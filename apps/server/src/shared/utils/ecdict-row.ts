import { z } from "zod";

const nullableTextSchema = z.string().nullable();

export const WordBookImportRowSchema = z.object({
  bnc: nullableTextSchema,
  cet4: z.boolean(),
  cet6: z.boolean(),
  collins: nullableTextSchema,
  definition: nullableTextSchema,
  exchange: nullableTextSchema,
  frq: nullableTextSchema,
  gk: z.boolean(),
  gre: z.boolean(),
  ielts: z.boolean(),
  ky: z.boolean(),
  oxford: nullableTextSchema,
  phonetic: nullableTextSchema,
  pos: nullableTextSchema,
  tag: nullableTextSchema,
  toefl: z.boolean(),
  translation: nullableTextSchema,
  word: z.string(),
  zk: z.boolean(),
});

export type WordBookImportRow = z.infer<typeof WordBookImportRowSchema>;

export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue);
  return values;
}

function parseTagToBoolean(tagValue: string) {
  const tags = tagValue
    ? tagValue.split(" ").filter((item) => item.trim() !== "")
    : [];

  return {
    cet4: tags.includes("cet4"),
    cet6: tags.includes("cet6"),
    gk: tags.includes("gk"),
    gre: tags.includes("gre"),
    ielts: tags.includes("ielts"),
    ky: tags.includes("ky"),
    toefl: tags.includes("toefl"),
    zk: tags.includes("zk"),
  };
}

function emptyToNull(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export function createWordBookImportRow(
  headers: readonly string[],
  line: string,
): WordBookImportRow {
  const values = parseCsvLine(line);
  const rowData: Record<string, string> = {};

  headers.forEach((header, index) => {
    rowData[header] = values[index] ?? "";
  });

  return WordBookImportRowSchema.parse({
    ...parseTagToBoolean(rowData.tag ?? ""),
    bnc: emptyToNull(rowData.bnc),
    collins: emptyToNull(rowData.collins),
    definition: emptyToNull(rowData.definition),
    exchange: emptyToNull(rowData.exchange),
    frq: emptyToNull(rowData.frq),
    oxford: emptyToNull(rowData.oxford),
    phonetic: emptyToNull(rowData.phonetic),
    pos: emptyToNull(rowData.pos),
    tag: emptyToNull(rowData.tag),
    translation: emptyToNull(rowData.translation),
    word: rowData.word ?? "",
  });
}
