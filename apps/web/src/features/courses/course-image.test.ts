import { describe, expect, test } from "vitest";
import { createCourseImageUrl } from ".";

describe("createCourseImageUrl", () => {
  test("keeps absolute image URLs", () => {
    expect(createCourseImageUrl("/api/v1", "https://cdn.example/a.png")).toBe(
      "https://cdn.example/a.png",
    );
  });

  test("resolves uploaded paths against the server origin", () => {
    expect(
      createCourseImageUrl("https://api.example/api/v1", "/uploads/a.png"),
    ).toBe("https://api.example/uploads/a.png");
  });
});
