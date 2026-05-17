import { describe, expect, test } from "vitest";
import {
  type AlipayPagePayParams,
  type AlipaySdkLike,
  createAlipayClientFromSdk,
  createAlipayPagePayParams,
} from "./alipay-adapter.js";

class MockAlipaySdk implements AlipaySdkLike {
  public pagePayParams: AlipayPagePayParams | undefined;
  public notifyPayload: Readonly<Record<string, string>> | undefined;

  constructor(private readonly verifyResult: boolean) {}

  pageExecute(
    method: "alipay.trade.page.pay",
    httpMethod: "GET",
    params: AlipayPagePayParams,
  ) {
    this.pagePayParams = params;
    return `${method}:${httpMethod}:${params.bizContent.out_trade_no}`;
  }

  checkNotifySignV2(payload: Readonly<Record<string, string>>) {
    this.notifyPayload = payload;
    return this.verifyResult;
  }
}

const pagePayInput = {
  body: "{\"courseId\":\"course-1\",\"userId\":\"user-1\"}",
  notifyUrl: "https://api.example.com/api/v1/pay/notify",
  outTradeNo: "lark-order-1",
  subject: "Course",
  timeExpire: "2026-01-01 00:01:00",
  totalAmount: "99.00",
};

describe("Alipay adapter", () => {
  test("creates page pay params for the legacy Alipay trade API", () => {
    expect(createAlipayPagePayParams(pagePayInput)).toEqual({
      bizContent: {
        body: "{\"courseId\":\"course-1\",\"userId\":\"user-1\"}",
        out_trade_no: "lark-order-1",
        product_code: "FAST_INSTANT_TRADE_PAY",
        subject: "Course",
        time_expire: "2026-01-01 00:01:00",
        total_amount: "99.00",
      },
      notify_url: "https://api.example.com/api/v1/pay/notify",
    });
  });

  test("delegates checkout URL creation to the SDK", () => {
    const sdk = new MockAlipaySdk(true);
    const client = createAlipayClientFromSdk(sdk);

    const payUrl = client.createPagePayUrl(pagePayInput);

    expect(payUrl).toBe("alipay.trade.page.pay:GET:lark-order-1");
    expect(sdk.pagePayParams).toEqual(createAlipayPagePayParams(pagePayInput));
  });

  test("delegates notify signature verification to the SDK", () => {
    const sdk = new MockAlipaySdk(false);
    const client = createAlipayClientFromSdk(sdk);
    const payload = {
      out_trade_no: "lark-order-1",
      sign: "invalid-signature",
      sign_type: "RSA2",
    };

    expect(client.verifyNotify(payload)).toBe(false);
    expect(sdk.notifyPayload).toEqual(payload);
  });
});
