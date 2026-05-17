import { z } from "zod";

export const saveWordMasterSchema = z.object({
  wordIds: z.array(z.string().min(1)).min(1),
});

export type SaveWordMasterInput = z.infer<typeof saveWordMasterSchema>;
