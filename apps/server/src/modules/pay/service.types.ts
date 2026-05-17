import type { TradeStatus } from "../../generated/prisma/client.js";

export interface NotifyPaymentInput {
  readonly outTradeNo: string;
  readonly tradeNo: string;
  readonly gmtPayment: string;
  readonly courseId: string;
  readonly userId: string;
}

export interface PayTransactionClient {
  readonly paymentRecord: {
    findUnique(input: {
      readonly where: { readonly outTradeNo: string };
      readonly select: {
        readonly id: true;
        readonly tradeStatus: true;
      };
    }): Promise<{
      readonly id: string;
      readonly tradeStatus: TradeStatus;
    } | null>;
    update(input: {
      readonly where: { readonly outTradeNo: string };
      readonly data: {
        readonly tradeNo: string;
        readonly tradeStatus: TradeStatus;
        readonly sendPayTime: Date;
      };
    }): Promise<{ readonly id: string }>;
  };
  readonly courseRecord: {
    upsert(input: {
      readonly where: {
        readonly userId_courseId: {
          readonly userId: string;
          readonly courseId: string;
        };
      };
      readonly create: {
        readonly userId: string;
        readonly courseId: string;
        readonly isPurchased: true;
        readonly paymentRecordId: string;
      };
      readonly update: {
        readonly isPurchased: true;
        readonly paymentRecordId: string;
      };
    }): Promise<unknown>;
  };
}

export interface PayStatusClient {
  readonly paymentRecord: {
    findFirst(input: {
      readonly where: {
        readonly outTradeNo: string;
        readonly userId: string;
      };
      readonly select: {
        readonly outTradeNo: true;
        readonly tradeStatus: true;
        readonly sendPayTime: true;
      };
    }): Promise<{
      readonly outTradeNo: string;
      readonly tradeStatus: TradeStatus;
      readonly sendPayTime: Date | null;
    } | null>;
  };
}
