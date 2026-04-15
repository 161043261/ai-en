import { Hono } from "hono";
import { authMiddleware } from "../../shared/middleware/auth.js";
import withPrisma from "../../shared/prisma/index.js";
import { success, error } from "../../shared/utils/response.js";
import type { HonoContext } from "../../types/index.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { AlipaySdk } from "alipay-sdk";

const payRouter = new Hono<HonoContext>();

// Helper to get alipay sdk instance
const getAlipaySdk = () => {
  return new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID || "",
    privateKey: process.env.ALIPAY_PRIVATE_KEY || "",
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || "",
    gateway:
      process.env.ALIPAY_GATEWAY ||
      "https://openapi-sandbox.dl.alipaydev.com/gateway.do",
    signType: "RSA2",
  });
};

const createTradeNo = () => {
  const prefix = "XM";
  const randomStr = crypto.randomUUID().replace(/-/g, "").substring(0, 12);
  return `${prefix}-${randomStr}`;
};

const createPaySchema = z.object({
  courseId: z.string(),
  totalAmount: z.number().or(z.string()),
  subject: z.string(),
  body: z.string(),
});

payRouter.post(
  "/create",
  authMiddleware,
  withPrisma,
  zValidator("json", createPaySchema),
  async (c) => {
    const prisma = c.get("prisma");
    const userPayload = c.get("user");
    const { courseId, totalAmount, subject, body } = c.req.valid("json");

    // 1. Check if the user has already purchased the course
    const courseRecord = await prisma.courseRecord.findFirst({
      where: {
        userId: userPayload.userId,
        courseId,
      },
    });

    if (courseRecord) {
      return c.json(error(null, "您已经购买过该课程"));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      const outTradeNo = createTradeNo();

      // Create payment record with pending status
      await tx.paymentRecord.create({
        data: {
          userId: userPayload.userId,
          outTradeNo,
          amount: Number(totalAmount),
          subject,
          body,
        },
      });

      // Expiration time (e.g. 1 minute later for testing)
      const expireTime = new Date();
      expireTime.setMinutes(expireTime.getMinutes() + 1);

      // Format to YYYY-MM-DD HH:mm:ss for Alipay
      const pad = (n: number) => n.toString().padStart(2, "0");
      const timeExpireStr = `${expireTime.getFullYear()}-${pad(expireTime.getMonth() + 1)}-${pad(expireTime.getDate())} ${pad(expireTime.getHours())}:${pad(expireTime.getMinutes())}:${pad(expireTime.getSeconds())}`;

      const alipaySdk = getAlipaySdk();
      const notifyUrl = `${process.env.ALIPAY_NOTIFY_URL || ""}/api/v1/pay/notify`;

      const payUrl = alipaySdk.pageExecute("alipay.trade.page.pay", "GET", {
        bizContent: {
          out_trade_no: outTradeNo,
          total_amount: totalAmount.toString(),
          subject,
          body: JSON.stringify({
            courseId,
            userId: userPayload.userId,
          }),
          product_code: "FAST_INSTANT_TRADE_PAY",
          time_expire: timeExpireStr,
        },
        notify_url: notifyUrl,
      });

      return {
        payUrl,
        timeExpire: expireTime.getTime(),
        outTradeNo,
      };
    });

    c.var.logger.info(
      { userId: userPayload.userId, courseId, outTradeNo: result.outTradeNo },
      "Created payment order",
    );

    return c.json(success(result));
  },
);

payRouter.all("/notify", withPrisma, async (c) => {
  const prisma = c.get("prisma");
  // The notification from Alipay is typically a POST request with URL-encoded form data
  const body = await c.req.parseBody();

  const outTradeNo =
    typeof body.out_trade_no === "string" ? body.out_trade_no : "";
  const tradeNo = typeof body.trade_no === "string" ? body.trade_no : "";
  const gmtPayment =
    typeof body.gmt_payment === "string" ? body.gmt_payment : "";
  const bizBodyStr = typeof body.body === "string" ? body.body : "";

  if (!outTradeNo) {
    return c.text("fail");
  }

  // TODO: Ideally we should verify the signature from Alipay here

  await prisma.$transaction(async (tx) => {
    // 1. Update payment record
    const paymentRecord = await tx.paymentRecord.update({
      where: {
        outTradeNo: outTradeNo,
      },
      data: {
        tradeNo: tradeNo,
        tradeStatus: "TRADE_SUCCESS", // Using string since TradeStatus enum might be Prisma generated
        sendPayTime: gmtPayment ? new Date(gmtPayment) : new Date(),
      },
    });

    // 2. Create course record
    if (bizBodyStr) {
      try {
        const parsedBody = JSON.parse(bizBodyStr) as {
          courseId: string;
          userId: string;
        };

        await tx.courseRecord.create({
          data: {
            userId: parsedBody.userId,
            courseId: parsedBody.courseId,
            isPurchased: true,
            paymentRecordId: paymentRecord.id,
          },
        });

        // 3. Optional: Emit socket event here if socket server is implemented
        // e.g., socketGateway.emitPaymentSuccess(parsedBody.userId);

        c.var.logger.info(
          {
            userId: parsedBody.userId,
            courseId: parsedBody.courseId,
            outTradeNo: outTradeNo,
          },
          "Payment success and course recorded",
        );
      } catch (e) {
        c.var.logger.error(e, "Failed to parse body from alipay notify");
      }
    }
  });

  return c.text("success");
});

export default payRouter;
