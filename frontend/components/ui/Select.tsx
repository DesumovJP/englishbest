"use client";

import { SelectHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  selectSize?: Size;
  invalid?: boolean;
  /** Optional shorthand; otherwise provide <option> children directly. */
  options?: readonly Option[];
  placeholder?: string;
  children?: ReactNode;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-9 pl-3 pr-9 text-sm",
  md: "h-10 pl-3.5 pr-10 text-sm",
  lg: "h-12 pl-4 pr-10 text-base",
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { selectSize = "md", invalid, options, placeholder, className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-xl border bg-surface-raised text-ink appearance-none cursor-pointer",
        "select-arrow-primary",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        sizeClasses[selectSize],
        invalid
          ? "border-danger focus:border-danger"
          : "border-border focus:border-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      aria-invalid={invalid || props["aria-invalid"]}
      {...props}
    >
      {placeholder !== undefined && (
        <option value="" disabled>{placeholder}</option>
      )}
      {options
        ? options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))
        : children}
    </select>
  );
});
