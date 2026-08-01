/**
 * HTTP room lifecycle SDK for the Fystash control plane.
 *
 * Product surface: Org → Room → Sandboxes + Fabric + Drive.
 * Talks only to the control API (never shells into vm-controller).
 */

export class RoomApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(`HTTP ${status}: ${detail}`);
    this.name = "RoomApiError";
    this.status = status;
    this.detail = detail;
  }
}

export type JsonObject = Record<string, unknown>;

export type RoomClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  /** Request timeout in milliseconds (default 180_000). */
  timeoutMs?: number;
};

function bytesToBase64(data: Uint8Array): string {
  // Avoid Node Buffer so this module can run in Convex's default runtime.
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]!);
  }
  return btoa(binary);
}

function toUint8Array(data: Uint8Array | string): Uint8Array {
  if (typeof data === "string") {
    return new TextEncoder().encode(data);
  }
  return data;
}

export class RoomClient {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly timeoutMs: number;

  constructor(options: RoomClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://127.0.0.1:8080").replace(/\/$/, "");
    this.apiKey = options.apiKey ?? "dev-key";
    this.timeoutMs = options.timeoutMs ?? 180_000;
  }

  private async request(
    method: string,
    path: string,
    body?: JsonObject | null,
    query?: Record<string, string>,
  ): Promise<JsonObject> {
    let url = `${this.baseUrl}${path}`;
    if (query && Object.keys(query).length > 0) {
      url = `${url}?${new URLSearchParams(query).toString()}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          // Loop 66: prefer keep-alive on multi-exec (parity with Python SDK).
          Connection: "keep-alive",
        },
        body: body == null ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      const raw = await res.text();
      if (!res.ok) {
        let detail = raw || res.statusText;
        try {
          const parsed = JSON.parse(raw) as { detail?: unknown };
          if (parsed.detail != null) {
            detail = String(parsed.detail);
          }
        } catch {
          // keep raw detail
        }
        throw new RoomApiError(res.status, detail);
      }
      if (!raw) {
        return {};
      }
      return JSON.parse(raw) as JsonObject;
    } finally {
      clearTimeout(timer);
    }
  }

  health(): Promise<JsonObject> {
    return this.request("GET", "/health");
  }

  createRoom(roomId: string): Promise<JsonObject> {
    return this.request("POST", "/v1/rooms", { room_id: roomId });
  }

  listRooms(): Promise<JsonObject> {
    return this.request("GET", "/v1/rooms");
  }

  createOrg(
    name: string,
    opts: { orgId?: string; apiKey?: string } = {},
  ): Promise<JsonObject> {
    const body: JsonObject = { name };
    if (opts.orgId != null) body.org_id = opts.orgId;
    if (opts.apiKey != null) body.api_key = opts.apiKey;
    return this.request("POST", "/v1/orgs", body);
  }

  orgUsage(orgId: string): Promise<JsonObject> {
    return this.request("GET", `/v1/orgs/${orgId}/usage`);
  }

  getRoom(roomId: string): Promise<JsonObject> {
    return this.request("GET", `/v1/rooms/${roomId}`);
  }

  prepare(
    roomId: string,
    agentId: string,
    opts: {
      guestCid: number;
      vcpuCount?: number;
      memoryMib?: number;
      enableGuestNet?: boolean;
    },
  ): Promise<JsonObject> {
    return this.request("POST", `/v1/rooms/${roomId}/sandboxes/prepare`, {
      agent_id: agentId,
      guest_cid: opts.guestCid,
      vcpu_count: opts.vcpuCount ?? 1,
      memory_mib: opts.memoryMib ?? 256,
      enable_guest_net: opts.enableGuestNet ?? true,
    });
  }

  start(roomId: string, opts: { attachFabric?: boolean } = {}): Promise<JsonObject> {
    return this.request("POST", `/v1/rooms/${roomId}/start`, {
      attach_fabric: opts.attachFabric ?? true,
    });
  }

  createFromTemplate(
    roomId: string,
    agentId: string,
    opts: {
      guestCid: number;
      templateId?: string;
      vcpuCount?: number;
      memoryMib?: number;
      enableGuestNet?: boolean;
      attachFabric?: boolean;
      env?: Record<string, string>;
      egressAllowlist?: string[];
    },
  ): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      agent_id: agentId,
      guest_cid: opts.guestCid,
      template_id: opts.templateId ?? "default",
      vcpu_count: opts.vcpuCount ?? 1,
      memory_mib: opts.memoryMib ?? 256,
      enable_guest_net: opts.enableGuestNet ?? true,
      attach_fabric: opts.attachFabric ?? true,
    };
    if (opts.env) body.env = opts.env;
    if (opts.egressAllowlist !== undefined) {
      body.egress_allowlist = opts.egressAllowlist;
    }
    return this.request("POST", `/v1/rooms/${roomId}/sandboxes/from-template`, body);
  }

  createEpisodeBatch(opts: {
    count: number;
    templateId?: string;
    labels?: Record<string, string>;
    seed?: number;
    roomIdPrefix?: string;
    agentId?: string;
    guestCidBase?: number;
    env?: Record<string, string>;
    egressAllowlist?: string[];
    attachFabric?: boolean;
    memoryMib?: number;
    strategy?: "auto" | "wave" | "single";
    curriculumLabels?: Record<string, string>;
    schedule?: string;
  }): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      count: opts.count,
      template_id: opts.templateId ?? "default",
      room_id_prefix: opts.roomIdPrefix ?? "ep",
      agent_id: opts.agentId ?? "agent",
      attach_fabric: opts.attachFabric ?? true,
      memory_mib: opts.memoryMib ?? 256,
    };
    if (opts.strategy != null) body.strategy = opts.strategy;
    else if (opts.schedule == null) body.strategy = "auto";
    if (opts.labels) body.labels = opts.labels;
    if (opts.curriculumLabels) body.curriculum_labels = opts.curriculumLabels;
    if (opts.schedule != null) body.schedule = opts.schedule;
    if (opts.seed != null) body.seed = opts.seed;
    if (opts.guestCidBase != null) body.guest_cid_base = opts.guestCidBase;
    if (opts.env) body.env = opts.env;
    if (opts.egressAllowlist !== undefined) {
      body.egress_allowlist = opts.egressAllowlist;
    }
    return this.request("POST", "/v1/episodes/batch", body);
  }

  listCurriculumSchedules(): Promise<JsonObject> {
    return this.request("GET", "/v1/curriculum/schedules");
  }

  listRoomTopologies(): Promise<JsonObject> {
    return this.request("GET", "/v1/rooms/topologies");
  }

  createTrainingRoom(opts: {
    topology?: string;
    roles?: string[];
    roomId?: string;
    templateId?: string;
    memoryMib?: number;
    guestCidBase?: number;
    env?: Record<string, string>;
    egressAllowlist?: string[];
    attachFabric?: boolean;
  } = {}): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      template_id: opts.templateId ?? "default",
      memory_mib: opts.memoryMib ?? 256,
      guest_cid_base: opts.guestCidBase ?? 9200,
      attach_fabric: opts.attachFabric ?? true,
    };
    if (opts.topology != null) body.topology = opts.topology;
    if (opts.roles != null) body.roles = opts.roles;
    if (opts.roomId != null) body.room_id = opts.roomId;
    if (opts.env) body.env = opts.env;
    if (opts.egressAllowlist !== undefined) {
      body.egress_allowlist = opts.egressAllowlist;
    }
    return this.request("POST", "/v1/rooms/training", body);
  }

  listFleetPresets(): Promise<JsonObject> {
    return this.request("GET", "/v1/episodes/fleet-presets");
  }

  createEpisodeFleet(
    episodeId: string,
    opts: {
      count: number;
      labels?: Record<string, string>;
      copyPaths?: string[];
      preset?: string;
    },
  ): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      count: opts.count,
      preset: opts.preset ?? "browser_snap",
    };
    if (opts.labels) body.labels = opts.labels;
    if (opts.copyPaths) body.copy_paths = opts.copyPaths;
    return this.request("POST", `/v1/episodes/${episodeId}/fleet`, body);
  }

  /**
   * Measure a running app's behaviour from inside a room.
   *
   * Returns the facts a grader is written from, alongside the coverage they
   * were measured over. Pass `scope` path prefixes to bound the crawl;
   * without one, coverage is measured against the whole app.
   */
  replicate(
    roomId: string,
    target: string,
    opts: {
      agentId?: string;
      scope?: string[];
      timeoutMs?: number;
      includeReport?: boolean;
      maxWorkers?: number;
      maxShapes?: number;
      maxPages?: number;
      crawlDepth?: number;
      maxForms?: number;
    } = {},
  ): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      room_id: roomId,
      target,
      agent_id: opts.agentId ?? "agent",
      timeout_ms: opts.timeoutMs ?? 900_000,
      include_report: opts.includeReport ?? true,
    };
    if (opts.scope?.length) body.scope = opts.scope;
    if (opts.maxWorkers != null) body.max_workers = opts.maxWorkers;
    if (opts.maxShapes != null) body.max_shapes = opts.maxShapes;
    if (opts.maxPages != null) body.max_pages = opts.maxPages;
    if (opts.crawlDepth != null) body.crawl_depth = opts.crawlDepth;
    if (opts.maxForms != null) body.max_forms = opts.maxForms;
    return this.request("POST", "/v1/replicate", body);
  }

  replicateEnv(
    roomId: string,
    target: string,
    cloneCode: string,
    opts: {
      agentId?: string;
      scope?: string[];
      timeoutMs?: number;
      appPort?: number;
      includeReport?: boolean;
      exportHarbor?: boolean;
    } = {},
  ): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      room_id: roomId,
      target,
      agent_id: opts.agentId ?? "agent",
      mode: "env",
      clone_code: cloneCode,
      timeout_ms: opts.timeoutMs ?? 900_000,
      app_port: opts.appPort ?? 8088,
      include_report: opts.includeReport ?? false,
      export_harbor: opts.exportHarbor ?? false,
    };
    if (opts.scope?.length) body.scope = opts.scope;
    return this.request("POST", "/v1/replicate", body);
  }

  replicateJobStart(
    roomId: string,
    target: string,
    opts: {
      agentId?: string;
      scope?: string[];
      mode?: "report" | "env";
      cloneCode?: string;
      timeoutMs?: number;
      appPort?: number;
      exportHarbor?: boolean;
      secretsRef?: string;
      credentials?: Record<string, string>;
    } = {},
  ): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      room_id: roomId,
      target,
      agent_id: opts.agentId ?? "agent",
      mode: opts.mode ?? "report",
      timeout_ms: opts.timeoutMs ?? 900_000,
      app_port: opts.appPort ?? 8088,
      export_harbor: opts.exportHarbor ?? false,
    };
    if (opts.scope?.length) body.scope = opts.scope;
    if (opts.cloneCode) body.clone_code = opts.cloneCode;
    if (opts.secretsRef) body.secrets_ref = opts.secretsRef;
    if (opts.credentials) body.credentials = opts.credentials;
    return this.request("POST", "/v1/replicate/jobs", body);
  }

  replicateJobPoll(roomId: string, jobId: string): Promise<JsonObject> {
    return this.request("GET", `/v1/replicate/jobs/${jobId}`, null, {
      room_id: roomId,
    });
  }

  getEpisodeBatch(batchId: string): Promise<JsonObject> {
    return this.request("GET", `/v1/episodes/batch/${batchId}`);
  }

  destroyEpisodeBatch(batchId: string): Promise<JsonObject> {
    return this.request("DELETE", `/v1/episodes/batch/${batchId}`);
  }

  getEpisode(episodeId: string): Promise<JsonObject> {
    return this.request("GET", `/v1/episodes/${episodeId}`);
  }

  getEpisodeTrajectory(
    episodeId: string,
    opts: { limit?: number } = {},
  ): Promise<JsonObject> {
    const query: Record<string, string> = {};
    if (opts.limit != null) query.limit = String(opts.limit);
    return this.request(
      "GET",
      `/v1/episodes/${episodeId}/trajectory`,
      null,
      Object.keys(query).length ? query : undefined,
    );
  }

  setEpisodeReward(
    episodeId: string,
    opts: {
      reward?: number | null;
      broken?: boolean;
      metrics?: Record<string, string | number | boolean>;
      note?: string;
    } = {},
  ): Promise<JsonObject> {
    const body: Record<string, unknown> = {};
    if (opts.reward !== undefined) body.reward = opts.reward;
    if (opts.broken !== undefined) body.broken = opts.broken;
    if (opts.metrics) body.metrics = opts.metrics;
    if (opts.note !== undefined) body.note = opts.note;
    return this.request("POST", `/v1/episodes/${episodeId}/reward`, body);
  }

  resetEpisode(
    episodeId: string,
    opts: { seed?: number; clearDrive?: boolean } = {},
  ): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      clear_drive: opts.clearDrive ?? false,
    };
    if (opts.seed !== undefined) body.seed = opts.seed;
    return this.request("POST", `/v1/episodes/${episodeId}/reset`, body);
  }

  recordEpisodeSteps(
    episodeId: string,
    steps: Array<{
      action: string;
      url?: string;
      selector?: string;
      text?: string;
    }>,
    opts: { execute?: boolean } = {},
  ): Promise<JsonObject> {
    return this.request("POST", `/v1/episodes/${episodeId}/record`, {
      steps,
      execute: opts.execute ?? true,
    });
  }

  seedEpisode(
    episodeId: string,
    opts: { pack: string; clearFirst?: boolean },
  ): Promise<JsonObject> {
    return this.request("POST", `/v1/episodes/${episodeId}/seed`, {
      pack: opts.pack,
      clear_first: opts.clearFirst ?? false,
    });
  }

  exportBatchTrajectories(
    batchId: string,
    opts: {
      format?: "atif" | "fystash";
      callbackUrl?: string;
      limit?: number;
    } = {},
  ): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      format: opts.format ?? "atif",
    };
    if (opts.callbackUrl) body.callback_url = opts.callbackUrl;
    if (opts.limit != null) body.limit = opts.limit;
    return this.request(
      "POST",
      `/v1/episodes/batch/${batchId}/trajectories/export`,
      body,
    );
  }

  async downloadBatchTrajectoryExport(
    batchId: string,
    opts: { metaOnly?: boolean } = {},
  ): Promise<JsonObject | string> {
    if (opts.metaOnly) {
      return this.request(
        "GET",
        `/v1/episodes/batch/${batchId}/trajectories/export`,
        null,
        { meta_only: "true" },
      );
    }
    const url = `${this.baseUrl}/v1/episodes/batch/${batchId}/trajectories/export`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/x-ndjson, text/plain, */*",
        },
        signal: controller.signal,
      });
      const raw = await res.text();
      if (!res.ok) {
        let detail = raw || res.statusText;
        try {
          const parsed = JSON.parse(raw) as { detail?: unknown };
          if (parsed.detail != null) detail = String(parsed.detail);
        } catch {
          /* keep raw */
        }
        throw new Error(`HTTP ${res.status}: ${detail}`);
      }
      return raw;
    } finally {
      clearTimeout(timer);
    }
  }

  reserveCapacity(opts: {
    count: number;
    templateId?: string;
    ttlS?: number;
    labels?: Record<string, string>;
  }): Promise<JsonObject> {
    const body: Record<string, unknown> = {
      count: opts.count,
      template_id: opts.templateId ?? "default",
      ttl_s: opts.ttlS ?? 3600,
    };
    if (opts.labels) body.labels = opts.labels;
    return this.request("POST", "/v1/capacity/reserve", body);
  }

  listCapacityReservations(): Promise<JsonObject> {
    return this.request("GET", "/v1/capacity/reservations");
  }

  releaseCapacity(reservationId: string): Promise<JsonObject> {
    return this.request("DELETE", `/v1/capacity/reservations/${reservationId}`);
  }

  createBrowser(
    roomId: string,
    agentId: string,
    opts: {
      guestCid: number;
      memoryMib?: number;
      attachFabric?: boolean;
      env?: Record<string, string>;
    },
  ): Promise<JsonObject> {
    return this.createFromTemplate(roomId, agentId, {
      guestCid: opts.guestCid,
      templateId: "browser",
      memoryMib: opts.memoryMib ?? 2048,
      attachFabric: opts.attachFabric,
      env: opts.env,
    });
  }

  createDesktop(
    roomId: string,
    agentId: string,
    opts: {
      guestCid: number;
      memoryMib?: number;
      attachFabric?: boolean;
      env?: Record<string, string>;
    },
  ): Promise<JsonObject> {
    return this.createFromTemplate(roomId, agentId, {
      guestCid: opts.guestCid,
      templateId: "desktop",
      memoryMib: opts.memoryMib ?? 1536,
      attachFabric: opts.attachFabric,
      env: opts.env,
    });
  }

  createDocker(
    roomId: string,
    agentId: string,
    opts: {
      guestCid: number;
      memoryMib?: number;
      attachFabric?: boolean;
      env?: Record<string, string>;
    },
  ): Promise<JsonObject> {
    return this.createFromTemplate(roomId, agentId, {
      guestCid: opts.guestCid,
      templateId: "docker",
      memoryMib: opts.memoryMib ?? 2048,
      attachFabric: opts.attachFabric,
      env: opts.env,
    });
  }

  standby(roomId: string, agentId: string): Promise<JsonObject> {
    return this.request("POST", `/v1/rooms/${roomId}/sandboxes/${agentId}/standby`);
  }

  resume(roomId: string, agentId: string): Promise<JsonObject> {
    return this.request("POST", `/v1/rooms/${roomId}/sandboxes/${agentId}/resume`);
  }

  listSandboxes(roomId: string): Promise<JsonObject> {
    return this.request("GET", `/v1/rooms/${roomId}/sandboxes`);
  }

  send(
    roomId: string,
    opts: {
      source: string;
      destination?: string;
      topic?: string | null;
      payload?: Uint8Array | string;
      kind?: string;
      waitReply?: boolean;
      timeoutMs?: number;
    },
  ): Promise<JsonObject> {
    const payload = toUint8Array(opts.payload ?? new Uint8Array());
    return this.request("POST", `/v1/rooms/${roomId}/messages`, {
      source: opts.source,
      destination: opts.destination ?? "",
      topic: opts.topic ?? null,
      payload_b64: bytesToBase64(payload),
      kind: opts.kind ?? "event",
      wait_reply: opts.waitReply ?? false,
      timeout_ms: opts.timeoutMs ?? 5_000,
    });
  }

  waitBarrier(
    roomId: string,
    opts: {
      barrierId: string;
      arrivals: string[];
      parties?: number;
      timeoutMs?: number;
    },
  ): Promise<JsonObject> {
    const arrivals = opts.arrivals;
    return this.request("POST", `/v1/rooms/${roomId}/barriers`, {
      barrier_id: opts.barrierId,
      arrivals,
      parties: opts.parties && opts.parties > 0 ? opts.parties : arrivals.length,
      timeout_ms: opts.timeoutMs ?? 30_000,
    });
  }

  exec(
    roomId: string,
    agentId: string,
    argv: string[],
    opts: {
      cwd?: string | null;
      timeoutMs?: number;
      stdin?: Uint8Array | string | null;
    } = {},
  ): Promise<JsonObject> {
    const body: JsonObject = {
      argv,
      timeout_ms: opts.timeoutMs ?? 30_000,
    };
    if (opts.cwd != null) body.cwd = opts.cwd;
    if (opts.stdin != null) {
      body.stdin_b64 = bytesToBase64(toUint8Array(opts.stdin));
    }
    return this.request("POST", `/v1/rooms/${roomId}/sandboxes/${agentId}/exec`, body);
  }

  driveWrite(roomId: string, path: string, content: Uint8Array | string): Promise<JsonObject> {
    return this.request("POST", `/v1/rooms/${roomId}/drive/write`, {
      path,
      content_b64: bytesToBase64(toUint8Array(content)),
    });
  }

  driveRead(roomId: string, path: string): Promise<JsonObject> {
    return this.request("GET", `/v1/rooms/${roomId}/drive/read`, null, { path });
  }

  driveList(roomId: string): Promise<JsonObject> {
    return this.request("GET", `/v1/rooms/${roomId}/drive/list`);
  }

  destroy(roomId: string): Promise<JsonObject> {
    return this.request("DELETE", `/v1/rooms/${roomId}`);
  }

  destroySandbox(roomId: string, agentId: string): Promise<JsonObject> {
    return this.request("DELETE", `/v1/rooms/${roomId}/sandboxes/${agentId}`);
  }

  audit(roomId: string): Promise<JsonObject> {
    return this.request("GET", `/v1/rooms/${roomId}/audit`);
  }
}
