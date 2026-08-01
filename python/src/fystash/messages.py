"""Message identifiers, deadlines, and envelope helpers."""

from __future__ import annotations

import time
import uuid
from collections.abc import Mapping

from ._generated.fabric_pb2 import Envelope, MessageKind, WireFrame
from .errors import ProtocolError, RemoteError

PROTOCOL_VERSION = 1


def new_message_id() -> bytes:
    """Return a collision-resistant 16-byte message identifier."""

    return uuid.uuid4().bytes


def message_id_hex(message_id: bytes) -> str:
    """Render a message identifier for logs and JSON results."""

    return message_id.hex()


def deadline_after(timeout_seconds: float | None) -> int:
    """Return an absolute Unix-millisecond deadline, or zero for no deadline."""

    if timeout_seconds is None:
        return 0
    if timeout_seconds < 0:
        raise ValueError("timeout must be non-negative")
    return int((time.time() + timeout_seconds) * 1000)


def remaining_seconds(deadline_unix_ms: int) -> float | None:
    """Return the time remaining until a deadline."""

    if deadline_unix_ms == 0:
        return None
    return max(0.0, (deadline_unix_ms / 1000) - time.time())


def is_registration_ack(
    frame: WireFrame,
    *,
    room_id: str | None = None,
    agent_id: str | None = None,
) -> bool:
    """Return whether a frame is the Rust router's registration acknowledgement."""

    if frame.WhichOneof("body") != "envelope":
        return False
    envelope = frame.envelope
    return (
        envelope.protocol_version == PROTOCOL_VERSION
        and envelope.source == "router"
        and envelope.kind == MessageKind.MESSAGE_KIND_ACK
        and envelope.headers.get("registration") == "accepted"
        and bool(envelope.message_id)
        and not envelope.payload
        and (room_id is None or envelope.room_id == room_id)
        and (agent_id is None or envelope.destination == agent_id)
    )


def validate_registration_ack(
    frame: WireFrame,
    *,
    room_id: str,
    agent_id: str,
) -> Envelope:
    """Validate the first direct-router response and return its ACK envelope."""

    if frame.WhichOneof("body") == "error":
        raise RemoteError(
            frame.error.code,
            frame.error.message,
            related_message_id=frame.error.related_message_id,
        )
    if not is_registration_ack(frame, room_id=room_id, agent_id=agent_id):
        raise ProtocolError(
            f"expected router registration ACK for room={room_id!r} agent={agent_id!r}"
        )
    return frame.envelope


def make_envelope(
    *,
    room_id: str,
    source: str,
    destination: str,
    payload: bytes,
    kind: MessageKind = MessageKind.MESSAGE_KIND_EVENT,
    message_id: bytes | None = None,
    stream_id: int = 0,
    sequence: int = 0,
    deadline_unix_ms: int = 0,
    headers: Mapping[str, str] | None = None,
) -> Envelope:
    """Construct a protocol-versioned envelope."""

    envelope = Envelope(
        protocol_version=PROTOCOL_VERSION,
        message_id=message_id or new_message_id(),
        room_id=room_id,
        source=source,
        destination=destination,
        kind=kind,
        stream_id=stream_id,
        sequence=sequence,
        deadline_unix_ms=deadline_unix_ms,
        payload=payload,
    )
    if headers:
        envelope.headers.update(headers)
    return envelope
