import { z } from "zod";

const ApiErrorEnvelopeSchema = z.union([
  z.looseObject({
    code: z.number(),
    message: z.string().min(1),
    ok: z.literal(false),
  }),
  z.looseObject({
    code: z.number(),
    message: z.string().min(1),
    success: z.literal(false),
  }),
]);

const ApiMessageEnvelopeSchema = z.looseObject({
  message: z.string().min(1),
});

export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

export async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    const body: unknown = await response.json();
    return body;
  } catch {
    return null;
  }
}

export function getApiErrorEnvelope(body: unknown): ApiErrorEnvelope | null {
  const parsed = ApiErrorEnvelopeSchema.safeParse(body);
  return parsed.success ? parsed.data : null;
}

export function getHttpErrorMessage(response: Response, body: unknown): string {
  const parsed = ApiMessageEnvelopeSchema.safeParse(body);
  if (parsed.success) {
    return parsed.data.message;
  }

  return (
    response.statusText || `Request failed with status ${response.status}.`
  );
}
