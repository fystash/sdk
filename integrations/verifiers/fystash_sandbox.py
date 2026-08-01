"""Verifiers-oriented Fystash sandbox helper (Loop 95, Path B).

Thin Room API lifecycle for teams not on Harbor yet:

  create room → from-template → exec → destroy

Prefer Path A (Verifiers HarborTaskset + Harbor ``-e fystash``) when available:
https://github.com/harbor-framework/harbor/pull/2491

Env:
  FYSTASH_API=https://api.fystash.ai
  FYSTASH_API_KEY=key-…
  FYSTASH_TEMPLATE_ID=default
  FYSTASH_AGENT_ID=verifiers
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Reuse Harbor-shaped FystashSandbox (same RoomClient path).
_REPO = Path(__file__).resolve().parents[2]
_HARBOR = _REPO / "integrations" / "harbor"
if str(_REPO) not in sys.path:
    sys.path.insert(0, str(_REPO))

from integrations.harbor.fystash_env import (  # noqa: E402
    ExecResult,
    FystashSandbox,
    preflight as _harbor_preflight,
)


def preflight() -> None:
    """Require FYSTASH_API_KEY (same contract as Harbor / OpenEnv providers)."""
    if not os.environ.get("FYSTASH_API_KEY"):
        raise SystemExit(
            "Fystash Verifiers helper requires FYSTASH_API_KEY "
            "(and usually FYSTASH_API=https://api.fystash.ai). "
            "Signup: https://fystash.ai/signup — see docs/pi-verifiers-runtime-note.md"
        )
    _harbor_preflight()


class FystashVerifiersSandbox(FystashSandbox):
    """Alias default agent_id for Verifiers-shaped scripts."""

    def __init__(self, **kwargs) -> None:
        if "agent_id" not in kwargs and not os.environ.get("FYSTASH_AGENT_ID"):
            kwargs["agent_id"] = "verifiers"
        super().__init__(**kwargs)


def main() -> int:
    """CLI smoke: start → echo → stop."""
    import time

    preflight()
    sb = FystashVerifiersSandbox()
    t0 = time.perf_counter()
    try:
        sb.start()
        result = sb.exec("echo verifiers-fystash-ok && uname -a")
        wall_ms = (time.perf_counter() - t0) * 1000.0
        ok = result.return_code == 0 and "verifiers-fystash-ok" in result.stdout
        print(
            {
                "ok": ok,
                "return_code": result.return_code,
                "stdout": result.stdout.strip(),
                "create_wall_ms": sb.create_wall_ms,
                "smoke_wall_ms": wall_ms,
                "meta": sb.to_dict(),
            }
        )
        return 0 if ok else 1
    finally:
        sb.stop(delete=True)


if __name__ == "__main__":
    raise SystemExit(main())
