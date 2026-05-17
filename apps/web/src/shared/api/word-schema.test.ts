import { describe, expect, test } from "vitest";
import { WordSchema } from "./word-schema";

describe("WordSchema", () => {
  test("accepts nullable fields from database rows", () => {
    const result = WordSchema.parse({
      bnc: "9999",
      cet4: false,
      cet6: false,
      collins: "2",
      createdAt: "2026-05-17T19:06:18.902Z",
      definition: "To pronounce not guilty.",
      exchange: null,
      frq: "9999",
      gk: false,
      gre: true,
      id: "word-1",
      ielts: false,
      ky: false,
      oxford: null,
      phonetic: "kwit",
      pos: null,
      tag: "toefl gre",
      toefl: true,
      translation: "Acquit.",
      updatedAt: "2026-05-17T19:06:18.902Z",
      word: "acquit",
      zk: false,
    });

    expect(result.word).toBe("acquit");
  });
});
