# Verifiers × Fystash (Loop 95)

Thin runtime helper for **Prime Intellect Verifiers** users. Fystash is the
sandbox/episode plane — not Environments Hub content.

## Paths

### A — Harbor cascade (preferred)

Verifiers `HarborTaskset` + Harbor `-e fystash` after
[harbor#2491](https://github.com/harbor-framework/harbor/pull/2491) merges:

```bash
export FYSTASH_API_KEY=key-…
harbor run -d "<org/dataset>" -a "<agent>" -m "<model>" -e fystash -n 4
```

### B — Direct Room API (this package)

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY=key-…
python3 integrations/verifiers/fystash_sandbox.py
```

```python
from integrations.verifiers.fystash_sandbox import FystashVerifiersSandbox, preflight

preflight()
sb = FystashVerifiersSandbox()
sb.start()
print(sb.exec("echo hello"))
sb.stop()
```

## Honesty

- Not an official `prime_sandboxes` plugin
- Not Environments Hub
- Harbor merge is out of band; Path A may need vendored Harbor adapter until then

## Links

- How-to: [docs/pi-verifiers-runtime-note.md](../../docs/pi-verifiers-runtime-note.md)
- Public: https://docs.fystash.ai/guides/verifiers
- OpenEnv provider: https://github.com/huggingface/OpenEnv/pull/1014
- Harbor provider: https://github.com/harbor-framework/harbor/pull/2491
