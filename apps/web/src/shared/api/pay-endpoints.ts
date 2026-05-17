import type { ApiClient } from "../http";
import {
  CreatePaySchema,
  PaymentStatusSchema,
  ResultPaySchema,
  type CreatePay,
  type PaymentStatus,
  type ResultPay,
} from "./pay-schema";
import { createResponseSchema } from "./response-schema";

export type PayEndpoints = {
  readonly createPay: (data: CreatePay) => Promise<ResultPay>;
  readonly getPaymentStatus: (outTradeNo: string) => Promise<PaymentStatus>;
};

export function createPayEndpoints(client: ApiClient): PayEndpoints {
  return {
    createPay: async (data) => {
      const response = await client.post(
        "/pay/create",
        createResponseSchema(ResultPaySchema),
        { body: CreatePaySchema.parse(data) },
      );
      return response.data;
    },
    getPaymentStatus: async (outTradeNo) => {
      const response = await client.get(
        `/pay/status/${encodeURIComponent(outTradeNo)}`,
        createResponseSchema(PaymentStatusSchema),
      );
      return response.data;
    },
  };
}
