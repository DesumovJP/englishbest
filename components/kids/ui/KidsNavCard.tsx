/**
 * KidsNavCard — large 3D colored navigation tile.
 * Used in grids on dashboard and other kids pages.
 *
 * Color pairs reference design token values:
 *   primary   → bg-primary   + shadow-press-primary
 *   secondary → bg-secondary + shadow-press-secondary
 *   accent    → bg-accent    + shadow-press-accent
 *   danger    → bg-danger    + shadow-press-danger
 *   purple    → bg-purple    + shadow-press-purple
 *
 * Usage:
 *   <KidsNavCard href="/kids/room" emoji="🏠" label="Кімната" color="secondary" />
 */

import Link from "next/link";
import type { KidsButtonVariant } from "./KidsButton";

type NavCardColor = Exclude<KidsButtonVariant, "ghost">;

const COLOR_CLASSES: Record<NavCardColor, string> = {
  primary:   "bg-primary   shadow-press-primary",
  secondary: "bg-secondary shadow-press-secondary",
  accent:    "bg-accent    shadow-press-accent",
  danger:    "bg-danger    shadow-press-danger",
  purple:    "bg-purple    shadow-press-purple",
};

interface KidsNavCardProps {
  href: string;
  emoji: string;
  label: string;
  color?: NavCardColor;
  className?: string;
}

export function KidsNavCard({
  href,
  emoji,
  label,
  color = "primary",
  className = "",
}: KidsNavCardProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center py-7 gap-2 rounded-2xl text-white transition-transform active:translate-y-1 ${COLOR_CLASSES[color]} ${className}`}
    >
      <span className="text-4xl drop-shadow">{emoji}</span>
      <span className="font-black text-sm">{label}</span>
    </Link>
  );
}
