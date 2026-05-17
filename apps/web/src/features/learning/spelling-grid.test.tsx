import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SpellingGrid } from "./spelling-grid";
import {
  createSpellingCells,
  updateSpellingCell,
  type SpellingCell,
} from "./spelling-state";

function SpellingGridHarness() {
  const [cells, setCells] = useState<readonly SpellingCell[]>(
    createSpellingCells("ai"),
  );

  return (
    <SpellingGrid
      cells={cells}
      updateCell={(index, value) => {
        setCells((current) => updateSpellingCell(current, index, value));
      }}
    />
  );
}

describe("SpellingGrid", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test("focuses the next cell after a character input", () => {
    render(<SpellingGridHarness />);

    const firstLetter = screen.getByLabelText("Letter 1");
    const secondLetter = screen.getByLabelText("Letter 2");
    fireEvent.change(firstLetter, { target: { value: "a" } });

    expect(firstLetter).toHaveClass("input-success");
    expect(secondLetter).toHaveFocus();
  });

  test("clears the current cell and focuses the previous cell on Backspace", () => {
    render(<SpellingGridHarness />);

    const firstLetter = screen.getByLabelText("Letter 1");
    const secondLetter = screen.getByLabelText("Letter 2");
    fireEvent.change(firstLetter, { target: { value: "a" } });
    fireEvent.change(secondLetter, { target: { value: "i" } });

    fireEvent.keyDown(secondLetter, { key: "Backspace" });

    expect(secondLetter).toHaveValue("");
    expect(firstLetter).toHaveFocus();
  });
});
