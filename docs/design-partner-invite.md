# Design-partner invite — Fystash

You are invited to try Fystash: **Start free → copy an API key → run an
Episode batch on public HTTPS** — no SSH and no Fystash access to your hosts.

The **episode runtime for RL environments**: versioned Episode specs, warm
Firecracker environments, Harbor trials, capacity reservations, partner-owned
rewards, and destroy-safe trajectory export.

## What Fystash is

Fystash turns an environment, policy reference, verifier, and collector
specification into one managed Episode lifecycle. Bring your policy,
environment, tasks, and reward logic — we run the episodes.

```text
Harness → EpisodeBatch → Episode → environment → verifier → trajectory/reward
                              └─ lower-level Room/Sandbox APIs remain available
```

## Topology disclosure

Production control plane runs on **GCP nested KVM** (`topology=nested`). Latency claims are for this path — not bare metal.

```bash
export FYSTASH_API=https://api.fystash.ai
```

If something looks down: `curl -fsS "$FYSTASH_API/health"` (expect `"status":"ok"`).

## Steps (about 10 minutes)

1. Open **[https://fystash.ai](https://fystash.ai)** → **Start free** / **Sign up**
2. Open **[Account](https://fystash.ai/account)** → copy your **API key** (free $5 signup credits; Billing is optional for higher quotas)
3. Export env:

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY='key-…'
```

4. **Episode batch hello** (primary):

```python
import os
from fystash.room import RoomClient

c = RoomClient(os.environ["FYSTASH_API"], os.environ["FYSTASH_API_KEY"])
spec = {
    "schema_version": "fystash.episode.v1",
    "environment": {"template_id": "default"},
    "policy_ref": {"name": "design-partner-policy", "version": "trial-1"},
    "verifier": {"mode": "shared"},
    "collector": {"format": "atif"},
    "execution": {"timeout_s": 900, "cleanup": "retain"},
}
batch = c.create_episode_batch(count=4, episode=spec, seed=42)
print(batch["batch_id"], batch["created_count"])
c.destroy_episode_batch(batch["batch_id"])
```

Docs: [RL training](https://docs.fystash.ai/get-started/rl-training) · [Episodes guide](https://docs.fystash.ai/guides/episodes) · [Episodes API](https://docs.fystash.ai/api/episodes) · [Harbor](https://docs.fystash.ai/guides/harbor) · [Capacity and trajectories](https://docs.fystash.ai/guides/capacity-and-trajectories).

5. Optional coding path: install MCP (`uvx fystash-mcp`) — [Connect agent](https://docs.fystash.ai/get-started/connect-agent).

## Templates

| `template_id` | Use | Typical RAM |
|---------------|-----|-------------|
| `default` | Episode / coding default | 256 MiB |
| `browser` | Chromium + product CDP URL | 2048 MiB |
| `desktop` | XFCE + computer-use + noVNC | 1536 MiB |
| `docker` | Docker Engine in-guest | 16384 MiB / 6 vCPU |

## Latency notes

- **Never mix create and resume columns.** Create is pool restore wall-clock; resume is standby→resume hot.
- Concurrent episode creates share warm pool depth (**24** on prod — current `/health`); use `strategy=wave` or reserve capacity when `count` exceeds depth.
- Capacity `hard_l1_fence` is single-host — not multi-region.

## Support

- **Slack (preferred for quick questions):** [Fystash Partners](https://join.slack.com/t/fystashpartners/shared_invite/zt-44yuea11h-KWEkIootL2rShugQkQ~P0g) → `#design-partners`
- **Email:** **support@fystash.ai** with your org id and a paste of `/health` if creates fail.
