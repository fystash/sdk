# Harbor provider — Fystash (Loops 70 + 93 + 105)

Fystash as a Harbor sandbox backend: `create room → from-template → exec → destroy`.

## Env

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY=key-…
export FYSTASH_TEMPLATE_ID=default   # overridden to docker when task has docker_image
export FYSTASH_AGENT_ID=harbor
```

## DinD docker_image (Loop 105)

When `task.environment.docker_image` is set:

1. Start Fystash **`template_id=docker`** (2048 MiB guest dockerd)
2. `docker pull` the prebuilt image
3. `docker run -d --name harbor-task --entrypoint sleep <image> infinity`
4. Wrap Harbor `exec` / upload / download via `docker exec` into that container

**Honesty:** prebuilt images only (OpenSandbox posture). Does **not** build Harbor task Dockerfiles. Compose tasks are rejected. Without `docker_image`, falls back to v1 template + env upload (`default` @ 256 MiB).

## Upstream Harbor PR

**https://github.com/harbor-framework/harbor/pull/2491**

```bash
harbor run -d terminal-bench@2.0 -a oracle -e fystash -n 2 -y
```

## Smoke (no Harbor package required)

```bash
python3 integrations/harbor/fystash_env.py
# or
bash deploy/gcp/run-harbor-fystash-smoke.sh
```

## Wire into Harbor (pre-merge / vendored)

1. Vendor `integrations/harbor/fystash_env.py` or use the upstream PR branch.
2. Register type `fystash` in Harbor’s environment factory.
3. For SkyRL: `harbor_trial_config.environment.type=fystash`.

## Measured path

- Adapter hello: `evals/scripts/harbor_fystash_smoke_eval.py`
- TB oracle (Loop 105): `evals/results/harbor-tb-oracle-<stamp>.*`
