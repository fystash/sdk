# SkyRL × Fystash (Loop 97)

Thin **Harbor cascade** example for NovaSky SkyRL. Fystash is the sandbox plane —
SkyRL does not register providers; set Harbor `environment.type: fystash`.

## Env

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY=key-…
export FYSTASH_TEMPLATE_ID=default
```

## Preflight

```bash
python3 integrations/skyrl/preflight.py
# Room hello (Harbor adapter):
python3 integrations/harbor/fystash_env.py
```

## SkyRL override

After Harbor merges [harbor#2491](https://github.com/harbor-framework/harbor/pull/2491)
(and SkyRL’s pinned Harbor rev includes Fystash):

```bash
uv run --extra harbor \
  -m examples.train_integrations.harbor.entrypoints.main_harbor \
  … \
  harbor_trial_config.environment.type=fystash
```

YAML snippet: [configs/fystash-trial.yaml](configs/fystash-trial.yaml)

## Honesty

- Not a custom SkyRL `GeneratorInterface`
- Fystash v1 does not build Harbor task Dockerfiles (template_id path)
- Harbor merge + Harbor pin bump are out of band

## Links

- How-to: [docs/skyrl-fystash.md](../../docs/skyrl-fystash.md)
- Public: https://docs.fystash.ai/guides/skyrl
- Harbor: https://github.com/harbor-framework/harbor/pull/2491
- OpenEnv: https://github.com/huggingface/OpenEnv/pull/1014
- Verifiers: https://github.com/PrimeIntellect-ai/verifiers/pull/2143
- NeMo Gym: https://github.com/NVIDIA-NeMo/Gym/pull/2144
