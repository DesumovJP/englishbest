/**
 * KidsProgressBar — thick gamified progress bar.
 *
 * Uses bg-xp-bar gradient utility from globals.css.
 * Height defaults to "md" (14px) — never thin like a standard bar.
 *
 * Usage:
 *   <KidsProgressBar value={240} max={1000} />
 *   <KidsProgressBar value={3} max={5} height="lg" showLabel />
 */

interface KidsProgressBarProps {
  value: number;
  max: number;
  height?: "sm" | "md" | "lg";
  /** Show "value / max" label above the bar */
  showLabel?: boolean;
  labelLeft?: string;
  labelRight?: string;
}

const HEIGHT: Record<NonNullable<KidsProgressBarProps["height"]>, string> = {
  sm: "h-2.5",
  md: "h-3.5",
  lg: "h-5",
};

export function KidsProgressBar({
  value,
  max,
  height = "md",
  showLabel = false,
  labelLeft,
  labelRight,
}: KidsProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5">
      {(showLabel || labelLeft || labelRight) && (
        <div className="flex justify-between">
          <span className="text-[11px] font-black text-ink-faint">
            {labelLeft ?? value}
          </span>
          <span className="text-[11px] font-black text-ink-faint">
            {labelRight ?? max}
          </span>
        </div>
      )}
      <div className={`w-full ${HEIGHT[height]} rounded-full overflow-hidden bg-border`}>
        <div
          className="h-full rounded-full bg-xp-bar transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
