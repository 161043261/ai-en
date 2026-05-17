import { describe, expect, test } from "vitest";
import { createApp } from "../../app.js";

describe("request id middleware", () => {
  test("generates an x-request-id response header", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/health");

    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  test("preserves a provided x-request-id response header", async () => {
    const app = createApp({ readinessChecks: [] });
    const requestId = "request-123";

    const response = await app.request("/health", {
      headers: { "x-request-id": requestId },
    });

    expect(response.headers.get("x-request-id")).toBe(requestId);
  });
});
