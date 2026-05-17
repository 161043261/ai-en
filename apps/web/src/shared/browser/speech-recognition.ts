import { useMemo, useState } from "react";

export type SpeechRecognitionOptions = {
  readonly continuous?: boolean;
  readonly interimResults?: boolean;
  readonly lang?: string;
  readonly maxAlternatives?: number;
};

type SpeechRecognitionResultLike = {
  readonly transcript: string;
};

type SpeechRecognitionEventLike = {
  readonly results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function hasSpeechRecognition() {
  return typeof window !== "undefined" && Boolean(getSpeechRecognitionConstructor());
}

export function useSpeechToText(options: SpeechRecognitionOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const recognition = useMemo(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return null;
    const instance = new Recognition();
    instance.lang = options.lang ?? "en-US";
    instance.continuous = options.continuous ?? true;
    instance.interimResults = options.interimResults ?? false;
    instance.maxAlternatives = options.maxAlternatives ?? 1;
    return instance;
  }, [
    options.continuous,
    options.interimResults,
    options.lang,
    options.maxAlternatives,
  ]);

  const start = (onText: (text: string) => void) => {
    if (!recognition) return;
    setIsRecording(true);
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("");
      onText(text);
    };
    recognition.start();
  };

  const stop = () => {
    if (!recognition) return;
    setIsRecording(false);
    recognition.stop();
  };

  return {
    isRecording,
    isSupported: Boolean(recognition),
    start,
    stop,
  };
}
