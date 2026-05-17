import { Hono } from "hono";
import { authMiddleware } from "../../shared/middleware/auth.js";
import { env } from "../../shared/config/env.js";
import withPrisma from "../../shared/prisma/index.js";
import { error, success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { zValidator } from "@hono/zod-validator";
import { paymentStatusParamSchema } from "./schema.js";
import { prisma as defaultPrisma } from "../../shared/prisma/index.js";
import { completePayment, getPaymentStatus } from "./service.js";
import type { AlipayClient } from "./alipay-adapter.js";
import { createAlipayClientForEnv } from "./alipay-runtime.js";
import { createPayCreateRouter } from "./create-route.js";
import {
  createPayNotifyRouter,
  type CompletePaymentHandler,
} from "./notify-route.js";

interface PayRouterOptions {
  readonly alipayClient?: AlipayClient;
  readonly alipayEnabled?: boolean;
  readonly alipayNotifyBaseUrl?: string;
  readonly completePayment?: CompletePaymentHandler;
  readonly paymentNotifySecret?: string;
}

export const createPayRouter = (options: PayRouterOptions = {}) => {
  const payRouter = new Hono<HonoContext>();
  const paymentNotifySecret =
    options.paymentNotifySecret ?? env.PAYMENT_NOTIFY_SECRET;
  const alipayEnabled = options.alipayEnabled ?? env.ALIPAY_ENABLED;
  const alipayClient =
    options.alipayClient ??
    (alipayEnabled ? createAlipayClientForEnv(env) : undefined);
  const alipayNotifyBaseUrl =
    options.alipayNotifyBaseUrl ?? env.ALIPAY_NOTIFY_URL;
  const completePaymentHandler =
    options.completePayment ??
    ((input) => completePayment(defaultPrisma, input));

  payRouter.route(
    "/",
    createPayCreateRouter({
      alipayEnabled,
      alipayNotifyBaseUrl,
      ...(alipayClient ? { alipayClient } : {}),
    }),
  );

  payRouter.get(
    "/status/:outTradeNo",
    authMiddleware,
    withPrisma,
    zValidator("param", paymentStatusParamSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const user = c.get("user");
      const { outTradeNo } = c.req.valid("param");
      const status = await getPaymentStatus(prisma, user.userId, outTradeNo);

      if (!status) {
        return c.json(error(null, "payment not found", 404), 404);
      }

      return c.json(success(status));
    },
  );

  payRouter.route(
    "/",
    createPayNotifyRouter({
      alipayEnabled,
      completePayment: completePaymentHandler,
      paymentNotifySecret,
      ...(alipayClient ? { alipayClient } : {}),
    }),
  );

  return payRouter;
};

export default createPayRouter();
