import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";
type Size = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  /** @deprecated use `tone` */
  variant?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  primary: "bg-primary/15 text-primary-dark",
  success: "bg-success/15 text-success-dark",
  warning: "bg-warning/15 text-warning-dark",
  danger: "bg-danger/15 text-danger-dark",
  info: "bg-info/15 text-info-dark",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-0.5 text-xs",
};

export function Badge({
  tone,
  variant,
  size = "md",
  className,
  children,
  ...rest
}: BadgeProps) {
  const t: Tone = tone ?? variant ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-chip font-semibold",
        toneClasses[t],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
