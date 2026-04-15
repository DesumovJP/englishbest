interface ProgressBarProps {
  current: number;
  total: number;
  tone?: "primary" | "accent" | "success" | "purple" | "secondary";
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  label?: string;
  className?: string;
}

const TONE: Record<NonNullable<ProgressBarProps["tone"]>, { bar: string; track: string; text: string }> = {
  primary:   { bar: "bg-primary",   track: "bg-primary/15",   text: "text-primary" },
  accent:    { bar: "bg-accent",    track: "bg-accent/15",    text: "text-accent-dark" },
  success:   { bar: "bg-success",   track: "bg-success/15",   text: "text-success-dark" },
  purple:    { bar: "bg-purple",    track: "bg-purple/15",    text: "text-purple-dark" },
  secondary: { bar: "bg-secondary", track: "bg-secondary/15", text: "text-secondary-dark" },
};

const HEIGHT: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

export function ProgressBar({
  current, total, tone = "primary", size = "md", showCount, label, className = "",
}: ProgressBarProps) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;
  const t = TONE[tone];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 rounded-full overflow-hidden ${HEIGHT[size]} ${t.track}`}
        role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full transition-[width] duration-500 ${t.bar}`} style={{ width: `${pct}%` }} />
      </div>
      {showCount && (
        <span className={`font-black flex-shrink-0 text-xs ${t.text}`}>
          {current}<span className="text-ink-faint font-medium">/{total}</span>
        </span>
      )}
    </div>
  );
}
