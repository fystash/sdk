from google.protobuf.internal import containers as _containers
from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class MessageKind(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    MESSAGE_KIND_UNSPECIFIED: _ClassVar[MessageKind]
    MESSAGE_KIND_REQUEST: _ClassVar[MessageKind]
    MESSAGE_KIND_RESPONSE: _ClassVar[MessageKind]
    MESSAGE_KIND_EVENT: _ClassVar[MessageKind]
    MESSAGE_KIND_ACK: _ClassVar[MessageKind]
    MESSAGE_KIND_CANCEL: _ClassVar[MessageKind]
    MESSAGE_KIND_ERROR: _ClassVar[MessageKind]

MESSAGE_KIND_UNSPECIFIED: MessageKind
MESSAGE_KIND_REQUEST: MessageKind
MESSAGE_KIND_RESPONSE: MessageKind
MESSAGE_KIND_EVENT: MessageKind
MESSAGE_KIND_ACK: MessageKind
MESSAGE_KIND_CANCEL: MessageKind
MESSAGE_KIND_ERROR: MessageKind

class Register(_message.Message):
    __slots__ = ("protocol_version", "room_id", "agent_id", "session_token", "subscriptions")
    PROTOCOL_VERSION_FIELD_NUMBER: _ClassVar[int]
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    AGENT_ID_FIELD_NUMBER: _ClassVar[int]
    SESSION_TOKEN_FIELD_NUMBER: _ClassVar[int]
    SUBSCRIPTIONS_FIELD_NUMBER: _ClassVar[int]
    protocol_version: int
    room_id: str
    agent_id: str
    session_token: bytes
    subscriptions: _containers.RepeatedScalarFieldContainer[str]
    def __init__(
        self,
        protocol_version: _Optional[int] = ...,
        room_id: _Optional[str] = ...,
        agent_id: _Optional[str] = ...,
        session_token: _Optional[bytes] = ...,
        subscriptions: _Optional[_Iterable[str]] = ...,
    ) -> None: ...

class Envelope(_message.Message):
    __slots__ = (
        "protocol_version",
        "message_id",
        "room_id",
        "source",
        "destination",
        "kind",
        "stream_id",
        "sequence",
        "deadline_unix_ms",
        "headers",
        "payload",
    )
    class HeadersEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...

    PROTOCOL_VERSION_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_ID_FIELD_NUMBER: _ClassVar[int]
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    DESTINATION_FIELD_NUMBER: _ClassVar[int]
    KIND_FIELD_NUMBER: _ClassVar[int]
    STREAM_ID_FIELD_NUMBER: _ClassVar[int]
    SEQUENCE_FIELD_NUMBER: _ClassVar[int]
    DEADLINE_UNIX_MS_FIELD_NUMBER: _ClassVar[int]
    HEADERS_FIELD_NUMBER: _ClassVar[int]
    PAYLOAD_FIELD_NUMBER: _ClassVar[int]
    protocol_version: int
    message_id: bytes
    room_id: str
    source: str
    destination: str
    kind: MessageKind
    stream_id: int
    sequence: int
    deadline_unix_ms: int
    headers: _containers.ScalarMap[str, str]
    payload: bytes
    def __init__(
        self,
        protocol_version: _Optional[int] = ...,
        message_id: _Optional[bytes] = ...,
        room_id: _Optional[str] = ...,
        source: _Optional[str] = ...,
        destination: _Optional[str] = ...,
        kind: _Optional[_Union[MessageKind, str]] = ...,
        stream_id: _Optional[int] = ...,
        sequence: _Optional[int] = ...,
        deadline_unix_ms: _Optional[int] = ...,
        headers: _Optional[_Mapping[str, str]] = ...,
        payload: _Optional[bytes] = ...,
    ) -> None: ...

class BarrierArrive(_message.Message):
    __slots__ = ("room_id", "barrier_id", "parties")
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    BARRIER_ID_FIELD_NUMBER: _ClassVar[int]
    PARTIES_FIELD_NUMBER: _ClassVar[int]
    room_id: str
    barrier_id: str
    parties: int
    def __init__(
        self,
        room_id: _Optional[str] = ...,
        barrier_id: _Optional[str] = ...,
        parties: _Optional[int] = ...,
    ) -> None: ...

class BarrierRelease(_message.Message):
    __slots__ = ("room_id", "barrier_id", "participants")
    ROOM_ID_FIELD_NUMBER: _ClassVar[int]
    BARRIER_ID_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANTS_FIELD_NUMBER: _ClassVar[int]
    room_id: str
    barrier_id: str
    participants: _containers.RepeatedScalarFieldContainer[str]
    def __init__(
        self,
        room_id: _Optional[str] = ...,
        barrier_id: _Optional[str] = ...,
        participants: _Optional[_Iterable[str]] = ...,
    ) -> None: ...

class ArtifactRef(_message.Message):
    __slots__ = ("artifact_id", "path", "sha256", "size", "media_type")
    ARTIFACT_ID_FIELD_NUMBER: _ClassVar[int]
    PATH_FIELD_NUMBER: _ClassVar[int]
    SHA256_FIELD_NUMBER: _ClassVar[int]
    SIZE_FIELD_NUMBER: _ClassVar[int]
    MEDIA_TYPE_FIELD_NUMBER: _ClassVar[int]
    artifact_id: str
    path: str
    sha256: bytes
    size: int
    media_type: str
    def __init__(
        self,
        artifact_id: _Optional[str] = ...,
        path: _Optional[str] = ...,
        sha256: _Optional[bytes] = ...,
        size: _Optional[int] = ...,
        media_type: _Optional[str] = ...,
    ) -> None: ...

class ErrorFrame(_message.Message):
    __slots__ = ("code", "message", "related_message_id")
    CODE_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    RELATED_MESSAGE_ID_FIELD_NUMBER: _ClassVar[int]
    code: str
    message: str
    related_message_id: bytes
    def __init__(
        self,
        code: _Optional[str] = ...,
        message: _Optional[str] = ...,
        related_message_id: _Optional[bytes] = ...,
    ) -> None: ...

class WireFrame(_message.Message):
    __slots__ = ("register", "envelope", "barrier_arrive", "barrier_release", "error")
    REGISTER_FIELD_NUMBER: _ClassVar[int]
    ENVELOPE_FIELD_NUMBER: _ClassVar[int]
    BARRIER_ARRIVE_FIELD_NUMBER: _ClassVar[int]
    BARRIER_RELEASE_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    register: Register
    envelope: Envelope
    barrier_arrive: BarrierArrive
    barrier_release: BarrierRelease
    error: ErrorFrame
    def __init__(
        self,
        register: _Optional[_Union[Register, _Mapping]] = ...,
        envelope: _Optional[_Union[Envelope, _Mapping]] = ...,
        barrier_arrive: _Optional[_Union[BarrierArrive, _Mapping]] = ...,
        barrier_release: _Optional[_Union[BarrierRelease, _Mapping]] = ...,
        error: _Optional[_Union[ErrorFrame, _Mapping]] = ...,
    ) -> None: ...
