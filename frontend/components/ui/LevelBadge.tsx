import { cn } from "@/lib/cn";

export type Level = "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

interface LevelBadgeProps {
  level: Level;
  size?: "sm" | "md";
  className?: string;
}

// Tints by CEFR band — A = green, B = blue, C = purple
const toneByLevel: Record<Level, string> = {
  A0: "bg-success/15 text-success-dark",
  A1: "bg-success/15 text-success-dark",
  A2: "bg-success/15 text-success-dark",
  B1: "bg-info/15 text-info-dark",
  B2: "bg-info/15 text-info-dark",
  C1: "bg-purple/15 text-purple-dark",
  C2: "bg-purple/15 text-purple-dark",
};

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-[11px] px-2 py-0.5",
};

export function LevelBadge({ level, size = "sm", className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-chip tracking-wide",
        toneByLevel[level],
        sizeClasses[size],
        className,
      )}
    >
      {level}
    </span>
  );
}
