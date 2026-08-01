/** Connection endpoint parsing (Unix or TCP). */

import { ConfigurationError } from "./errors.js";

export type Endpoint =
  | { kind: "unix"; path: string }
  | { kind: "tcp"; host: string; port: number };

export function endpointUnix(path: string): Endpoint {
  if (!path) {
    throw new ConfigurationError("Unix socket path must not be empty");
  }
  return { kind: "unix", path };
}

export function endpointTcp(host: string, port: number): Endpoint {
  if (!host) {
    throw new ConfigurationError("TCP endpoint requires host");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError("TCP port must be between 1 and 65535");
  }
  return { kind: "tcp", host, port };
}

export function parseEndpoint(value: string | Endpoint): Endpoint {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.includes("://")) {
    return endpointUnix(value);
  }
  const url = new URL(value);
  if (url.protocol === "unix:") {
    // unix:///tmp/x.sock → pathname /tmp/x.sock
    let path = decodeURIComponent(url.pathname);
    if (url.host) {
      path = `/${url.host}${path}`;
    }
    return endpointUnix(path);
  }
  if (url.protocol === "tcp:" || url.protocol === "fystash:") {
    const port = Number(url.port);
    if (!url.hostname || !port) {
      throw new ConfigurationError(`TCP endpoint must include host and port: ${value}`);
    }
    return endpointTcp(url.hostname, port);
  }
  throw new ConfigurationError(`unsupported endpoint scheme: ${url.protocol}`);
}

export function endpointDisplayName(endpoint: Endpoint): string {
  if (endpoint.kind === "unix") {
    return `unix://${endpoint.path}`;
  }
  return `tcp://${endpoint.host}:${endpoint.port}`;
}
