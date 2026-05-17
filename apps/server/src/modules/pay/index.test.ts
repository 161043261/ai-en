import { Hono } from "hono";
import { describe, expect, test } from "vitest";
import type { HonoContext } from "../../types/index.js";
import type { AlipayClient } from "./alipay-adapter.js";
import { paymentNotifySecretHeader } from "./boundary.js";
import { createPayRouter } from "./index.js";
import type { NotifyPaymentInput } from "./service.js";

const createAlipayClient = (verified: boolean): AlipayClient => ({
  createPagePayUrl: () => "",
  verifyNotify: () => verified,
});

const createNotifyForm = () =>
  new URLSearchParams({
    body: JSON.stringify({
      userId: "user-1",
      courseId: "course-1",
    }),
    gmt_payment: "2026-01-01T00:00:00.000Z",
    out_trade_no: "lark-123456789012",
    sign: "signature",
    sign_type: "RSA2",
    trade_no: "202601012200000000000001",
    trade_status: "TRADE_SUCCESS",
  });

describe("pay notify route boundary", () => {
  const createTestApp = () => {
    const app = new Hono<HonoContext>();
    app.route("/pay", createPayRouter({ paymentNotifySecret: "secret-1" }));
    return app;
  };

  test("rejects notify callbacks without the shared secret", async () => {
    const response = await createTestApp().request("/pay/notify", {
      method: "POST",
    });

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("fail");
  });

  test("rejects notify callbacks with an invalid shared secret", async () => {
    const response = await createTestApp().request("/pay/notify", {
      method: "POST",
      headers: { [paymentNotifySecretHeader]: "wrong" },
    });

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("fail");
  });

  test("rejects Alipay notify callbacks with invalid signatures", async () => {
    const completed: NotifyPaymentInput[] = [];
    const app = new Hono<HonoContext>();
    app.route(
      "/pay",
      createPayRouter({
        alipayClient: createAlipayClient(false),
        alipayEnabled: true,
        completePayment: async (input) => {
          completed.push(input);
        },
      }),
    );

    const response = await app.request("/pay/notify", {
      method: "POST",
      body: createNotifyForm(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("fail");
    expect(completed).toEqual([]);
  });

  test("completes valid signed Alipay notify callbacks", async () => {
    const completed: NotifyPaymentInput[] = [];
    const app = new Hono<HonoContext>();
    app.route(
      "/pay",
      createPayRouter({
        alipayClient: createAlipayClient(true),
        alipayEnabled: true,
        completePayment: async (input) => {
          completed.push(input);
        },
      }),
    );

    const response = await app.request("/pay/notify", {
      method: "POST",
      body: createNotifyForm(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("success");
    expect(completed).toEqual([
      {
        outTradeNo: "lark-123456789012",
        tradeNo: "202601012200000000000001",
        gmtPayment: "2026-01-01T00:00:00.000Z",
        userId: "user-1",
        courseId: "course-1",
      },
    ]);
  });
});
