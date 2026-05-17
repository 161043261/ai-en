import { z } from "zod";

export const CreatePaySchema = z.object({
  body: z.string(),
  courseId: z.string().min(1),
  subject: z.string(),
  totalAmount: z.number().positive(),
});

export const CheckoutSchema = z.discriminatedUnion("provider", [
  z.object({
    managedBy: z.string(),
    provider: z.literal("external"),
  }),
  z.object({
    productCode: z.string(),
    provider: z.literal("alipay"),
  }),
]);

export const ResultPaySchema = z.object({
  checkout: CheckoutSchema,
  outTradeNo: z.string(),
  payUrl: z.string().optional(),
  statusUrl: z.string(),
  timeExpire: z.number(),
});

export const PaymentStatusSchema = z.object({
  outTradeNo: z.string(),
  sendPayTime: z.string(),
  tradeStatus: z.enum(["NOT_PAY", "TRADE_SUCCESS", "TRADE_FINISHED"]),
});

export type CreatePay = z.infer<typeof CreatePaySchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type ResultPay = z.infer<typeof ResultPaySchema>;
