export type SpellingCell = {
  readonly expected: string;
  readonly input: string;
  readonly isCorrect: boolean | undefined;
};

export function createSpellingCells(word: string): readonly SpellingCell[] {
  return Array.from(word).map((letter) => ({
    expected: letter,
    input: "",
    isCorrect: undefined,
  }));
}

export function updateSpellingCell(
  cells: readonly SpellingCell[],
  index: number,
  input: string,
): readonly SpellingCell[] {
  const letter = input.slice(-1);
  return cells.map((cell, cellIndex) =>
    cellIndex === index
      ? { ...cell, input: letter, isCorrect: cell.expected === letter }
      : cell,
  );
}

export function isSpellingComplete(cells: readonly SpellingCell[]): boolean {
  return cells.length > 0 && cells.every((cell) => cell.isCorrect);
}
