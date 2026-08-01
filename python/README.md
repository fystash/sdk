# Fystash Python SDK

Python 3.11+ async client for the Fystash fabric protocol.

```python
import asyncio

from fystash import FystashClient


async def main() -> None:
    async with FystashClient.tcp(
        "127.0.0.1",
        7447,
        room_id="demo",
        agent_id="worker-a",
    ) as client:
        response = await client.request("worker-b", b"hello", timeout=5)
        print(response.payload)


asyncio.run(main())
```

The transport is a four-byte, unsigned big-endian frame length followed by a
serialized `fystash.fabric.v1.WireFrame`.

## Registration modes

`registration_mode="auto"` is the safe default:

- TCP selects `direct`: the SDK sends one `Register`, then reads and validates
  the Rust router's registration ACK before reporting connected.
- Unix sockets select `daemon`: the SDK sends no `Register`, because
  `fystash-guest-daemon` owns router identity. The SDK's `room_id` and
  `agent_id` are informational in this mode and the router rewrites them from
  the daemon registration.

The mode can be set explicitly to `"direct"` or `"daemon"`. The Rust router
allows only one registration per connection. Consequently `register()` and
`subscribe()` raise `UnsupportedOperationError` after direct connection, and
both are unsupported in daemon mode. Configure daemon subscriptions with the
guest daemon's `--topic` option.

Responses and cancellations always receive fresh message IDs and carry the
original request ID in the `reply_to` header. This is required because the
router deduplicates message IDs across a room.

Development:

```console
uv sync
uv run ruff check .
uv run mypy src
uv run pytest
```

The checked-in runtime binding and type stub are regenerated from the canonical
proto with:

```console
uv run python -m grpc_tools.protoc \
  --proto_path=../../proto \
  --python_out=src/fystash/_generated \
  --pyi_out=src/fystash/_generated \
  ../../proto/fabric.proto
```
