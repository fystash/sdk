import * as fs from "node:fs";
import * as net from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  FystashClient,
  FrameReader,
  MessageKind,
  RemoteError,
  RequestTimeoutError,
  UnsupportedOperationError,
  encodeFrame,
  makeEnvelope,
  makeWireFrame,
  whichBody,
  type IEnvelope,
  type Register,
  type WireFrame,
} from "../src/index.js";
import { fabricV1 } from "../src/_generated/index.js";

class FakeFabric {
  port = 0;
  registrations: Register[] = [];
  envelopes: IEnvelope[] = [];
  private server: net.Server | null = null;
  private sockets = new Set<net.Socket>();
  private registrationWaiters: Array<() => void> = [];
  dropped = false;
  private droppedWaiters: Array<() => void> = [];

  async start(): Promise<void> {
    this.server = net.createServer((socket) => this.handle(socket));
    await new Promise<void>((resolve, reject) => {
      this.server!.once("error", reject);
      this.server!.listen(0, "127.0.0.1", () => resolve());
    });
    const addr = this.server.address();
    if (!addr || typeof addr === "string") throw new Error("expected TCP address");
    this.port = addr.port;
  }

  async close(): Promise<void> {
    for (const s of [...this.sockets]) {
      s.destroy();
    }
    this.sockets.clear();
    if (this.server) {
      await new Promise<void>((resolve) => this.server!.close(() => resolve()));
      this.server = null;
    }
  }

  async waitForRegistrations(count: number, timeoutMs = 2000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (this.registrations.length < count) {
      if (Date.now() > deadline) {
        throw new Error(
          `timed out waiting for ${count} registrations (have ${this.registrations.length})`,
        );
      }
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 25);
        this.registrationWaiters.push(() => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  }

  async waitDropped(timeoutMs = 2000): Promise<void> {
    if (this.dropped) return;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("timed out waiting for drop")),
        timeoutMs,
      );
      this.droppedWaiters.push(() => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  takeEnvelope(timeoutMs = 2000): Promise<IEnvelope> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        const next = this.envelopes.shift();
        if (next) {
          resolve(next);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          reject(new Error("timed out waiting for envelope"));
          return;
        }
        setTimeout(tick, 10);
      };
      tick();
    });
  }

  private writeFrame(socket: net.Socket, frame: WireFrame): void {
    if (socket.destroyed) return;
    socket.write(encodeFrame(frame));
  }

  private handle(socket: net.Socket): void {
    this.sockets.add(socket);
    const reader = new FrameReader();
    socket.on("data", (chunk) => {
      let frames: WireFrame[];
      try {
        frames = reader.push(chunk);
      } catch {
        socket.destroy();
        return;
      }
      for (const frame of frames) {
        void this.onFrame(socket, frame);
      }
    });
    socket.on("close", () => {
      this.sockets.delete(socket);
    });
  }

  private async onFrame(socket: net.Socket, frame: WireFrame): Promise<void> {
    const body = whichBody(frame);
    if (body === "register" && frame.register) {
      const registration = frame.register as Register;
      this.registrations.push(registration);
      for (const w of this.registrationWaiters.splice(0)) w();
      this.writeFrame(
        socket,
        makeWireFrame({
          envelope: makeEnvelope({
            roomId: registration.roomId ?? "",
            source: "router",
            destination: registration.agentId ?? "",
            payload: new Uint8Array(),
            kind: MessageKind.MESSAGE_KIND_ACK,
            messageId: Buffer.from(
              this.registrations.length.toString(16).padStart(16, "0"),
              "hex",
            ),
            headers: { registration: "accepted" },
          }),
        }),
      );
      return;
    }

    if (body === "barrier_arrive" && frame.barrierArrive) {
      this.writeFrame(
        socket,
        makeWireFrame({
          barrierRelease: fabricV1.BarrierRelease.create({
            roomId: frame.barrierArrive.roomId,
            barrierId: frame.barrierArrive.barrierId,
            participants: ["worker-a", "worker-b"],
          }),
        }),
      );
      return;
    }

    if (body !== "envelope" || !frame.envelope) return;

    const envelope = frame.envelope;
    this.envelopes.push(envelope);
    const payload = Buffer.from(envelope.payload ?? []);

    if (payload.equals(Buffer.from("drop"))) {
      this.dropped = true;
      for (const w of this.droppedWaiters.splice(0)) w();
      socket.destroy();
      return;
    }

    if (payload.equals(Buffer.from("remote-error"))) {
      this.writeFrame(
        socket,
        makeWireFrame({
          error: fabricV1.ErrorFrame.create({
            code: "TEST_ERROR",
            message: "requested failure",
            relatedMessageId: envelope.messageId,
          }),
        }),
      );
      return;
    }

    if (payload.equals(Buffer.from("push"))) {
      this.writeFrame(
        socket,
        makeWireFrame({
          envelope: makeEnvelope({
            roomId: envelope.roomId ?? "",
            source: "server",
            destination: envelope.source ?? "",
            payload: Buffer.from("pushed"),
          }),
        }),
      );
      return;
    }

    if (payload.equals(Buffer.from("no-response"))) {
      return;
    }

    if (envelope.kind === MessageKind.MESSAGE_KIND_REQUEST) {
      const response = makeEnvelope({
        roomId: envelope.roomId ?? "",
        source: envelope.destination ?? "",
        destination: envelope.source ?? "",
        payload: Buffer.from(payload.toString("utf8").toUpperCase()),
        kind: MessageKind.MESSAGE_KIND_RESPONSE,
        messageId: envelope.messageId
          ? Buffer.from(envelope.messageId)
          : undefined,
        headers: {
          reply_to: Buffer.from(envelope.messageId ?? []).toString("hex"),
        },
      });
      this.writeFrame(socket, makeWireFrame({ envelope: response }));
    }
  }
}

describe("FystashClient FakeFabric", () => {
  let fabric: FakeFabric;

  beforeEach(async () => {
    fabric = new FakeFabric();
    await fabric.start();
  });

  afterEach(async () => {
    await fabric.close();
  });

  it("registers, request/reply, receive, barrier, and fanout", async () => {
    const client = FystashClient.tcp("127.0.0.1", fabric.port, {
      roomId: "room-1",
      agentId: "worker-a",
      subscriptions: ["initial"],
    });
    await client.connect();
    try {
      const response = await client.request("worker-b", Buffer.from("hello"), {
        timeoutMs: 1000,
      });
      expect(Buffer.from(response.payload!).toString("utf8")).toBe("HELLO");

      await client.send("server", Buffer.from("push"));
      const pushed = await client.receive({ timeoutMs: 1000 });
      expect(Buffer.from(pushed.payload!).toString("utf8")).toBe("pushed");

      await expect(client.subscribe("updates")).rejects.toThrow(
        UnsupportedOperationError,
      );
      expect(fabric.registrations).toHaveLength(1);

      const release = await client.barrier("ready", 2, { timeoutMs: 1000 });
      expect(release.barrierId).toBe("ready");
      expect([...release.participants!]).toEqual(["worker-a", "worker-b"]);

      const messageIds = await client.fanout(
        ["worker-b", "worker-c"],
        Buffer.from("event"),
      );
      expect(messageIds).toHaveLength(2);
      expect(messageIds.every((id) => id.length === 16)).toBe(true);
    } finally {
      await client.close();
    }

    expect(fabric.registrations[0]?.protocolVersion).toBe(1);
    expect(fabric.registrations[0]?.roomId).toBe("room-1");
    expect(fabric.registrations[0]?.agentId).toBe("worker-a");
  });

  it("surfaces correlated remote errors", async () => {
    const client = FystashClient.tcp("127.0.0.1", fabric.port, {
      roomId: "room",
      agentId: "worker",
    });
    await client.connect();
    try {
      await expect(
        client.request("server", Buffer.from("remote-error"), { timeoutMs: 1000 }),
      ).rejects.toThrow(RemoteError);
    } finally {
      await client.close();
    }
  });

  it("respond uses a fresh id and reply_to", async () => {
    const request = makeEnvelope({
      roomId: "room",
      source: "requester",
      destination: "worker",
      payload: Buffer.from("question"),
      kind: MessageKind.MESSAGE_KIND_REQUEST,
    });
    const client = FystashClient.tcp("127.0.0.1", fabric.port, {
      roomId: "room",
      agentId: "worker",
    });
    await client.connect();
    try {
      const responseId = await client.respond(request, Buffer.from("answer"));
      const response = await fabric.takeEnvelope();
      expect(Buffer.compare(Buffer.from(responseId), Buffer.from(request.messageId!))).not.toBe(
        0,
      );
      expect(Buffer.compare(Buffer.from(response.messageId!), Buffer.from(responseId))).toBe(0);
      expect(response.headers?.["reply_to"]).toBe(
        Buffer.from(request.messageId!).toString("hex"),
      );
    } finally {
      await client.close();
    }
  });

  it("request timeout sends CANCEL", async () => {
    const client = FystashClient.tcp("127.0.0.1", fabric.port, {
      roomId: "room",
      agentId: "worker",
    });
    await client.connect();
    try {
      await expect(
        client.request("server", Buffer.from("no-response"), { timeoutMs: 10 }),
      ).rejects.toThrow(RequestTimeoutError);
      const request = await fabric.takeEnvelope();
      const cancel = await fabric.takeEnvelope();
      expect(Number(request.deadlineUnixMs ?? 0)).toBeGreaterThan(0);
      expect(cancel.kind).toBe(MessageKind.MESSAGE_KIND_CANCEL);
      expect(
        Buffer.compare(Buffer.from(cancel.messageId!), Buffer.from(request.messageId!)),
      ).not.toBe(0);
      expect(cancel.headers?.["reply_to"]).toBe(
        Buffer.from(request.messageId!).toString("hex"),
      );
    } finally {
      await client.close();
    }
  });

  it("automatic reconnect registers again", async () => {
    const client = FystashClient.tcp("127.0.0.1", fabric.port, {
      roomId: "room",
      agentId: "worker",
      reconnectInitialDelayMs: 10,
      reconnectJitter: 0,
    });
    await client.connect();
    try {
      await client.send("server", Buffer.from("drop"));
      await fabric.waitDropped();
      await fabric.waitForRegistrations(2);
      await client.waitUntilConnected({ timeoutMs: 2000 });

      const response = await client.request("server", Buffer.from("after"), {
        timeoutMs: 1000,
      });
      expect(Buffer.from(response.payload!).toString("utf8")).toBe("AFTER");
    } finally {
      await client.close();
    }
  });

  it("unix auto mode connects without registering", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fystash-sdk-"));
    const socketPath = path.join(dir, "daemon.sock");
    const received: WireFrame[] = [];

    const server = net.createServer((socket) => {
      const reader = new FrameReader();
      socket.on("data", (chunk) => {
        for (const frame of reader.push(chunk)) {
          received.push(frame);
        }
      });
    });
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(socketPath, () => resolve());
    });

    const client = FystashClient.unix(socketPath, {
      roomId: "informational-room",
      agentId: "informational-agent",
    });
    try {
      await client.connect();
      expect(client.registrationMode).toBe("daemon");
      await client.send("target", Buffer.from("through-daemon"));
      const deadline = Date.now() + 2000;
      while (received.length === 0 && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 10));
      }
      expect(received).toHaveLength(1);
      await expect(client.register()).rejects.toThrow(/daemon owns identity/);
      await expect(client.subscribe("updates")).rejects.toThrow(/daemon topics/);
    } finally {
      await client.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      fs.rmSync(dir, { recursive: true, force: true });
    }

    expect(whichBody(received[0]!)).toBe("envelope");
    expect(Buffer.from(received[0]!.envelope!.payload!).toString("utf8")).toBe(
      "through-daemon",
    );
  });
});
