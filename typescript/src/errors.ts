/** Exceptions raised by the Fystash TypeScript SDK (wire + HTTP). */

export class FystashError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FystashError";
  }
}

export class ConfigurationError extends FystashError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class UnsupportedOperationError extends FystashError {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedOperationError";
  }
}

export class ProtocolError extends FystashError {
  constructor(message: string) {
    super(message);
    this.name = "ProtocolError";
  }
}

export class FrameTooLargeError extends ProtocolError {
  readonly size: number;
  readonly maximum: number;

  constructor(size: number, maximum: number) {
    super(`frame size ${size} exceeds maximum ${maximum}`);
    this.name = "FrameTooLargeError";
    this.size = size;
    this.maximum = maximum;
  }
}

export class ConnectionClosedError extends FystashError {
  constructor(message: string) {
    super(message);
    this.name = "ConnectionClosedError";
  }
}

export class ConnectionLostError extends FystashError {
  constructor(message: string) {
    super(message);
    this.name = "ConnectionLostError";
  }
}

export class NotConnectedError extends ConnectionLostError {
  constructor(message: string) {
    super(message);
    this.name = "NotConnectedError";
  }
}

export class RequestTimeoutError extends FystashError {
  constructor(message: string) {
    super(message);
    this.name = "RequestTimeoutError";
  }
}

export class RemoteError extends FystashError {
  readonly code: string;
  readonly relatedMessageId: Uint8Array;

  constructor(
    code: string,
    message: string,
    relatedMessageId: Uint8Array = new Uint8Array(),
  ) {
    super(code ? `${code}: ${message}` : message);
    this.name = "RemoteError";
    this.code = code;
    this.relatedMessageId = relatedMessageId;
  }
}
