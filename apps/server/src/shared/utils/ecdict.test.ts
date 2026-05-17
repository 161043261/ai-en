import { describe, expect, test } from "vitest";
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
});
