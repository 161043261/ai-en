export type SpeakOptions = {
  readonly lang?: string;
  readonly pitch?: number;
  readonly rate?: number;
  readonly volume?: number;
};

export function speakText(text: string, options: SpeakOptions = {}): void {
  if (
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window)
  ) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang ?? "en-US";
  utterance.pitch = options.pitch ?? 1;
  utterance.rate = options.rate ?? 0.7;
  utterance.volume = options.volume ?? 1;
  window.speechSynthesis.speak(utterance);
}
