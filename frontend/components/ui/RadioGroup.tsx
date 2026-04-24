"use client";

import { ReactNode, useId } from "react";
import { cn } from "@/lib/cn";

interface RadioOption<T extends string = string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

interface RadioGroupProps<T extends string> {
  name?: string;
  value: T;
  onChange: (next: T) => void;
  options: readonly RadioOption<T>[];
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  orientation = "vertical",
  disabled,
  className,
  ariaLabel,
}: RadioGroupProps<T>) {
  const autoName = useId();
  const groupName = name ?? autoName;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className,
      )}
    >
      {options.map((opt) => {
        const isChecked = opt.value === value;
        const isDisabled = disabled || opt.disabled;
        return (
          <label
            key={opt.value}
            className={cn(
              "inline-flex items-start gap-2.5 p-2 rounded-lg cursor-pointer select-none",
              "hover:bg-surface-hover",
              isChecked && "bg-primary/5",
              isDisabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={opt.value}
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 w-4 h-4 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
            <span className="flex flex-col gap-0.5 leading-tight">
              <span className="text-sm font-medium text-ink">{opt.label}</span>
              {opt.description && (
                <span className="text-xs text-ink-muted">{opt.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
