import type { Word } from "../../shared/api/word-schema";
import { wordFilterOptions } from "./word-filter";

export type WordBadgesProps = {
  readonly word: Word;
};

export function WordBadges({ word }: WordBadgesProps) {
  const labels = wordFilterOptions.filter((option) => word[option.key]);

  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((option) => (
        <span className="badge badge-primary badge-soft" key={option.key}>
          {option.label}
        </span>
      ))}
    </div>
  );
}
