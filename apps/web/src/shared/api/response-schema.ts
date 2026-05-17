import { z } from "zod";

const ServerResponseMetadataSchema = z.object({
  ok: z.boolean(),
  timestamp: z.number(),
});

const LegacyResponseMetadataSchema = z.object({
  path: z.string(),
  success: z.boolean(),
  timestamp: z.string(),
});

export function createResponseSchema<DataSchema extends z.ZodType>(
  dataSchema: DataSchema,
) {
  return z
    .object({
      code: z.number(),
      data: dataSchema,
      message: z.string(),
    })
    .and(z.union([ServerResponseMetadataSchema, LegacyResponseMetadataSchema]));
}
