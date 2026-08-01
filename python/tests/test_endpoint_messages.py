from __future__ import annotations

import pytest

from fystash import (
    Endpoint,
    WireFrame,
    deadline_after,
    is_registration_ack,
    make_envelope,
    new_message_id,
    validate_registration_ack,
)
from fystash._generated import fabric_pb2
from fystash.errors import ConfigurationError, ProtocolError, RemoteError


def test_endpoint_parsing() -> None:
    assert Endpoint.parse("unix:///tmp/fystash.sock") == Endpoint.unix("/tmp/fystash.sock")
    assert Endpoint.parse("/tmp/fystash.sock") == Endpoint.unix("/tmp/fystash.sock")
    assert Endpoint.parse("tcp://localhost:7447") == Endpoint.tcp("localhost", 7447)
    assert Endpoint.parse("fystash://127.0.0.1:9000") == Endpoint.tcp("127.0.0.1", 9000)


@pytest.mark.parametrize("value", ["udp://localhost:1", "tcp://localhost", "tcp://:7447"])
def test_invalid_endpoint_is_rejected(value: str) -> None:
    with pytest.raises(ConfigurationError):
        Endpoint.parse(value)


def test_message_helpers() -> None:
    first = new_message_id()
    second = new_message_id()
    envelope = make_envelope(
        room_id="r",
        source="a",
        destination="b",
        payload=b"data",
        headers={"trace": "abc"},
    )

    assert len(first) == 16
    assert first != second
    assert envelope.protocol_version == 1
    assert envelope.headers["trace"] == "abc"
    assert deadline_after(None) == 0
    assert deadline_after(1) > 0
    with pytest.raises(ValueError):
        deadline_after(-1)


def test_registration_ack_validation() -> None:
    acknowledgement = WireFrame(
        envelope=make_envelope(
            room_id="room",
            source="router",
            destination="agent",
            payload=b"",
            kind=fabric_pb2.MESSAGE_KIND_ACK,
            message_id=b"connection",
            headers={"registration": "accepted"},
        )
    )

    assert is_registration_ack(acknowledgement, room_id="room", agent_id="agent")
    assert (
        validate_registration_ack(
            acknowledgement,
            room_id="room",
            agent_id="agent",
        ).source
        == "router"
    )
    with pytest.raises(ProtocolError):
        validate_registration_ack(acknowledgement, room_id="other", agent_id="agent")
    with pytest.raises(RemoteError, match="rejected"):
        validate_registration_ack(
            WireFrame(
                error=fabric_pb2.ErrorFrame(
                    code="rejected",
                    message="no",
                )
            ),
            room_id="room",
            agent_id="agent",
        )
