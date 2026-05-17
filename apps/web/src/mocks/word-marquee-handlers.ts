import { http, HttpResponse } from "msw";
import {
  WordMarqueeItemSchema,
  type WordMarqueeList,
} from "../shared/api/word-marquee-schema";

// cSpell: words bcdfghjklmnpqrstvwxyz aeiou

const levels = ["core", "daily", "advanced"] as const;
const consonants = "bcdfghjklmnpqrstvwxyz";
const vowels = "aeiou";

function randomInt(max: number): number {
  if (globalThis.crypto) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function randomChar(chars: string): string {
  return chars.charAt(randomInt(chars.length));
}

function createRandomWord(): string {
  const length = randomInt(5) + 5;
  return Array.from({ length }, (_, index) =>
    randomChar(index % 2 === 0 ? consonants : vowels),
  ).join("");
}

function createRandomMeaning(index: number): string {
  return `generated practice term ${index + 1}`;
}

function createWordItem(index: number): WordMarqueeList[number] {
  const word = createRandomWord();
  return WordMarqueeItemSchema.parse({
    id: crypto.randomUUID(),
    level: levels[index % levels.length],
    meaning: createRandomMeaning(index),
    phonetic: `/${word.slice(0, 3).toLowerCase()}-${index + 1}/`,
    word,
  });
}

export const wordMarqueeHandlers = [
  http.get("/api/v1/word-marquee", ({ request }) => {
    const data = Array.from({ length: 18 }, (_, index) =>
      createWordItem(index),
    );

    return HttpResponse.json({
      code: 0,
      data,
      message: "success",
      path: new URL(request.url).pathname,
      success: true,
      timestamp: new Date().toISOString(),
    });
  }),
];
