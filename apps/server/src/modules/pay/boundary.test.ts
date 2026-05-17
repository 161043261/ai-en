import { describe, expect, test } from "vitest";
import { isPaymentNotifyTrusted } from "./boundary.js";

describe("payment notify boundary", () => {
  test("allows callbacks when no shared secret is configured", () => {
    expect(isPaymentNotifyTrusted(undefined, "")).toBe(true);
  });

  test("rejects missing or invalid shared secrets when configured", () => {
    expect(isPaymentNotifyTrusted(undefined, "secret-1")).toBe(false);
    expect(isPaymentNotifyTrusted("wrong", "secret-1")).toBe(false);
  });

  test("accepts the configured shared secret", () => {
    expect(isPaymentNotifyTrusted("secret-1", "secret-1")).toBe(true);
  });
});
