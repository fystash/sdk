"""HTTP room lifecycle SDK for the Fystash control plane.

This is the product-facing surface for Org → Room → Sandboxes + Fabric + Drive.
It talks only to the control API (never shells into vm-controller).
"""

from __future__ import annotations

import base64
import http.client
import json
import ssl
import urllib.error
import urllib.parse
from typing import Any


class RoomApiError(RuntimeError):
    def __init__(self, status: int, detail: str) -> None:
        super().__init__(f"HTTP {status}: {detail}")
        self.status = status
        self.detail = detail


class RoomClient:
    """Thin synchronous client for room lifecycle, fabric, exec, and drive.

    Uses a persistent HTTP(S) connection (keep-alive) to cut TLS/handshake
    cost on repeated exec/create calls (Loop 37).
    """

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:8080",
        api_key: str = "dev-key",
        *,
        timeout: float = 180.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        parsed = urllib.parse.urlparse(self.base_url)
        if parsed.scheme not in ("http", "https") or not parsed.hostname:
            raise ValueError(f"invalid base_url: {base_url!r}")
        self._scheme = parsed.scheme
        self._host = parsed.hostname
        self._port = parsed.port or (443 if parsed.scheme == "https" else 80)
        self._conn: http.client.HTTPConnection | http.client.HTTPSConnection | None = None

    def close(self) -> None:
        if self._conn is not None:
            try:
                self._conn.close()
            except Exception:  # noqa: BLE001
                pass
            self._conn = None

    def __enter__(self) -> "RoomClient":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def _connect(self) -> http.client.HTTPConnection | http.client.HTTPSConnection:
        if self._scheme == "https":
            ctx = ssl.create_default_context()
            return http.client.HTTPSConnection(
                self._host, self._port, timeout=self.timeout, context=ctx
            )
        return http.client.HTTPConnection(self._host, self._port, timeout=self.timeout)

    def _ensure_conn(self) -> http.client.HTTPConnection | http.client.HTTPSConnection:
        if self._conn is None:
            self._conn = self._connect()
        return self._conn

    def _request(
        self,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
        query: dict[str, str] | None = None,
    ) -> Any:
        url_path = path
        if query:
            url_path = f"{path}?{urllib.parse.urlencode(query)}"
        data = None if body is None else json.dumps(body).encode()
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Connection": "keep-alive",
        }
        last_exc: Exception | None = None
        for attempt in range(2):
            conn = self._ensure_conn()
            try:
                conn.request(method, url_path, body=data, headers=headers)
                resp = conn.getresponse()
                raw = resp.read()
                if resp.status >= 400:
                    detail = raw.decode() if raw else str(resp.status)
                    try:
                        parsed = json.loads(detail)
                        detail = str(parsed.get("detail", detail))
                    except Exception:  # noqa: BLE001
                        pass
                    raise RoomApiError(resp.status, detail)
                if not raw:
                    return {}
                return json.loads(raw.decode())
            except RoomApiError:
                raise
            except (http.client.HTTPException, OSError, TimeoutError) as exc:
                last_exc = exc
                self.close()
                if attempt == 0:
                    continue
                raise RoomApiError(502, f"connection failed: {exc}") from exc
        raise RoomApiError(502, f"connection failed: {last_exc}")

    def health(self) -> dict[str, Any]:
        return self._request("GET", "/health")

    def create_room(self, room_id: str) -> dict[str, Any]:
        return self._request("POST", "/v1/rooms", {"room_id": room_id})

    def list_rooms(self) -> dict[str, Any]:
        return self._request("GET", "/v1/rooms")

    def create_org(
        self,
        name: str,
        *,
        org_id: str | None = None,
        api_key: str | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {"name": name}
        if org_id is not None:
            body["org_id"] = org_id
        if api_key is not None:
            body["api_key"] = api_key
        return self._request("POST", "/v1/orgs", body)

    def org_usage(self, org_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/orgs/{org_id}/usage")

    def get_room(self, room_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/rooms/{room_id}")

    def prepare(
        self,
        room_id: str,
        agent_id: str,
        *,
        guest_cid: int,
        vcpu_count: int = 1,
        memory_mib: int = 256,
        enable_guest_net: bool = True,
    ) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/sandboxes/prepare",
            {
                "agent_id": agent_id,
                "guest_cid": guest_cid,
                "vcpu_count": vcpu_count,
                "memory_mib": memory_mib,
                "enable_guest_net": enable_guest_net,
            },
        )

    def start(self, room_id: str, *, attach_fabric: bool = True) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/start",
            {"attach_fabric": attach_fabric},
        )

    def create_from_template(
        self,
        room_id: str,
        agent_id: str,
        *,
        guest_cid: int,
        template_id: str = "default",
        vcpu_count: int = 1,
        memory_mib: int = 256,
        enable_guest_net: bool = True,
        attach_fabric: bool = True,
        env: dict[str, str] | None = None,
        egress_allowlist: list[str] | None = None,
    ) -> dict[str, Any]:
        """Product create via restore-as-create (claimed clock: create_hot_ms)."""
        body: dict[str, Any] = {
            "agent_id": agent_id,
            "guest_cid": guest_cid,
            "template_id": template_id,
            "vcpu_count": vcpu_count,
            "memory_mib": memory_mib,
            "enable_guest_net": enable_guest_net,
            "attach_fabric": attach_fabric,
        }
        if env:
            body["env"] = env
        if egress_allowlist is not None:
            body["egress_allowlist"] = egress_allowlist
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/sandboxes/from-template",
            body,
        )

    def create_episode_batch(
        self,
        *,
        count: int,
        template_id: str = "default",
        labels: dict[str, str] | None = None,
        seed: int | None = None,
        room_id_prefix: str = "ep",
        agent_id: str = "agent",
        guest_cid_base: int | None = None,
        env: dict[str, str] | None = None,
        egress_allowlist: list[str] | None = None,
        attach_fabric: bool = True,
        memory_mib: int = 256,
        strategy: str | None = None,
        curriculum_labels: dict[str, str] | None = None,
        schedule: str | None = None,
    ) -> dict[str, Any]:
        """Loop 69/84/101: create N episodes (room + one sandbox each).

        When ``schedule`` is set, omit ``strategy`` unless overriding the preset.
        """
        body: dict[str, Any] = {
            "count": int(count),
            "template_id": template_id,
            "room_id_prefix": room_id_prefix,
            "agent_id": agent_id,
            "attach_fabric": attach_fabric,
            "memory_mib": memory_mib,
        }
        if strategy is not None:
            body["strategy"] = strategy
        elif schedule is None:
            body["strategy"] = "auto"
        if labels is not None:
            body["labels"] = labels
        if curriculum_labels is not None:
            body["curriculum_labels"] = curriculum_labels
        if schedule is not None:
            body["schedule"] = schedule
        if seed is not None:
            body["seed"] = seed
        if guest_cid_base is not None:
            body["guest_cid_base"] = guest_cid_base
        if env:
            body["env"] = env
        if egress_allowlist is not None:
            body["egress_allowlist"] = egress_allowlist
        return self._request("POST", "/v1/episodes/batch", body)

    def list_curriculum_schedules(self) -> dict[str, Any]:
        """Loop 101: named curriculum schedule catalog."""
        return self._request("GET", "/v1/curriculum/schedules")

    def get_episode_batch(self, batch_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/episodes/batch/{batch_id}")

    def destroy_episode_batch(self, batch_id: str) -> dict[str, Any]:
        return self._request("DELETE", f"/v1/episodes/batch/{batch_id}")

    def get_episode(self, episode_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/episodes/{episode_id}")

    def get_episode_trajectory(
        self,
        episode_id: str,
        *,
        limit: int | None = None,
    ) -> dict[str, Any]:
        query: dict[str, str] = {}
        if limit is not None:
            query["limit"] = str(int(limit))
        return self._request(
            "GET",
            f"/v1/episodes/{episode_id}/trajectory",
            query=query or None,
        )

    def set_episode_reward(
        self,
        episode_id: str,
        *,
        reward: float | int | None = None,
        broken: bool | None = None,
        metrics: dict[str, Any] | None = None,
        note: str | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {}
        if reward is not None:
            body["reward"] = reward
        if broken is not None:
            body["broken"] = broken
        if metrics is not None:
            body["metrics"] = metrics
        if note is not None:
            body["note"] = note
        return self._request("POST", f"/v1/episodes/{episode_id}/reward", body)

    def get_batch_trajectories(
        self,
        batch_id: str,
        *,
        limit: int | None = None,
    ) -> dict[str, Any]:
        query: dict[str, str] = {}
        if limit is not None:
            query["limit"] = str(int(limit))
        return self._request(
            "GET",
            f"/v1/episodes/batch/{batch_id}/trajectories",
            query=query or None,
        )

    def export_batch_trajectories(
        self,
        batch_id: str,
        *,
        format: str = "atif",
        callback_url: str | None = None,
        limit: int | None = None,
    ) -> dict[str, Any]:
        """Loop 100: durable ATIF/fystash NDJSON sink (survives destroy)."""
        body: dict[str, Any] = {"format": format}
        if callback_url:
            body["callback_url"] = callback_url
        if limit is not None:
            body["limit"] = int(limit)
        return self._request(
            "POST",
            f"/v1/episodes/batch/{batch_id}/trajectories/export",
            body,
        )

    def download_batch_trajectory_export(
        self,
        batch_id: str,
        *,
        meta_only: bool = False,
    ) -> Any:
        """Loop 100: GET last export — meta JSON or raw NDJSON text."""
        query: dict[str, str] = {}
        if meta_only:
            query["meta_only"] = "true"
            return self._request(
                "GET",
                f"/v1/episodes/batch/{batch_id}/trajectories/export",
                query=query,
            )
        # NDJSON is not JSON — read raw body.
        url_path = f"/v1/episodes/batch/{batch_id}/trajectories/export"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/x-ndjson, text/plain, */*",
            "Connection": "keep-alive",
        }
        last_exc: Exception | None = None
        for attempt in range(2):
            conn = self._ensure_conn()
            try:
                conn.request("GET", url_path, body=None, headers=headers)
                resp = conn.getresponse()
                raw = resp.read()
                if resp.status >= 400:
                    detail = raw.decode() if raw else str(resp.status)
                    try:
                        parsed = json.loads(detail)
                        detail = str(parsed.get("detail", detail))
                    except Exception:  # noqa: BLE001
                        pass
                    raise RoomApiError(resp.status, detail)
                return raw.decode() if raw else ""
            except RoomApiError:
                raise
            except (http.client.HTTPException, OSError, TimeoutError) as exc:
                last_exc = exc
                self.close()
                if attempt == 0:
                    continue
                raise RoomApiError(502, f"connection failed: {exc}") from exc
        raise RoomApiError(502, f"connection failed: {last_exc}")

    def reset_episode(
        self,
        episode_id: str,
        *,
        seed: int | None = None,
        clear_drive: bool = False,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {"clear_drive": clear_drive}
        if seed is not None:
            body["seed"] = seed
        return self._request("POST", f"/v1/episodes/{episode_id}/reset", body)

    def record_episode_steps(
        self,
        episode_id: str,
        steps: list[dict[str, Any]],
        *,
        execute: bool = True,
    ) -> dict[str, Any]:
        """Loop 113: append structured browser demo steps to the episode trajectory."""
        return self._request(
            "POST",
            f"/v1/episodes/{episode_id}/record",
            {"steps": steps, "execute": execute},
        )

    def seed_episode(
        self,
        episode_id: str,
        *,
        pack: str,
        clear_first: bool = False,
    ) -> dict[str, Any]:
        """Loop 114: apply a named fixture seed pack onto the episode drive."""
        return self._request(
            "POST",
            f"/v1/episodes/{episode_id}/seed",
            {"pack": pack, "clear_first": clear_first},
        )

    def fork_episode(
        self,
        episode_id: str,
        *,
        labels: dict[str, str] | None = None,
        copy_paths: list[str] | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {}
        if labels is not None:
            body["labels"] = labels
        if copy_paths is not None:
            body["copy_paths"] = copy_paths
        return self._request("POST", f"/v1/episodes/{episode_id}/fork", body)

    def list_fleet_presets(self) -> dict[str, Any]:
        """Loop 104: snapshot fleet preset catalog."""
        return self._request("GET", "/v1/episodes/fleet-presets")

    def create_episode_fleet(
        self,
        episode_id: str,
        *,
        count: int,
        labels: dict[str, str] | None = None,
        copy_paths: list[str] | None = None,
        preset: str = "browser_snap",
    ) -> dict[str, Any]:
        """Loop 104: N× fork fleet from a browser source episode."""
        body: dict[str, Any] = {"count": int(count), "preset": preset}
        if labels is not None:
            body["labels"] = labels
        if copy_paths is not None:
            body["copy_paths"] = copy_paths
        return self._request("POST", f"/v1/episodes/{episode_id}/fleet", body)

    def replicate(
        self,
        room_id: str,
        target: str,
        *,
        agent_id: str = "agent",
        scope: list[str] | None = None,
        timeout_ms: int = 900_000,
        include_report: bool = True,
        max_workers: int | None = None,
        max_shapes: int | None = None,
        max_pages: int | None = None,
        crawl_depth: int | None = None,
        max_forms: int | None = None,
    ) -> dict[str, Any]:
        """Measure a running app's behaviour from inside a room.

        Returns the facts a grader is written from, alongside the coverage
        they were measured over. Pass `scope` path prefixes to bound the
        crawl; without one, coverage is measured against the whole app.
        """
        body: dict[str, Any] = {
            "room_id": room_id,
            "target": target,
            "agent_id": agent_id,
            "timeout_ms": int(timeout_ms),
            "include_report": bool(include_report),
        }
        if scope:
            body["scope"] = list(scope)
        if max_workers is not None:
            body["max_workers"] = int(max_workers)
        if max_shapes is not None:
            body["max_shapes"] = int(max_shapes)
        if max_pages is not None:
            body["max_pages"] = int(max_pages)
        if crawl_depth is not None:
            body["crawl_depth"] = int(crawl_depth)
        if max_forms is not None:
            body["max_forms"] = int(max_forms)
        return self._request("POST", "/v1/replicate", body)

    def replicate_env(
        self,
        room_id: str,
        target: str,
        clone_code: str,
        *,
        agent_id: str = "agent",
        scope: list[str] | None = None,
        timeout_ms: int = 900_000,
        app_port: int = 8088,
        include_report: bool = False,
        export_harbor: bool = False,
    ) -> dict[str, Any]:
        """Materialise a measured env: running clone + differential grader on the drive."""
        body: dict[str, Any] = {
            "room_id": room_id,
            "target": target,
            "agent_id": agent_id,
            "mode": "env",
            "clone_code": clone_code,
            "timeout_ms": int(timeout_ms),
            "app_port": int(app_port),
            "include_report": bool(include_report),
            "export_harbor": bool(export_harbor),
        }
        if scope:
            body["scope"] = list(scope)
        return self._request("POST", "/v1/replicate", body)

    def replicate_job_start(
        self,
        room_id: str,
        target: str,
        *,
        agent_id: str = "agent",
        scope: list[str] | None = None,
        mode: str = "report",
        clone_code: str | None = None,
        timeout_ms: int = 900_000,
        app_port: int = 8088,
        export_harbor: bool = False,
        secrets_ref: str | None = None,
        credentials: dict[str, str] | None = None,
        max_workers: int | None = None,
        max_shapes: int | None = None,
        max_pages: int | None = None,
        crawl_depth: int | None = None,
        max_forms: int | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {
            "room_id": room_id,
            "target": target,
            "agent_id": agent_id,
            "mode": mode,
            "timeout_ms": int(timeout_ms),
            "app_port": int(app_port),
            "export_harbor": bool(export_harbor),
        }
        if scope:
            body["scope"] = list(scope)
        if clone_code:
            body["clone_code"] = clone_code
        if secrets_ref:
            body["secrets_ref"] = secrets_ref
        if credentials:
            body["credentials"] = credentials
        if max_workers is not None:
            body["max_workers"] = int(max_workers)
        if max_shapes is not None:
            body["max_shapes"] = int(max_shapes)
        if max_pages is not None:
            body["max_pages"] = int(max_pages)
        if crawl_depth is not None:
            body["crawl_depth"] = int(crawl_depth)
        if max_forms is not None:
            body["max_forms"] = int(max_forms)
        return self._request("POST", "/v1/replicate/jobs", body)

    def replicate_job_poll(self, room_id: str, job_id: str) -> dict[str, Any]:
        return self._request(
            "GET",
            f"/v1/replicate/jobs/{job_id}",
            query={"room_id": room_id},
        )

    def replicate_export_harbor(
        self,
        room_id: str,
        replicate_id: str,
        *,
        target: str = "",
    ) -> dict[str, Any]:
        return self._request(
            "POST",
            "/v1/replicate/export-harbor",
            {
                "room_id": room_id,
                "replicate_id": replicate_id,
                "target": target,
            },
        )

    def list_templates(self) -> dict[str, Any]:
        """Loop 107: builtins + org-scoped templates."""
        return self._request("GET", "/v1/templates")

    def get_template(self, template_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/templates/{template_id}")

    def delete_template(self, template_id: str) -> dict[str, Any]:
        return self._request("DELETE", f"/v1/templates/{template_id}")

    def template_from_episode(
        self,
        *,
        source_episode_id: str,
        name: str,
        labels: dict[str, str] | None = None,
        copy_paths: list[str] | None = None,
    ) -> dict[str, Any]:
        """Loop 107: promote a browser episode snap → orgtpl-* golden."""
        body: dict[str, Any] = {
            "source_episode_id": source_episode_id,
            "name": name,
        }
        if labels is not None:
            body["labels"] = labels
        if copy_paths is not None:
            body["copy_paths"] = copy_paths
        return self._request("POST", "/v1/templates/from-episode", body)

    def template_clone(
        self,
        *,
        name: str,
        url: str = "fixture://clone-auth",
        checks: list[str] | None = None,
        labels: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """Loop 108: parity (signup/login) + promote to org template."""
        body: dict[str, Any] = {"name": name, "url": url}
        if checks is not None:
            body["checks"] = checks
        if labels is not None:
            body["labels"] = labels
        return self._request("POST", "/v1/templates/clone", body)

    def create_training_room(
        self,
        *,
        room_id: str | None = None,
        roles: list[str] | None = None,
        topology: str | None = None,
        template_id: str = "default",
        memory_mib: int = 256,
        guest_cid_base: int = 9200,
        env: dict[str, str] | None = None,
        egress_allowlist: list[str] | None = None,
        attach_fabric: bool = True,
    ) -> dict[str, Any]:
        """Loop 82/103: multi-role room via POST /v1/rooms/training.

        Prefer ``topology`` (``agent_grader`` / ``agent_grader_judge``). Optional
        ``roles`` override the preset. Falls back to client-side compose if CP
        returns 404 (pre-Loop-103 hosts).
        """
        body: dict[str, Any] = {
            "template_id": template_id,
            "memory_mib": memory_mib,
            "guest_cid_base": guest_cid_base,
            "attach_fabric": attach_fabric,
        }
        if room_id is not None:
            body["room_id"] = room_id
        if topology is not None:
            body["topology"] = topology
        if roles is not None:
            body["roles"] = roles
        if env:
            body["env"] = env
        if egress_allowlist is not None:
            body["egress_allowlist"] = egress_allowlist
        try:
            return self._request("POST", "/v1/rooms/training", body)
        except RoomApiError as exc:
            if exc.status != 404:
                raise
        # Pre-103 CP fallback: compose room + from-template locally.
        import secrets as _secrets

        rid = room_id or f"train-{_secrets.token_hex(4)}"
        if topology and not roles:
            presets = {
                "agent_grader": ["agent", "grader"],
                "agent_grader_judge": ["agent", "grader", "judge"],
            }
            role_ids = presets.get(topology) or ["agent", "grader"]
        else:
            role_ids = roles or ["agent", "grader"]
        self.create_room(rid)
        sandboxes = []
        for i, role in enumerate(role_ids):
            sb = self.create_from_template(
                rid,
                role,
                guest_cid=guest_cid_base + i,
                template_id=template_id,
                memory_mib=memory_mib,
                attach_fabric=attach_fabric,
                env=env,
                egress_allowlist=egress_allowlist,
            )
            sandboxes.append({"agent_id": role, **sb})
        return {
            "room_id": rid,
            "topology_id": topology or "custom",
            "roles": role_ids,
            "sandboxes": sandboxes,
        }

    def list_room_topologies(self) -> dict[str, Any]:
        """Loop 103: named multi-role room topology catalog."""
        return self._request("GET", "/v1/rooms/topologies")

    def reserve_capacity(
        self,
        *,
        count: int,
        template_id: str = "default",
        ttl_s: int = 3600,
        labels: dict[str, str] | None = None,
        kind: str = "hard_l1_fence",
    ) -> dict[str, Any]:
        body: dict[str, Any] = {
            "count": int(count),
            "template_id": template_id,
            "ttl_s": int(ttl_s),
            "kind": kind,
        }
        if labels is not None:
            body["labels"] = labels
        return self._request("POST", "/v1/capacity/reserve", body)

    def list_capacity_reservations(self) -> dict[str, Any]:
        return self._request("GET", "/v1/capacity/reservations")

    def release_capacity(self, reservation_id: str) -> dict[str, Any]:
        return self._request("DELETE", f"/v1/capacity/reservations/{reservation_id}")

    def create_browser(
        self,
        room_id: str,
        agent_id: str,
        *,
        guest_cid: int,
        memory_mib: int = 2048,
        attach_fabric: bool = True,
        env: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """Create a browser-template sandbox (Chromium CDP on :9222 / relay :9223)."""
        return self.create_from_template(
            room_id,
            agent_id,
            guest_cid=guest_cid,
            template_id="browser",
            memory_mib=memory_mib,
            attach_fabric=attach_fabric,
            env=env,
        )

    def create_desktop(
        self,
        room_id: str,
        agent_id: str,
        *,
        guest_cid: int,
        memory_mib: int = 1536,
        attach_fabric: bool = True,
        env: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """Create a desktop-template sandbox (XFCE + fystash-cua + noVNC)."""
        return self.create_from_template(
            room_id,
            agent_id,
            guest_cid=guest_cid,
            template_id="desktop",
            memory_mib=memory_mib,
            attach_fabric=attach_fabric,
            env=env,
        )

    def create_docker(
        self,
        room_id: str,
        agent_id: str,
        *,
        guest_cid: int,
        memory_mib: int = 2048,
        attach_fabric: bool = True,
        env: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        """Create a docker-template sandbox (dockerd + docker CLI)."""
        return self.create_from_template(
            room_id,
            agent_id,
            guest_cid=guest_cid,
            template_id="docker",
            memory_mib=memory_mib,
            attach_fabric=attach_fabric,
            env=env,
        )

    def standby(self, room_id: str, agent_id: str) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/sandboxes/{agent_id}/standby",
        )

    def resume(self, room_id: str, agent_id: str) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/sandboxes/{agent_id}/resume",
        )

    def list_sandboxes(self, room_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/rooms/{room_id}/sandboxes")

    def send(
        self,
        room_id: str,
        *,
        source: str,
        destination: str = "",
        topic: str | None = None,
        payload: bytes = b"",
        kind: str = "event",
        wait_reply: bool = False,
        timeout_ms: int = 5_000,
    ) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/messages",
            {
                "source": source,
                "destination": destination,
                "topic": topic,
                "payload_b64": base64.b64encode(payload).decode(),
                "kind": kind,
                "wait_reply": wait_reply,
                "timeout_ms": timeout_ms,
            },
        )

    def wait_barrier(
        self,
        room_id: str,
        *,
        barrier_id: str,
        arrivals: list[str],
        parties: int = 0,
        timeout_ms: int = 30_000,
    ) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/barriers",
            {
                "barrier_id": barrier_id,
                "arrivals": arrivals,
                "parties": parties or len(arrivals),
                "timeout_ms": timeout_ms,
            },
        )

    def exec(
        self,
        room_id: str,
        agent_id: str,
        argv: list[str],
        *,
        cwd: str | None = None,
        timeout_ms: int = 30_000,
        stdin: bytes | None = None,
        env: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {"argv": argv, "timeout_ms": timeout_ms}
        if cwd is not None:
            body["cwd"] = cwd
        if stdin is not None:
            body["stdin_b64"] = base64.b64encode(stdin).decode()
        if env:
            body["env"] = env
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/sandboxes/{agent_id}/exec",
            body,
        )

    def expose_port(
        self,
        room_id: str,
        agent_id: str,
        port: int,
    ) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/sandboxes/{agent_id}/ports",
            {"port": port},
        )

    def unexpose_port(
        self,
        room_id: str,
        agent_id: str,
        port: int,
    ) -> dict[str, Any]:
        return self._request(
            "DELETE",
            f"/v1/rooms/{room_id}/sandboxes/{agent_id}/ports/{port}",
        )

    def drive_write(self, room_id: str, path: str, content: bytes) -> dict[str, Any]:
        return self._request(
            "POST",
            f"/v1/rooms/{room_id}/drive/write",
            {
                "path": path,
                "content_b64": base64.b64encode(content).decode(),
            },
        )

    def drive_read(self, room_id: str, path: str) -> dict[str, Any]:
        return self._request(
            "GET",
            f"/v1/rooms/{room_id}/drive/read",
            query={"path": path},
        )

    def drive_list(self, room_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/rooms/{room_id}/drive/list")

    def destroy(self, room_id: str) -> dict[str, Any]:
        return self._request("DELETE", f"/v1/rooms/{room_id}")

    def destroy_sandbox(self, room_id: str, agent_id: str) -> dict[str, Any]:
        return self._request("DELETE", f"/v1/rooms/{room_id}/sandboxes/{agent_id}")

    def audit(
        self,
        room_id: str,
        *,
        limit: int | None = None,
        since: str | float | None = None,
        event: str | None = None,
        agent_id: str | None = None,
    ) -> dict[str, Any]:
        query: dict[str, str] = {}
        if limit is not None:
            query["limit"] = str(int(limit))
        if since is not None and since != "":
            query["since"] = str(since)
        if event:
            query["event"] = event
        if agent_id:
            query["agent_id"] = agent_id
        path = f"/v1/rooms/{room_id}/audit"
        if query:
            from urllib.parse import urlencode

            path = f"{path}?{urlencode(query)}"
        return self._request("GET", path)

    def org_audit(
        self,
        org_id: str,
        *,
        limit: int | None = None,
        since: str | float | None = None,
        event: str | None = None,
    ) -> dict[str, Any]:
        query: dict[str, str] = {}
        if limit is not None:
            query["limit"] = str(int(limit))
        if since is not None and since != "":
            query["since"] = str(since)
        if event:
            query["event"] = event
        path = f"/v1/orgs/{org_id}/audit"
        if query:
            from urllib.parse import urlencode

            path = f"{path}?{urlencode(query)}"
        return self._request("GET", path)
