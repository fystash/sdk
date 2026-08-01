/**
 * Shared multi-agent room session for host-ecosystem wrappers
 * (Convex, Vercel AI SDK, …).
 *
 * Flow: create room → spawn N from template → drive write → exec → destroy.
 */

import { RoomClient, type RoomClientOptions } from "./room.js";

export type FystashSessionOptions = RoomClientOptions & {
  /** Default guest CID seed (increments per spawn). Default 9100. */
  guestCidStart?: number;
  /** Default template for spawn. Default "default". */
  templateId?: string;
  /** Default memory MiB for spawn. Default 256. */
  memoryMib?: number;
};

export type SpawnOptions = {
  agentId: string;
  guestCid?: number;
  templateId?: string;
  memoryMib?: number;
  attachFabric?: boolean;
  env?: Record<string, string>;
  egressAllowlist?: string[];
};

export type ExecResult = {
  exit_code?: number;
  stdout?: string;
  stderr?: string;
  [key: string]: unknown;
};

/**
 * High-level room lifecycle used by `@fystash_ai/convex` and `@fystash_ai/ai`.
 */
export class FystashSession {
  readonly client: RoomClient;
  readonly roomId: string;
  private nextCid: number;
  private readonly defaultTemplateId: string;
  private readonly defaultMemoryMib: number;
  private created = false;

  constructor(roomId: string, options: FystashSessionOptions = {}) {
    this.roomId = roomId;
    this.client = new RoomClient(options);
    this.nextCid = options.guestCidStart ?? 9100;
    this.defaultTemplateId = options.templateId ?? "default";
    this.defaultMemoryMib = options.memoryMib ?? 256;
  }

  static fromEnv(
    roomId: string,
    env: Record<string, string | undefined> = process.env,
  ): FystashSession {
    return new FystashSession(roomId, {
      baseUrl: env.FYSTASH_API ?? "https://api.fystash.ai",
      apiKey: env.FYSTASH_API_KEY ?? "",
    });
  }

  async create(): Promise<Record<string, unknown>> {
    const result = await this.client.createRoom(this.roomId);
    this.created = true;
    return result;
  }

  async ensureCreated(): Promise<void> {
    if (this.created) return;
    try {
      await this.client.getRoom(this.roomId);
      this.created = true;
    } catch {
      await this.create();
    }
  }

  async spawn(opts: SpawnOptions): Promise<Record<string, unknown>> {
    await this.ensureCreated();
    const guestCid = opts.guestCid ?? this.nextCid++;
    if (opts.guestCid == null) {
      // keep nextCid ahead of explicit assignments when mixed
      this.nextCid = Math.max(this.nextCid, guestCid + 1);
    }
    return this.client.createFromTemplate(this.roomId, opts.agentId, {
      guestCid,
      templateId: opts.templateId ?? this.defaultTemplateId,
      memoryMib: opts.memoryMib ?? this.defaultMemoryMib,
      attachFabric: opts.attachFabric ?? true,
      env: opts.env,
      egressAllowlist: opts.egressAllowlist,
    });
  }

  async spawnMany(
    agentIds: string[],
    opts: Omit<SpawnOptions, "agentId"> = {},
  ): Promise<Record<string, unknown>[]> {
    const out: Record<string, unknown>[] = [];
    for (const agentId of agentIds) {
      out.push(await this.spawn({ ...opts, agentId }));
    }
    return out;
  }

  async driveWrite(
    path: string,
    content: string | Uint8Array,
  ): Promise<Record<string, unknown>> {
    await this.ensureCreated();
    return this.client.driveWrite(this.roomId, path, content);
  }

  async driveRead(path: string): Promise<Record<string, unknown>> {
    return this.client.driveRead(this.roomId, path);
  }

  async driveList(): Promise<Record<string, unknown>> {
    return this.client.driveList(this.roomId);
  }

  async exec(
    agentId: string,
    argv: string[],
    opts: { cwd?: string | null; timeoutMs?: number; stdin?: string | null } = {},
  ): Promise<ExecResult> {
    return (await this.client.exec(this.roomId, agentId, argv, opts)) as ExecResult;
  }

  async standby(agentId: string): Promise<Record<string, unknown>> {
    return this.client.standby(this.roomId, agentId);
  }

  async resume(agentId: string): Promise<Record<string, unknown>> {
    return this.client.resume(this.roomId, agentId);
  }

  async destroy(): Promise<Record<string, unknown>> {
    const result = await this.client.destroy(this.roomId);
    this.created = false;
    return result;
  }
}
