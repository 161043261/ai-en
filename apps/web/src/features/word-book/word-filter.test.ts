import { describe, expect, test } from "vitest";
import { createWordQuery, toggleWordFilter, type WordFilterKey } from ".";

describe("word book filters", () => {
  test("only sends selected filters to the server", () => {
    const selected = new Set<WordFilterKey>(["gre"]);

    expect(createWordQuery({ selected, word: " ai " }, 2, 12)).toEqual({
      cet4: undefined,
      cet6: undefined,
      gk: undefined,
      gre: true,
      ielts: undefined,
      ky: undefined,
      page: 2,
      pageSize: 12,
      toefl: undefined,
      word: "ai",
      zk: undefined,
    });
  });

  test("toggles selected filters immutably", () => {
    const selected = new Set<WordFilterKey>(["gre"]);
    const next = toggleWordFilter(selected, "gre");

    expect(selected.has("gre")).toBe(true);
    expect(next.has("gre")).toBe(false);
  });
});
