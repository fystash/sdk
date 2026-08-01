"""Exceptions raised by the Fystash SDK."""

from __future__ import annotations


class FystashError(Exception):
    """Base class for SDK errors."""


class ConfigurationError(FystashError, ValueError):
    """The client or endpoint configuration is invalid."""


class UnsupportedOperationError(FystashError):
    """The selected transport mode cannot perform an operation safely."""


class ProtocolError(FystashError):
    """A peer sent an invalid fabric frame."""


class FrameTooLargeError(ProtocolError):
    """A frame exceeds the configured safety limit."""

    def __init__(self, size: int, maximum: int) -> None:
        super().__init__(f"frame size {size} exceeds maximum {maximum}")
        self.size = size
        self.maximum = maximum


class ConnectionClosedError(FystashError):
    """The transport closed before a complete frame was read."""


class ConnectionLostError(FystashError):
    """The active transport failed."""


class NotConnectedError(ConnectionLostError):
    """No usable connection is available."""


class RequestTimeoutError(FystashError, TimeoutError):
    """A request or barrier did not complete before its deadline."""


class RemoteError(FystashError):
    """An error frame returned by the fabric."""

    def __init__(
        self,
        code: str,
        message: str,
        *,
        related_message_id: bytes = b"",
    ) -> None:
        super().__init__(f"{code}: {message}" if code else message)
        self.code = code
        self.message = message
        self.related_message_id = related_message_id
