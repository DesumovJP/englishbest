import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Trend = "up" | "down" | "flat";

interface KPICardProps {
  label: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
  trend?: Trend;
  icon?: ReactNode;
  /** Optional spark-line / mini-chart slot. */
  chart?: ReactNode;
  className?: string;
}

const trendClasses: Record<Trend, string> = {
  up: "text-success-dark",
  down: "text-danger-dark",
  flat: "text-ink-muted",
};

const trendArrow: Record<Trend, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

export function KPICard({ label, value, delta, trend, icon, chart, className }: KPICardProps) {
  return (
    <div className={cn("bg-surface-raised border border-border rounded-card p-4 flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="type-label text-ink-muted">{label}</span>
        {icon && <span className="text-ink-faint" aria-hidden>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-ink tabular-nums">{value}</span>
        {delta !== undefined && trend && (
          <span className={cn("text-xs font-semibold tabular-nums", trendClasses[trend])}>
            <span aria-hidden>{trendArrow[trend]}</span> {delta}
          </span>
        )}
      </div>
      {chart && <div className="mt-1">{chart}</div>}
    </div>
  );
}
