import clsx from "clsx";
import type { KeyboardEvent } from "react";
import { useRef } from "react";
import type { SpellingCell } from "./spelling-state";

export type SpellingGridProps = {
  readonly cells: readonly SpellingCell[];
  readonly updateCell: (index: number, value: string) => void;
};

export function SpellingGrid({ cells, updateCell }: SpellingGridProps) {
  const inputRefs = useRef<readonly (HTMLInputElement | null)[]>([]);

  const focusCell = (index: number) => {
    window.requestAnimationFrame(() => {
      inputRefs.current[index]?.focus();
    });
  };

  const updateInputRef = (index: number, element: HTMLInputElement | null) => {
    inputRefs.current = cells.map((_, cellIndex) =>
      cellIndex === index ? element : (inputRefs.current[cellIndex] ?? null),
    );
  };

  const handleChange = (index: number, value: string) => {
    const nextValue = value.slice(-1);
    updateCell(index, nextValue);
    if (nextValue && index < cells.length - 1) focusCell(index + 1);
  };

  const handleKeyDown = (
    cell: SpellingCell,
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      updateCell(index, "");
      if (index > 0) focusCell(index - 1);
      return;
    }

    if (
      cell.input &&
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      index < cells.length - 1
    ) {
      event.preventDefault();
      updateCell(index + 1, event.key);
      focusCell(index + 1);
    }
  };

  return (
    <section className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Spell the word</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {cells.map((cell, index) => (
            <input
              aria-label={`Letter ${index + 1}`}
              className={clsx(
                "input input-bordered w-12 text-center text-2xl font-black",
                cell.isCorrect === true && "input-success",
                cell.isCorrect === false && "input-error",
              )}
              key={`${cell.expected}-${index}`}
              maxLength={1}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(cell, index, event)}
              ref={(element) => updateInputRef(index, element)}
              value={cell.input}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
