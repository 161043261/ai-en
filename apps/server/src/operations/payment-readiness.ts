import { type Env, env } from "../shared/config/env.js";
import {
  createDependencyStatus,
  type ReadinessCheck,
} from "./readiness-types.js";

type PaymentReadinessEnv = Pick<
  Env,
  | "ALIPAY_APP_ID"
  | "ALIPAY_ENABLED"
  | "ALIPAY_GATEWAY"
  | "ALIPAY_NOTIFY_URL"
  | "ALIPAY_PRIVATE_KEY"
  | "ALIPAY_PUBLIC_KEY"
  | "PAYMENT_NOTIFY_SECRET"
>;

const hasUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const requiredAlipayKeys = [
  "ALIPAY_APP_ID",
  "ALIPAY_PRIVATE_KEY",
  "ALIPAY_PUBLIC_KEY",
] as const;

const getMissingAlipayKeys = (config: PaymentReadinessEnv) =>
  requiredAlipayKeys.filter((key) => config[key].length === 0);

export const createPaymentConfigCheck =
  (config: PaymentReadinessEnv = env): ReadinessCheck =>
  async () => {
    if (!config.ALIPAY_ENABLED) {
      return createDependencyStatus(
        "payment",
        true,
        config.PAYMENT_NOTIFY_SECRET.length === 0
          ? "configured for internal fallback without shared secret"
          : "configured for internal fallback with shared secret",
      );
    }

    const missingKeys = getMissingAlipayKeys(config);
    if (missingKeys.length > 0) {
      return createDependencyStatus(
        "payment",
        false,
        `missing Alipay keys: ${missingKeys.join(", ")}`,
      );
    }

    if (!hasUrl(config.ALIPAY_GATEWAY) || !hasUrl(config.ALIPAY_NOTIFY_URL)) {
      return createDependencyStatus("payment", false, "invalid Alipay URLs");
    }

    return createDependencyStatus("payment", true, "configured for alipay");
  };
