import { z } from "zod";
import { WordBookImportRowSchema } from "./ecdict-row.js";

export const ImportWorkerRequestSchema = z.object({
  id: z.number().int().nonnegative(),
  rows: z.array(WordBookImportRowSchema).min(1),
  type: z.literal("import"),
});

export const CloseWorkerRequestSchema = z.object({
  id: z.number().int().nonnegative(),
  type: z.literal("close"),
});

export const WorkerRequestSchema = z.discriminatedUnion("type", [
  ImportWorkerRequestSchema,
  CloseWorkerRequestSchema,
]);

export const WorkerResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    count: z.number().int().nonnegative(),
    id: z.number().int().nonnegative(),
    ok: z.literal(true),
  }),
  z.object({
    error: z.string().min(1),
    id: z.number().int().nonnegative(),
    ok: z.literal(false),
  }),
]);

export type WorkerRequest = z.infer<typeof WorkerRequestSchema>;
export type WorkerResponse = z.infer<typeof WorkerResponseSchema>;
