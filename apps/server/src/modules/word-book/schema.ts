import { z } from "zod";

const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const wordQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
  word: z.string().min(1).optional(),
  gk: booleanQuerySchema,
  zk: booleanQuerySchema,
  gre: booleanQuerySchema,
  toefl: booleanQuerySchema,
  ielts: booleanQuerySchema,
  cet6: booleanQuerySchema,
  cet4: booleanQuerySchema,
  ky: booleanQuerySchema,
});

export type WordQuery = z.infer<typeof wordQuerySchema>;
