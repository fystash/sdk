"""Length-prefixed protobuf framing for the fabric transport."""

from __future__ import annotations

import asyncio
import struct
from collections.abc import Awaitable, Callable

from google.protobuf.message import DecodeError

from ._generated.fabric_pb2 import WireFrame
from .errors import ConnectionClosedError, FrameTooLargeError, ProtocolError

DEFAULT_MAX_FRAME_SIZE = 16 * 1024 * 1024
_LENGTH = struct.Struct("!I")

Drain = Callable[[], Awaitable[object]]


def encode_frame(frame: WireFrame, *, max_frame_size: int = DEFAULT_MAX_FRAME_SIZE) -> bytes:
    """Serialize a frame with a four-byte unsigned big-endian length prefix."""

    payload = frame.SerializeToString()
    if len(payload) > max_frame_size:
        raise FrameTooLargeError(len(payload), max_frame_size)
    return _LENGTH.pack(len(payload)) + payload


def decode_frame(payload: bytes, *, max_frame_size: int = DEFAULT_MAX_FRAME_SIZE) -> WireFrame:
    """Decode a protobuf frame body without a length prefix."""

    if len(payload) > max_frame_size:
        raise FrameTooLargeError(len(payload), max_frame_size)
    frame = WireFrame()
    try:
        frame.ParseFromString(payload)
    except DecodeError as exc:
        raise ProtocolError("invalid WireFrame protobuf") from exc
    if frame.WhichOneof("body") is None:
        raise ProtocolError("WireFrame body is not set")
    return frame


async def read_frame(
    reader: asyncio.StreamReader,
    *,
    max_frame_size: int = DEFAULT_MAX_FRAME_SIZE,
) -> WireFrame:
    """Read one complete length-prefixed frame."""

    try:
        header = await reader.readexactly(_LENGTH.size)
    except asyncio.IncompleteReadError as exc:
        raise ConnectionClosedError("connection closed while reading frame length") from exc
    (size,) = _LENGTH.unpack(header)
    if size > max_frame_size:
        raise FrameTooLargeError(size, max_frame_size)
    try:
        payload = await reader.readexactly(size)
    except asyncio.IncompleteReadError as exc:
        raise ConnectionClosedError("connection closed while reading frame body") from exc
    return decode_frame(payload, max_frame_size=max_frame_size)


async def write_frame(
    writer: asyncio.StreamWriter,
    frame: WireFrame,
    *,
    max_frame_size: int = DEFAULT_MAX_FRAME_SIZE,
) -> None:
    """Write and drain one complete frame."""

    writer.write(encode_frame(frame, max_frame_size=max_frame_size))
    await writer.drain()
