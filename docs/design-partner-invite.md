# Design-partner invite — Fystash

You are invited to try Fystash: **Start free → copy an API key → run an episode batch on public HTTPS** — no SSH, no us on your box.

The multi-agent sandbox for **RL training**: warm Fystash rooms, episode batches, Harbor provider, capacity reserve, trajectory export. Coding-agent MCP remains available as a secondary path.

## What Fystash is

Fystash supplies **sandboxed multi-agent rooms** for RL training and interactive agents. Shared drive + fabric messaging. It is **not** an LLM product and not a competitor on gym/task content — bring your envs, graders, and models.

```text
Org → Episode batch → Room ↔ Sandbox + Fabric + Drive
     (Harbor / OpenEnv-style adapters at the edge)
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
batch = c.create_episode_batch(count=4, template_id="default", seed=42)
print(batch["batch_id"], batch["created_count"])
c.destroy_episode_batch(batch["batch_id"])
```

Docs: [RL training](https://docs.fystash.ai/get-started/rl-training) · [Episodes](https://docs.fystash.ai/guides/episodes) · [Harbor](https://docs.fystash.ai/guides/harbor) · [Capacity](https://docs.fystash.ai/guides/capacity-and-trajectories).

5. Optional coding path: install MCP (`uvx fystash-mcp`) — [Connect agent](https://docs.fystash.ai/get-started/connect-agent).

Full walkthrough: [RL training](https://docs.fystash.ai/get-started/rl-training) · [Episodes](https://docs.fystash.ai/guides/episodes).

## Templates

| `template_id` | Use | Typical RAM |
|---------------|-----|-------------|
| `default` | Episode / coding default | 256 MiB |
| `browser` | Chromium + product CDP URL | 2048 MiB |
| `desktop` | XFCE + computer-use + noVNC | 1536 MiB |
| `docker` | Docker Engine in-guest | 2048 MiB |

## Honesty card (latency)

- **Never mix create and resume columns.** Create is pool restore wall-clock; resume is standby→resume hot.
- Concurrent episode creates share warm pool depth (**32** on prod); use `strategy=wave` or reserve capacity when `count` exceeds depth.
- Create vs resume are different clocks — see [docs.fystash.ai](https://docs.fystash.ai).
- Capacity `hard_l1_fence` is single-host — not multi-region.

## Support

- **Slack (preferred for quick questions):** [Fystash Partners](https://join.slack.com/t/fystashpartners/shared_invite/zt-44yuea11h-KWEkIootL2rShugQkQ~P0g) → `#design-partners`
- **Email:** **support@fystash.ai** with your org id and a paste of `/health` if creates fail. Do not send API keys in email if you can avoid it — rotate if exposed.

## Out of this invite

Rootless docker, N>64 density claims, bare-metal latency claims, full Harbor dataset green as our gate.
