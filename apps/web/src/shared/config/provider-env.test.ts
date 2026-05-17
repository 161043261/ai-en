import { describe, expect, test } from "vitest";
import { parseProviderEnv } from "./provider-env";

describe("parseProviderEnv", () => {
  test("uses documented defaults when provider values are missing", () => {
    expect(parseProviderEnv({})).toEqual({
      aiApiBaseUrl: "/ai/v1",
      dataProvider: "swr",
      requestTimeoutMs: 50_000,
      routerProvider: "react-router",
      serverApiBaseUrl: "/api/v1",
      socketBaseUrl: "http://localhost:3000",
      storeProvider: "zustand",
    });
  });

  test("accepts every supported provider branch", () => {
    expect(
      parseProviderEnv({
        AI_API_BASE_URL: "/custom-ai",
        REQUEST_TIMEOUT_MS: "1000",
        ROUTER_PROVIDER: "tanstack",
        SERVER_API_BASE_URL: "/custom-server",
        SOCKET_BASE_URL: "http://socket.example",
        STORE_PROVIDER: "jotai",
        SWR_PROVIDER: "tanstack",
      }),
    ).toEqual({
      aiApiBaseUrl: "/custom-ai",
      dataProvider: "tanstack",
      requestTimeoutMs: 1000,
      routerProvider: "tanstack",
      serverApiBaseUrl: "/custom-server",
      socketBaseUrl: "http://socket.example",
      storeProvider: "jotai",
    });
  });

  test("fails fast for invalid provider values", () => {
    expect(() =>
      parseProviderEnv({
        ROUTER_PROVIDER: "legacy-router",
        STORE_PROVIDER: "legacy-store",
        SWR_PROVIDER: "legacy-query",
      }),
    ).toThrow();
  });
});
