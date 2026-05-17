import { describe, expect, test } from "vitest";
import { renderSafeMarkdown } from ".";

describe("renderSafeMarkdown", () => {
  test("removes unsafe markup from markdown output", () => {
    const html = renderSafeMarkdown("Hello <img src=x onerror=alert(1)> **AI**");

    expect(html).toContain("<strong>AI</strong>");
    expect(html).not.toContain("onerror");
  });
});
