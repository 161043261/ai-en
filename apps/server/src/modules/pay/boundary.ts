export const paymentNotifySecretHeader = "x-payment-notify-secret";

export const isPaymentNotifyTrusted = (
  providedSecret: string | undefined,
  expectedSecret: string,
) => expectedSecret.length === 0 || providedSecret === expectedSecret;
