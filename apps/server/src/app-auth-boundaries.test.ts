import { describe, expect, test } from "vitest";
import { createApp } from "./app.js";
import { generateToken } from "./shared/utils/auth.js";

describe("app auth boundaries", () => {
  test("rejects access tokens on the refresh-token endpoint", async () => {
    const app = createApp();
    const token = await generateToken({
      userId: "user-1",
      name: "Test User",
      email: null,
    });

    const response = await app.request("/api/v1/user/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token.accessToken }),
      headers: { "Content-Type": "application/json" },
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({
      code: 401,
      message: "token expired or invalid",
      ok: false,
    });
  });

  test("requires authentication for avatar uploads", async () => {
    const app = createApp();

    const response = await app.request("/api/v1/user/upload-avatar", {
      method: "POST",
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({
      code: 401,
      message: "token not found",
      ok: false,
    });
  });
});
