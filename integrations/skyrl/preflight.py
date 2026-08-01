#!/usr/bin/env python3
"""SkyRL × Fystash preflight (Loop 97).

Checks FYSTASH_API_KEY before Harbor/SkyRL wiring. Live room smoke stays on
integrations/harbor/fystash_env.py.
"""

from __future__ import annotations

import os
import sys


def preflight() -> None:
    if not os.environ.get("FYSTASH_API_KEY"):
        raise SystemExit(
            "Fystash SkyRL path requires FYSTASH_API_KEY "
            "(and usually FYSTASH_API=https://api.fystash.ai). "
            "Signup: https://fystash.ai/signup — see docs/skyrl-fystash.md"
        )


def main() -> int:
    preflight()
    print(
        {
            "ok": True,
            "api": os.environ.get("FYSTASH_API") or "https://api.fystash.ai",
            "template_id": os.environ.get("FYSTASH_TEMPLATE_ID") or "default",
            "hint": "Room smoke: python3 integrations/harbor/fystash_env.py",
            "skyrl": "harbor_trial_config.environment.type=fystash",
        }
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
