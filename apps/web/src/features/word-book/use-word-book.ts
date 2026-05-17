import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppServices } from "../../app/use-app-services";
import type { WordList } from "../../shared/api/word-schema";
import {
  createWordQuery,
  toggleWordFilter,
  type WordBookFilters,
  type WordFilterKey,
} from "./word-filter";

const pageSize = 12;

export function useWordBook() {
  const { api } = useAppServices();
  const [filters, setFilters] = useState<WordBookFilters>({
    selected: new Set(),
    word: "",
  });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<WordList>({ list: [], total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));
  const query = useMemo(
    () => createWordQuery(filters, page, pageSize),
    [filters, page],
  );

  const loadWords = useCallback(() => {
    setIsLoading(true);
    setError(null);
    void api.wordBook
      .getWordBookList(query)
      .then(setResult)
      .catch(() => setError("Unable to load word book."))
      .finally(() => setIsLoading(false));
  }, [api.wordBook, query]);

  useEffect(loadWords, [loadWords]);

  return {
    error,
    filters,
    isLoading,
    page,
    pageSize,
    search: () => setPage(1),
    setPage,
    setWord: (word: string) => {
      setFilters((current) => ({ ...current, word }));
    },
    toggleFilter: (key: WordFilterKey) => {
      setPage(1);
      setFilters((current) => ({
        ...current,
        selected: toggleWordFilter(current.selected, key),
      }));
    },
    total: result.total,
    totalPages,
    words: result.list,
  };
}
