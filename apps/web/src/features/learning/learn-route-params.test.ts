import { describe, expect, test } from "vitest";
import { parseLearnRouteParams, parseLearnRoutePath } from ".";

describe("parseLearnRoutePath", () => {
  test("parses and decodes the legacy learning route", () => {
    expect(parseLearnRoutePath("/courses/learn/course-1/CET%204")).toEqual({
      courseId: "course-1",
      title: "CET 4",
    });
  });

  test("rejects incomplete learning paths", () => {
    expect(() => parseLearnRoutePath("/courses/learn")).toThrow();
  });

  test("rejects blank provider route params", () => {
    expect(() =>
      parseLearnRouteParams({ courseId: "course-1", title: " " }),
    ).toThrow();
  });
});
