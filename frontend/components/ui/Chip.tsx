"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  tone?: Tone;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

const toneWhenSelected: Record<Tone, string> = {
  neutral: "bg-ink text-white border-ink",
  primary: "bg-primary text-white border-primary",
  success: "bg-success text-white border-success",
  warning: "bg-warning text-white border-warning",
  danger: "bg-danger text-white border-danger",
  info: "bg-info text-white border-info",
};

const sizeClasses = {
  sm: "h-7 px-3 text-xs",
  md: "h-8 px-3.5 text-sm",
};

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected = false, tone = "primary", size = "md", icon, className, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip border font-semibold transition-colors whitespace-nowrap cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        sizeClasses[size],
        selected
          ? toneWhenSelected[tone]
          : "bg-surface-raised text-ink-muted border-border hover:text-ink hover:bg-surface-hover",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
});
