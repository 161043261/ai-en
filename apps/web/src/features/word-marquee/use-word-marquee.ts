import { useEffect, useState } from "react";
import { useAppServices } from "../../app/use-app-services";
import type { WordMarqueeList } from "../../shared/api/word-marquee-schema";

export const fallbackWords: WordMarqueeList = [
  {
    id: "fallback-fluent",
    level: "core",
    meaning: "able to speak smoothly",
    phonetic: "/flu-ent/",
    word: "fluent",
  },
  {
    id: "fallback-clarity",
    level: "daily",
    meaning: "easy to understand",
    phonetic: "/clar-i-ty/",
    word: "clarity",
  },
  {
    id: "fallback-context",
    level: "advanced",
    meaning: "the situation around a word",
    phonetic: "/con-text/",
    word: "context",
  },
  {
    id: "fallback-recall",
    level: "core",
    meaning: "remember quickly",
    phonetic: "/re-call/",
    word: "recall",
  },
  {
    id: "fallback-dialogue",
    level: "daily",
    meaning: "a guided conversation",
    phonetic: "/di-a-logue/",
    word: "dialogue",
  },
  {
    id: "fallback-nuance",
    level: "advanced",
    meaning: "a small difference in meaning",
    phonetic: "/nu-ance/",
    word: "nuance",
  },
];

export function useWordMarquee() {
  const { api } = useAppServices();
  const [words, setWords] = useState<WordMarqueeList>(fallbackWords);

  useEffect(() => {
    let isActive = true;

    void api.wordMarquee
      .getWords()
      .then((items) => {
        if (isActive && items.length > 0) {
          setWords(items);
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [api.wordMarquee]);

  return words;
}
