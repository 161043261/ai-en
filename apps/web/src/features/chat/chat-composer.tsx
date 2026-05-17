import { Brain, Mic, Pause, Search, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useSpeechToText } from "../../shared/browser";

export type ChatComposerPayload = {
  readonly content: string;
  readonly deepThink: boolean;
  readonly webSearch: boolean;
};

export type ChatComposerProps = {
  readonly isDisabled: boolean;
  readonly isStreaming: boolean;
  readonly onSend: (payload: ChatComposerPayload) => void;
};

export function ChatComposer({
  isDisabled,
  isStreaming,
  onSend,
}: ChatComposerProps) {
  const [content, setContent] = useState("");
  const [deepThink, setDeepThink] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const speech = useSpeechToText({ continuous: true, lang: "en-US" });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend({ content: trimmed, deepThink, webSearch });
    setContent("");
  };

  return (
    <form className="card bg-base-100 shadow-xl" onSubmit={submit}>
      <div className="card-body gap-4">
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-sm" onClick={() => setDeepThink((value) => !value)} type="button">
            <Brain aria-hidden="true" size={16} />
            {deepThink ? "Deep think on" : "Deep think"}
          </button>
          <button className="btn btn-sm" onClick={() => setWebSearch((value) => !value)} type="button">
            <Search aria-hidden="true" size={16} />
            {webSearch ? "Web search on" : "Web search"}
          </button>
          <button
            className="btn btn-sm"
            disabled={!speech.isSupported}
            onClick={() => {
              if (speech.isRecording) {
                speech.stop();
              } else {
                speech.start(setContent);
              }
            }}
            type="button"
          >
            {speech.isRecording ? (
              <Pause aria-hidden="true" size={16} />
            ) : (
              <Mic aria-hidden="true" size={16} />
            )}
            {speech.isSupported ? "Voice input" : "Speech unavailable"}
          </button>
        </div>
        <textarea
          className="textarea textarea-bordered min-h-24 w-full"
          disabled={isDisabled || isStreaming}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Ask for corrections, role-play, or vocabulary examples..."
          value={content}
        />
        <div className="card-actions justify-end">
          <button className="btn btn-primary" disabled={isDisabled || isStreaming} type="submit">
            <Send aria-hidden="true" size={18} />
            {isStreaming ? "Streaming..." : "Send"}
          </button>
        </div>
      </div>
    </form>
  );
}
