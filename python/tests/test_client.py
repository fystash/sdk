from __future__ import annotations

import asyncio
import contextlib
import tempfile
from collections.abc import AsyncIterator
from pathlib import Path

import pytest

from fystash import (
    FystashClient,
    RemoteError,
    RequestTimeoutError,
    UnsupportedOperationError,
    WireFrame,
    make_envelope,
)
from fystash._generated import fabric_pb2
from fystash.errors import ConnectionClosedError
from fystash.framing import read_frame, write_frame


class FakeFabric:
    def __init__(self) -> None:
        self.server: asyncio.Server | None = None
        self.port = 0
        self.registrations: list[fabric_pb2.Register] = []
        self.envelopes: asyncio.Queue[fabric_pb2.Envelope] = asyncio.Queue()
        self.writers: set[asyncio.StreamWriter] = set()
        self.dropped = asyncio.Event()
        self.registration_changed = asyncio.Event()

    async def start(self) -> None:
        self.server = await asyncio.start_server(self._handle, "127.0.0.1", 0)
        socket = self.server.sockets[0]
        self.port = int(socket.getsockname()[1])

    async def close(self) -> None:
        if self.server is not None:
            self.server.close()
            await self.server.wait_closed()
        writers = list(self.writers)
        for writer in writers:
            writer.close()
        await asyncio.gather(
            *(writer.wait_closed() for writer in writers),
            return_exceptions=True,
        )

    async def wait_for_registrations(self, count: int, timeout: float = 2.0) -> None:
        async def wait() -> None:
            while len(self.registrations) < count:
                self.registration_changed.clear()
                if len(self.registrations) < count:
                    await self.registration_changed.wait()

        await asyncio.wait_for(wait(), timeout)

    async def _handle(
        self,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ) -> None:
        self.writers.add(writer)
        try:
            while True:
                frame = await read_frame(reader)
                body = frame.WhichOneof("body")
                if body == "register":
                    registration = fabric_pb2.Register()
                    registration.CopyFrom(frame.register)
                    self.registrations.append(registration)
                    self.registration_changed.set()
                    await write_frame(
                        writer,
                        WireFrame(
                            envelope=make_envelope(
                                room_id=registration.room_id,
                                source="router",
                                destination=registration.agent_id,
                                payload=b"",
                                kind=fabric_pb2.MESSAGE_KIND_ACK,
                                message_id=len(self.registrations).to_bytes(8, "big"),
                                headers={"registration": "accepted"},
                            )
                        ),
                    )
                    continue
                if body == "barrier_arrive":
                    await write_frame(
                        writer,
                        WireFrame(
                            barrier_release=fabric_pb2.BarrierRelease(
                                room_id=frame.barrier_arrive.room_id,
                                barrier_id=frame.barrier_arrive.barrier_id,
                                participants=["worker-a", "worker-b"],
                            )
                        ),
                    )
                    continue
                if body != "envelope":
                    continue

                envelope = frame.envelope
                await self.envelopes.put(envelope)
                if envelope.payload == b"drop":
                    self.dropped.set()
                    writer.close()
                    await writer.wait_closed()
                    return
                if envelope.payload == b"remote-error":
                    await write_frame(
                        writer,
                        WireFrame(
                            error=fabric_pb2.ErrorFrame(
                                code="TEST_ERROR",
                                message="requested failure",
                                related_message_id=envelope.message_id,
                            )
                        ),
                    )
                    continue
                if envelope.payload == b"push":
                    await write_frame(
                        writer,
                        WireFrame(
                            envelope=make_envelope(
                                room_id=envelope.room_id,
                                source="server",
                                destination=envelope.source,
                                payload=b"pushed",
                            )
                        ),
                    )
                    continue
                if envelope.payload == b"no-response":
                    continue
                if envelope.kind == fabric_pb2.MESSAGE_KIND_REQUEST:
                    response = make_envelope(
                        room_id=envelope.room_id,
                        source=envelope.destination,
                        destination=envelope.source,
                        payload=envelope.payload.upper(),
                        kind=fabric_pb2.MESSAGE_KIND_RESPONSE,
                        message_id=envelope.message_id,
                        headers={"reply_to": envelope.message_id.hex()},
                    )
                    await write_frame(writer, WireFrame(envelope=response))
        except ConnectionClosedError:
            pass
        finally:
            self.writers.discard(writer)
            writer.close()
            with contextlib.suppress(Exception):
                await writer.wait_closed()


@pytest.fixture
async def fabric() -> AsyncIterator[FakeFabric]:
    instance = FakeFabric()
    await instance.start()
    yield instance
    await instance.close()


@pytest.mark.asyncio
async def test_register_request_receive_subscribe_and_barrier(fabric: FakeFabric) -> None:
    async with FystashClient.tcp(
        "127.0.0.1",
        fabric.port,
        room_id="room-1",
        agent_id="worker-a",
        subscriptions=["initial"],
    ) as client:
        response = await client.request("worker-b", b"hello", timeout=1)
        assert response.payload == b"HELLO"

        await client.send("server", b"push")
        pushed = await client.receive(timeout=1)
        assert pushed.payload == b"pushed"

        with pytest.raises(UnsupportedOperationError, match="cannot change"):
            await client.subscribe("updates")
        assert len(fabric.registrations) == 1

        release = await client.barrier("ready", 2, timeout=1)
        assert release.barrier_id == "ready"
        assert list(release.participants) == ["worker-a", "worker-b"]

        message_ids = await client.fanout(["worker-b", "worker-c"], b"event")
        assert len(message_ids) == 2
        assert all(len(message_id) == 16 for message_id in message_ids)

    assert fabric.registrations[0].protocol_version == 1
    assert fabric.registrations[0].room_id == "room-1"
    assert fabric.registrations[0].agent_id == "worker-a"


@pytest.mark.asyncio
async def test_correlated_remote_error(fabric: FakeFabric) -> None:
    async with FystashClient.tcp(
        "127.0.0.1",
        fabric.port,
        room_id="room",
        agent_id="worker",
    ) as client:
        with pytest.raises(RemoteError, match="TEST_ERROR"):
            await client.request("server", b"remote-error", timeout=1)


@pytest.mark.asyncio
async def test_respond_uses_fresh_id_and_reply_to(fabric: FakeFabric) -> None:
    request = make_envelope(
        room_id="room",
        source="requester",
        destination="worker",
        payload=b"question",
        kind=fabric_pb2.MESSAGE_KIND_REQUEST,
    )
    async with FystashClient.tcp(
        "127.0.0.1",
        fabric.port,
        room_id="room",
        agent_id="worker",
    ) as client:
        response_id = await client.respond(request, b"answer")
        response = await asyncio.wait_for(fabric.envelopes.get(), 1)

    assert response_id != request.message_id
    assert response.message_id == response_id
    assert response.headers["reply_to"] == request.message_id.hex()


@pytest.mark.asyncio
async def test_request_deadline_times_out_and_sends_cancel(fabric: FakeFabric) -> None:
    async with FystashClient.tcp(
        "127.0.0.1",
        fabric.port,
        room_id="room",
        agent_id="worker",
    ) as client:
        with pytest.raises(RequestTimeoutError):
            await client.request("server", b"no-response", timeout=0.01)
        request = await asyncio.wait_for(fabric.envelopes.get(), 1)
        cancel = await asyncio.wait_for(fabric.envelopes.get(), 1)

    assert request.deadline_unix_ms > 0
    assert cancel.kind == fabric_pb2.MESSAGE_KIND_CANCEL
    assert cancel.message_id != request.message_id
    assert cancel.headers["reply_to"] == request.message_id.hex()


@pytest.mark.asyncio
async def test_automatic_reconnect_registers_again(fabric: FakeFabric) -> None:
    async with FystashClient.tcp(
        "127.0.0.1",
        fabric.port,
        room_id="room",
        agent_id="worker",
        reconnect_initial_delay=0.01,
        reconnect_jitter=0,
    ) as client:
        await client.send("server", b"drop")
        await asyncio.wait_for(fabric.dropped.wait(), 1)
        await fabric.wait_for_registrations(2)
        await client.wait_until_connected(timeout=1)

        response = await client.request("server", b"after", timeout=1)

    assert response.payload == b"AFTER"


@pytest.mark.asyncio
async def test_auto_unix_mode_connects_without_registering() -> None:
    temporary = tempfile.TemporaryDirectory(prefix="fystash-sdk-", dir="/tmp")
    socket_path = Path(temporary.name) / "daemon.sock"
    received: asyncio.Queue[WireFrame] = asyncio.Queue()

    async def handle(
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ) -> None:
        try:
            await received.put(await read_frame(reader))
        finally:
            writer.close()
            await writer.wait_closed()

    server = await asyncio.start_unix_server(handle, socket_path)
    try:
        async with FystashClient.unix(
            socket_path,
            room_id="informational-room",
            agent_id="informational-agent",
        ) as client:
            assert client.registration_mode == "daemon"
            await client.send("target", b"through-daemon")
            frame = await asyncio.wait_for(received.get(), 1)
            with pytest.raises(UnsupportedOperationError, match="daemon owns identity"):
                await client.register()
            with pytest.raises(UnsupportedOperationError, match="daemon topics"):
                await client.subscribe("updates")
    finally:
        server.close()
        await server.wait_closed()
        temporary.cleanup()

    assert frame.WhichOneof("body") == "envelope"
    assert frame.envelope.payload == b"through-daemon"
