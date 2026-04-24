"use client";

import { ReactNode, useId, cloneElement, isValidElement, ReactElement, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FormFieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Optional explicit id; otherwise generated via useId. */
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared wrapper that renders label + hint + error and wires them to the
 * control via `id` / `aria-describedby` / `aria-invalid`. The single child
 * must accept these props (as all native inputs do).
 */
export function FormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const inputId = htmlFor ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-err` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  type ControlProps = HTMLAttributes<HTMLElement> & { id?: string; "aria-invalid"?: boolean };
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<ControlProps>, {
        id: inputId,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error) || undefined,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          {label}
          {required && <span className="text-danger ml-0.5" aria-hidden>*</span>}
        </label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger-dark" role="alert">{error}</p>
      )}
    </div>
  );
}
