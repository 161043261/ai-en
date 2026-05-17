import { describe, expect, test } from "vitest";
import { getAvatarFileError } from "./avatar-file";

describe("avatar file validation", () => {
  test("accepts supported image files", () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    expect(getAvatarFileError(file)).toBeNull();
  });

  test("rejects unsupported image formats", () => {
    const file = new File(["avatar"], "avatar.gif", { type: "image/gif" });

    expect(getAvatarFileError(file)).toBe(
      "Avatar must be a png, jpg, or webp image.",
    );
  });
});
