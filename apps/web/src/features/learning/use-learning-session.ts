import { useEffect, useMemo, useState } from "react";
import { useAppServices } from "../../app/use-app-services";
import type { Word } from "../../shared/api/word-schema";
import {
  createSpellingCells,
  isSpellingComplete,
  updateSpellingCell,
} from "./spelling-state";

export function useLearningSession(courseId: string) {
  const { api, session } = useAppServices();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWordHidden, setIsWordHidden] = useState(true);
  const [words, setWords] = useState<readonly Word[]>([]);
  const currentWord = words[currentIndex];
  const [cells, setCells] = useState(createSpellingCells(""));
  const isComplete = useMemo(() => isSpellingComplete(cells), [cells]);

  const loadWords = () => {
    setIsLoading(true);
    setError(null);
    void api.learn
      .getWordList(courseId)
      .then((nextWords) => {
        setWords(nextWords);
        setCurrentIndex(0);
      })
      .catch(() => setError("Unable to load learning words."))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadWords, [api.learn, courseId]);

  useEffect(() => {
    setIsWordHidden(true);
    setCells(createSpellingCells(currentWord?.word ?? ""));
  }, [currentWord]);

  const saveMasteredWords = async () => {
    const result = await api.learn.saveWordMaster(words.map((word) => word.id));
    const user = session.getState().user;
    if (user) session.setUser({ ...user, wordNumber: result.wordNumber });
    loadWords();
  };

  return {
    cells,
    currentIndex,
    currentWord,
    error,
    isComplete,
    isLoading,
    isWordHidden,
    next: () => {
      if (isComplete) setCurrentIndex((index) => index + 1);
    },
    previous: () => setCurrentIndex((index) => Math.max(0, index - 1)),
    saveMasteredWords,
    setIsWordHidden,
    updateCell: (index: number, input: string) => {
      setCells((current) => updateSpellingCell(current, index, input));
    },
    words,
  };
}
