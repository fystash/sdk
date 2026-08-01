/** Message identifiers, deadlines, and envelope helpers. */

import { randomUUID } from "node:crypto";
import {
  fabricV1,
  MessageKind,
  type Envelope,
  type IWireFrame,
  type WireFrame,
} from "./_generated/index.js";
import { ProtocolError, RemoteError } from "./errors.js";
import { whichBody } from "./framing.js";

export const PROTOCOL_VERSION = 1;

export function newMessageId(): Uint8Array {
  const u = randomUUID().replace(/-/g, "");
  return Buffer.from(u, "hex");
}

export function messageIdHex(messageId: Uint8Array): string {
  return Buffer.from(messageId).toString("hex");
}

export function deadlineAfter(timeoutSeconds: number | null | undefined): number {
  if (timeoutSeconds == null) {
    return 0;
  }
  if (timeoutSeconds < 0) {
    throw new Error("timeout must be non-negative");
  }
  return Math.floor((Date.now() / 1000 + timeoutSeconds) * 1000);
}

export function remainingSeconds(deadlineUnixMs: number): number | null {
  if (deadlineUnixMs === 0) {
    return null;
  }
  return Math.max(0, deadlineUnixMs / 1000 - Date.now() / 1000);
}

export function isRegistrationAck(
  frame: WireFrame | IWireFrame,
  opts?: { roomId?: string; agentId?: string },
): boolean {
  if (whichBody(frame) !== "envelope" || frame.envelope == null) {
    return false;
  }
  const envelope = frame.envelope;
  const headers = envelope.headers ?? {};
  return (
    (envelope.protocolVersion ?? 0) === PROTOCOL_VERSION &&
    envelope.source === "router" &&
    envelope.kind === MessageKind.MESSAGE_KIND_ACK &&
    headers["registration"] === "accepted" &&
    Boolean(envelope.messageId && envelope.messageId.length > 0) &&
    !(envelope.payload && envelope.payload.length > 0) &&
    (opts?.roomId == null || envelope.roomId === opts.roomId) &&
    (opts?.agentId == null || envelope.destination === opts.agentId)
  );
}

export function validateRegistrationAck(
  frame: WireFrame | IWireFrame,
  roomId: string,
  agentId: string,
): Envelope {
  if (whichBody(frame) === "error" && frame.error != null) {
    throw new RemoteError(
      frame.error.code ?? "",
      frame.error.message ?? "",
      frame.error.relatedMessageId
        ? Buffer.from(frame.error.relatedMessageId)
        : new Uint8Array(),
    );
  }
  if (!isRegistrationAck(frame, { roomId, agentId })) {
    throw new ProtocolError(
      `expected router registration ACK for room=${JSON.stringify(roomId)} agent=${JSON.stringify(agentId)}`,
    );
  }
  return frame.envelope as Envelope;
}

export function makeEnvelope(opts: {
  roomId: string;
  source: string;
  destination: string;
  payload: Uint8Array;
  kind?: MessageKind;
  messageId?: Uint8Array;
  streamId?: number;
  sequence?: number;
  deadlineUnixMs?: number;
  headers?: Record<string, string>;
}): Envelope {
  return fabricV1.Envelope.create({
    protocolVersion: PROTOCOL_VERSION,
    messageId: opts.messageId ?? newMessageId(),
    roomId: opts.roomId,
    source: opts.source,
    destination: opts.destination,
    kind: opts.kind ?? MessageKind.MESSAGE_KIND_EVENT,
    streamId: opts.streamId ?? 0,
    sequence: opts.sequence ?? 0,
    deadlineUnixMs: opts.deadlineUnixMs ?? 0,
    headers: opts.headers ?? {},
    payload: opts.payload,
  });
}

export function makeWireFrame(body: IWireFrame): WireFrame {
  return fabricV1.WireFrame.create(body);
}

export type { Envelope, WireFrame, IWireFrame };
