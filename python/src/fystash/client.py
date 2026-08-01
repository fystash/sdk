"""Async client for the Fystash fabric protocol."""

from __future__ import annotations

import asyncio
import contextlib
import logging
import random
import ssl
from collections.abc import Iterable, Mapping
from pathlib import Path
from types import TracebackType
from typing import Any, Literal, Self

from ._generated import fabric_pb2
from .endpoint import Endpoint
from .errors import (
    ConnectionLostError,
    FystashError,
    NotConnectedError,
    ProtocolError,
    RemoteError,
    RequestTimeoutError,
    UnsupportedOperationError,
)
from .framing import DEFAULT_MAX_FRAME_SIZE, read_frame, write_frame
from .messages import (
    PROTOCOL_VERSION,
    deadline_after,
    is_registration_ack,
    make_envelope,
    new_message_id,
    remaining_seconds,
    validate_registration_ack,
)

logger = logging.getLogger(__name__)
RegistrationMode = Literal["auto", "direct", "daemon"]
ResolvedRegistrationMode = Literal["direct", "daemon"]


class FystashClient:
    """A reconnecting async client over Unix-domain sockets or TCP.

    Request responses are correlated through the ``reply_to`` header. Response
    and cancellation frames always use new message IDs because the Rust router
    deduplicates IDs across the entire room.

    ``registration_mode="auto"`` selects daemon mode for Unix sockets and
    direct mode for TCP. Direct mode sends exactly one Register frame and
    validates the router ACK. Daemon mode sends no Register frame because the
    guest daemon owns router identity.

    Requests that were in flight when a connection drops fail instead of being
    replayed, because replaying an arbitrary request is not safely idempotent.
    """

    def __init__(
        self,
        endpoint: str | Path | Endpoint,
        *,
        room_id: str,
        agent_id: str,
        session_token: bytes = b"",
        subscriptions: Iterable[str] = (),
        registration_mode: RegistrationMode = "auto",
        auto_reconnect: bool = True,
        connect_timeout: float = 10.0,
        reconnect_initial_delay: float = 0.05,
        reconnect_max_delay: float = 5.0,
        reconnect_jitter: float = 0.2,
        max_reconnect_attempts: int | None = None,
        max_frame_size: int = DEFAULT_MAX_FRAME_SIZE,
        incoming_queue_size: int = 1024,
        ssl_context: ssl.SSLContext | None = None,
    ) -> None:
        if not room_id:
            raise ValueError("room_id must not be empty")
        if not agent_id:
            raise ValueError("agent_id must not be empty")
        if connect_timeout <= 0:
            raise ValueError("connect_timeout must be positive")
        if reconnect_initial_delay < 0 or reconnect_max_delay < reconnect_initial_delay:
            raise ValueError("invalid reconnect delay range")
        if not 0 <= reconnect_jitter <= 1:
            raise ValueError("reconnect_jitter must be between zero and one")
        if max_reconnect_attempts is not None and max_reconnect_attempts < 0:
            raise ValueError("max_reconnect_attempts must be non-negative")
        if incoming_queue_size <= 0:
            raise ValueError("incoming_queue_size must be positive")

        self.endpoint = Endpoint.parse(endpoint)
        if registration_mode not in {"auto", "direct", "daemon"}:
            raise ValueError("registration_mode must be 'auto', 'direct', or 'daemon'")
        self.requested_registration_mode = registration_mode
        self.registration_mode: ResolvedRegistrationMode = (
            "daemon"
            if registration_mode == "daemon"
            or (registration_mode == "auto" and self.endpoint.unix_path is not None)
            else "direct"
        )
        self.room_id = room_id
        self.agent_id = agent_id
        self.session_token = session_token
        self.subscriptions = set(subscriptions)
        if self.registration_mode == "daemon" and self.session_token:
            raise UnsupportedOperationError(
                "daemon mode session_token is owned by fystash-guest-daemon"
            )
        if self.registration_mode == "daemon" and self.subscriptions:
            raise UnsupportedOperationError(
                "daemon mode subscriptions are owned by fystash-guest-daemon; "
                "configure them when launching the daemon"
            )
        self.auto_reconnect = auto_reconnect
        self.connect_timeout = connect_timeout
        self.reconnect_initial_delay = reconnect_initial_delay
        self.reconnect_max_delay = reconnect_max_delay
        self.reconnect_jitter = reconnect_jitter
        self.max_reconnect_attempts = max_reconnect_attempts
        self.max_frame_size = max_frame_size
        self.ssl_context = ssl_context

        self._reader: asyncio.StreamReader | None = None
        self._writer: asyncio.StreamWriter | None = None
        self._reader_task: asyncio.Task[None] | None = None
        self._connected = asyncio.Event()
        self._connect_lock = asyncio.Lock()
        self._write_lock = asyncio.Lock()
        self._closing = False
        self._incoming: asyncio.Queue[fabric_pb2.Envelope] = asyncio.Queue(
            maxsize=incoming_queue_size
        )
        self._errors: asyncio.Queue[RemoteError] = asyncio.Queue()
        self._pending: dict[bytes, asyncio.Future[fabric_pb2.Envelope]] = {}
        self._barriers: dict[str, asyncio.Future[fabric_pb2.BarrierRelease]] = {}
        self._last_connection_error: BaseException | None = None

    @classmethod
    def unix(
        cls,
        path: str | Path,
        *,
        room_id: str,
        agent_id: str,
        **kwargs: Any,
    ) -> FystashClient:
        """Create a client configured for a Unix-domain socket."""

        return cls(Endpoint.unix(path), room_id=room_id, agent_id=agent_id, **kwargs)

    @classmethod
    def tcp(
        cls,
        host: str,
        port: int,
        *,
        room_id: str,
        agent_id: str,
        **kwargs: Any,
    ) -> FystashClient:
        """Create a client configured for a TCP socket."""

        return cls(Endpoint.tcp(host, port), room_id=room_id, agent_id=agent_id, **kwargs)

    async def __aenter__(self) -> Self:
        await self.connect()
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        await self.close()

    @property
    def is_connected(self) -> bool:
        """Whether a registered direct transport or daemon socket is available."""

        return self._connected.is_set() and self._writer is not None

    @property
    def last_connection_error(self) -> BaseException | None:
        """The most recent transport error, if any."""

        return self._last_connection_error

    async def connect(self) -> None:
        """Open the transport and complete the mode-specific handshake."""

        async with self._connect_lock:
            if self.is_connected:
                return
            if self._reader_task is not None and not self._reader_task.done():
                await asyncio.wait_for(self._connected.wait(), timeout=self.connect_timeout)
                return
            self._closing = False
            await self._open_transport()
            self._reader_task = asyncio.create_task(
                self._reader_loop(),
                name=f"fystash-reader-{self.agent_id}",
            )

    async def close(self) -> None:
        """Stop reconnecting and close the active transport."""

        self._closing = True
        self._connected.clear()
        task = self._reader_task
        self._reader_task = None
        if task is not None:
            task.cancel()
        await self._close_writer()
        if task is not None:
            with contextlib.suppress(asyncio.CancelledError):
                await task
        self._fail_waiters(ConnectionLostError("client closed"))

    async def reconnect(self) -> None:
        """Replace the connection and repeat the mode-specific handshake."""

        async with self._connect_lock:
            if self._closing:
                raise NotConnectedError("client is closed")
            task = self._reader_task
            self._reader_task = None
            self._connected.clear()
            if task is not None:
                task.cancel()
            await self._close_writer()
            if task is not None:
                with contextlib.suppress(asyncio.CancelledError):
                    await task
            self._fail_waiters(ConnectionLostError("connection replaced"))
            await self._open_transport()
            self._reader_task = asyncio.create_task(
                self._reader_loop(),
                name=f"fystash-reader-{self.agent_id}",
            )

    async def wait_until_connected(self, *, timeout: float | None = None) -> None:
        """Wait for the initial connection or an automatic reconnect."""

        if self.is_connected:
            return
        task = self._reader_task
        if task is None or task.done():
            detail = f": {self._last_connection_error}" if self._last_connection_error else ""
            raise NotConnectedError(f"client is not reconnecting{detail}")
        try:
            await asyncio.wait_for(
                self._connected.wait(),
                timeout=self.connect_timeout if timeout is None else timeout,
            )
        except TimeoutError as exc:
            raise NotConnectedError("timed out waiting for a connection") from exc

    async def register(
        self,
        *,
        room_id: str | None = None,
        agent_id: str | None = None,
        session_token: bytes | None = None,
        subscriptions: Iterable[str] | None = None,
    ) -> None:
        """Perform the one initial direct registration.

        The Rust router permits one Register frame per connection. Dynamic
        registration is therefore rejected after connecting. Daemon mode never
        permits this operation because the guest daemon owns registration.
        """

        if self.registration_mode == "daemon":
            raise UnsupportedOperationError(
                "register() is unavailable in daemon mode; the guest daemon owns identity"
            )
        if self.is_connected or (self._reader_task is not None and not self._reader_task.done()):
            raise UnsupportedOperationError(
                "the Rust router permits exactly one Register frame per connection"
            )

        if room_id is not None:
            if not room_id:
                raise ValueError("room_id must not be empty")
            self.room_id = room_id
        if agent_id is not None:
            if not agent_id:
                raise ValueError("agent_id must not be empty")
            self.agent_id = agent_id
        if session_token is not None:
            self.session_token = session_token
        if subscriptions is not None:
            self.subscriptions = set(subscriptions)
        await self.connect()

    async def subscribe(self, *topics: str) -> None:
        """Configure direct-mode subscriptions before connecting."""

        if any(not topic for topic in topics):
            raise ValueError("subscription names must not be empty")
        if self.registration_mode == "daemon":
            raise UnsupportedOperationError(
                "subscribe() is unavailable in daemon mode; configure daemon topics at launch"
            )
        if self.is_connected or (self._reader_task is not None and not self._reader_task.done()):
            raise UnsupportedOperationError(
                "subscriptions cannot change after the one router registration"
            )
        self.subscriptions.update(topics)

    async def send(
        self,
        destination: str,
        payload: bytes | bytearray | memoryview | str,
        *,
        kind: fabric_pb2.MessageKind = fabric_pb2.MESSAGE_KIND_EVENT,
        message_id: bytes | None = None,
        stream_id: int = 0,
        sequence: int = 0,
        deadline_unix_ms: int = 0,
        headers: Mapping[str, str] | None = None,
    ) -> bytes:
        """Send an envelope and return its message identifier."""

        if not destination:
            raise ValueError("destination must not be empty")
        payload_bytes = payload.encode() if isinstance(payload, str) else bytes(payload)
        envelope = make_envelope(
            room_id=self.room_id,
            source=self.agent_id,
            destination=destination,
            payload=payload_bytes,
            kind=kind,
            message_id=message_id,
            stream_id=stream_id,
            sequence=sequence,
            deadline_unix_ms=deadline_unix_ms,
            headers=headers,
        )
        await self._send_wire(fabric_pb2.WireFrame(envelope=envelope))
        return envelope.message_id

    async def respond(
        self,
        request: fabric_pb2.Envelope,
        payload: bytes | bytearray | memoryview | str,
        *,
        kind: fabric_pb2.MessageKind = fabric_pb2.MESSAGE_KIND_RESPONSE,
        headers: Mapping[str, str] | None = None,
    ) -> bytes:
        """Respond with a fresh ID correlated through ``reply_to``."""

        response_headers = dict(headers or {})
        response_headers.setdefault("reply_to", request.message_id.hex())
        return await self.send(
            request.source,
            payload,
            kind=kind,
            message_id=new_message_id(),
            stream_id=request.stream_id,
            sequence=request.sequence,
            headers=response_headers,
        )

    async def request(
        self,
        destination: str,
        payload: bytes | bytearray | memoryview | str,
        *,
        timeout: float | None = 30.0,
        deadline_unix_ms: int | None = None,
        headers: Mapping[str, str] | None = None,
    ) -> fabric_pb2.Envelope:
        """Send a request and await its correlated response."""

        if timeout is not None and timeout < 0:
            raise ValueError("timeout must be non-negative")
        message_id = new_message_id()
        deadline = deadline_after(timeout) if deadline_unix_ms is None else deadline_unix_ms
        loop = asyncio.get_running_loop()
        future: asyncio.Future[fabric_pb2.Envelope] = loop.create_future()
        self._pending[message_id] = future
        try:
            await self.send(
                destination,
                payload,
                kind=fabric_pb2.MESSAGE_KIND_REQUEST,
                message_id=message_id,
                deadline_unix_ms=deadline,
                headers=headers,
            )
            wait_timeout = timeout
            if deadline:
                deadline_timeout = remaining_seconds(deadline)
                assert deadline_timeout is not None
                wait_timeout = (
                    deadline_timeout
                    if wait_timeout is None
                    else min(wait_timeout, deadline_timeout)
                )
            try:
                if wait_timeout is None:
                    return await future
                return await asyncio.wait_for(asyncio.shield(future), timeout=wait_timeout)
            except TimeoutError as exc:
                await self._send_cancel_best_effort(destination, message_id)
                raise RequestTimeoutError(
                    f"request {message_id.hex()} exceeded its deadline"
                ) from exc
        finally:
            self._pending.pop(message_id, None)
            if not future.done():
                future.cancel()

    async def receive(self, *, timeout: float | None = None) -> fabric_pb2.Envelope:
        """Receive the next unsolicited envelope, raising queued remote errors."""

        if timeout is not None and timeout < 0:
            raise ValueError("timeout must be non-negative")
        message_task = asyncio.create_task(self._incoming.get())
        error_task = asyncio.create_task(self._errors.get())
        try:
            done, _ = await asyncio.wait(
                {message_task, error_task},
                timeout=timeout,
                return_when=asyncio.FIRST_COMPLETED,
            )
            if not done:
                raise RequestTimeoutError("receive timed out")
            if message_task in done:
                if error_task in done:
                    self._errors.put_nowait(error_task.result())
                return message_task.result()
            raise error_task.result()
        finally:
            for task in (message_task, error_task):
                if not task.done():
                    task.cancel()
            await asyncio.gather(message_task, error_task, return_exceptions=True)

    async def fanout(
        self,
        destinations: Iterable[str],
        payload: bytes | bytearray | memoryview | str,
        *,
        headers: Mapping[str, str] | None = None,
        deadline_unix_ms: int = 0,
    ) -> list[bytes]:
        """Send one event to each destination."""

        targets = list(destinations)
        if not targets:
            return []
        return [
            await self.send(
                destination,
                payload,
                headers=headers,
                deadline_unix_ms=deadline_unix_ms,
            )
            for destination in targets
        ]

    async def barrier(
        self,
        barrier_id: str,
        parties: int,
        *,
        timeout: float | None = 30.0,
    ) -> fabric_pb2.BarrierRelease:
        """Arrive at a named room barrier and wait for its release."""

        if not barrier_id:
            raise ValueError("barrier_id must not be empty")
        if parties <= 0:
            raise ValueError("parties must be positive")
        loop = asyncio.get_running_loop()
        future: asyncio.Future[fabric_pb2.BarrierRelease] = loop.create_future()
        if barrier_id in self._barriers:
            raise FystashError(f"already waiting at barrier {barrier_id!r}")
        self._barriers[barrier_id] = future
        frame = fabric_pb2.WireFrame(
            barrier_arrive=fabric_pb2.BarrierArrive(
                room_id=self.room_id,
                barrier_id=barrier_id,
                parties=parties,
            )
        )
        try:
            await self._send_wire(frame)
            try:
                if timeout is None:
                    return await future
                return await asyncio.wait_for(asyncio.shield(future), timeout=timeout)
            except TimeoutError as exc:
                raise RequestTimeoutError(f"barrier {barrier_id!r} timed out") from exc
        finally:
            self._barriers.pop(barrier_id, None)
            if not future.done():
                future.cancel()

    async def _open_transport(self) -> None:
        async def open_connection() -> tuple[asyncio.StreamReader, asyncio.StreamWriter]:
            if self.endpoint.unix_path is not None:
                return await asyncio.open_unix_connection(self.endpoint.unix_path)
            assert self.endpoint.host is not None and self.endpoint.port is not None
            return await asyncio.open_connection(
                self.endpoint.host,
                self.endpoint.port,
                ssl=self.ssl_context,
            )

        writer: asyncio.StreamWriter | None = None
        try:
            reader, writer = await asyncio.wait_for(
                open_connection(),
                timeout=self.connect_timeout,
            )
            assert writer is not None
            if self.registration_mode == "direct":
                await write_frame(
                    writer,
                    self._registration_frame(),
                    max_frame_size=self.max_frame_size,
                )
                acknowledgement = await asyncio.wait_for(
                    read_frame(reader, max_frame_size=self.max_frame_size),
                    timeout=self.connect_timeout,
                )
                validate_registration_ack(
                    acknowledgement,
                    room_id=self.room_id,
                    agent_id=self.agent_id,
                )
        except Exception as exc:
            if writer is not None:
                writer.close()
                with contextlib.suppress(Exception):
                    await writer.wait_closed()
            self._last_connection_error = exc
            if isinstance(exc, (ProtocolError, RemoteError)):
                raise
            raise ConnectionLostError(
                f"failed to connect to {self.endpoint.display_name}: {exc}"
            ) from exc
        self._reader = reader
        self._writer = writer
        self._last_connection_error = None
        self._connected.set()

    def _registration_frame(self) -> fabric_pb2.WireFrame:
        return fabric_pb2.WireFrame(
            register=fabric_pb2.Register(
                protocol_version=PROTOCOL_VERSION,
                room_id=self.room_id,
                agent_id=self.agent_id,
                session_token=self.session_token,
                subscriptions=sorted(self.subscriptions),
            )
        )

    async def _send_wire(self, frame: fabric_pb2.WireFrame) -> None:
        await self.wait_until_connected()
        async with self._write_lock:
            writer = self._writer
            if writer is None or not self._connected.is_set():
                raise NotConnectedError("connection became unavailable before write")
            try:
                await write_frame(writer, frame, max_frame_size=self.max_frame_size)
            except Exception as exc:
                self._connected.clear()
                writer.close()
                raise ConnectionLostError("connection failed while writing frame") from exc

    async def _reader_loop(self) -> None:
        reconnect_attempt = 0
        while not self._closing:
            reader = self._reader
            if reader is None:
                return
            try:
                frame = await read_frame(reader, max_frame_size=self.max_frame_size)
                reconnect_attempt = 0
                await self._dispatch(frame)
                continue
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                self._last_connection_error = exc
                self._connected.clear()
                await self._close_writer()
                self._fail_waiters(ConnectionLostError(f"connection lost: {exc}"))
                if not self.auto_reconnect or self._closing:
                    return

            while not self._closing:
                if (
                    self.max_reconnect_attempts is not None
                    and reconnect_attempt >= self.max_reconnect_attempts
                ):
                    return
                reconnect_attempt += 1
                delay = min(
                    self.reconnect_max_delay,
                    self.reconnect_initial_delay * (2 ** (reconnect_attempt - 1)),
                )
                if delay:
                    spread = delay * self.reconnect_jitter
                    await asyncio.sleep(max(0.0, delay + random.uniform(-spread, spread)))
                try:
                    await self._open_transport()
                    break
                except FystashError as exc:
                    logger.debug(
                        "Fystash reconnect attempt %d failed: %s",
                        reconnect_attempt,
                        exc,
                    )
            if self._closing:
                return

    async def _dispatch(self, frame: fabric_pb2.WireFrame) -> None:
        body = frame.WhichOneof("body")
        if body == "envelope":
            envelope = frame.envelope
            if is_registration_ack(frame, room_id=self.room_id, agent_id=self.agent_id):
                return
            pending = self._find_pending(envelope)
            if pending is not None and envelope.kind in {
                fabric_pb2.MESSAGE_KIND_RESPONSE,
                fabric_pb2.MESSAGE_KIND_ACK,
                fabric_pb2.MESSAGE_KIND_ERROR,
            }:
                if not pending.done():
                    if envelope.kind == fabric_pb2.MESSAGE_KIND_ERROR:
                        pending.set_exception(
                            RemoteError(
                                envelope.headers.get("code", "REMOTE_ERROR"),
                                envelope.payload.decode(errors="replace"),
                                related_message_id=envelope.message_id,
                            )
                        )
                    else:
                        pending.set_result(envelope)
                return
            await self._incoming.put(envelope)
            return

        if body == "barrier_release":
            release = frame.barrier_release
            barrier_future = self._barriers.get(release.barrier_id)
            if barrier_future is not None and not barrier_future.done():
                barrier_future.set_result(release)
            return

        if body == "error":
            error = RemoteError(
                frame.error.code,
                frame.error.message,
                related_message_id=frame.error.related_message_id,
            )
            pending_future = self._pending.get(frame.error.related_message_id)
            if pending_future is not None and not pending_future.done():
                pending_future.set_exception(error)
            else:
                await self._errors.put(error)
            return

        if body == "register":
            await self._errors.put(
                RemoteError("PROTOCOL_ERROR", "server sent an unexpected Register frame")
            )
            return

        if body == "barrier_arrive":
            await self._errors.put(
                RemoteError("PROTOCOL_ERROR", "server sent an unexpected BarrierArrive frame")
            )

    def _find_pending(
        self,
        envelope: fabric_pb2.Envelope,
    ) -> asyncio.Future[fabric_pb2.Envelope] | None:
        future = self._pending.get(envelope.message_id)
        if future is not None:
            return future
        reply_to = envelope.headers.get("reply_to")
        if not reply_to:
            return None
        try:
            return self._pending.get(bytes.fromhex(reply_to))
        except ValueError:
            return None

    async def _send_cancel_best_effort(self, destination: str, message_id: bytes) -> None:
        if not self.is_connected:
            return
        with contextlib.suppress(FystashError):
            await self.send(
                destination,
                b"",
                kind=fabric_pb2.MESSAGE_KIND_CANCEL,
                message_id=new_message_id(),
                headers={"reply_to": message_id.hex()},
            )

    async def _close_writer(self) -> None:
        writer = self._writer
        self._reader = None
        self._writer = None
        if writer is None:
            return
        writer.close()
        with contextlib.suppress(Exception):
            await writer.wait_closed()

    def _fail_waiters(self, error: BaseException) -> None:
        for future in self._pending.values():
            if not future.done():
                future.set_exception(error)
        for barrier_future in self._barriers.values():
            if not barrier_future.done():
                barrier_future.set_exception(error)
