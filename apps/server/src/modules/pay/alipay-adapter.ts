import { AlipaySdk } from "alipay-sdk";

export interface AlipayClientConfig {
  readonly appId: string;
  readonly privateKey: string;
  readonly publicKey: string;
  readonly gateway: string;
}

export interface AlipayPagePayInput {
  readonly outTradeNo: string;
  readonly totalAmount: string;
  readonly subject: string;
  readonly body: string;
  readonly timeExpire: string;
  readonly notifyUrl: string;
}

export interface AlipayPagePayParams {
  readonly bizContent: {
    readonly out_trade_no: string;
    readonly total_amount: string;
    readonly subject: string;
    readonly body: string;
    readonly product_code: "FAST_INSTANT_TRADE_PAY";
    readonly time_expire: string;
  };
  readonly notify_url: string;
}

export interface AlipaySdkLike {
  pageExecute(
    method: "alipay.trade.page.pay",
    httpMethod: "GET",
    params: AlipayPagePayParams,
  ): string;
  checkNotifySignV2(payload: Readonly<Record<string, string>>): boolean;
}

export interface AlipayClient {
  createPagePayUrl(input: AlipayPagePayInput): string;
  verifyNotify(payload: Readonly<Record<string, string>>): boolean;
}

export const createAlipayPagePayParams = (
  input: AlipayPagePayInput,
): AlipayPagePayParams => ({
  bizContent: {
    out_trade_no: input.outTradeNo,
    total_amount: input.totalAmount,
    subject: input.subject,
    body: input.body,
    product_code: "FAST_INSTANT_TRADE_PAY",
    time_expire: input.timeExpire,
  },
  notify_url: input.notifyUrl,
});

export const createAlipayClientFromSdk = (
  sdk: AlipaySdkLike,
): AlipayClient => ({
  createPagePayUrl: (input) =>
    sdk.pageExecute(
      "alipay.trade.page.pay",
      "GET",
      createAlipayPagePayParams(input),
    ),
  verifyNotify: (payload) => sdk.checkNotifySignV2(payload),
});

export const createAlipayClient = (
  config: AlipayClientConfig,
): AlipayClient => {
  const sdk = new AlipaySdk({
    alipayPublicKey: config.publicKey,
    appId: config.appId,
    gateway: config.gateway,
    privateKey: config.privateKey,
  });

  return createAlipayClientFromSdk(sdk);
};
