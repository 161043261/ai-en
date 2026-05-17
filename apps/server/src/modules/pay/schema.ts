import { z } from "zod";
import { TradeStatus } from "../../generated/prisma/client.js";

export const createPaySchema = z.object({
  courseId: z.string().min(1),
  totalAmount: z.coerce.number().positive(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export const paymentStatusParamSchema = z.object({
  outTradeNo: z.string().min(1),
});

export const notifyBizBodySchema = z.object({
  courseId: z.string().min(1),
  userId: z.string().min(1),
});

export const paymentNotifyStringRecordSchema = z.record(z.string(), z.string());

export const paymentNotifyFormSchema = z.object({
  out_trade_no: z.string().min(1),
  trade_no: z.string().default(""),
  gmt_payment: z.string().default(""),
  body: z.string().default(""),
  trade_status: z.enum([TradeStatus.TRADE_SUCCESS, TradeStatus.TRADE_FINISHED]),
}).passthrough();

export type CreatePayInput = z.infer<typeof createPaySchema>;
export type PaymentStatusParam = z.infer<typeof paymentStatusParamSchema>;
