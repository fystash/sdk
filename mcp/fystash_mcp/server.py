"""Stdio MCP tools mirroring SPEC §9 (REST twins)."""

from __future__ import annotations

import base64
import json
import os
from typing import Any

from mcp.server.fastmcp import FastMCP

from fystash_mcp.client import RoomApiError, RoomClient

mcp = FastMCP("fystash")


def _client() -> RoomClient:
    return RoomClient(
        base_url=os.environ.get("FYSTASH_API", "http://127.0.0.1:8080"),
        api_key=os.environ.get("FYSTASH_API_KEY", "dev-key"),
    )


def _err(exc: Exception) -> str:
    if isinstance(exc, RoomApiError):
        return json.dumps({"ok": False, "status": exc.status, "detail": exc.detail})
    return json.dumps({"ok": False, "detail": str(exc)})


def _ok(data: Any) -> str:
    return json.dumps({"ok": True, "result": data}, default=str)


@mcp.tool()
def health() -> str:
    """Control-plane health (GET /health). Includes topology=nested disclosure."""
    try:
        return _ok(_client().health())
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def room_list() -> str:
    """List rooms for the authenticated org (GET /v1/rooms)."""
    try:
        return _ok(_client().list_rooms())
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def usage(org_id: str) -> str:
    """Org usage + billing entitlement (GET /v1/orgs/:id/usage)."""
    try:
        return _ok(_client().org_usage(org_id))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def room_create(room_id: str) -> str:
    """Create a room (POST /v1/rooms)."""
    try:
        return _ok(_client().create_room(room_id))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def room_get(room_id: str) -> str:
    """Get room metadata (GET /v1/rooms/:id)."""
    try:
        return _ok(_client().get_room(room_id))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def room_destroy(room_id: str) -> str:
    """Destroy a room and all sandboxes (DELETE /v1/rooms/:id)."""
    try:
        return _ok(_client().destroy(room_id))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def sandbox_create(
    room_id: str,
    agent_id: str,
    guest_cid: int,
    memory_mib: int = 256,
    template_id: str = "default",
    attach_fabric: bool = True,
    env_json: str | None = None,
    egress_allowlist_json: str | None = None,
) -> str:
    """Create sandbox via from-template (product create path).

    Pick a unique guest_cid per sandbox in the 9000–9999 range when unsure
    (pool templates often use 9000+; avoid reusing an in-use cid).
    template_id: "default" (coding), "browser" (Chromium CDP, memory_mib=2048),
    "desktop" (XFCE + fystash-cua, memory_mib=1536), or "docker" (dockerd,
    memory_mib=2048).
    Optional env_json is a JSON object of KEY=value strings (no FYSTASH_* keys).
    Optional egress_allowlist_json is a JSON array of IPv4/CIDR/hostname strings
    (opt-in allowlist; omit for open egress).
    """
    try:
        env = None
        if env_json:
            parsed = json.loads(env_json)
            if not isinstance(parsed, dict) or not all(
                isinstance(k, str) and isinstance(v, str) for k, v in parsed.items()
            ):
                return _err(ValueError("env_json must be a JSON object of strings"))
            env = parsed
        egress_allowlist = None
        if egress_allowlist_json:
            parsed_eg = json.loads(egress_allowlist_json)
            if not isinstance(parsed_eg, list) or not all(
                isinstance(x, str) for x in parsed_eg
            ):
                return _err(
                    ValueError("egress_allowlist_json must be a JSON array of strings")
                )
            egress_allowlist = parsed_eg
        return _ok(
            _client().create_from_template(
                room_id,
                agent_id,
                guest_cid=guest_cid,
                memory_mib=memory_mib,
                template_id=template_id,
                attach_fabric=attach_fabric,
                env=env,
                egress_allowlist=egress_allowlist,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def sandbox_exec(
    room_id: str,
    agent_id: str,
    argv_json: str,
    cwd: str | None = None,
    timeout_ms: int = 30_000,
    env_json: str | None = None,
) -> str:
    """Exec argv in sandbox (argv_json is a JSON list of strings).

    Optional env_json is a JSON object merged over create-time env for this exec.
    """
    try:
        argv = json.loads(argv_json)
        if not isinstance(argv, list) or not all(isinstance(x, str) for x in argv):
            return _err(ValueError("argv_json must be a JSON list of strings"))
        env = None
        if env_json:
            parsed = json.loads(env_json)
            if not isinstance(parsed, dict) or not all(
                isinstance(k, str) and isinstance(v, str) for k, v in parsed.items()
            ):
                return _err(ValueError("env_json must be a JSON object of strings"))
            env = parsed
        return _ok(
            _client().exec(
                room_id, agent_id, argv, cwd=cwd, timeout_ms=timeout_ms, env=env
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def sandbox_expose_port(room_id: str, agent_id: str, port: int) -> str:
    """Expose a guest HTTP port as a public preview URL (Loop 47)."""
    try:
        return _ok(_client().expose_port(room_id, agent_id, port))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def sandbox_unexpose_port(room_id: str, agent_id: str, port: int) -> str:
    """Remove a previously exposed preview port."""
    try:
        return _ok(_client().unexpose_port(room_id, agent_id, port))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def replicate_target(
    room_id: str,
    target: str,
    agent_id: str = "agent",
    scope: list[str] | None = None,
    include_report: bool = False,
) -> str:
    """Measure a running app's behaviour from inside a room.

    Returns what the target requires, rejects and says — the facts a grader
    is written from — with the coverage they were measured over. Pass `scope`
    path prefixes to bound the crawl. The full report is large, so it is
    omitted unless `include_report` is set.
    """
    try:
        return _ok(
            _client().replicate(
                room_id,
                target,
                agent_id=agent_id,
                scope=scope,
                include_report=include_report,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def replicate_env(
    room_id: str,
    target: str,
    clone_code: str,
    agent_id: str = "agent",
    scope: list[str] | None = None,
    app_port: int = 8088,
    include_report: bool = False,
) -> str:
    """Materialise a training env: measure target, write grader + clone on drive, start clone."""
    try:
        return _ok(
            _client().replicate_env(
                room_id,
                target,
                clone_code,
                agent_id=agent_id,
                scope=scope,
                app_port=app_port,
                include_report=include_report,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def sandbox_destroy(room_id: str, agent_id: str) -> str:
    """Destroy one sandbox in a room."""
    try:
        return _ok(_client().destroy_sandbox(room_id, agent_id))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def agent_send(
    room_id: str,
    source: str,
    destination: str,
    payload_b64: str = "",
    kind: str = "event",
) -> str:
    """Directed fabric send (event)."""
    try:
        payload = base64.b64decode(payload_b64) if payload_b64 else b""
        return _ok(
            _client().send(
                room_id,
                source=source,
                destination=destination,
                payload=payload,
                kind=kind,
                wait_reply=False,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def agent_request(
    room_id: str,
    source: str,
    destination: str,
    payload_b64: str = "",
    timeout_ms: int = 5_000,
) -> str:
    """Directed fabric request/reply."""
    try:
        payload = base64.b64decode(payload_b64) if payload_b64 else b""
        return _ok(
            _client().send(
                room_id,
                source=source,
                destination=destination,
                payload=payload,
                kind="request",
                wait_reply=True,
                timeout_ms=timeout_ms,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def agent_fanout(
    room_id: str,
    source: str,
    topic: str,
    payload_b64: str = "",
) -> str:
    """Topic fan-out fabric send."""
    try:
        payload = base64.b64decode(payload_b64) if payload_b64 else b""
        return _ok(
            _client().send(
                room_id,
                source=source,
                topic=topic,
                payload=payload,
                kind="event",
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def agent_wait(
    room_id: str,
    barrier_id: str,
    arrivals_json: str,
    parties: int = 0,
    timeout_ms: int = 30_000,
) -> str:
    """Alias for barrier wait (SPEC agent_wait). arrivals_json = JSON string list."""
    return barrier_arrive(
        room_id, barrier_id, arrivals_json, parties=parties, timeout_ms=timeout_ms
    )


@mcp.tool()
def barrier_arrive(
    room_id: str,
    barrier_id: str,
    arrivals_json: str,
    parties: int = 0,
    timeout_ms: int = 30_000,
) -> str:
    """Arrive/wait on a room barrier."""
    try:
        arrivals = json.loads(arrivals_json)
        if not isinstance(arrivals, list) or not all(isinstance(x, str) for x in arrivals):
            return _err(ValueError("arrivals_json must be a JSON list of strings"))
        return _ok(
            _client().wait_barrier(
                room_id,
                barrier_id=barrier_id,
                arrivals=arrivals,
                parties=parties,
                timeout_ms=timeout_ms,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def fs_read(room_id: str, path: str) -> str:
    """Read a file from the room drive."""
    try:
        return _ok(_client().drive_read(room_id, path))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def fs_write(room_id: str, path: str, content_b64: str) -> str:
    """Write bytes (base64) to the room drive."""
    try:
        data = base64.b64decode(content_b64)
        return _ok(_client().drive_write(room_id, path, data))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def fs_list(room_id: str) -> str:
    """List files on the room drive."""
    try:
        return _ok(_client().drive_list(room_id))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def audit_list(
    room_id: str,
    limit: int = 200,
    since: str = "",
    event: str = "",
    agent_id: str = "",
) -> str:
    """List room audit events (summarize for humans). Optional filters: limit, since (unix/ISO), event prefix, agent_id."""
    try:
        return _ok(
            _client().audit(
                room_id,
                limit=limit,
                since=since or None,
                event=event or None,
                agent_id=agent_id or None,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def org_audit_list(
    org_id: str = "",
    limit: int = 200,
    since: str = "",
    event: str = "",
) -> str:
    """List org audit events (billing/keys/quota). Summarize for humans. Pass org_id or set FYSTASH_ORG_ID."""
    try:
        resolved = org_id.strip() or os.environ.get("FYSTASH_ORG_ID", "").strip()
        if not resolved:
            rooms = _client().list_rooms()
            if isinstance(rooms, dict) and rooms.get("org_id"):
                resolved = str(rooms["org_id"])
        if not resolved:
            return _err(
                ValueError("org_id required (pass org_id or set FYSTASH_ORG_ID)")
            )
        return _ok(
            _client().org_audit(
                resolved,
                limit=limit,
                since=since or None,
                event=event or None,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def capacity_reserve(
    count: int,
    ttl_s: int = 3600,
    template_id: str = "default",
    kind: str = "hard_l1_fence",
    contract: str = "",
) -> str:
    """Reserve warm slots for a training window (hard L1 fence by default).

    Free orgs max 8 concurrent reserved slots; Starter/paid max 64.
    Optional contract label → labels.contract.
    """
    try:
        labels = {"contract": contract} if contract.strip() else None
        return _ok(
            _client().reserve_capacity(
                count=count,
                template_id=template_id,
                ttl_s=ttl_s,
                labels=labels,
                kind=kind,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def capacity_list() -> str:
    """List org capacity reservations (training-window contracts)."""
    try:
        return _ok(_client().list_capacity_reservations())
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def capacity_release(reservation_id: str) -> str:
    """Release a capacity reservation early."""
    try:
        return _ok(_client().release_capacity(reservation_id))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_trajectory(episode_id: str, limit: int = 1000) -> str:
    """Export fystash.trajectory.v1 for one episode (audit-backed; room must exist)."""
    try:
        return _ok(_client().get_episode_trajectory(episode_id, limit=limit))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_reward(
    episode_id: str,
    reward: float = 0.0,
    broken: bool = False,
    note: str = "",
) -> str:
    """Attach grader reward for trajectory / ATIF export (Verify v1 / Loop 75/110)."""
    try:
        return _ok(
            _client().set_episode_reward(
                episode_id,
                reward=reward,
                broken=broken if broken else None,
                note=note or None,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_reset(
    episode_id: str,
    seed: int = -1,
    clear_drive: bool = False,
) -> str:
    """Loop 109 Reset: destroy sandbox and recreate from template (optional clear_drive)."""
    try:
        return _ok(
            _client().reset_episode(
                episode_id,
                seed=None if seed < 0 else seed,
                clear_drive=clear_drive,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_record(
    episode_id: str,
    steps_json: str,
    execute: bool = True,
) -> str:
    """Loop 113 Record: append browser steps (navigate/click/type) to trajectory.

    steps_json: JSON array of {action, url?, selector?, text?}
    """
    try:
        import json

        steps = json.loads(steps_json)
        if not isinstance(steps, list):
            return _err(ValueError("steps_json must be a JSON array"))
        return _ok(
            _client().record_episode_steps(episode_id, steps, execute=execute)
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_seed(
    episode_id: str,
    pack: str = "demo",
    clear_first: bool = False,
) -> str:
    """Loop 114 Seed: apply named fixture pack onto the episode drive."""
    try:
        return _ok(
            _client().seed_episode(episode_id, pack=pack, clear_first=clear_first)
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_trajectories_export(
    batch_id: str,
    format: str = "atif",
    callback_url: str = "",
) -> str:
    """Loop 100/112 Replay: durable batch trajectory sink (ATIF or fystash NDJSON). Survives destroy."""
    try:
        return _ok(
            _client().export_batch_trajectories(
                batch_id,
                format=format,
                callback_url=callback_url or None,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_replay_export(
    batch_id: str,
    format: str = "atif",
    callback_url: str = "",
) -> str:
    """Alias of episode_trajectories_export — Replay v1 = export/sink (not re-exec)."""
    return episode_trajectories_export(batch_id, format=format, callback_url=callback_url)


@mcp.tool()
def curriculum_schedules_list() -> str:
    """Loop 101: list named curriculum schedules (warmup/ramp/full/single_shot)."""
    try:
        return _ok(_client().list_curriculum_schedules())
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def room_topologies_list() -> str:
    """Loop 103: list named multi-role room topologies (agent_grader, agent_grader_judge)."""
    try:
        return _ok(_client().list_room_topologies())
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def training_room_create(
    topology: str = "agent_grader_judge",
    roles_json: str = "",
    room_id: str = "",
    template_id: str = "default",
    memory_mib: int = 256,
    guest_cid_base: int = 9200,
) -> str:
    """Loop 103: create multi-role training room (shared drive + fabric).

    topology: agent_grader | agent_grader_judge (default) | omit with roles_json.
    roles_json: optional JSON array of agent_id strings to override preset.
    """
    try:
        roles = None
        if roles_json.strip():
            import json

            parsed = json.loads(roles_json)
            if not isinstance(parsed, list):
                return _err(ValueError("roles_json must be a JSON array"))
            roles = [str(x) for x in parsed]
        return _ok(
            _client().create_training_room(
                topology=topology or None,
                roles=roles,
                room_id=room_id or None,
                template_id=template_id,
                memory_mib=memory_mib,
                guest_cid_base=guest_cid_base,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_fleet_presets_list() -> str:
    """Loop 104: list snapshot fleet presets (browser_snap)."""
    try:
        return _ok(_client().list_fleet_presets())
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_fleet_create(
    episode_id: str,
    count: int = 4,
    preset: str = "browser_snap",
    labels_json: str = "",
) -> str:
    """Loop 104: N× fork fleet from a browser source episode.

    Source episode must be template_id=browser. count 1–16.
    """
    try:
        labels = None
        if labels_json.strip():
            import json

            parsed = json.loads(labels_json)
            if not isinstance(parsed, dict):
                return _err(ValueError("labels_json must be a JSON object"))
            labels = {str(k): str(v) for k, v in parsed.items()}
        return _ok(
            _client().create_episode_fleet(
                episode_id,
                count=count,
                preset=preset,
                labels=labels,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def template_list() -> str:
    """Loop 107: list builtin + org-scoped templates."""
    try:
        return _ok(_client().list_templates())
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def template_from_episode(
    source_episode_id: str,
    name: str,
    labels_json: str = "",
) -> str:
    """Loop 107: promote a browser episode snap into orgtpl-* golden.

    Destroy the source episode batch before Booting the new template (same guest_cid).
    """
    try:
        labels = None
        if labels_json.strip():
            import json

            parsed = json.loads(labels_json)
            if not isinstance(parsed, dict):
                return _err(ValueError("labels_json must be a JSON object"))
            labels = {str(k): str(v) for k, v in parsed.items()}
        return _ok(
            _client().template_from_episode(
                source_episode_id=source_episode_id,
                name=name,
                labels=labels,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def template_clone(
    name: str,
    url: str = "fixture://clone-auth",
    checks_csv: str = "signup,login",
    labels_json: str = "",
) -> str:
    """Loop 108: signup/login parity on fixture URL, then promote to org template.

    Default url=fixture://clone-auth starts an in-guest auth app. Destroy source
    batch before Boot. Not an Omnizon-class URL crawler.
    """
    try:
        labels = None
        if labels_json.strip():
            import json

            parsed = json.loads(labels_json)
            if not isinstance(parsed, dict):
                return _err(ValueError("labels_json must be a JSON object"))
            labels = {str(k): str(v) for k, v in parsed.items()}
        checks = [c.strip() for c in checks_csv.split(",") if c.strip()]
        return _ok(
            _client().template_clone(
                name=name,
                url=url,
                checks=checks or None,
                labels=labels,
            )
        )
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def template_delete(template_id: str) -> str:
    """Loop 107: delete an org-scoped template (orgtpl-*)."""
    try:
        return _ok(_client().delete_template(template_id))
    except Exception as exc:
        return _err(exc)


@mcp.tool()
def episode_batch_create(
    count: int,
    template_id: str = "default",
    schedule: str = "",
    strategy: str = "",
    curriculum_json: str = "",
    seed: int = -1,
) -> str:
    """Loop 101: create episode batch; optional named schedule expands strategy + labels.

    curriculum_json: optional JSON object merged over schedule defaults.
    strategy: omit (empty) to keep schedule preset; set to auto|wave|single to override.
    """
    try:
        curriculum_labels = None
        if curriculum_json.strip():
            import json

            parsed = json.loads(curriculum_json)
            if not isinstance(parsed, dict):
                return _err(ValueError("curriculum_json must be a JSON object"))
            curriculum_labels = {str(k): str(v) for k, v in parsed.items()}
        return _ok(
            _client().create_episode_batch(
                count=count,
                template_id=template_id,
                schedule=schedule or None,
                strategy=strategy or None,
                curriculum_labels=curriculum_labels,
                seed=None if seed < 0 else seed,
            )
        )
    except Exception as exc:
        return _err(exc)


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
