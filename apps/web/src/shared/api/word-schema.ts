import { z } from "zod";

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
  bnc: z.string().optional(),
  cet4: z.boolean().optional(),
  cet6: z.boolean().optional(),
  collins: z.string().optional(),
  createdAt: z.string(),
  definition: z.string().optional(),
  exchange: z.string().optional(),
  frq: z.string().optional(),
  gk: z.boolean().optional(),
  gre: z.boolean().optional(),
  id: z.string(),
  ielts: z.boolean().optional(),
  ky: z.boolean().optional(),
  oxford: z.string().optional(),
  phonetic: z.string().optional(),
  pos: z.string().optional(),
  tag: z.string().optional(),
  toefl: z.boolean().optional(),
  translation: z.string().optional(),
  updatedAt: z.string(),
  word: z.string(),
  zk: z.boolean().optional(),
});

export const WordListSchema = z.object({
  list: z.array(WordSchema),
  total: z.number(),
});

export type Word = z.infer<typeof WordSchema>;
export type WordList = z.infer<typeof WordListSchema>;
export type WordQuery = z.infer<typeof WordQuerySchema>;
