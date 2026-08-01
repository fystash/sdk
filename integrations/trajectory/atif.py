"""ATIF-v1.7 converter from fystash.trajectory.v1 (Loop 100).

Harbor interchange format — execution-plane mapping only.
Does not claim Verifiers Trace / logprobs parity.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


ATIF_SCHEMA_VERSION = "ATIF-v1.7"


def _iso_ts(ts: float | int | None) -> str:
    if ts is None:
        ts = 0.0
    return datetime.fromtimestamp(float(ts), tz=timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%S.%fZ"
    )


def fystash_to_atif(traj: dict[str, Any]) -> dict[str, Any]:
    """Convert one fystash.trajectory.v1 dict → ATIF-v1.7 subset dict."""
    episode_id = str(traj.get("episode_id") or traj.get("session_id") or "unknown")
    agent_id = str(traj.get("agent_id") or "agent")
    labels = dict(traj.get("labels") or {})
    model_name = str(labels.get("model") or labels.get("model_name") or "unknown")

    atif_steps: list[dict[str, Any]] = []
    step_id = 0
    for raw in traj.get("steps") or []:
        step_id += 1
        kind = str(raw.get("kind") or "other")
        ts = raw.get("ts")
        if kind == "exec":
            call_id = f"exec_{step_id}"
            argv = raw.get("argv")
            stdout = raw.get("stdout_preview") or ""
            stderr = raw.get("stderr_preview") or ""
            obs_parts = []
            if stdout:
                obs_parts.append(str(stdout))
            if stderr:
                obs_parts.append(f"[stderr]\n{stderr}")
            obs_content = "\n".join(obs_parts) if obs_parts else "(no output preview)"
            atif_steps.append(
                {
                    "step_id": step_id,
                    "timestamp": _iso_ts(ts if isinstance(ts, (int, float)) else None),
                    "source": "agent",
                    "message": f"exec exit={raw.get('exit_code')}",
                    "tool_calls": [
                        {
                            "tool_call_id": call_id,
                            "function_name": "exec",
                            "arguments": {
                                "argv": argv,
                                "exit_code": raw.get("exit_code"),
                                "duration_ms": raw.get("duration_ms"),
                                "timed_out": raw.get("timed_out"),
                            },
                        }
                    ],
                    "observation": {
                        "results": [
                            {
                                "source_call_id": call_id,
                                "content": obs_content,
                            }
                        ]
                    },
                    "extra": {
                        "fystash_event": raw.get("event"),
                        "stdout_truncated": raw.get("stdout_truncated"),
                        "stderr_truncated": raw.get("stderr_truncated"),
                    },
                }
            )
        else:
            atif_steps.append(
                {
                    "step_id": step_id,
                    "timestamp": _iso_ts(ts if isinstance(ts, (int, float)) else None),
                    "source": "system",
                    "message": str(raw.get("event") or kind),
                    "extra": {
                        "fystash_kind": kind,
                        "fystash_event": raw.get("event"),
                        **{
                            k: v
                            for k, v in raw.items()
                            if k
                            not in {
                                "ts",
                                "event",
                                "agent_id",
                                "kind",
                                "argv",
                                "stdout_preview",
                                "stderr_preview",
                            }
                            and isinstance(v, (str, int, float, bool, type(None)))
                        },
                    },
                }
            )

    extra: dict[str, Any] = {
        "fystash_schema": traj.get("schema") or "fystash.trajectory.v1",
        "fystash_reward": traj.get("reward"),
        "fystash_reward_broken": traj.get("reward_broken"),
        "fystash_reward_metrics": traj.get("reward_metrics") or {},
        "room_id": traj.get("room_id"),
        "template_id": traj.get("template_id"),
        "seed": traj.get("seed"),
        "labels": labels,
        "exported_at": traj.get("exported_at"),
        "status": traj.get("status"),
    }

    return {
        "schema_version": ATIF_SCHEMA_VERSION,
        "session_id": episode_id,
        "trajectory_id": episode_id,
        "agent": {
            "name": agent_id,
            "version": "1.0.0",
            "model_name": model_name,
            "extra": {
                "template_id": traj.get("template_id"),
                "room_id": traj.get("room_id"),
                "source": "fystash",
            },
        },
        "steps": atif_steps,
        "final_metrics": {
            "total_steps": len(atif_steps),
        },
        "extra": extra,
    }


def validate_atif_structure(doc: dict[str, Any]) -> list[str]:
    """Soft structural checks (no Harbor package required). Returns error strings."""
    errors: list[str] = []
    if doc.get("schema_version") != ATIF_SCHEMA_VERSION:
        errors.append(
            f"schema_version expected {ATIF_SCHEMA_VERSION}, got {doc.get('schema_version')!r}"
        )
    agent = doc.get("agent")
    if not isinstance(agent, dict) or not agent.get("name"):
        errors.append("agent.name required")
    steps = doc.get("steps")
    if not isinstance(steps, list):
        errors.append("steps must be a list")
        return errors
    for i, step in enumerate(steps, start=1):
        if not isinstance(step, dict):
            errors.append(f"steps[{i-1}] not an object")
            continue
        sid = step.get("step_id")
        if sid != i:
            errors.append(f"steps[{i-1}].step_id expected {i}, got {sid!r}")
        if step.get("source") not in {"agent", "user", "system"}:
            errors.append(f"steps[{i-1}].source invalid: {step.get('source')!r}")
        if "timestamp" not in step:
            errors.append(f"steps[{i-1}].timestamp missing")
    if not doc.get("session_id") and not doc.get("trajectory_id"):
        errors.append("session_id or trajectory_id required")
    return errors
