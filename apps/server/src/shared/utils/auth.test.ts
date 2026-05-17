import { describe, expect, test } from "vitest";
import {
  generateToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./auth.js";

describe("auth tokens", () => {
  test("separates access and refresh token usage", async () => {
    const token = await generateToken({
      userId: "user-1",
      name: "Test User",
      email: null,
    });

    await expect(verifyAccessToken(token.accessToken)).resolves.toMatchObject({
      userId: "user-1",
      tokenType: "access",
    });
    await expect(verifyRefreshToken(token.refreshToken)).resolves.toMatchObject({
      userId: "user-1",
      tokenType: "refresh",
    });
    await expect(verifyRefreshToken(token.accessToken)).rejects.toThrow(
      "Expected refresh token",
    );
  });
});
