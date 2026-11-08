"use client";

type StatusTone = "success" | "warning" | "danger" | "neutral";

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
};

const toneClasses: Record<StatusTone, string> = {
  success: "status-assigned",
  warning: "status-maintenance",
  danger: "status-retired",
  neutral: "status-available",
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${toneClasses[tone]}`}>
      <span className="status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
