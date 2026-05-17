import {
  Prisma,
  type PrismaClient,
  TradeStatus,
} from "../../generated/prisma/client.js";
import type { CreatePayInput } from "./schema.js";
import type {
  NotifyPaymentInput,
  PayStatusClient,
  PayTransactionClient,
} from "./service.types.js";
export type {
  NotifyPaymentInput,
  PayStatusClient,
  PayTransactionClient,
} from "./service.types.js";

export const getPaymentStatus = (
  prisma: PayStatusClient,
  userId: string,
  outTradeNo: string,
) =>
  prisma.paymentRecord.findFirst({
    where: {
      outTradeNo,
      userId,
    },
    select: {
      outTradeNo: true,
      tradeStatus: true,
      sendPayTime: true,
    },
  });

export const createPaymentRecord = (
  prisma: PrismaClient,
  userId: string,
  outTradeNo: string,
  input: CreatePayInput,
) =>
  prisma.paymentRecord.create({
    data: {
      userId,
      outTradeNo,
      amount: new Prisma.Decimal(input.totalAmount),
      subject: input.subject,
      body: input.body,
    },
  });

export const completePaymentInTransaction = async (
  tx: PayTransactionClient,
  input: NotifyPaymentInput,
) => {
  const existingRecord = await tx.paymentRecord.findUnique({
    where: { outTradeNo: input.outTradeNo },
    select: { id: true, tradeStatus: true },
  });

  if (existingRecord?.tradeStatus === TradeStatus.TRADE_SUCCESS) {
    return existingRecord;
  }

  const paymentRecord = await tx.paymentRecord.update({
    where: {
      outTradeNo: input.outTradeNo,
    },
    data: {
      tradeNo: input.tradeNo,
      tradeStatus: TradeStatus.TRADE_SUCCESS,
      sendPayTime: input.gmtPayment ? new Date(input.gmtPayment) : new Date(),
    },
  });

  await tx.courseRecord.upsert({
    where: {
      userId_courseId: {
        userId: input.userId,
        courseId: input.courseId,
      },
    },
    create: {
      userId: input.userId,
      courseId: input.courseId,
      isPurchased: true,
      paymentRecordId: paymentRecord.id,
    },
    update: {
      isPurchased: true,
      paymentRecordId: paymentRecord.id,
    },
  });

  return paymentRecord;
};

export const completePayment = (
  prisma: PrismaClient,
  input: NotifyPaymentInput,
) =>
  prisma.$transaction(async (tx) => {
    const payTx: PayTransactionClient = {
      paymentRecord: {
        findUnique: (findInput) => tx.paymentRecord.findUnique(findInput),
        update: (updateInput) => tx.paymentRecord.update(updateInput),
      },
      courseRecord: {
        upsert: (upsertInput) => tx.courseRecord.upsert(upsertInput),
      },
    };

    return completePaymentInTransaction(payTx, input);
  });
