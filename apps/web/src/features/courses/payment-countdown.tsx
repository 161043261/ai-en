import { useEffect, useMemo, useState } from "react";

export type PaymentCountdownProps = {
  readonly expiresAt: number;
  readonly onExpire: () => void;
};

function formatRemaining(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const nextSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(nextSeconds).padStart(2, "0")}`;
}

export function PaymentCountdown({
  expiresAt,
  onExpire,
}: PaymentCountdownProps) {
  const [now, setNow] = useState(() => Date.now());
  const remaining = expiresAt - now;
  const label = useMemo(() => formatRemaining(remaining), [remaining]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return undefined;
    }
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [onExpire, remaining]);

  return (
    <div className="stat rounded-box bg-warning/10">
      <div className="stat-title">Payment window</div>
      <div className="stat-value text-warning">{label}</div>
    </div>
  );
}
