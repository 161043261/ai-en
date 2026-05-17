import { describe, expect, test } from "vitest";
import { createWordBookImportRow, parseCsvLine } from "./ecdict-row.js";
import {
  requiredWordBookCsvHeaders,
  validateWordBookCsvHeaders,
} from "./word-book-csv-schema.js";

describe("word-book CSV validation", () => {
  test("accepts the required ECDICT headers", () => {
    expect(validateWordBookCsvHeaders(requiredWordBookCsvHeaders)).toEqual({
      valid: true,
      missing: [],
    });
  });

  test("reports missing required headers", () => {
    expect(validateWordBookCsvHeaders(["word", "phonetic"])).toEqual({
      valid: false,
      missing: [
        "definition",
        "translation",
        "pos",
        "collins",
        "oxford",
        "tag",
        "bnc",
        "frq",
        "exchange",
      ],
    });
  });

  test("parses quoted CSV fields without splitting inner commas", () => {
    expect(parseCsvLine('hello,"a,b",world')).toEqual([
      "hello",
      "a,b",
      "world",
    ]);
  });

  test("creates validated import rows from ECDICT fields", () => {
    expect(
      createWordBookImportRow(
        requiredWordBookCsvHeaders,
        [
          "abandon",
          "abandon",
          "give up",
          "give up translation",
          "v",
          "2",
          "1",
          "cet4 cet6 ky",
          "3000",
          "100",
          "abandoned",
        ].join(","),
      ),
    ).toMatchObject({
      cet4: true,
      cet6: true,
      definition: "give up",
      ky: true,
      phonetic: "abandon",
      tag: "cet4 cet6 ky",
      word: "abandon",
    });
  });
});
