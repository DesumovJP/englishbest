import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Side = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: Side;
  className?: string;
}

const sideClasses: Record<Side, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

/**
 * Hover/focus tooltip. Uses pure CSS (no positioning engine) — assumes the
 * trigger has space in the chosen direction. For dynamic positioning needs,
 * reach for @floating-ui/react case-by-case.
 */
export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  return (
    <span className={cn("relative inline-flex group", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "absolute z-overlay whitespace-nowrap pointer-events-none",
          "px-2 py-1 rounded-md bg-ink text-white text-xs font-medium",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          "transition-opacity duration-100",
          sideClasses[side],
        )}
      >
        {label}
      </span>
    </span>
  );
}
