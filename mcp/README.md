# fystash-mcp

Stdio [MCP](https://modelcontextprotocol.io) server for the Fystash control plane.
Agents call tools (`room_create`, `sandbox_create`, `sandbox_exec`,
`capacity_reserve`, …) which hit public HTTPS REST with your org API key.

Production topology is **GCP nested KVM** (`topology=nested`).

## Install

```bash
pip install fystash-mcp
# or
uvx fystash-mcp
```

## Env

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY='key-…'   # from webapp Account / Billing success
```

## Cursor / Claude Desktop (`mcp.json`)

```json
{
  "mcpServers": {
    "fystash": {
      "command": "uvx",
      "args": ["fystash-mcp"],
      "env": {
        "FYSTASH_API": "https://api.fystash.ai",
        "FYSTASH_API_KEY": "key-…"
      }
    }
  }
}
```

Or with pip-installed console script:

```json
{
  "mcpServers": {
    "fystash": {
      "command": "fystash-mcp",
      "env": {
        "FYSTASH_API": "https://api.fystash.ai",
        "FYSTASH_API_KEY": "key-…"
      }
    }
  }
}
```

## Tools (SPEC §9 + status)

| Tool | REST twin |
|------|-----------|
| `health` | `GET /health` |
| `room_list` | `GET /v1/rooms` |
| `usage` | `GET /v1/orgs/{org_id}/usage` |
| `room_create` / `room_get` / `room_destroy` | rooms |
| `sandbox_create` | `POST …/sandboxes/from-template` |
| `sandbox_exec` / `sandbox_destroy` | exec / delete sandbox |
| `agent_send` / `agent_request` / `agent_fanout` / `agent_wait` | fabric |
| `barrier_arrive` | barriers |
| `fs_read` / `fs_write` / `fs_list` | room drive |
| `audit_list` | room audit (filters: limit/since/event/agent_id; summarize) |
| `org_audit_list` | org audit (billing/keys/quota; summarize) |

**guest_cid:** pick a unique int per sandbox, typically `9100–9999`, and do not reuse an in-use cid in the same room/host.

**Templates (`sandbox_create.template_id`):**

| id | Use | Typical `memory_mib` |
|----|-----|----------------------|
| `default` | Coding (`git` / `curl` / `python3` / `node`) | 256 |
| `browser` | Chromium + product CDP / preview URL | 2048 |
| `desktop` | XFCE + `fystash-cua` + noVNC | 1536 |
| `docker` | Docker Engine (Compose / build / pull) | 2048 |

Optional create args: `env_json` (JSON object of strings; no `FYSTASH_*` keys), `egress_allowlist_json` (JSON array of IPv4/CIDR/hostname). Exec accepts `env_json` merge for that call.

Cookbook parity path: [docs/cookbook/README.md](../../docs/cookbook/README.md). Latency honesty: [Loop 59 competitor-bench](../../evals/results/competitor-bench-20260724T081731Z.md).

**Agent-first:** the webapp is a prompt hub. Prefer skills `fystash-ask` / `fystash-diagnose` / `fystash-debug` / `fystash-plan` over asking users to click console UI.

## Develop (this repo)

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY=dev-key   # or org key
cd apps/mcp && uv run python -m fystash_mcp
```

See [docs/get-started.md](../../docs/get-started.md) and [skills/fystash/SKILL.md](../../skills/fystash/SKILL.md).
