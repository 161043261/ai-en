import { useCallback, useEffect, useState } from "react";
import type { Course } from "../../shared/api/course-schema";
import { useAppServices } from "../../app/use-app-services";
import { createCourseImageUrl } from "./course-image";
import { PaymentCountdown } from "./payment-countdown";
import { openCheckoutWindow } from "./payment-window";
import { usePaymentStatusPolling } from "./use-payment-status-polling";

export type PaymentDialogProps = {
  readonly close: () => void;
  readonly course: Course | null;
  readonly isOpen: boolean;
  readonly onSuccess: () => void;
};

export function PaymentDialog({
  close,
  course,
  isOpen,
  onSuccess,
}: PaymentDialogProps) {
  const { api, config, socketLifecycle } = useAppServices();
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetOrder = useCallback(() => {
    setError(null);
    setExpiresAt(null);
    setIsPaying(false);
    setOutTradeNo(null);
    setSuccess(null);
  }, []);

  const handleClose = useCallback(() => {
    resetOrder();
    close();
  }, [close, resetOrder]);

  const handlePaymentSuccess = useCallback(() => {
    if (!isPaying && !outTradeNo) return;
    setError(null);
    setExpiresAt(null);
    setIsPaying(false);
    setOutTradeNo(null);
    setSuccess("Payment completed. Your courses are refreshed.");
    onSuccess();
  }, [isPaying, onSuccess, outTradeNo]);

  const handlePaymentExpire = useCallback(() => {
    setError("Payment expired. Please create a new order.");
    setExpiresAt(null);
    setIsPaying(false);
    setOutTradeNo(null);
  }, []);

  const handlePollingFailure = useCallback(() => {
    setError("Unable to verify payment status. Waiting for confirmation.");
  }, []);

  useEffect(() => {
    const socket = socketLifecycle.getSocket();
    if (!isOpen || !socket) return undefined;
    socket.on("paymentSuccess", handlePaymentSuccess);
    return () => socket.off("paymentSuccess", handlePaymentSuccess);
  }, [handlePaymentSuccess, isOpen, socketLifecycle]);

  useEffect(() => {
    if (isOpen) return;
    resetOrder();
  }, [isOpen, resetOrder]);

  usePaymentStatusPolling({
    api: api.pay,
    expiresAt,
    isActive: isOpen && isPaying,
    onExpire: handlePaymentExpire,
    onFailure: handlePollingFailure,
    onSuccess: handlePaymentSuccess,
    outTradeNo,
  });

  const confirm = async () => {
    if (!course) return;
    setError(null);
    setSuccess(null);
    setIsPaying(true);
    try {
      const result = await api.pay.createPay({
        body: course.description ?? course.name,
        courseId: course.id,
        subject: course.name,
        totalAmount: Number(course.price),
      });
      setExpiresAt(result.timeExpire);
      setOutTradeNo(result.outTradeNo);
      if (result.payUrl) openCheckoutWindow(result.payUrl);
    } catch {
      setError("Unable to create payment order. Please try again.");
      setIsPaying(false);
    }
  };

  return (
    <dialog className="modal" open={isOpen}>
      <div className="modal-box max-w-lg">
        <h2 className="text-2xl font-black">Confirm purchase</h2>
        {course ? (
          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-box bg-base-200 flex gap-4 p-4">
              <img
                alt={course.name}
                className="rounded-box size-24 object-cover"
                src={createCourseImageUrl(config.serverApiBaseUrl, course.url)}
              />
              <div className="min-w-0">
                <h3 className="font-bold">{course.name}</h3>
                <p className="text-base-content/60 text-sm">{course.teacher}</p>
              </div>
            </div>
            <div className="alert alert-info">
              <span>Total amount: ¥{course.price}</span>
            </div>
            {expiresAt ? (
              <PaymentCountdown
                expiresAt={expiresAt}
                onExpire={handlePaymentExpire}
              />
            ) : null}
            {error ? <div className="alert alert-error">{error}</div> : null}
            {success ? (
              <div className="alert alert-success">{success}</div>
            ) : null}
          </div>
        ) : null}
        <div className="modal-action">
          <button className="btn" onClick={handleClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={isPaying}
            onClick={confirm}
            type="button"
          >
            {isPaying ? "Waiting for payment" : "Create order"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
