import { describe, expect, test } from "vitest";
import { buildLearningWordWhere } from "./word-selection.js";

describe("learning word selection", () => {
  test("builds a safe course-specific word filter", () => {
    expect(buildLearningWordWhere("cet4", "user-1")).toEqual({
      cet4: true,
      wordBookRecords: {
        none: {
          userId: "user-1",
        },
      },
    });
  });

  test("rejects unsupported course values", () => {
    expect(buildLearningWordWhere("unexpected", "user-1")).toBeNull();
  });
});
