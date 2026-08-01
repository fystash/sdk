# @fystash_ai/sdk

Async SDK for the Fystash control plane and fabric wire:

- **`RoomClient`** — HTTP Org → Room → Sandboxes + Fabric + Drive (camelCase, Promise-based).
- **`FystashClient`** — native fabric wire over TCP / Unix (length-prefixed `WireFrame` protobuf): register, send, request/respond, receive, barrier, reconnect.

Requires **Node ≥ 20**. Production topology is **GCP nested KVM** (`topology=nested`).

## Install

```bash
npm install @fystash_ai/sdk
```

```bash
export FYSTASH_API=https://api.fystash.ai
export FYSTASH_API_KEY='key-…'   # from webapp Account / Billing success
```

Docs: [docs.fystash.ai](https://docs.fystash.ai) · [get started](https://docs.fystash.ai/get-started/quickstart).

## HTTP RoomClient (hello)

```ts
import { RoomClient } from "@fystash_ai/sdk";

const client = new RoomClient({
  baseUrl: process.env.FYSTASH_API!,
  apiKey: process.env.FYSTASH_API_KEY!,
  timeoutMs: 180_000,
});

const room = `room-hello-${Date.now()}`;
await client.health();
await client.createRoom(room);
await client.createFromTemplate(room, "a1", {
  guestCid: 9100,
  memoryMib: 256,
});
await client.destroy(room);
```

## FystashSession (host wrappers)

High-level create → spawn → drive → exec → destroy used by
`@fystash_ai/convex` and `@fystash_ai/ai`:

```ts
import { FystashSession } from "@fystash_ai/sdk";

const session = FystashSession.fromEnv(`room-${Date.now()}`);
await session.create();
await session.spawnMany(["scout", "drafter"]);
await session.driveWrite("hello.txt", "hi\n");
const out = await session.exec("scout", ["cat", "hello.txt"]);
await session.destroy();
```

## Wire client (in-guest)

```ts
import { FystashClient } from "@fystash_ai/sdk";

const client = FystashClient.tcp("127.0.0.1", 7000, {
  roomId: "room-1",
  agentId: "worker-a",
  subscriptions: ["events"],
});
await client.connect();

const reply = await client.request("worker-b", Buffer.from("hello"), {
  timeoutMs: 5_000,
});
await client.send("server", Buffer.from("ping"));
const pushed = await client.receive({ timeoutMs: 5_000 });
const release = await client.barrier("ready", 2, { timeoutMs: 5_000 });

await client.close();
```

## Capacity (training-window contract)

```ts
await client.reserveCapacity({
  count: 32,
  ttlS: 3600,
  kind: "hard_l1_fence",
  labels: { contract: "codecontests-week" },
});
await client.listCapacityReservations();
// await client.releaseCapacity(reservationId);
```

Free orgs: max **8** reserved slots · Starter/paid: **64**. See [capacity docs](https://docs.fystash.ai/guides/capacity-and-trajectories).

Unix sockets default to **daemon** registration mode (no `Register` frame; identity owned by the guest daemon):

```ts
const client = FystashClient.unix("/run/fystash/daemon.sock", {
  roomId: "room-1",
  agentId: "worker-a",
});
```

## Develop (this repo)

```bash
cd sdk/typescript
npm install
npm test
npm run build
```

Regenerate protobuf stubs (optional; committed under `src/_generated/`):

```bash
npm run generate
```

## Tests & smoke

```bash
# Local FakeFabric (primary green bar)
cd sdk/typescript && npm test

# Nested L1 Node smoke (product_gate: fabric-wire-ts)
bash deploy/gcp/run-fabric-wire-ts-smoke.sh
```
