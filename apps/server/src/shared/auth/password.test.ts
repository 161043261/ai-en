import { describe, expect, test } from "vitest";
import { hashPassword, isPasswordHash, verifyPassword } from "./password.js";

describe("password hashing", () => {
  test("hashes and verifies passwords", async () => {
    const hashedPassword = await hashPassword("correct-password");

    expect(isPasswordHash(hashedPassword)).toBe(true);
    await expect(
      verifyPassword("correct-password", hashedPassword),
    ).resolves.toEqual({
      valid: true,
      needsRehash: false,
    });
    await expect(
      verifyPassword("wrong-password", hashedPassword),
    ).resolves.toEqual({
      valid: false,
      needsRehash: false,
    });
  });

  test("accepts legacy plaintext passwords and marks them for rehash", async () => {
    await expect(
      verifyPassword("legacy-password", "legacy-password"),
    ).resolves.toEqual({
      valid: true,
      needsRehash: true,
    });
  });
});
