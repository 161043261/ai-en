import {
  notifyBizBodySchema,
  paymentNotifyFormSchema,
  paymentNotifyStringRecordSchema,
} from "./schema.js";
import type { AlipayClient } from "./alipay-adapter.js";
import type { NotifyPaymentInput } from "./service.js";

export const parsePaymentNotifyForm = (formData: unknown) => {
  const recordResult = paymentNotifyStringRecordSchema.safeParse(formData);
  if (!recordResult.success) {
    return null;
  }

  const formResult = paymentNotifyFormSchema.safeParse(recordResult.data);
  if (!formResult.success) {
    return null;
  }

  return formResult.data;
};

export const parsePaymentNotifyInput = (
  formData: unknown,
): NotifyPaymentInput | null => {
  const parsedForm = parsePaymentNotifyForm(formData);
  if (!parsedForm) {
    return null;
  }

  const {
    out_trade_no: outTradeNo,
    trade_no: tradeNo,
    gmt_payment: gmtPayment,
    body,
  } = parsedForm;

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    return null;
  }

  const bodyResult = notifyBizBodySchema.safeParse(parsedBody);
  if (!bodyResult.success) {
    return null;
  }

  return {
    outTradeNo,
    tradeNo,
    gmtPayment,
    userId: bodyResult.data.userId,
    courseId: bodyResult.data.courseId,
  };
};

export const parseVerifiedAlipayNotifyInput = (
  formData: unknown,
  alipayClient: AlipayClient,
): NotifyPaymentInput | null => {
  const parsedRecord = paymentNotifyStringRecordSchema.safeParse(formData);
  if (!parsedRecord.success || !alipayClient.verifyNotify(parsedRecord.data)) {
    return null;
  }

  return parsePaymentNotifyInput(parsedRecord.data);
};
