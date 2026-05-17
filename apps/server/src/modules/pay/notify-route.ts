import { Hono } from "hono";
import type { HonoContext } from "../../types/index.js";
import type { AlipayClient } from "./alipay-adapter.js";
import {
  isPaymentNotifyTrusted,
  paymentNotifySecretHeader,
} from "./boundary.js";
import {
  parsePaymentNotifyInput,
  parseVerifiedAlipayNotifyInput,
} from "./notify.js";
import type { NotifyPaymentInput } from "./service.js";

export type CompletePaymentHandler = (
  input: NotifyPaymentInput,
) => Promise<unknown>;

export interface PayNotifyRouterOptions {
  readonly alipayClient?: AlipayClient;
  readonly alipayEnabled: boolean;
  readonly completePayment: CompletePaymentHandler;
  readonly paymentNotifySecret: string;
}

export const createPayNotifyRouter = (options: PayNotifyRouterOptions) => {
  const router = new Hono<HonoContext>();

  router.all(
    "/notify",
    async (c, next) => {
      if (options.alipayEnabled) {
        await next();
        return;
      }

      if (
        !isPaymentNotifyTrusted(
          c.req.header(paymentNotifySecretHeader),
          options.paymentNotifySecret,
        )
      ) {
        c.var.logger?.warn("Rejected untrusted payment notify callback");
        return c.text("fail", 401);
      }

      await next();
    },
    async (c) => {
      const body = await c.req.parseBody();
      const notifyInput =
        options.alipayEnabled && options.alipayClient
          ? parseVerifiedAlipayNotifyInput(body, options.alipayClient)
          : parsePaymentNotifyInput(body);

      if (!notifyInput) {
        return c.text("fail");
      }

      await options.completePayment(notifyInput);

      c.var.logger?.info(
        {
          userId: notifyInput.userId,
          courseId: notifyInput.courseId,
          outTradeNo: notifyInput.outTradeNo,
        },
        "Payment success and course recorded",
      );

      return c.text("success");
    },
  );

  return router;
};
