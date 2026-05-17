import clsx from "clsx";
import { Eye, EyeOff, Volume2 } from "lucide-react";
import { speakText } from "../../shared/browser";
import type { Word } from "../../shared/api/word-schema";
import { MarkdownMessage } from "../chat/markdown-message";

export type WordDetailCardProps = {
  readonly isHidden: boolean;
  readonly toggleHidden: () => void;
  readonly word: Word;
};

export function WordDetailCard({
  isHidden,
  toggleHidden,
  word,
}: WordDetailCardProps) {
  return (
    <article className="card bg-base-100 shadow-xl">
      <div className="card-body gap-5">
        <button
          className="btn btn-ghost btn-sm ml-auto"
          onClick={toggleHidden}
          type="button"
        >
          {isHidden ? (
            <Eye aria-hidden="true" size={18} />
          ) : (
            <EyeOff aria-hidden="true" size={18} />
          )}
          {isHidden ? "Show word" : "Hide word"}
        </button>
        <div
          className={clsx(
            "text-center transition",
            isHidden && "blur-md select-none",
          )}
        >
          <h2 className="text-primary text-4xl font-black">{word.word}</h2>
          <button
            className="btn btn-ghost btn-sm mt-2"
            onClick={() => speakText(word.word)}
            type="button"
          >
            <Volume2 aria-hidden="true" size={16} />
            {word.phonetic ?? "Play pronunciation"}
          </button>
        </div>
        <section className="rounded-box bg-base-200 p-4">
          <h3 className="text-base-content/50 mb-2 text-xs font-bold uppercase">
            Definition
          </h3>
          <MarkdownMessage
            content={word.definition ?? "No definition available."}
          />
        </section>
        <section className="rounded-box bg-base-200 p-4">
          <h3 className="text-base-content/50 mb-2 text-xs font-bold uppercase">
            Translation
          </h3>
          <MarkdownMessage
            content={word.translation ?? "No translation available."}
          />
        </section>
      </div>
    </article>
  );
}
