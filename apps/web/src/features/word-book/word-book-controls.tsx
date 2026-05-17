import clsx from "clsx";
import { Search } from "lucide-react";
import type { FormEvent } from "react";
import {
  wordFilterOptions,
  type WordBookFilters,
  type WordFilterKey,
} from "./word-filter";

export type WordBookControlsProps = {
  readonly filters: WordBookFilters;
  readonly search: () => void;
  readonly setWord: (word: string) => void;
  readonly toggleFilter: (key: WordFilterKey) => void;
};

export function WordBookControls({
  filters,
  search,
  setWord,
  toggleFilter,
}: WordBookControlsProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    search();
  };

  return (
    <form className="card bg-base-100 shadow-xl" onSubmit={submit}>
      <div className="card-body gap-4">
        <label className="input input-bordered flex w-full items-center gap-2">
          <Search aria-hidden="true" size={18} />
          <input
            name="word"
            onChange={(event) => setWord(event.target.value)}
            placeholder="Search a word"
            value={filters.word}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {wordFilterOptions.map((option) => (
            <button
              className={clsx(
                "btn btn-sm rounded-full",
                filters.selected.has(option.key)
                  ? "btn-primary"
                  : "btn-outline",
              )}
              key={option.key}
              onClick={() => toggleFilter(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
