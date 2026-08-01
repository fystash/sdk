"""Helpers for constructing and validating ``ArtifactRef`` messages."""

from __future__ import annotations

import hashlib
import mimetypes
from pathlib import Path

from ._generated.fabric_pb2 import ArtifactRef


def sha256_bytes(data: bytes | bytearray | memoryview) -> bytes:
    """Return the binary SHA-256 digest of artifact content."""

    return hashlib.sha256(data).digest()


def artifact_ref_from_bytes(
    data: bytes | bytearray | memoryview,
    *,
    path: str = "",
    artifact_id: str | None = None,
    media_type: str = "application/octet-stream",
) -> ArtifactRef:
    """Create a deterministic reference for in-memory content."""

    digest = sha256_bytes(data)
    return ArtifactRef(
        artifact_id=artifact_id or digest.hex(),
        path=path,
        sha256=digest,
        size=len(data),
        media_type=media_type,
    )


def artifact_ref_from_file(
    path: str | Path,
    *,
    artifact_id: str | None = None,
    media_type: str | None = None,
    chunk_size: int = 1024 * 1024,
) -> ArtifactRef:
    """Hash a file without loading it all into memory and create its reference."""

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    file_path = Path(path)
    digest = hashlib.sha256()
    size = 0
    with file_path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(chunk_size), b""):
            digest.update(chunk)
            size += len(chunk)
    digest_bytes = digest.digest()
    detected_type = media_type or mimetypes.guess_type(file_path.name)[0]
    return ArtifactRef(
        artifact_id=artifact_id or digest_bytes.hex(),
        path=str(file_path),
        sha256=digest_bytes,
        size=size,
        media_type=detected_type or "application/octet-stream",
    )


def verify_artifact(
    reference: ArtifactRef,
    data: bytes | bytearray | memoryview,
) -> bool:
    """Verify both the declared size and digest for artifact content."""

    return reference.size == len(data) and reference.sha256 == sha256_bytes(data)


def verify_artifact_file(
    reference: ArtifactRef,
    path: str | Path | None = None,
    *,
    chunk_size: int = 1024 * 1024,
) -> bool:
    """Verify a file against an ``ArtifactRef``."""

    candidate = artifact_ref_from_file(
        path or reference.path,
        artifact_id=reference.artifact_id,
        media_type=reference.media_type,
        chunk_size=chunk_size,
    )
    return candidate.size == reference.size and candidate.sha256 == reference.sha256
