import type { Env } from "../../shared/config/env.js";
import { createAlipayClient } from "./alipay-adapter.js";

type AlipayEnv = Pick<
  Env,
  | "ALIPAY_APP_ID"
  | "ALIPAY_GATEWAY"
  | "ALIPAY_PRIVATE_KEY"
  | "ALIPAY_PUBLIC_KEY"
>;

export const createAlipayClientForEnv = (config: AlipayEnv) =>
  createAlipayClient({
    appId: config.ALIPAY_APP_ID,
    gateway: config.ALIPAY_GATEWAY,
    privateKey: config.ALIPAY_PRIVATE_KEY,
    publicKey: config.ALIPAY_PUBLIC_KEY,
  });
