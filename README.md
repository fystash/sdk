# Fystash SDK & adapters

**Open SDKs and embed adapters. Paid warm Firecracker cloud ($/agent-hr).**

This repo is the public client surface for [Fystash](https://fystash.ai) — multi-agent sandboxes for RL training.

| Path | What |
|------|------|
| [`typescript/`](typescript/) | `@fystash_ai/sdk` — HTTP `RoomClient` + fabric wire |
| [`python/`](python/) | `fystash` Python fabric / room SDK |
| [`mcp/`](mcp/) | Stdio MCP server (`fystash-mcp`) |
| [`integrations/`](integrations/) | Harbor, OpenEnv, NeMo Gym, SkyRL, Verifiers, trajectory helpers |

The **runtime** is hosted: [https://api.fystash.ai](https://api.fystash.ai). Sign up and credits: [https://fystash.ai](https://fystash.ai). Docs: [https://docs.fystash.ai](https://docs.fystash.ai).

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY='key-…'   # Account → API key
```

## Quick links

- [RL training](https://docs.fystash.ai/get-started/rl-training)
- [Harbor](https://docs.fystash.ai/guides/harbor) · adapter: [`integrations/harbor`](integrations/harbor)
- [NeMo Gym](https://docs.fystash.ai/guides/nemo-gym) · adapter: [`integrations/nemo_gym`](integrations/nemo_gym)
- [OpenEnv](https://docs.fystash.ai/guides/openenv) · adapter: [`integrations/openenv`](integrations/openenv)
- [Design-partner invite](docs/design-partner-invite.md)

## License

Apache-2.0. Control plane, deploy, and guest images stay private — this repo is clients and embeds only.
