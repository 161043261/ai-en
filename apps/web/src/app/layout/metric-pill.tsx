import type { LucideIcon } from "lucide-react";

export type MetricPillProps = {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: number;
};

export function MetricPill({ icon: Icon, label, value }: MetricPillProps) {
  return (
    <div
      aria-label={label}
      className="badge badge-soft badge-primary gap-2 p-4"
    >
      <Icon aria-hidden="true" size={16} />
      <span className="font-bold">{value}</span>
    </div>
  );
}
