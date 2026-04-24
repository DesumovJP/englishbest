"use client";

import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Щось пішло не так",
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "py-10 px-6 text-center flex flex-col items-center gap-3 rounded-card border border-danger/20 bg-danger-soft/40",
        className,
      )}
    >
      <p className="type-h3 text-danger-dark">{title}</p>
      {description && <p className="text-sm text-ink-muted max-w-md">{description}</p>}
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Спробувати ще раз
        </Button>
      )}
    </div>
  );
}
