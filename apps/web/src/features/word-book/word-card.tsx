import { Volume2 } from "lucide-react";
import type { Word } from "../../shared/api/word-schema";
import { speakText } from "../../shared/browser";
import { MarkdownMessage } from "../chat/markdown-message";
import { WordBadges } from "./word-badges";

export type WordCardProps = {
  readonly word: Word;
};

export function WordCard({ word }: WordCardProps) {
  return (
    <article className="card bg-base-100 h-full shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="card-body gap-4">
        <div>
          <h2 className="card-title text-primary">{word.word}</h2>
          <button
            className="btn btn-ghost btn-xs mt-1"
            onClick={() => speakText(word.word)}
            type="button"
          >
            <Volume2 aria-hidden="true" size={14} />
            {word.phonetic ?? "Play pronunciation"}
          </button>
        </div>
        <p className="text-base-content/70 line-clamp-3 text-sm">
          {word.definition ?? "No definition available."}
        </p>
        <div className="text-base-content/70 line-clamp-3 text-sm">
          <MarkdownMessage content={word.translation ?? ""} />
        </div>
        <WordBadges word={word} />
      </div>
    </article>
  );
}
