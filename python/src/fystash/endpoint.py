"""Connection endpoint parsing."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from urllib.parse import unquote, urlparse

from .errors import ConfigurationError


@dataclass(frozen=True, slots=True)
class Endpoint:
    """A Unix-domain socket or TCP fabric endpoint."""

    unix_path: str | None = None
    host: str | None = None
    port: int | None = None

    def __post_init__(self) -> None:
        has_unix = self.unix_path is not None
        has_tcp = self.host is not None or self.port is not None
        if has_unix == has_tcp:
            raise ConfigurationError("endpoint must select exactly one of Unix or TCP")
        if has_tcp and (not self.host or self.port is None):
            raise ConfigurationError("TCP endpoint requires both host and port")
        if self.port is not None and not 1 <= self.port <= 65535:
            raise ConfigurationError("TCP port must be between 1 and 65535")
        if self.unix_path is not None and not self.unix_path:
            raise ConfigurationError("Unix socket path must not be empty")

    @classmethod
    def unix(cls, path: str | Path) -> Endpoint:
        """Create a Unix-domain endpoint."""

        return cls(unix_path=str(path))

    @classmethod
    def tcp(cls, host: str, port: int) -> Endpoint:
        """Create a TCP endpoint."""

        return cls(host=host, port=port)

    @classmethod
    def parse(cls, value: str | Path | Endpoint) -> Endpoint:
        """Parse ``unix:///path``, ``tcp://host:port``, or a bare Unix path."""

        if isinstance(value, Endpoint):
            return value
        raw = str(value)
        if "://" not in raw:
            return cls.unix(raw)

        parsed = urlparse(raw)
        if parsed.scheme == "unix":
            path = unquote(parsed.path)
            if parsed.netloc:
                path = f"/{parsed.netloc}{path}"
            return cls.unix(path)
        if parsed.scheme in {"tcp", "fystash"}:
            try:
                port = parsed.port
            except ValueError as exc:
                raise ConfigurationError(f"invalid TCP endpoint: {raw}") from exc
            if parsed.hostname is None or port is None:
                raise ConfigurationError(f"TCP endpoint must include host and port: {raw}")
            return cls.tcp(parsed.hostname, port)
        raise ConfigurationError(f"unsupported endpoint scheme: {parsed.scheme}")

    @property
    def display_name(self) -> str:
        """Return a token-free endpoint description."""

        if self.unix_path is not None:
            return f"unix://{self.unix_path}"
        return f"tcp://{self.host}:{self.port}"
