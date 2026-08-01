import { describe, expect, it } from "vitest";
import {
  FrameTooLargeError,
  ProtocolError,
  decodeFrame,
  encodeFrame,
  fabricV1,
  makeEnvelope,
  makeWireFrame,
  whichBody,
} from "../src/index.js";

describe("framing", () => {
  it("round-trips a length-prefixed envelope", () => {
    const frame = makeWireFrame({
      envelope: makeEnvelope({
        roomId: "room",
        source: "a",
        destination: "b",
        payload: Buffer.from("hello"),
      }),
    });
    const encoded = encodeFrame(frame);
    expect(encoded.readUInt32BE(0)).toBe(encoded.length - 4);
    const decoded = decodeFrame(encoded.subarray(4));
    expect(whichBody(decoded)).toBe("envelope");
    expect(Buffer.from(decoded.envelope!.payload!).toString("utf8")).toBe("hello");
  });

  it("rejects oversized frames on encode", () => {
    const frame = makeWireFrame({
      envelope: makeEnvelope({
        roomId: "room",
        source: "a",
        destination: "b",
        payload: Buffer.alloc(64),
      }),
    });
    expect(() => encodeFrame(frame, 8)).toThrow(FrameTooLargeError);
  });

  it("rejects empty body on decode", () => {
    expect(() => decodeFrame(new Uint8Array())).toThrow(ProtocolError);
    const empty = fabricV1.WireFrame.encode(fabricV1.WireFrame.create({})).finish();
    expect(() => decodeFrame(empty)).toThrow(ProtocolError);
  });
});
