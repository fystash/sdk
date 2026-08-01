"""NeMo Gym–shaped Fystash SandboxProvider (Loop 96, Path B).

Out-of-tree adapter: create room → from-template → exec → destroy.

Implements the SandboxProvider lifecycle without requiring ``nemo-gym`` at
import time. When ``nemo_gym`` is installed, call ``register()`` to bind
``fystash`` via ``register_provider``.

Prefer Path A (NeMo Gym ``harbor_agent`` + Harbor ``environment.type: fystash``)
when available: https://github.com/harbor-framework/harbor/pull/2491

Env:
  FYSTASH_API=https://api.fystash.ai
  FYSTASH_API_KEY=key-…
  FYSTASH_TEMPLATE_ID=default
  FYSTASH_AGENT_ID=nemo-gym

Honesty: Fystash v1 is template_id-oriented. ``SandboxSpec.image`` is not
pulled like Daytona; use ``provider_options.template_id`` or FYSTASH_TEMPLATE_ID.
"""

from __future__ import annotations

import asyncio
import os
import sys
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping

_REPO = Path(__file__).resolve().parents[2]
if str(_REPO) not in sys.path:
    sys.path.insert(0, str(_REPO))

from integrations.harbor.fystash_env import (  # noqa: E402
    ExecResult as HarborExecResult,
    FystashSandbox,
    preflight as _harbor_preflight,
)


def preflight() -> None:
    """Require FYSTASH_API_KEY (same contract as Harbor / OpenEnv / Verifiers)."""
    if not os.environ.get("FYSTASH_API_KEY"):
        raise SystemExit(
            "Fystash NeMo Gym provider requires FYSTASH_API_KEY "
            "(and usually FYSTASH_API=https://api.fystash.ai). "
            "Signup: https://fystash.ai/signup — see docs/nemo-gym-fystash.md"
        )
    _harbor_preflight()


@dataclass
class SandboxHandle:
    """Opaque handle for an allocated Fystash room."""

    id: str
    room_id: str
    template_id: str
    metadata: dict[str, Any] = field(default_factory=dict)
    _sandbox: FystashSandbox | None = field(default=None, repr=False, compare=False)


@dataclass
class SandboxExecResult:
    stdout: str
    stderr: str
    return_code: int
    error_type: str | None = None


@dataclass
class SandboxStatus:
    state: str  # starting | running | stopped | error | unknown
    detail: str | None = None


def _resolve_template_id(
    *,
    image: str | None,
    provider_options: Mapping[str, Any] | None,
) -> str:
    opts = dict(provider_options or {})
    if opts.get("template_id"):
        return str(opts["template_id"])
    env = os.environ.get("FYSTASH_TEMPLATE_ID")
    if env:
        return env
    # Image is not pulled in v1; keep a stable default.
    _ = image
    return "default"


class FystashProvider:
    """Thin async SandboxProvider over Harbor ``FystashSandbox`` / RoomClient."""

    name = "fystash"

    def __init__(
        self,
        connection: Mapping[str, Any] | None = None,
        **_kwargs: Any,
    ) -> None:
        conn = dict(connection or {})
        self.endpoint = (
            str(conn.get("endpoint") or os.environ.get("FYSTASH_API") or "https://api.fystash.ai")
        ).rstrip("/")
        self.api_key = str(conn.get("api_key") or os.environ.get("FYSTASH_API_KEY") or "")
        self.agent_id = str(
            conn.get("agent_id") or os.environ.get("FYSTASH_AGENT_ID") or "nemo-gym"
        )
        self._handles: dict[str, SandboxHandle] = {}

    async def create(
        self,
        *,
        image: str | None = None,
        workdir: str = "/tmp",
        env: Mapping[str, str] | None = None,
        metadata: Mapping[str, Any] | None = None,
        provider_options: Mapping[str, Any] | None = None,
        **_kwargs: Any,
    ) -> SandboxHandle:
        """Allocate a room and start from template.

        ``image`` is accepted for API compatibility but not pulled; use
        ``provider_options.template_id`` or ``FYSTASH_TEMPLATE_ID``.
        """
        if not self.api_key and not os.environ.get("FYSTASH_API_KEY"):
            raise RuntimeError("FYSTASH_API_KEY is required for FystashProvider")

        template_id = _resolve_template_id(image=image, provider_options=provider_options)
        session = f"ng-{uuid.uuid4().hex[:10]}"
        sb = FystashSandbox(
            api=self.endpoint,
            api_key=self.api_key or None,
            template_id=template_id,
            agent_id=self.agent_id,
            session_id=session,
            workdir=workdir,
        )
        # Room id uses harbor- prefix from FystashSandbox; fine for Gym too.
        await asyncio.to_thread(sb.start)

        handle = SandboxHandle(
            id=session,
            room_id=sb.room_id,
            template_id=template_id,
            metadata=dict(metadata or {}),
            _sandbox=sb,
        )
        if env:
            # Best-effort: export into a shell profile for subsequent execs.
            exports = " ".join(f"export {k}={repr(v)};" for k, v in env.items())
            await asyncio.to_thread(sb.exec, f"{exports} true")
        self._handles[handle.id] = handle
        return handle

    async def exec(
        self,
        handle: SandboxHandle,
        command: str,
        *,
        cwd: str | None = None,
        env: Mapping[str, str] | None = None,
        timeout_s: float | None = 120,
        user: str | None = None,  # noqa: ARG002 — guest is single-user Firecracker
    ) -> SandboxExecResult:
        sb = self._require(handle)
        result: HarborExecResult = await asyncio.to_thread(
            sb.exec,
            command,
            cwd,
            dict(env) if env else None,
            int(timeout_s) if timeout_s is not None else None,
        )
        return SandboxExecResult(
            stdout=result.stdout,
            stderr=result.stderr,
            return_code=result.return_code,
        )

    async def upload_file(
        self,
        handle: SandboxHandle,
        source_path: str | Path,
        target_path: str,
    ) -> None:
        sb = self._require(handle)
        await asyncio.to_thread(sb.upload_file, source_path, target_path)

    async def download_file(
        self,
        handle: SandboxHandle,
        source_path: str,
        target_path: str | Path,
    ) -> None:
        sb = self._require(handle)
        await asyncio.to_thread(sb.download_file, source_path, target_path)

    async def status(self, handle: SandboxHandle) -> SandboxStatus:
        sb = self._handles.get(handle.id)
        if sb is None or sb._sandbox is None:
            return SandboxStatus(state="unknown", detail="handle not found")
        if sb._sandbox._started:
            return SandboxStatus(state="running")
        return SandboxStatus(state="stopped")

    async def close(self, handle: SandboxHandle) -> None:
        sb = self._handles.pop(handle.id, None)
        if sb and sb._sandbox is not None:
            await asyncio.to_thread(sb._sandbox.stop, True)

    async def aclose(self) -> None:
        for hid in list(self._handles):
            await self.close(self._handles[hid])

    def _require(self, handle: SandboxHandle) -> FystashSandbox:
        owned = self._handles.get(handle.id) or handle
        if owned._sandbox is None:
            raise RuntimeError(f"sandbox handle {handle.id} is not started")
        return owned._sandbox


def register() -> bool:
    """Register ``fystash`` with NeMo Gym if installed. Returns True on success."""
    try:
        from nemo_gym.sandbox.providers.registry import register_provider
    except ImportError:
        return False
    register_provider("fystash", FystashProvider)
    return True


def main() -> int:
    """CLI smoke: preflight → create → echo → close."""
    import time

    preflight()

    async def _run() -> int:
        provider = FystashProvider()
        t0 = time.perf_counter()
        handle = await provider.create()
        try:
            result = await provider.exec(
                handle, "echo nemo-gym-fystash-ok && uname -a"
            )
            wall_ms = (time.perf_counter() - t0) * 1000.0
            ok = result.return_code == 0 and "nemo-gym-fystash-ok" in result.stdout
            print(
                {
                    "ok": ok,
                    "return_code": result.return_code,
                    "stdout": result.stdout.strip(),
                    "smoke_wall_ms": wall_ms,
                    "handle": handle.id,
                    "room_id": handle.room_id,
                    "template_id": handle.template_id,
                }
            )
            return 0 if ok else 1
        finally:
            await provider.close(handle)

    return asyncio.run(_run())


if __name__ == "__main__":
    raise SystemExit(main())
