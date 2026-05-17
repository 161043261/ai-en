import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { hasSpeechRecognition, useSpeechToText } from ".";

type ResultAlternative = {
  readonly transcript: string;
};

type ResultEvent = {
  readonly results: ArrayLike<ArrayLike<ResultAlternative>>;
};

class MockSpeechRecognition {
  static instance: MockSpeechRecognition | null = null;

  continuous = false;
  interimResults = false;
  lang = "";
  maxAlternatives = 1;
  onend: (() => void) | null = null;
  onresult: ((event: ResultEvent) => void) | null = null;
  startCount = 0;
  stopCount = 0;

  constructor() {
    MockSpeechRecognition.instance = this;
  }

  start() {
    this.startCount += 1;
  }

  stop() {
    this.stopCount += 1;
    this.onend?.();
  }
}

describe("hasSpeechRecognition", () => {
  afterEach(() => {
    cleanup();
    delete window.SpeechRecognition;
    MockSpeechRecognition.instance = null;
  });

  test("reports unsupported speech recognition in jsdom", () => {
    expect(hasSpeechRecognition()).toBe(false);
  });

  test("starts, receives text, and stops with a browser adapter", () => {
    window.SpeechRecognition = MockSpeechRecognition;

    function SpeechProbe() {
      const [text, setText] = useState("");
      const speech = useSpeechToText({ continuous: true, lang: "en-US" });

      return (
        <div>
          <button onClick={() => speech.start(setText)} type="button">
            Start
          </button>
          <button onClick={speech.stop} type="button">
            Stop
          </button>
          <span>{speech.isRecording ? "Recording" : "Idle"}</span>
          <output>{text}</output>
        </div>
      );
    }

    render(<SpeechProbe />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    const recognition = MockSpeechRecognition.instance;

    act(() => {
      recognition?.onresult?.({
        results: [[{ transcript: "hello world" }]],
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(recognition?.startCount).toBe(1);
    expect(recognition?.stopCount).toBe(1);
    expect(screen.getByText("hello world")).toBeTruthy();
    expect(screen.getByText("Idle")).toBeTruthy();
  });
});
