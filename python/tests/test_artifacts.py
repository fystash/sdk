from __future__ import annotations

import hashlib
from pathlib import Path

from fystash import (
    artifact_ref_from_bytes,
    artifact_ref_from_file,
    verify_artifact,
    verify_artifact_file,
)


def test_artifact_ref_from_bytes_is_content_addressed() -> None:
    data = b"deterministic artifact"
    reference = artifact_ref_from_bytes(data, path="out/result.bin")

    assert reference.artifact_id == hashlib.sha256(data).hexdigest()
    assert reference.sha256 == hashlib.sha256(data).digest()
    assert reference.size == len(data)
    assert verify_artifact(reference, data)
    assert not verify_artifact(reference, data + b"!")


def test_artifact_ref_from_file_streams_and_detects_media_type(tmp_path: Path) -> None:
    path = tmp_path / "report.json"
    path.write_bytes(b'{"status":"ok"}')

    reference = artifact_ref_from_file(path, chunk_size=3)

    assert reference.path == str(path)
    assert reference.media_type == "application/json"
    assert verify_artifact_file(reference)
    path.write_bytes(b"changed")
    assert not verify_artifact_file(reference)
