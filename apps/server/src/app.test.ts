import { describe, expect, test } from "vitest";
import { createApp } from "./app.js";

describe("server app", () => {
  test("returns health status", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      code: 200,
      data: { status: "ok" },
      ok: true,
    });
  });

  test("returns not found for unknown routes", async () => {
    const app = createApp();

    const response = await app.request("/missing");
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({
      code: 404,
      message: "not found",
      ok: false,
    });
  });

  test("keeps word-book query routes public", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/word-book?pageSize=0");

    expect(response.status).toBe(400);
  });

  test("rejects invalid login payloads before database access", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/user/login", {
      method: "POST",
      body: JSON.stringify({ phone: "", password: "" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
  });

  test("rejects invalid word-book query contracts", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/word-book?pageSize=0");

    expect(response.status).toBe(400);
  });

  test("rejects invalid tracker payloads before database writes", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/tracker/uv", {
      method: "POST",
      body: JSON.stringify({ browser: "Chrome" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
  });

  test("rejects unknown AI chat roles before model access", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        role: "unknown",
        content: "hello",
        userId: "user-1",
      }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
  });

  test("requires AI chat history query values", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/ai/chat/history");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: 400,
      message: "userId and role are required",
      ok: false,
    });
  });
});
