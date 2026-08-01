"""Minimal HTTP room client for the MCP package (stdlib only).

Vendored subset of sdk/python RoomClient so `fystash-mcp` on PyPI does not
require the monorepo or a separate fystash-sdk wheel.
"""

from __future__ import annotations

import base64
import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


class RoomApiError(RuntimeError):
    def __init__(self, status: int, detail: str) -> None:
        super().__init__(f"HTTP {status}: {detail}")
        self.status = status
        self.detail = detail


class RoomClient:
    """Thin synchronous client for room lifecycle, fabric, exec, and drive."""

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

    def _request(
        self,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
        query: dict[str, str] | None = None,
    ) -> Any:
        url = f"{self.base_url}{path}"
        if query:
            url = f"{url}?{urllib.parse.urlencode(query)}"
        data = None if body is None else json.dumps(body).encode()
        req = urllib.request.Request(
            url,
            data=data,
            method=method,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read()
                if not raw:
                    return {}
                return json.loads(raw.decode())
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode() if exc.fp else str(exc)
            try:
                parsed = json.loads(detail)
                detail = str(parsed.get("detail", detail))
            except Exception:
                pass
            raise RoomApiError(exc.code, detail) from exc

    def health(self) -> dict[str, Any]:
        return self._request("GET", "/health")

    def list_rooms(self) -> dict[str, Any]:
        return self._request("GET", "/v1/rooms")

    def org_usage(self, org_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/orgs/{org_id}/usage")

    def create_room(self, room_id: str) -> dict[str, Any]:
        return self._request("POST", "/v1/rooms", {"room_id": room_id})

    def get_room(self, room_id: str) -> dict[str, Any]:
        return self._request("GET", f"/v1/rooms/{room_id}")

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
        return self._request(
            "GET",
            f"/v1/rooms/{room_id}/audit",
            query=query or None,
        )

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
        return self._request(
            "GET",
            f"/v1/orgs/{org_id}/audit",
            query=query or None,
        )

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
        return self._request(
            "DELETE", f"/v1/capacity/reservations/{reservation_id}"
        )

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

    def reset_episode(
        self,
        episode_id: str,
        *,
        seed: int | None = None,
        clear_drive: bool = False,
    ) -> dict[str, Any]:
        """Loop 109: destroy sandbox and recreate from template."""
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
        """Loop 113: append structured browser steps to trajectory."""
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
        """Loop 114: apply named fixture seed pack onto episode drive."""
        return self._request(
            "POST",
            f"/v1/episodes/{episode_id}/seed",
            {"pack": pack, "clear_first": clear_first},
        )

    def export_batch_trajectories(
        self,
        batch_id: str,
        *,
        format: str = "atif",
        callback_url: str | None = None,
        limit: int | None = None,
    ) -> dict[str, Any]:
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

    def download_batch_trajectory_export_meta(self, batch_id: str) -> dict[str, Any]:
        return self._request(
            "GET",
            f"/v1/episodes/batch/{batch_id}/trajectories/export",
            query={"meta_only": "true"},
        )

    def create_episode_batch(
        self,
        *,
        count: int,
        template_id: str = "default",
        labels: dict[str, str] | None = None,
        strategy: str | None = None,
        curriculum_labels: dict[str, str] | None = None,
        schedule: str | None = None,
        seed: int | None = None,
        memory_mib: int = 256,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {
            "count": int(count),
            "template_id": template_id,
            "memory_mib": int(memory_mib),
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
        return self._request("POST", "/v1/episodes/batch", body)

    def destroy_episode_batch(self, batch_id: str) -> dict[str, Any]:
        return self._request("DELETE", f"/v1/episodes/batch/{batch_id}")

    def list_curriculum_schedules(self) -> dict[str, Any]:
        return self._request("GET", "/v1/curriculum/schedules")

    def list_room_topologies(self) -> dict[str, Any]:
        return self._request("GET", "/v1/rooms/topologies")

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
        return self._request("POST", "/v1/rooms/training", body)

    def list_fleet_presets(self) -> dict[str, Any]:
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
        return self._request("POST", "/v1/replicate/jobs", body)

    def replicate_job_poll(self, room_id: str, job_id: str) -> dict[str, Any]:
        return self._request(
            "GET",
            f"/v1/replicate/jobs/{job_id}",
            query={"room_id": room_id},
        )

    def list_templates(self) -> dict[str, Any]:
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
        body: dict[str, Any] = {"name": name, "url": url}
        if checks is not None:
            body["checks"] = checks
        if labels is not None:
            body["labels"] = labels
        return self._request("POST", "/v1/templates/clone", body)
