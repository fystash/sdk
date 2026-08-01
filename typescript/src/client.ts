/** Reconnecting fabric wire client (TCP / Unix) — TypeScript twin of Python FystashClient. */

import * as net from "node:net";
import { fabricV1, MessageKind } from "./_generated/index.js";
import type {
  IBarrierRelease,
  IEnvelope,
  IWireFrame,
  WireFrame,
} from "./_generated/index.js";
import {
  endpointDisplayName,
  endpointTcp,
  endpointUnix,
  parseEndpoint,
  type Endpoint,
} from "./endpoint.js";
import {
  ConnectionClosedError,
  ConnectionLostError,
  FystashError,
  NotConnectedError,
  RemoteError,
  RequestTimeoutError,
  UnsupportedOperationError,
} from "./errors.js";
import {
  DEFAULT_MAX_FRAME_SIZE,
  FrameReader,
  encodeFrame,
  whichBody,
} from "./framing.js";
import {
  PROTOCOL_VERSION,
  deadlineAfter,
  isRegistrationAck,
  makeEnvelope,
  makeWireFrame,
  newMessageId,
  remainingSeconds,
  validateRegistrationAck,
} from "./messages.js";

export type RegistrationMode = "auto" | "direct" | "daemon";
export type ResolvedRegistrationMode = "direct" | "daemon";

export type FystashClientOptions = {
  roomId: string;
  agentId: string;
  sessionToken?: Uint8Array;
  subscriptions?: Iterable<string>;
  registrationMode?: RegistrationMode;
  autoReconnect?: boolean;
  connectTimeoutMs?: number;
  reconnectInitialDelayMs?: number;
  reconnectMaxDelayMs?: number;
  reconnectJitter?: number;
  maxReconnectAttempts?: number | null;
  maxFrameSize?: number;
  incomingQueueSize?: number;
};

type Pending = {
  resolve: (value: IEnvelope) => void;
  reject: (err: Error) => void;
};

type BarrierPending = {
  resolve: (value: IBarrierRelease) => void;
  reject: (err: Error) => void;
};

function toPayload(payload: Uint8Array | string | Buffer): Uint8Array {
  if (typeof payload === "string") {
    return Buffer.from(payload, "utf8");
  }
  return payload instanceof Buffer ? payload : Buffer.from(payload);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function longToNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value ?? 0);
}

export class FystashClient {
  readonly endpoint: Endpoint;
  readonly requestedRegistrationMode: RegistrationMode;
  registrationMode: ResolvedRegistrationMode;
  roomId: string;
  agentId: string;
  sessionToken: Uint8Array;
  subscriptions: Set<string>;
  autoReconnect: boolean;
  connectTimeoutMs: number;
  reconnectInitialDelayMs: number;
  reconnectMaxDelayMs: number;
  reconnectJitter: number;
  maxReconnectAttempts: number | null;
  maxFrameSize: number;

  private socket: net.Socket | null = null;
  private reader = new FrameReader();
  private connected = false;
  private closing = false;
  private connectLock: Promise<void> = Promise.resolve();
  private writeChain: Promise<void> = Promise.resolve();
  private readerRunning = false;
  private lastConnectionError: Error | null = null;
  private readonly pending = new Map<string, Pending>();
  private readonly barriers = new Map<string, BarrierPending>();
  private readonly incoming: IEnvelope[] = [];
  private readonly errors: RemoteError[] = [];
  private incomingWaiters: Array<{
    resolve: (v: IEnvelope) => void;
    reject: (e: Error) => void;
  }> = [];
  private errorWaiters: Array<{
    resolve: (v: RemoteError) => void;
    reject: (e: Error) => void;
  }> = [];
  private connectedWaiters: Array<() => void> = [];

  constructor(endpoint: string | Endpoint, opts: FystashClientOptions) {
    if (!opts.roomId) throw new Error("roomId must not be empty");
    if (!opts.agentId) throw new Error("agentId must not be empty");

    this.endpoint = parseEndpoint(endpoint);
    this.requestedRegistrationMode = opts.registrationMode ?? "auto";
    if (!["auto", "direct", "daemon"].includes(this.requestedRegistrationMode)) {
      throw new Error("registrationMode must be 'auto', 'direct', or 'daemon'");
    }
    this.registrationMode =
      this.requestedRegistrationMode === "daemon" ||
      (this.requestedRegistrationMode === "auto" && this.endpoint.kind === "unix")
        ? "daemon"
        : "direct";

    this.roomId = opts.roomId;
    this.agentId = opts.agentId;
    this.sessionToken = opts.sessionToken ?? new Uint8Array();
    this.subscriptions = new Set(opts.subscriptions ?? []);
    if (this.registrationMode === "daemon" && this.sessionToken.length > 0) {
      throw new UnsupportedOperationError(
        "daemon mode session_token is owned by fystash-guest-daemon",
      );
    }
    if (this.registrationMode === "daemon" && this.subscriptions.size > 0) {
      throw new UnsupportedOperationError(
        "daemon mode subscriptions are owned by fystash-guest-daemon; configure them when launching the daemon",
      );
    }

    this.autoReconnect = opts.autoReconnect ?? true;
    this.connectTimeoutMs = opts.connectTimeoutMs ?? 10_000;
    this.reconnectInitialDelayMs = opts.reconnectInitialDelayMs ?? 50;
    this.reconnectMaxDelayMs = opts.reconnectMaxDelayMs ?? 5_000;
    this.reconnectJitter = opts.reconnectJitter ?? 0.2;
    this.maxReconnectAttempts =
      opts.maxReconnectAttempts === undefined ? null : opts.maxReconnectAttempts;
    this.maxFrameSize = opts.maxFrameSize ?? DEFAULT_MAX_FRAME_SIZE;
    this.reader = new FrameReader(this.maxFrameSize);
  }

  static tcp(
    host: string,
    port: number,
    opts: FystashClientOptions,
  ): FystashClient {
    return new FystashClient(endpointTcp(host, port), opts);
  }

  static unix(path: string, opts: FystashClientOptions): FystashClient {
    return new FystashClient(endpointUnix(path), opts);
  }

  get isConnected(): boolean {
    return this.connected && this.socket != null && !this.socket.destroyed;
  }

  get lastError(): Error | null {
    return this.lastConnectionError;
  }

  async connect(): Promise<void> {
    await this.withConnectLock(async () => {
      if (this.isConnected) return;
      if (this.readerRunning) {
        await this.waitUntilConnected({ timeoutMs: this.connectTimeoutMs });
        return;
      }
      this.closing = false;
      await this.openTransport();
      this.startReaderLoop();
    });
  }

  async close(): Promise<void> {
    this.closing = true;
    this.connected = false;
    this.notifyConnected();
    this.destroySocket();
    this.failWaiters(new ConnectionLostError("client closed"));
    this.readerRunning = false;
  }

  async reconnect(): Promise<void> {
    await this.withConnectLock(async () => {
      if (this.closing) {
        throw new NotConnectedError("client is closed");
      }
      this.connected = false;
      this.destroySocket();
      this.failWaiters(new ConnectionLostError("connection replaced"));
      await this.openTransport();
      if (!this.readerRunning) {
        this.startReaderLoop();
      }
    });
  }

  async waitUntilConnected(opts?: { timeoutMs?: number }): Promise<void> {
    if (this.isConnected) return;
    if (!this.readerRunning && !this.socket) {
      const detail = this.lastConnectionError
        ? `: ${this.lastConnectionError.message}`
        : "";
      throw new NotConnectedError(`client is not reconnecting${detail}`);
    }
    const timeoutMs = opts?.timeoutMs ?? this.connectTimeoutMs;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new NotConnectedError("timed out waiting for a connection"));
      }, timeoutMs);
      const onReady = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        clearTimeout(timer);
        this.connectedWaiters = this.connectedWaiters.filter((w) => w !== onReady);
      };
      this.connectedWaiters.push(onReady);
      if (this.isConnected) {
        cleanup();
        resolve();
      }
    });
  }

  async register(opts?: {
    roomId?: string;
    agentId?: string;
    sessionToken?: Uint8Array;
    subscriptions?: Iterable<string>;
  }): Promise<void> {
    if (this.registrationMode === "daemon") {
      throw new UnsupportedOperationError(
        "register() is unavailable in daemon mode; the guest daemon owns identity",
      );
    }
    if (this.isConnected || this.readerRunning) {
      throw new UnsupportedOperationError(
        "the Rust router permits exactly one Register frame per connection",
      );
    }
    if (opts?.roomId != null) {
      if (!opts.roomId) throw new Error("roomId must not be empty");
      this.roomId = opts.roomId;
    }
    if (opts?.agentId != null) {
      if (!opts.agentId) throw new Error("agentId must not be empty");
      this.agentId = opts.agentId;
    }
    if (opts?.sessionToken != null) {
      this.sessionToken = opts.sessionToken;
    }
    if (opts?.subscriptions != null) {
      this.subscriptions = new Set(opts.subscriptions);
    }
    await this.connect();
  }

  async subscribe(...topics: string[]): Promise<void> {
    if (topics.some((t) => !t)) {
      throw new Error("subscription names must not be empty");
    }
    if (this.registrationMode === "daemon") {
      throw new UnsupportedOperationError(
        "subscribe() is unavailable in daemon mode; configure daemon topics at launch",
      );
    }
    if (this.isConnected || this.readerRunning) {
      throw new UnsupportedOperationError(
        "subscriptions cannot change after the one router registration",
      );
    }
    for (const t of topics) this.subscriptions.add(t);
  }

  async send(
    destination: string,
    payload: Uint8Array | string | Buffer,
    opts?: {
      kind?: MessageKind;
      messageId?: Uint8Array;
      streamId?: number;
      sequence?: number;
      deadlineUnixMs?: number;
      headers?: Record<string, string>;
    },
  ): Promise<Uint8Array> {
    if (!destination) throw new Error("destination must not be empty");
    const envelope = makeEnvelope({
      roomId: this.roomId,
      source: this.agentId,
      destination,
      payload: toPayload(payload),
      kind: opts?.kind ?? MessageKind.MESSAGE_KIND_EVENT,
      messageId: opts?.messageId,
      streamId: opts?.streamId ?? 0,
      sequence: opts?.sequence ?? 0,
      deadlineUnixMs: opts?.deadlineUnixMs ?? 0,
      headers: opts?.headers,
    });
    await this.sendWire(makeWireFrame({ envelope }));
    return Buffer.from(envelope.messageId!);
  }

  async respond(
    request: IEnvelope,
    payload: Uint8Array | string | Buffer,
    opts?: { kind?: MessageKind; headers?: Record<string, string> },
  ): Promise<Uint8Array> {
    const headers = { ...(opts?.headers ?? {}) };
    const reqId = Buffer.from(request.messageId ?? new Uint8Array());
    if (headers["reply_to"] == null) {
      headers["reply_to"] = reqId.toString("hex");
    }
    return this.send(request.source ?? "", payload, {
      kind: opts?.kind ?? MessageKind.MESSAGE_KIND_RESPONSE,
      messageId: newMessageId(),
      streamId: longToNumber(request.streamId),
      sequence: longToNumber(request.sequence),
      headers,
    });
  }

  async request(
    destination: string,
    payload: Uint8Array | string | Buffer,
    opts?: {
      timeoutMs?: number | null;
      deadlineUnixMs?: number;
      headers?: Record<string, string>;
    },
  ): Promise<IEnvelope> {
    const timeoutMs =
      opts?.timeoutMs === undefined ? 30_000 : opts.timeoutMs;
    if (timeoutMs != null && timeoutMs < 0) {
      throw new Error("timeout must be non-negative");
    }
    const messageId = newMessageId();
    const messageIdHex = Buffer.from(messageId).toString("hex");
    const deadline =
      opts?.deadlineUnixMs ??
      deadlineAfter(timeoutMs == null ? null : timeoutMs / 1000);

    const responsePromise = new Promise<IEnvelope>((resolve, reject) => {
      this.pending.set(messageIdHex, { resolve, reject });
    });

    try {
      await this.send(destination, payload, {
        kind: MessageKind.MESSAGE_KIND_REQUEST,
        messageId,
        deadlineUnixMs: deadline,
        headers: opts?.headers,
      });

      let waitMs = timeoutMs;
      if (deadline) {
        const rem = remainingSeconds(deadline);
        if (rem != null) {
          const deadlineMs = rem * 1000;
          waitMs =
            waitMs == null ? deadlineMs : Math.min(waitMs, deadlineMs);
        }
      }

      if (waitMs == null) {
        return await responsePromise;
      }
      return await Promise.race([
        responsePromise,
        sleep(waitMs).then(async () => {
          await this.sendCancelBestEffort(destination, messageId);
          throw new RequestTimeoutError(
            `request ${messageIdHex} exceeded its deadline`,
          );
        }),
      ]);
    } finally {
      this.pending.delete(messageIdHex);
    }
  }

  async receive(opts?: { timeoutMs?: number | null }): Promise<IEnvelope> {
    const timeoutMs = opts?.timeoutMs;
    if (timeoutMs != null && timeoutMs < 0) {
      throw new Error("timeout must be non-negative");
    }

    const messagePromise = this.dequeueIncoming();
    const errorPromise = this.dequeueError();

    const raced = await Promise.race([
      messagePromise.then((m) => ({ kind: "msg" as const, m })),
      errorPromise.then((e) => ({ kind: "err" as const, e })),
      timeoutMs == null
        ? new Promise<never>(() => {})
        : sleep(timeoutMs).then(() => ({ kind: "timeout" as const })),
    ]);

    if (raced.kind === "timeout") {
      throw new RequestTimeoutError("receive timed out");
    }
    if (raced.kind === "err") {
      throw raced.e;
    }
    return raced.m;
  }

  async fanout(
    destinations: Iterable<string>,
    payload: Uint8Array | string | Buffer,
    opts?: { headers?: Record<string, string>; deadlineUnixMs?: number },
  ): Promise<Uint8Array[]> {
    const targets = [...destinations];
    const ids: Uint8Array[] = [];
    for (const dest of targets) {
      ids.push(
        await this.send(dest, payload, {
          headers: opts?.headers,
          deadlineUnixMs: opts?.deadlineUnixMs ?? 0,
        }),
      );
    }
    return ids;
  }

  async barrier(
    barrierId: string,
    parties: number,
    opts?: { timeoutMs?: number | null },
  ): Promise<IBarrierRelease> {
    if (!barrierId) throw new Error("barrierId must not be empty");
    if (parties <= 0) throw new Error("parties must be positive");
    if (this.barriers.has(barrierId)) {
      throw new FystashError(`already waiting at barrier ${JSON.stringify(barrierId)}`);
    }

    const timeoutMs = opts?.timeoutMs === undefined ? 30_000 : opts.timeoutMs;
    const releasePromise = new Promise<IBarrierRelease>((resolve, reject) => {
      this.barriers.set(barrierId, { resolve, reject });
    });

    try {
      await this.sendWire(
        makeWireFrame({
          barrierArrive: fabricV1.BarrierArrive.create({
            roomId: this.roomId,
            barrierId,
            parties,
          }),
        }),
      );
      if (timeoutMs == null) {
        return await releasePromise;
      }
      return await Promise.race([
        releasePromise,
        sleep(timeoutMs).then(() => {
          throw new RequestTimeoutError(
            `barrier ${JSON.stringify(barrierId)} timed out`,
          );
        }),
      ]);
    } finally {
      this.barriers.delete(barrierId);
    }
  }

  private async withConnectLock(fn: () => Promise<void>): Promise<void> {
    const prev = this.connectLock;
    let release!: () => void;
    this.connectLock = new Promise<void>((r) => {
      release = r;
    });
    await prev;
    try {
      await fn();
    } finally {
      release();
    }
  }

  private notifyConnected(): void {
    const waiters = this.connectedWaiters.splice(0);
    for (const w of waiters) w();
  }

  private async openTransport(): Promise<void> {
    const socket = await this.connectSocket();
    this.socket = socket;
    this.reader.reset();

    try {
      if (this.registrationMode === "direct") {
        await this.writeRaw(encodeFrame(this.registrationFrame(), this.maxFrameSize));
        const ack = await this.readOneFrame(this.connectTimeoutMs);
        validateRegistrationAck(ack, this.roomId, this.agentId);
      }
    } catch (err) {
      socket.destroy();
      this.socket = null;
      this.lastConnectionError = err as Error;
      if (
        err instanceof FystashError ||
        (err as Error)?.name === "RemoteError" ||
        (err as Error)?.name === "ProtocolError"
      ) {
        throw err;
      }
      throw new ConnectionLostError(
        `failed to connect to ${endpointDisplayName(this.endpoint)}: ${(err as Error).message}`,
      );
    }

    this.lastConnectionError = null;
    this.connected = true;
    this.notifyConnected();
    this.attachSocketHandlers(socket);
  }

  private connectSocket(): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timer = setTimeout(() => {
        socket.destroy();
        reject(new ConnectionLostError("connect timed out"));
      }, this.connectTimeoutMs);

      socket.once("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });

      const onConnect = () => {
        clearTimeout(timer);
        socket.removeListener("error", rejectOnError);
        resolve(socket);
      };
      const rejectOnError = (err: Error) => {
        clearTimeout(timer);
        reject(err);
      };

      if (this.endpoint.kind === "unix") {
        socket.connect(this.endpoint.path, onConnect);
      } else {
        socket.connect(this.endpoint.port, this.endpoint.host, onConnect);
      }
    });
  }

  private attachSocketHandlers(socket: net.Socket): void {
    socket.on("data", (chunk: Buffer) => {
      try {
        const frames = this.reader.push(chunk);
        for (const frame of frames) {
          void this.dispatch(frame);
        }
      } catch (err) {
        this.handleTransportError(err as Error);
      }
    });
    socket.on("close", () => {
      if (!this.closing) {
        this.handleTransportError(new ConnectionClosedError("socket closed"));
      }
    });
    socket.on("error", (err) => {
      this.handleTransportError(err);
    });
  }

  private registrationFrame(): WireFrame {
    return makeWireFrame({
      register: fabricV1.Register.create({
        protocolVersion: PROTOCOL_VERSION,
        roomId: this.roomId,
        agentId: this.agentId,
        sessionToken: this.sessionToken,
        subscriptions: [...this.subscriptions].sort(),
      }),
    });
  }

  private writeRaw(buf: Buffer): Promise<void> {
    const socket = this.socket;
    if (!socket || socket.destroyed) {
      return Promise.reject(new NotConnectedError("no socket"));
    }
    return new Promise((resolve, reject) => {
      socket.write(buf, (err) => (err ? reject(err) : resolve()));
    });
  }

  private async sendWire(frame: WireFrame | IWireFrame): Promise<void> {
    await this.waitUntilConnected();
    const run = async () => {
      if (!this.isConnected || !this.socket) {
        throw new NotConnectedError("connection became unavailable before write");
      }
      try {
        await this.writeRaw(encodeFrame(frame, this.maxFrameSize));
      } catch {
        this.connected = false;
        this.destroySocket();
        throw new ConnectionLostError("connection failed while writing frame");
      }
    };
    const next = this.writeChain.then(run, run);
    this.writeChain = next.then(
      () => undefined,
      () => undefined,
    );
    await next;
  }

  private readOneFrame(timeoutMs: number): Promise<WireFrame> {
    return new Promise((resolve, reject) => {
      const socket = this.socket;
      if (!socket) {
        reject(new NotConnectedError("no socket"));
        return;
      }
      const timer = setTimeout(() => {
        cleanup();
        reject(new ConnectionLostError("timed out waiting for frame"));
      }, timeoutMs);

      const onData = (chunk: Buffer) => {
        try {
          const frames = this.reader.push(chunk);
          if (frames.length > 0) {
            cleanup();
            const [first, ...rest] = frames;
            resolve(first!);
            for (const f of rest) {
              void this.dispatch(f);
            }
          }
        } catch (err) {
          cleanup();
          reject(err);
        }
      };
      const onClose = () => {
        cleanup();
        reject(new ConnectionClosedError("connection closed while reading frame"));
      };
      const cleanup = () => {
        clearTimeout(timer);
        socket.off("data", onData);
        socket.off("close", onClose);
        socket.off("error", onError);
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      socket.on("data", onData);
      socket.on("close", onClose);
      socket.on("error", onError);
    });
  }

  private startReaderLoop(): void {
    this.readerRunning = true;
    // Data is handled via socket 'data' events; reconnect loop watches close/errors.
  }

  private handleTransportError(err: Error): void {
    this.lastConnectionError = err;
    this.connected = false;
    this.destroySocket();
    this.failWaiters(new ConnectionLostError(`connection lost: ${err.message}`));
    if (!this.autoReconnect || this.closing) {
      this.readerRunning = false;
      return;
    }
    void this.reconnectLoop();
  }

  private async reconnectLoop(): Promise<void> {
    let attempt = 0;
    while (!this.closing) {
      if (
        this.maxReconnectAttempts != null &&
        attempt >= this.maxReconnectAttempts
      ) {
        this.readerRunning = false;
        return;
      }
      attempt += 1;
      let delay = Math.min(
        this.reconnectMaxDelayMs,
        this.reconnectInitialDelayMs * 2 ** (attempt - 1),
      );
      if (delay > 0 && this.reconnectJitter > 0) {
        const spread = delay * this.reconnectJitter;
        delay = Math.max(0, delay + (Math.random() * 2 - 1) * spread);
      }
      if (delay > 0) await sleep(delay);
      try {
        await this.withConnectLock(async () => {
          if (this.closing || this.isConnected) return;
          await this.openTransport();
        });
        if (this.isConnected) return;
      } catch {
        // retry
      }
    }
    this.readerRunning = false;
  }

  private async dispatch(frame: WireFrame): Promise<void> {
    const body = whichBody(frame);
    if (body === "envelope" && frame.envelope) {
      const envelope = frame.envelope;
      if (isRegistrationAck(frame, { roomId: this.roomId, agentId: this.agentId })) {
        return;
      }
      const pending = this.findPending(envelope);
      if (
        pending &&
        (envelope.kind === MessageKind.MESSAGE_KIND_RESPONSE ||
          envelope.kind === MessageKind.MESSAGE_KIND_ACK ||
          envelope.kind === MessageKind.MESSAGE_KIND_ERROR)
      ) {
        if (envelope.kind === MessageKind.MESSAGE_KIND_ERROR) {
          const headers = envelope.headers ?? {};
          pending.reject(
            new RemoteError(
              headers["code"] ?? "REMOTE_ERROR",
              Buffer.from(envelope.payload ?? []).toString("utf8"),
              Buffer.from(envelope.messageId ?? new Uint8Array()),
            ),
          );
        } else {
          pending.resolve(envelope);
        }
        return;
      }
      this.enqueueIncoming(envelope);
      return;
    }

    if (body === "barrier_release" && frame.barrierRelease) {
      const release = frame.barrierRelease;
      const waiter = this.barriers.get(release.barrierId ?? "");
      if (waiter) {
        waiter.resolve(release);
      }
      return;
    }

    if (body === "error" && frame.error) {
      const error = new RemoteError(
        frame.error.code ?? "",
        frame.error.message ?? "",
        frame.error.relatedMessageId
          ? Buffer.from(frame.error.relatedMessageId)
          : new Uint8Array(),
      );
      const relatedHex = Buffer.from(error.relatedMessageId).toString("hex");
      const pending = relatedHex ? this.pending.get(relatedHex) : undefined;
      if (pending) {
        pending.reject(error);
      } else {
        this.enqueueError(error);
      }
      return;
    }

    if (body === "register") {
      this.enqueueError(
        new RemoteError("PROTOCOL_ERROR", "server sent an unexpected Register frame"),
      );
      return;
    }
    if (body === "barrier_arrive") {
      this.enqueueError(
        new RemoteError(
          "PROTOCOL_ERROR",
          "server sent an unexpected BarrierArrive frame",
        ),
      );
    }
  }

  private findPending(envelope: IEnvelope): Pending | undefined {
    const id = Buffer.from(envelope.messageId ?? new Uint8Array()).toString("hex");
    const byId = this.pending.get(id);
    if (byId) return byId;
    const replyTo = envelope.headers?.["reply_to"];
    if (!replyTo) return undefined;
    return this.pending.get(replyTo);
  }

  private async sendCancelBestEffort(
    destination: string,
    messageId: Uint8Array,
  ): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.send(destination, new Uint8Array(), {
        kind: MessageKind.MESSAGE_KIND_CANCEL,
        messageId: newMessageId(),
        headers: { reply_to: Buffer.from(messageId).toString("hex") },
      });
    } catch {
      // best effort
    }
  }

  private destroySocket(): void {
    const socket = this.socket;
    this.socket = null;
    this.reader.reset();
    if (socket && !socket.destroyed) {
      socket.removeAllListeners();
      socket.destroy();
    }
  }

  private failWaiters(error: Error): void {
    for (const [, p] of this.pending) {
      p.reject(error);
    }
    this.pending.clear();
    for (const [, b] of this.barriers) {
      b.reject(error);
    }
    this.barriers.clear();
  }

  private enqueueIncoming(envelope: IEnvelope): void {
    const waiter = this.incomingWaiters.shift();
    if (waiter) {
      waiter.resolve(envelope);
      return;
    }
    this.incoming.push(envelope);
  }

  private enqueueError(error: RemoteError): void {
    const waiter = this.errorWaiters.shift();
    if (waiter) {
      waiter.resolve(error);
      return;
    }
    this.errors.push(error);
  }

  private dequeueIncoming(): Promise<IEnvelope> {
    const next = this.incoming.shift();
    if (next) return Promise.resolve(next);
    return new Promise((resolve, reject) => {
      this.incomingWaiters.push({ resolve, reject });
    });
  }

  private dequeueError(): Promise<RemoteError> {
    const next = this.errors.shift();
    if (next) return Promise.resolve(next);
    return new Promise((resolve, reject) => {
      this.errorWaiters.push({ resolve, reject });
    });
  }
}
