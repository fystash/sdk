export {
  RoomApiError,
  RoomClient,
  type JsonObject,
  type RoomClientOptions,
} from "./room.js";

export {
  FystashSession,
  type ExecResult,
  type FystashSessionOptions,
  type SpawnOptions,
} from "./session.js";

export {
  FystashClient,
  type FystashClientOptions,
  type RegistrationMode,
  type ResolvedRegistrationMode,
} from "./client.js";

export {
  ConfigurationError,
  ConnectionClosedError,
  ConnectionLostError,
  FrameTooLargeError,
  FystashError,
  NotConnectedError,
  ProtocolError,
  RemoteError,
  RequestTimeoutError,
  UnsupportedOperationError,
} from "./errors.js";

export {
  endpointDisplayName,
  endpointTcp,
  endpointUnix,
  parseEndpoint,
  type Endpoint,
} from "./endpoint.js";

export {
  DEFAULT_MAX_FRAME_SIZE,
  FrameReader,
  decodeFrame,
  encodeFrame,
  whichBody,
} from "./framing.js";

export {
  PROTOCOL_VERSION,
  deadlineAfter,
  isRegistrationAck,
  makeEnvelope,
  makeWireFrame,
  messageIdHex,
  newMessageId,
  remainingSeconds,
  validateRegistrationAck,
} from "./messages.js";

export { fabricV1, MessageKind, fystash } from "./_generated/index.js";
export type {
  BarrierArrive,
  BarrierRelease,
  Envelope,
  ErrorFrame,
  IEnvelope,
  Register,
  WireFrame,
} from "./_generated/index.js";
