import type { WordQuery } from "../../shared/api/word-schema";

export const wordFilterOptions = [
  { key: "gk", label: "Gaokao" },
  { key: "zk", label: "Zhongkao" },
  { key: "gre", label: "GRE" },
  { key: "toefl", label: "TOEFL" },
  { key: "ielts", label: "IELTS" },
  { key: "cet6", label: "CET-6" },
  { key: "cet4", label: "CET-4" },
  { key: "ky", label: "Postgraduate" },
] as const;

export type WordFilterKey = (typeof wordFilterOptions)[number]["key"];

export type WordBookFilters = {
  readonly selected: ReadonlySet<WordFilterKey>;
  readonly word: string;
};

export function createWordQuery(
  filters: WordBookFilters,
  page: number,
  pageSize: number,
): WordQuery {
  return {
    cet4: filters.selected.has("cet4") ? true : undefined,
    cet6: filters.selected.has("cet6") ? true : undefined,
    gk: filters.selected.has("gk") ? true : undefined,
    gre: filters.selected.has("gre") ? true : undefined,
    ielts: filters.selected.has("ielts") ? true : undefined,
    ky: filters.selected.has("ky") ? true : undefined,
    page,
    pageSize,
    toefl: filters.selected.has("toefl") ? true : undefined,
    word: filters.word.trim() || undefined,
    zk: filters.selected.has("zk") ? true : undefined,
  };
}

export function toggleWordFilter(
  selected: ReadonlySet<WordFilterKey>,
  key: WordFilterKey,
): ReadonlySet<WordFilterKey> {
  const next = new Set(selected);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}
