"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full px-3.5 py-2.5 rounded-xl border bg-surface-raised text-ink placeholder:text-ink-faint text-sm",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "resize-y min-h-24",
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
