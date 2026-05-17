import { z } from "zod";

const jsonScalarSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
const flatJsonObjectSchema = z.record(z.string(), jsonScalarSchema);
export const eventPayloadSchema = z.union([
  jsonScalarSchema,
  z.array(jsonScalarSchema),
  flatJsonObjectSchema,
]);

export const uvSchema = z.object({
  anonymousId: z.string().min(1),
  userId: z.string().min(1).optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
});

export const updateUvSchema = z.object({
  visitorId: z.string().min(1),
  userId: z.string().min(1),
});

export const performanceSchema = z.object({
  visitorId: z.string().min(1),
  fp: z.number().nonnegative().optional(),
  fcp: z.number().nonnegative().optional(),
  lcp: z.number().nonnegative().optional(),
  inp: z.number().nonnegative().optional(),
  cls: z.number().nonnegative().optional(),
});

export const pvSchema = z.object({
  visitorId: z.string().min(1),
  url: z.string().min(1),
  referrer: z.string().optional(),
  path: z.string().min(1),
});

export const eventSchema = z.object({
  visitorId: z.string().min(1),
  event: z.string().min(1),
  payload: eventPayloadSchema.optional(),
  url: z.string().optional(),
});

export const errorSchema = z.object({
  visitorId: z.string().min(1),
  error: z.string().min(1),
  message: z.string().min(1),
  stack: z.string().optional(),
  url: z.string().optional(),
});
