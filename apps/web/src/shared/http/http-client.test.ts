import { describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { createApiClient } from "./http-client";
import { HttpRequestError, NetworkRequestError } from "./http-error";

const ResponseSchema = z.object({
  value: z.string(),
});

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
    ...init,
  });
}

describe("createApiClient", () => {
  test("parses successful responses before returning data", async () => {
    const client = createApiClient({
      baseUrl: "/api",
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse({ value: "ok" })),
      timeoutMs: 1000,
    });

    await expect(client.get("/health", ResponseSchema)).resolves.toEqual({
      value: "ok",
    });
  });

  test("wraps network failures", async () => {
    const client = createApiClient({
      baseUrl: "/api",
      fetchImpl: vi.fn().mockRejectedValue(new Error("offline")),
      timeoutMs: 1000,
    });

    await expect(client.get("/health", ResponseSchema)).rejects.toBeInstanceOf(
      NetworkRequestError,
    );
  });

  test("throws non-auth HTTP failures without refresh", async () => {
    const client = createApiClient({
      baseUrl: "/api",
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse({}, { status: 500 })),
      refreshAccessToken: vi.fn(),
      timeoutMs: 1000,
    });

    await expect(client.get("/health", ResponseSchema)).rejects.toBeInstanceOf(
      HttpRequestError,
    );
  });

  test("refreshes access tokens and retries one auth failure", async () => {
    const requests: RequestInit[] = [];
    let requestCount = 0;
    const fetchImpl: typeof fetch = async (_input, init) => {
      requests.push(init ?? {});
      requestCount += 1;

      return requestCount === 1
        ? jsonResponse({}, { status: 401 })
        : jsonResponse({ value: "retried" });
    };
    const client = createApiClient({
      baseUrl: "/api",
      fetchImpl,
      getAccessToken: () => "old-token",
      refreshAccessToken: vi.fn().mockResolvedValue("new-token"),
      timeoutMs: 1000,
    });

    await expect(client.get("/profile", ResponseSchema)).resolves.toEqual({
      value: "retried",
    });

    expect(requests[1]?.headers).toEqual(
      new Headers({ Authorization: "Bearer new-token" }),
    );
  });

  test("expires auth when refresh fails", async () => {
    const onAuthExpired = vi.fn();
    const client = createApiClient({
      baseUrl: "/api",
      fetchImpl: vi.fn().mockResolvedValue(jsonResponse({}, { status: 401 })),
      onAuthExpired,
      refreshAccessToken: vi.fn().mockRejectedValue(new Error("expired")),
      timeoutMs: 1000,
    });

    await expect(client.get("/profile", ResponseSchema)).rejects.toBeInstanceOf(
      NetworkRequestError,
    );
    expect(onAuthExpired).toHaveBeenCalledOnce();
  });
});
