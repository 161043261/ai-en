import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createResponseSchema } from "./response-schema";

const PayloadSchema = z.object({
  value: z.string(),
});

describe("createResponseSchema", () => {
  test("accepts the server response envelope", () => {
    const result = createResponseSchema(PayloadSchema).parse({
      code: 200,
      data: { value: "ok" },
      message: "ok",
      ok: true,
      timestamp: Date.now(),
    });

    expect(result.data).toEqual({ value: "ok" });
  });

  test("keeps legacy mock envelopes compatible", () => {
    const result = createResponseSchema(PayloadSchema).parse({
      code: 200,
      data: { value: "ok" },
      message: "ok",
      path: "/api/v1/example",
      success: true,
      timestamp: "2026-05-17T00:00:00.000Z",
    });

    expect(result.data).toEqual({ value: "ok" });
  });
});
