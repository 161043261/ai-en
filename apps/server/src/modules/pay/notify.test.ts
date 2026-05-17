import { describe, expect, test } from "vitest";
import type { AlipayClient } from "./alipay-adapter.js";
import {
  parsePaymentNotifyInput,
  parseVerifiedAlipayNotifyInput,
} from "./notify.js";

const createAlipayClient = (verified: boolean): AlipayClient => ({
  createPagePayUrl: () => "",
  verifyNotify: () => verified,
});

describe("payment notify parsing", () => {
  test("parses a mocked callback form", () => {
    const callbackForm = {
      body: JSON.stringify({
        userId: "user-1",
        courseId: "course-1",
      }),
      gmt_payment: "2026-01-01T00:00:00.000Z",
      out_trade_no: "lark-123456789012",
      total_amount: "19.90",
      trade_no: "202601012200000000000001",
      trade_status: "TRADE_SUCCESS",
    };

    expect(parsePaymentNotifyInput(callbackForm)).toEqual({
      outTradeNo: "lark-123456789012",
      tradeNo: "202601012200000000000001",
      gmtPayment: "2026-01-01T00:00:00.000Z",
      userId: "user-1",
      courseId: "course-1",
    });
  });

  test("rejects callbacks with malformed business body", () => {
    expect(
      parsePaymentNotifyInput({
        body: "{not-json",
        gmt_payment: "2026-01-01T00:00:00.000Z",
        out_trade_no: "lark-123456789012",
        trade_no: "202601012200000000000001",
        trade_status: "TRADE_SUCCESS",
      }),
    ).toBeNull();
  });

  test("rejects callbacks with unsupported trade status", () => {
    expect(
      parsePaymentNotifyInput({
        body: JSON.stringify({
          userId: "user-1",
          courseId: "course-1",
        }),
        gmt_payment: "2026-01-01T00:00:00.000Z",
        out_trade_no: "lark-123456789012",
        trade_no: "202601012200000000000001",
        trade_status: "WAIT_BUYER_PAY",
      }),
    ).toBeNull();
  });

  test("requires a valid Alipay signature before parsing callback data", () => {
    const callbackForm = {
      body: JSON.stringify({
        userId: "user-1",
        courseId: "course-1",
      }),
      gmt_payment: "2026-01-01T00:00:00.000Z",
      out_trade_no: "lark-123456789012",
      sign: "invalid-signature",
      sign_type: "RSA2",
      trade_no: "202601012200000000000001",
      trade_status: "TRADE_SUCCESS",
    };

    expect(
      parseVerifiedAlipayNotifyInput(callbackForm, createAlipayClient(false)),
    ).toBeNull();
    expect(
      parseVerifiedAlipayNotifyInput(callbackForm, createAlipayClient(true)),
    ).toEqual({
      outTradeNo: "lark-123456789012",
      tradeNo: "202601012200000000000001",
      gmtPayment: "2026-01-01T00:00:00.000Z",
      userId: "user-1",
      courseId: "course-1",
    });
  });
});
