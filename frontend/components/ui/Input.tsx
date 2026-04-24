"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  inputSize?: Size;
  invalid?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-3.5 text-sm",
  lg: "h-12 px-4 text-base",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { inputSize = "md", invalid, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border bg-surface-raised text-ink placeholder:text-ink-faint",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        sizeClasses[inputSize],
        invalid
          ? "border-danger focus:border-danger"
          : "border-border focus:border-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      aria-invalid={invalid || props["aria-invalid"]}
      {...props}
    />
  );
});
