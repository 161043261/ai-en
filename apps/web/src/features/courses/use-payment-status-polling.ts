import { useEffect } from "react";
import type { PayEndpoints } from "../../shared/api/pay-endpoints";

const defaultIntervalMs = 2_000;

export type PaymentStatusPollingOptions = {
  readonly api: PayEndpoints;
  readonly expiresAt: number | null;
  readonly intervalMs?: number;
  readonly isActive: boolean;
  readonly onExpire: () => void;
  readonly onFailure: () => void;
  readonly onSuccess: () => void;
  readonly outTradeNo: string | null;
};

export function usePaymentStatusPolling({
  api,
  expiresAt,
  intervalMs = defaultIntervalMs,
  isActive,
  onExpire,
  onFailure,
  onSuccess,
  outTradeNo,
}: PaymentStatusPollingOptions) {
  useEffect(() => {
    if (!isActive || !outTradeNo || !expiresAt) return undefined;
    let isCurrent = true;

    const checkStatus = async () => {
      if (Date.now() >= expiresAt) {
        onExpire();
        return;
      }
      try {
        const status = await api.getPaymentStatus(outTradeNo);
        if (!isCurrent) return;
        if (
          status.tradeStatus === "TRADE_SUCCESS" ||
          status.tradeStatus === "TRADE_FINISHED"
        ) {
          onSuccess();
        }
      } catch {
        if (isCurrent) onFailure();
      }
    };

    void checkStatus();
    const timerId = window.setInterval(() => void checkStatus(), intervalMs);
    return () => {
      isCurrent = false;
      window.clearInterval(timerId);
    };
  }, [
    api,
    expiresAt,
    intervalMs,
    isActive,
    onExpire,
    onFailure,
    onSuccess,
    outTradeNo,
  ]);
}
