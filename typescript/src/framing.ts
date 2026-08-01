/** Length-prefixed protobuf framing for the fabric transport. */

import {
  fabricV1,
  type IWireFrame,
  type WireFrame,
} from "./_generated/index.js";
import {
  ConnectionClosedError,
  FrameTooLargeError,
  ProtocolError,
} from "./errors.js";

export const DEFAULT_MAX_FRAME_SIZE = 16 * 1024 * 1024;

export type WireFrameMsg = WireFrame;

export function encodeFrame(
  frame: WireFrame | IWireFrame,
  maxFrameSize: number = DEFAULT_MAX_FRAME_SIZE,
): Buffer {
  const msg =
    frame instanceof fabricV1.WireFrame
      ? frame
      : fabricV1.WireFrame.create(frame);
  const payload = Buffer.from(fabricV1.WireFrame.encode(msg).finish());
  if (payload.length > maxFrameSize) {
    throw new FrameTooLargeError(payload.length, maxFrameSize);
  }
  const header = Buffer.allocUnsafe(4);
  header.writeUInt32BE(payload.length, 0);
  return Buffer.concat([header, payload]);
}

export function decodeFrame(
  payload: Uint8Array,
  maxFrameSize: number = DEFAULT_MAX_FRAME_SIZE,
): WireFrame {
  if (payload.length > maxFrameSize) {
    throw new FrameTooLargeError(payload.length, maxFrameSize);
  }
  let frame: WireFrame;
  try {
    frame = fabricV1.WireFrame.decode(payload);
  } catch {
    throw new ProtocolError("invalid WireFrame protobuf");
  }
  if (whichBody(frame) == null) {
    throw new ProtocolError("WireFrame body is not set");
  }
  return frame;
}

export function whichBody(
  frame: WireFrame | IWireFrame,
): "register" | "envelope" | "barrier_arrive" | "barrier_release" | "error" | null {
  if (frame.register != null) return "register";
  if (frame.envelope != null) return "envelope";
  if (frame.barrierArrive != null) return "barrier_arrive";
  if (frame.barrierRelease != null) return "barrier_release";
  if (frame.error != null) return "error";
  return null;
}

/** Incremental length-prefixed frame reader for a socket byte stream. */
export class FrameReader {
  private buffer = Buffer.alloc(0);
  private readonly maxFrameSize: number;

  constructor(maxFrameSize: number = DEFAULT_MAX_FRAME_SIZE) {
    this.maxFrameSize = maxFrameSize;
  }

  push(chunk: Buffer): WireFrame[] {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    const frames: WireFrame[] = [];
    while (true) {
      if (this.buffer.length < 4) {
        break;
      }
      const size = this.buffer.readUInt32BE(0);
      if (size > this.maxFrameSize) {
        throw new FrameTooLargeError(size, this.maxFrameSize);
      }
      if (this.buffer.length < 4 + size) {
        break;
      }
      const payload = this.buffer.subarray(4, 4 + size);
      this.buffer = this.buffer.subarray(4 + size);
      frames.push(decodeFrame(payload, this.maxFrameSize));
    }
    return frames;
  }

  reset(): void {
    this.buffer = Buffer.alloc(0);
  }
}

export function assertCompleteRead(
  got: number,
  want: number,
  context: string,
): void {
  if (got < want) {
    throw new ConnectionClosedError(context);
  }
}
