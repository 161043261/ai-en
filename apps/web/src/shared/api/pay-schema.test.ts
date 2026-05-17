import { describe, expect, test } from "vitest";
import { CreatePaySchema, ResultPaySchema } from "./pay-schema";

describe("pay schemas", () => {
  test("accepts the server payment contract", () => {
    expect(
      ResultPaySchema.parse({
        checkout: { provider: "external", managedBy: "upstream" },
        outTradeNo: "order-1",
        statusUrl: "/api/v1/pay/status/order-1",
        timeExpire: 1_767_000_000_000,
      }),
    ).toEqual({
      checkout: { provider: "external", managedBy: "upstream" },
      outTradeNo: "order-1",
      statusUrl: "/api/v1/pay/status/order-1",
      timeExpire: 1_767_000_000_000,
    });
  });

  test("uses totalAmount instead of legacy total amount naming", () => {
    expect(
      CreatePaySchema.parse({
        body: "Course body",
        courseId: "course-1",
        subject: "Course",
        totalAmount: 19.9,
      }),
    ).toMatchObject({ totalAmount: 19.9 });
  });
});
