import { describe, expect, test } from "vitest";
import { TradeStatus } from "../../generated/prisma/client.js";
import {
  completePaymentInTransaction,
  getPaymentStatus,
  type PayTransactionClient,
  type PayStatusClient,
} from "./service.js";

describe("pay service", () => {
  test("completes payment with an idempotent course upsert", async () => {
    const paymentUpdates: unknown[] = [];
    const courseUpserts: unknown[] = [];
    const tx: PayTransactionClient = {
      paymentRecord: {
        findUnique: async () => ({
          id: "payment-1",
          tradeStatus: TradeStatus.NOT_PAY,
        }),
        update: async (input) => {
          paymentUpdates.push(input);
          return { id: "payment-1" };
        },
      },
      courseRecord: {
        upsert: async (input) => {
          courseUpserts.push(input);
          return {};
        },
      },
    };

    await completePaymentInTransaction(tx, {
      outTradeNo: "order-1",
      tradeNo: "trade-1",
      gmtPayment: "2026-01-01T00:00:00.000Z",
      userId: "user-1",
      courseId: "course-1",
    });

    expect(paymentUpdates).toEqual([
      {
        where: { outTradeNo: "order-1" },
        data: {
          tradeNo: "trade-1",
          tradeStatus: TradeStatus.TRADE_SUCCESS,
          sendPayTime: new Date("2026-01-01T00:00:00.000Z"),
        },
      },
    ]);
    expect(courseUpserts).toEqual([
      {
        where: {
          userId_courseId: {
            userId: "user-1",
            courseId: "course-1",
          },
        },
        create: {
          userId: "user-1",
          courseId: "course-1",
          isPurchased: true,
          paymentRecordId: "payment-1",
        },
        update: {
          isPurchased: true,
          paymentRecordId: "payment-1",
        },
      },
    ]);
  });

  test("ignores replayed successful callbacks", async () => {
    const paymentUpdates: unknown[] = [];
    const courseUpserts: unknown[] = [];
    const tx: PayTransactionClient = {
      paymentRecord: {
        findUnique: async () => ({
          id: "payment-1",
          tradeStatus: TradeStatus.TRADE_SUCCESS,
        }),
        update: async (input) => {
          paymentUpdates.push(input);
          return { id: "payment-1" };
        },
      },
      courseRecord: {
        upsert: async (input) => {
          courseUpserts.push(input);
          return {};
        },
      },
    };

    await expect(
      completePaymentInTransaction(tx, {
        outTradeNo: "order-1",
        tradeNo: "trade-1",
        gmtPayment: "2026-01-01T00:00:00.000Z",
        userId: "user-1",
        courseId: "course-1",
      }),
    ).resolves.toEqual({
      id: "payment-1",
      tradeStatus: TradeStatus.TRADE_SUCCESS,
    });
    expect(paymentUpdates).toEqual([]);
    expect(courseUpserts).toEqual([]);
  });

  test("finds payment status by authenticated user and order", async () => {
    const inputs: unknown[] = [];
    const client: PayStatusClient = {
      paymentRecord: {
        findFirst: async (input) => {
          inputs.push(input);
          return {
            outTradeNo: "order-1",
            tradeStatus: TradeStatus.TRADE_SUCCESS,
            sendPayTime: new Date("2026-01-01T00:00:00.000Z"),
          };
        },
      },
    };

    await expect(
      getPaymentStatus(client, "user-1", "order-1"),
    ).resolves.toMatchObject({
      outTradeNo: "order-1",
      tradeStatus: TradeStatus.TRADE_SUCCESS,
    });
    expect(inputs).toEqual([
      {
        where: {
          outTradeNo: "order-1",
          userId: "user-1",
        },
        select: {
          outTradeNo: true,
          tradeStatus: true,
          sendPayTime: true,
        },
      },
    ]);
  });
});
