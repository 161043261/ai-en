import { describe, expect, test } from "vitest";
import {
  createSpellingCells,
  isSpellingComplete,
  updateSpellingCell,
} from ".";

describe("spelling state", () => {
  test("tracks correct and incorrect letter input", () => {
    const cells = createSpellingCells("ai");
    const withFirstLetter = updateSpellingCell(cells, 0, "a");
    const withSecondLetter = updateSpellingCell(withFirstLetter, 1, "x");

    expect(isSpellingComplete(withSecondLetter)).toBe(false);
    expect(withSecondLetter).toEqual([
      { expected: "a", input: "a", isCorrect: true },
      { expected: "i", input: "x", isCorrect: false },
    ]);
  });
});
