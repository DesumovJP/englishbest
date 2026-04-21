import type { HTMLAttributes } from "react";

interface HudCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "frosted" | "flat";
  children: React.ReactNode;
}

export function HudCard({ variant = "frosted", className = "", children, ...rest }: HudCardProps) {
  const base = variant === "frosted" ? "hud-card" : "hud-card-flat";
  return (
    <div className={`${base} ${className}`} {...rest}>
      {children}
    </div>
  );
}
