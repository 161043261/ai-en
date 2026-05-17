import { z } from "zod";

export const ResultLearnSchema = z.object({
  wordNumber: z.number(),
});

export const SaveWordMasterSchema = z.object({
  wordIds: z.array(z.string().min(1)),
});

export type ResultLearn = z.infer<typeof ResultLearnSchema>;
export type SaveWordMaster = z.infer<typeof SaveWordMasterSchema>;
