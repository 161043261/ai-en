import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { AlipayClient } from "./alipay-adapter.js";
import { authMiddleware } from "../../shared/middleware/auth.js";
import withPrisma from "../../shared/prisma/index.js";
import { error, success } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { createPaySchema } from "./schema.js";
import { createPaymentRecord } from "./service.js";
import {
  createAlipayPaymentOrderResult,
  createPaymentOrderResult,
  createTradeNo,
} from "./order.js";

export interface PayCreateRouterOptions {
  readonly alipayClient?: AlipayClient;
  readonly alipayEnabled: boolean;
  readonly alipayNotifyBaseUrl: string;
}

export const createPayCreateRouter = (options: PayCreateRouterOptions) => {
  const router = new Hono<HonoContext>();

  router.post(
    "/create",
    authMiddleware,
    withPrisma,
    zValidator("json", createPaySchema),
    async (c) => {
      const prisma = c.get("prisma");
      const userPayload = c.get("user");
      const payInput = c.req.valid("json");

      const courseRecord = await prisma.courseRecord.findFirst({
        where: {
          userId: userPayload.userId,
          courseId: payInput.courseId,
        },
      });

      if (courseRecord) {
        return c.json(error(null, "course already purchased", 400), 400);
      }

      const outTradeNo = createTradeNo();
      await createPaymentRecord(
        prisma,
        userPayload.userId,
        outTradeNo,
        payInput,
      );

      const expireTime = new Date();
      expireTime.setMinutes(expireTime.getMinutes() + 1);

      const result =
        options.alipayEnabled && options.alipayClient
          ? createAlipayPaymentOrderResult(
              options.alipayClient,
              outTradeNo,
              expireTime,
              payInput,
              userPayload.userId,
              options.alipayNotifyBaseUrl,
            )
          : createPaymentOrderResult(outTradeNo, expireTime);

      c.var.logger?.info(
        {
          userId: userPayload.userId,
          courseId: payInput.courseId,
          outTradeNo: result.outTradeNo,
        },
        "Created payment order",
      );

      return c.json(success(result));
    },
  );

  return router;
};
