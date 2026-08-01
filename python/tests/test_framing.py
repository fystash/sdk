from __future__ import annotations

import asyncio
import struct

import pytest

from fystash import (
    FrameTooLargeError,
    ProtocolError,
    WireFrame,
    decode_frame,
    encode_frame,
    make_envelope,
    read_frame,
)
from fystash.errors import ConnectionClosedError


def sample_frame(payload: bytes = b"hello") -> WireFrame:
    return WireFrame(
        envelope=make_envelope(
            room_id="room",
            source="a",
            destination="b",
            payload=payload,
        )
    )


def test_frame_round_trip() -> None:
    frame = sample_frame()
    encoded = encode_frame(frame)
    (size,) = struct.unpack("!I", encoded[:4])

    assert size == len(encoded) - 4
    assert decode_frame(encoded[4:]) == frame


def test_frame_size_limit_is_enforced_on_encode_and_decode() -> None:
    frame = sample_frame(b"x" * 32)
    with pytest.raises(FrameTooLargeError):
        encode_frame(frame, max_frame_size=8)

    with pytest.raises(FrameTooLargeError):
        decode_frame(frame.SerializeToString(), max_frame_size=8)


def test_empty_wire_frame_is_rejected() -> None:
    with pytest.raises(ProtocolError, match="body is not set"):
        decode_frame(WireFrame().SerializeToString())


@pytest.mark.asyncio
async def test_read_frame_handles_fragmented_input() -> None:
    reader = asyncio.StreamReader()
    encoded = encode_frame(sample_frame())
    reader.feed_data(encoded[:2])
    await asyncio.sleep(0)
    reader.feed_data(encoded[2:])

    result = await read_frame(reader)

    assert result.envelope.payload == b"hello"


@pytest.mark.asyncio
async def test_read_frame_reports_truncation() -> None:
    reader = asyncio.StreamReader()
    reader.feed_data(struct.pack("!I", 20) + b"short")
    reader.feed_eof()

    with pytest.raises(ConnectionClosedError):
        await read_frame(reader)
