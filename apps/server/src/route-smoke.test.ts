import { describe, expect, test } from "vitest";
import { createApp } from "./app.js";

describe("mounted route groups", () => {
  test("exposes the user route group", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/api/v1/user/login", {
      method: "POST",
      body: JSON.stringify({ phone: "", password: "" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
  });

  test("exposes the public word-book route group", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/api/v1/word-book?pageSize=0");

    expect(response.status).toBe(400);
  });

  test("exposes the course route group", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/api/v1/course/my");

    expect(response.status).toBe(401);
  });

  test("exposes the learn route group", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/api/v1/learn/word/course-1");

    expect(response.status).toBe(401);
  });

  test("exposes the pay route group", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/api/v1/pay/create", {
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  test("exposes the tracker route group", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/api/v1/tracker/uv", {
      method: "POST",
      body: JSON.stringify({ browser: "Chrome" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
  });

  test("exposes the AI route group", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/api/v1/ai/prompt/list");

    expect(response.status).toBe(200);
  });

  test("exposes the legacy AI route group alias", async () => {
    const app = createApp({ readinessChecks: [] });

    const response = await app.request("/ai/v1/prompt/list");

    expect(response.status).toBe(200);
  });
});
