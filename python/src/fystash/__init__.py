"""Public API for the Fystash Python SDK."""

from .artifacts import (
    artifact_ref_from_bytes,
    artifact_ref_from_file,
    sha256_bytes,
    verify_artifact,
    verify_artifact_file,
)
from .client import FystashClient, RegistrationMode
from .endpoint import Endpoint
from .errors import (
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
)
from .framing import (
    DEFAULT_MAX_FRAME_SIZE,
    decode_frame,
    encode_frame,
    read_frame,
    write_frame,
)
from .messages import (
    PROTOCOL_VERSION,
    deadline_after,
    is_registration_ack,
    make_envelope,
    message_id_hex,
    new_message_id,
    remaining_seconds,
    validate_registration_ack,
)
from .room import RoomApiError, RoomClient

try:
    from ._generated.fabric_pb2 import (
        ArtifactRef,
        BarrierArrive,
        BarrierRelease,
        Envelope,
        ErrorFrame,
        MessageKind,
        Register,
        WireFrame,
    )
except ImportError:  # pragma: no cover
    ArtifactRef = BarrierArrive = BarrierRelease = Envelope = None  # type: ignore[misc, assignment]
    ErrorFrame = MessageKind = Register = WireFrame = None  # type: ignore[misc, assignment]

__all__ = [
    "DEFAULT_MAX_FRAME_SIZE",
    "PROTOCOL_VERSION",
    "ArtifactRef",
    "BarrierArrive",
    "BarrierRelease",
    "ConfigurationError",
    "ConnectionClosedError",
    "ConnectionLostError",
    "Endpoint",
    "Envelope",
    "ErrorFrame",
    "FrameTooLargeError",
    "FystashClient",
    "FystashError",
    "MessageKind",
    "NotConnectedError",
    "ProtocolError",
    "Register",
    "RegistrationMode",
    "RemoteError",
    "RequestTimeoutError",
    "RoomApiError",
    "RoomClient",
    "UnsupportedOperationError",
    "WireFrame",
    "artifact_ref_from_bytes",
    "artifact_ref_from_file",
    "deadline_after",
    "decode_frame",
    "encode_frame",
    "is_registration_ack",
    "make_envelope",
    "message_id_hex",
    "new_message_id",
    "read_frame",
    "remaining_seconds",
    "sha256_bytes",
    "validate_registration_ack",
    "verify_artifact",
    "verify_artifact_file",
    "write_frame",
]
