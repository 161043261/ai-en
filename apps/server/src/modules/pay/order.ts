import { randomUUID } from "node:crypto";
import dayjs from "dayjs";
import type { AlipayClient } from "./alipay-adapter.js";
import type { CreatePayInput } from "./schema.js";

export const createTradeNo = () => {
  const prefix = "lark";
  const randomStr = randomUUID().replace(/-/g, "").substring(0, 12);
  return `${prefix}-${randomStr}`;
};

export const createPaymentStatusUrl = (outTradeNo: string) =>
  `/api/v1/pay/status/${outTradeNo}`;

export const createPaymentOrderResult = (
  outTradeNo: string,
  expireTime: Date,
) => ({
  outTradeNo,
  statusUrl: createPaymentStatusUrl(outTradeNo),
  timeExpire: expireTime.getTime(),
  checkout: {
    provider: "external",
    managedBy: "upstream-payment-service",
  },
});

export const formatAlipayExpireTime = (expireTime: Date) =>
  dayjs(expireTime).format("YYYY-MM-DD HH:mm:ss");

export const createAlipayNotifyUrl = (baseUrl: string) =>
  `${baseUrl.replace(/\/$/, "")}/api/v1/pay/notify`;

export const createAlipayPaymentOrderResult = (
  alipayClient: AlipayClient,
  outTradeNo: string,
  expireTime: Date,
  input: CreatePayInput,
  userId: string,
  notifyBaseUrl: string,
) => ({
  outTradeNo,
  payUrl: alipayClient.createPagePayUrl({
    outTradeNo,
    totalAmount: input.totalAmount.toFixed(2),
    subject: input.subject,
    body: JSON.stringify({
      courseId: input.courseId,
      userId,
    }),
    timeExpire: formatAlipayExpireTime(expireTime),
    notifyUrl: createAlipayNotifyUrl(notifyBaseUrl),
  }),
  statusUrl: createPaymentStatusUrl(outTradeNo),
  timeExpire: expireTime.getTime(),
  checkout: {
    provider: "alipay",
    productCode: "FAST_INSTANT_TRADE_PAY",
  },
});
