"""Thin OpenEnv-style Env wrapper over Fystash episode APIs (Loop 81)."""

from __future__ import annotations

from typing import Any, Callable


class FystashOpenEnv:
    """Minimal OpenEnv-shaped adapter.

    reset → episode batch count=1 (or POST /v1/episodes/{id}/reset after first)
    step  → sandbox exec
    close → destroy episode batch
    """

    def __init__(
        self,
        client: Any,
        *,
        template_id: str = "default",
        agent_id: str = "agent",
        observation_fn: Callable[[Any, dict[str, Any]], Any] | None = None,
        reward_fn: Callable[[Any, dict[str, Any]], float] | None = None,
    ) -> None:
        self.client = client
        self.template_id = template_id
        self.agent_id = agent_id
        self.observation_fn = observation_fn
        self.reward_fn = reward_fn
        self.batch_id: str | None = None
        self.episode: dict[str, Any] | None = None

    def reset(self, seed: int | None = None) -> Any:
        if self.episode and self.batch_id:
            # Prefer in-place reset API (Loop 79)
            self.client.reset_episode(
                str(self.episode["episode_id"]), seed=seed
            )
        else:
            batch = self.client.create_episode_batch(
                count=1,
                template_id=self.template_id,
                seed=seed,
                agent_id=self.agent_id,
                strategy="single",
            )
            self.batch_id = str(batch["batch_id"])
            self.episode = (batch.get("episodes") or [None])[0]
        if not self.episode:
            raise RuntimeError("episode create failed")
        if self.observation_fn:
            return self.observation_fn(self.client, self.episode)
        return {"episode_id": self.episode["episode_id"], "room_id": self.episode["room_id"]}

    def step(self, action: list[str] | str) -> tuple[Any, float, bool, dict[str, Any]]:
        if not self.episode:
            raise RuntimeError("call reset() first")
        argv = action if isinstance(action, list) else ["/bin/bash", "-lc", str(action)]
        result = self.client.exec(
            str(self.episode["room_id"]),
            str(self.episode["agent_id"]),
            argv,
        )
        reward = 0.0
        if self.reward_fn:
            reward = float(self.reward_fn(self.client, self.episode))
            self.client.set_episode_reward(str(self.episode["episode_id"]), reward=reward)
        obs = (
            self.observation_fn(self.client, self.episode)
            if self.observation_fn
            else {"exec": result}
        )
        done = False
        info = {"exec": result}
        return obs, reward, done, info

    def close(self) -> None:
        if self.batch_id:
            try:
                self.client.destroy_episode_batch(self.batch_id)
            except Exception:  # noqa: BLE001
                pass
        self.batch_id = None
        self.episode = None

    def trajectory(self) -> dict[str, Any]:
        if not self.episode:
            raise RuntimeError("no episode")
        return self.client.get_episode_trajectory(str(self.episode["episode_id"]))
