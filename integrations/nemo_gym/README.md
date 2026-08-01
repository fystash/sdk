# NeMo Gym × Fystash (Loop 96)

Thin **SandboxProvider** for NVIDIA NeMo Gym. Fystash is the sandbox/episode
plane — not a GPU scheduler, not NGC packaging, not a `resources_server`.

## Paths

### A — Harbor cascade (preferred when on Harbor)

NeMo Gym `harbor_agent` + Harbor `harbor_environment_type: fystash` after
[harbor#2491](https://github.com/harbor-framework/harbor/pull/2491):

```bash
export FYSTASH_API_KEY=key-…
# Point Harbor agent config at environment type fystash
```

### B — Native SandboxProvider (this package)

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY=key-…
python3 integrations/nemo_gym/fystash_provider.py
```

```python
from integrations.nemo_gym import FystashProvider, preflight, register

preflight()
register()  # binds "fystash" if nemo_gym is installed

provider = FystashProvider()
# await provider.create() / exec() / close()
```

YAML: [configs/fystash.yaml](configs/fystash.yaml) — pass with `gym env start --config …`.

## Honesty

- v1 maps `provider_options.template_id` / `FYSTASH_TEMPLATE_ID` — does **not**
  pull arbitrary container images like Daytona
- Not a built-in until upstream fern/docs (or provider) merge
- Harbor Path A may need vendored adapter until Harbor merges

## Links

- How-to: [docs/nemo-gym-fystash.md](../../docs/nemo-gym-fystash.md)
- Public: https://docs.fystash.ai/guides/nemo-gym
- Gym sandbox: https://docs.nvidia.com/nemo/gym/infrastructure/sandbox
- Harbor: https://github.com/harbor-framework/harbor/pull/2491
- OpenEnv: https://github.com/huggingface/OpenEnv/pull/1014
- Verifiers: https://github.com/PrimeIntellect-ai/verifiers/pull/2143
