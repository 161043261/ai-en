import { z } from "zod";

export const WordMarqueeItemSchema = z.object({
  id: z.string().min(1),
  level: z.enum(["core", "daily", "advanced"]),
  meaning: z.string().min(1),
  phonetic: z.string().min(1),
  word: z.string().min(1),
});

export const WordMarqueeListSchema = z.array(WordMarqueeItemSchema);

export type WordMarqueeItem = z.infer<typeof WordMarqueeItemSchema>;
export type WordMarqueeList = z.infer<typeof WordMarqueeListSchema>;
