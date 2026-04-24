import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** If true, renders with bottom hairline — typical for dashboard top bars. */
  bordered?: boolean;
  sticky?: boolean;
}

export function Toolbar({ bordered = false, sticky = false, className, ...rest }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(
        "flex items-center gap-3 flex-wrap py-3",
        bordered && "border-b border-border",
        sticky && "sticky top-0 z-sticky bg-surface",
        className,
      )}
      {...rest}
    />
  );
}
