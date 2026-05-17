import { z } from "zod";

export function getFormError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

export function getUnknownErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The request failed. Please try again.";
}
