import { describe, expect, test } from "vitest";
import type { AlipayClient, AlipayPagePayInput } from "./alipay-adapter.js";
import {
  createAlipayNotifyUrl,
  createAlipayPaymentOrderResult,
  createPaymentOrderResult,
  formatAlipayExpireTime,
} from "./order.js";

describe("payment order response", () => {
  test("keeps the disabled Alipay fallback response shape", () => {
    const result = createPaymentOrderResult(
      "lark-order-1",
      new Date("2026-01-01T00:01:00.000Z"),
    );

    expect(result).toEqual({
      outTradeNo: "lark-order-1",
      statusUrl: "/api/v1/pay/status/lark-order-1",
      timeExpire: 1767225660000,
      checkout: {
        provider: "external",
        managedBy: "upstream-payment-service",
      },
    });
    expect("payUrl" in result).toBe(false);
  });

  test("formats Alipay checkout expiration and notify URL", () => {
    expect(formatAlipayExpireTime(new Date(2026, 0, 1, 0, 1, 0))).toBe(
      "2026-01-01 00:01:00",
    );
    expect(createAlipayNotifyUrl("https://api.example.com/")).toBe(
      "https://api.example.com/api/v1/pay/notify",
    );
  });

  test("creates an enabled Alipay checkout response", () => {
    const expireTime = new Date(2026, 0, 1, 0, 1, 0);
    const calls: AlipayPagePayInput[] = [];
    const alipayClient: AlipayClient = {
      createPagePayUrl: (input) => {
        calls.push(input);
        return "https://openapi.alipay.com/checkout";
      },
      verifyNotify: () => true,
    };

    const result = createAlipayPaymentOrderResult(
      alipayClient,
      "lark-order-1",
      expireTime,
      {
        body: "Course body",
        courseId: "course-1",
        subject: "Course",
        totalAmount: 99,
      },
      "user-1",
      "https://api.example.com",
    );

    expect(result).toEqual({
      outTradeNo: "lark-order-1",
      payUrl: "https://openapi.alipay.com/checkout",
      statusUrl: "/api/v1/pay/status/lark-order-1",
      timeExpire: expireTime.getTime(),
      checkout: {
        provider: "alipay",
        productCode: "FAST_INSTANT_TRADE_PAY",
      },
    });
    expect(calls).toEqual([
      {
        body: '{"courseId":"course-1","userId":"user-1"}',
        notifyUrl: "https://api.example.com/api/v1/pay/notify",
        outTradeNo: "lark-order-1",
        subject: "Course",
        timeExpire: "2026-01-01 00:01:00",
        totalAmount: "99.00",
      },
    ]);
  });
});
