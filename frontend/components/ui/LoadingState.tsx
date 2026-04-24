import { cn } from "@/lib/cn";

type Shape = "list" | "card" | "table" | "kids";

interface LoadingStateProps {
  shape?: Shape;
  rows?: number;
  className?: string;
}

const bar = "bg-surface-muted rounded-md animate-pulse";

export function LoadingState({ shape = "list", rows = 3, className }: LoadingStateProps) {
  return (
    <div role="status" aria-label="Loading" aria-live="polite" className={cn("w-full", className)}>
      {shape === "list" && (
        <ul className="flex flex-col gap-2">
          {Array.from({ length: rows }).map((_, i) => (
            <li key={i} className={cn(bar, "h-12")} />
          ))}
        </ul>
      )}
      {shape === "card" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={cn(bar, "h-36 rounded-card")} />
          ))}
        </div>
      )}
      {shape === "table" && (
        <div className="flex flex-col gap-1.5">
          <div className={cn(bar, "h-9")} />
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={cn(bar, "h-11")} />
          ))}
        </div>
      )}
      {shape === "kids" && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      )}
    </div>
  );
}
