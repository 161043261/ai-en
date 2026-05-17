export const requiredWordBookCsvHeaders = [
  "word",
  "phonetic",
  "definition",
  "translation",
  "pos",
  "collins",
  "oxford",
  "tag",
  "bnc",
  "frq",
  "exchange",
];

export const validateWordBookCsvHeaders = (headers: readonly string[]) => {
  const missing = requiredWordBookCsvHeaders.filter(
    (header) => !headers.includes(header),
  );
  return {
    valid: missing.length === 0,
    missing,
  };
};
