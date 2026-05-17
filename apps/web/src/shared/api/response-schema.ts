import { z } from "zod";

export function createResponseSchema<DataSchema extends z.ZodType>(
  dataSchema: DataSchema,
) {
  return z.object({
    code: z.number(),
    data: dataSchema,
    message: z.string(),
    path: z.string(),
    success: z.boolean(),
    timestamp: z.string(),
  });
}
