import { describe, expect, test } from "vitest";
import { createPaymentConfigCheck } from "./payment-readiness.js";
import { createDependencyStatus } from "./readiness-types.js";

describe("payment readiness configuration", () => {
  test("allows disabled Alipay fallback without a shared secret", async () => {
    await expect(
      createPaymentConfigCheck({
        ALIPAY_APP_ID: "",
        ALIPAY_ENABLED: false,
        ALIPAY_GATEWAY: "",
        ALIPAY_NOTIFY_URL: "",
        ALIPAY_PRIVATE_KEY: "",
        ALIPAY_PUBLIC_KEY: "",
        PAYMENT_NOTIFY_SECRET: "",
      })(),
    ).resolves.toEqual(
      createDependencyStatus(
        "payment",
        true,
        "configured for internal fallback without shared secret",
      ),
    );
  });

  test("rejects enabled Alipay without credentials", async () => {
    await expect(
      createPaymentConfigCheck({
        ALIPAY_APP_ID: "",
        ALIPAY_ENABLED: true,
        ALIPAY_GATEWAY: "https://openapi.alipay.com/gateway.do",
        ALIPAY_NOTIFY_URL: "https://api.example.com",
        ALIPAY_PRIVATE_KEY: "",
        ALIPAY_PUBLIC_KEY: "",
        PAYMENT_NOTIFY_SECRET: "",
      })(),
    ).resolves.toEqual(
      createDependencyStatus(
        "payment",
        false,
        "missing Alipay keys: ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY",
      ),
    );
  });

  test("rejects enabled Alipay with invalid URLs", async () => {
    await expect(
      createPaymentConfigCheck({
        ALIPAY_APP_ID: "app-id",
        ALIPAY_ENABLED: true,
        ALIPAY_GATEWAY: "not-a-url",
        ALIPAY_NOTIFY_URL: "https://api.example.com",
        ALIPAY_PRIVATE_KEY: "private-key",
        ALIPAY_PUBLIC_KEY: "public-key",
        PAYMENT_NOTIFY_SECRET: "",
      })(),
    ).resolves.toEqual(
      createDependencyStatus("payment", false, "invalid Alipay URLs"),
    );
  });

  test("accepts enabled Alipay credentials", async () => {
    await expect(
      createPaymentConfigCheck({
        ALIPAY_APP_ID: "app-id",
        ALIPAY_ENABLED: true,
        ALIPAY_GATEWAY: "https://openapi.alipay.com/gateway.do",
        ALIPAY_NOTIFY_URL: "https://api.example.com",
        ALIPAY_PRIVATE_KEY: "private-key",
        ALIPAY_PUBLIC_KEY: "public-key",
        PAYMENT_NOTIFY_SECRET: "",
      })(),
    ).resolves.toEqual(
      createDependencyStatus("payment", true, "configured for alipay"),
    );
  });
});
