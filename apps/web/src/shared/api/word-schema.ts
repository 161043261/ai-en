import { z } from "zod";

const nullableTextSchema = z.string().nullable().optional();
const nullableFlagSchema = z.boolean().nullable().optional();

export const WordQuerySchema = z.object({
  cet4: z.boolean().optional(),
  cet6: z.boolean().optional(),
  gk: z.boolean().optional(),
  gre: z.boolean().optional(),
  ielts: z.boolean().optional(),
  ky: z.boolean().optional(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  toefl: z.boolean().optional(),
  word: z.string().optional(),
  zk: z.boolean().optional(),
});

export const WordSchema = z.object({
  bnc: nullableTextSchema,
  cet4: nullableFlagSchema,
  cet6: nullableFlagSchema,
  collins: nullableTextSchema,
  createdAt: z.string(),
  definition: nullableTextSchema,
  exchange: nullableTextSchema,
  frq: nullableTextSchema,
  gk: nullableFlagSchema,
  gre: nullableFlagSchema,
  id: z.string(),
  ielts: nullableFlagSchema,
  ky: nullableFlagSchema,
  oxford: nullableTextSchema,
  phonetic: nullableTextSchema,
  pos: nullableTextSchema,
  tag: nullableTextSchema,
  toefl: nullableFlagSchema,
  translation: nullableTextSchema,
  updatedAt: z.string(),
  word: z.string(),
  zk: nullableFlagSchema,
});

export const WordListSchema = z.object({
  list: z.array(WordSchema),
  total: z.number(),
});

export type Word = z.infer<typeof WordSchema>;
export type WordList = z.infer<typeof WordListSchema>;
export type WordQuery = z.infer<typeof WordQuerySchema>;
