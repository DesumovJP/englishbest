"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link" | "kids-cta";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: boolean;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none whitespace-nowrap";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-dark shadow-sm",
  secondary:
    "bg-surface-raised text-ink border border-border hover:bg-surface-hover",
  outline:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger:
    "bg-danger text-white hover:bg-danger-dark shadow-sm",
  link:
    "bg-transparent text-primary hover:text-primary-dark underline underline-offset-2 px-0",
  "kids-cta":
    "bg-primary text-white shadow-press-primary active:translate-y-1 active:shadow-press-sm rounded-2xl font-black",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

const iconSizeClasses: Record<Size, string> = {
  sm: "w-8 h-8 p-0 rounded-lg",
  md: "w-10 h-10 p-0 rounded-xl",
  lg: "w-12 h-12 p-0 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon = false,
    fullWidth = false,
    disabled,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        base,
        variantClasses[variant],
        icon ? iconSizeClasses[size] : sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        />
      )}
      {children}
    </button>
  );
});
