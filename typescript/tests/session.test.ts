import { describe, expect, it, vi } from "vitest";
import { FystashSession } from "../src/session.js";
import { RoomClient } from "../src/room.js";

describe("FystashSession", () => {
  it("create → spawn → driveWrite → exec → destroy", async () => {
    const createRoom = vi.fn().mockResolvedValue({ room_id: "r1" });
    const createFromTemplate = vi.fn().mockResolvedValue({ agent_id: "a1" });
    const driveWrite = vi.fn().mockResolvedValue({ ok: true });
    const exec = vi.fn().mockResolvedValue({ exit_code: 0, stdout: "hi" });
    const destroy = vi.fn().mockResolvedValue({ ok: true });

    const session = new FystashSession("r1", {
      baseUrl: "https://api.fystash.ai",
      apiKey: "key-test",
    });
    session.client.createRoom = createRoom;
    session.client.createFromTemplate = createFromTemplate;
    session.client.driveWrite = driveWrite;
    session.client.exec = exec;
    session.client.destroy = destroy;

    await session.create();
    await session.spawn({ agentId: "a1" });
    await session.driveWrite("hello.txt", "hi");
    const result = await session.exec("a1", ["cat", "hello.txt"]);
    await session.destroy();

    expect(createRoom).toHaveBeenCalledWith("r1");
    expect(createFromTemplate).toHaveBeenCalledWith(
      "r1",
      "a1",
      expect.objectContaining({ guestCid: 9100, templateId: "default" }),
    );
    expect(driveWrite).toHaveBeenCalledWith("r1", "hello.txt", "hi");
    expect(exec).toHaveBeenCalledWith("r1", "a1", ["cat", "hello.txt"], {});
    expect(result.exit_code).toBe(0);
    expect(destroy).toHaveBeenCalledWith("r1");
  });

  it("spawnMany increments guest CIDs", async () => {
    const session = new FystashSession("r2");
    const createFromTemplate = vi.fn().mockResolvedValue({});
    session.client.getRoom = vi.fn().mockResolvedValue({ room_id: "r2" });
    session.client.createFromTemplate = createFromTemplate;

    await session.spawnMany(["a", "b"]);
    expect(createFromTemplate.mock.calls[0][2].guestCid).toBe(9100);
    expect(createFromTemplate.mock.calls[1][2].guestCid).toBe(9101);
  });

  it("fromEnv reads FYSTASH_API and FYSTASH_API_KEY", () => {
    const session = FystashSession.fromEnv("r3", {
      FYSTASH_API: "https://example.test",
      FYSTASH_API_KEY: "key-x",
    });
    expect(session.client).toBeInstanceOf(RoomClient);
    expect(session.client.baseUrl).toBe("https://example.test");
    expect(session.client.apiKey).toBe("key-x");
  });
});
