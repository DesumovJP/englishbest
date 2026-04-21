/**
 * KidsCard — base card primitive for the kids section.
 *
 * Variants:
 *   default  — white bg, border, card shadow
 *   hero     — green-to-blue gradient (companion area)
 *   special  — gold gradient (rare shop items)
 *   success  — light green (purchased / completed)
 *   flat     — surface-muted, no shadow (inner sections)
 */

export type KidsCardVariant = "default" | "hero" | "special" | "success" | "flat";

const VARIANT_CLASSES: Record<KidsCardVariant, string> = {
  default: "bg-surface border-2 border-border shadow-card",
  hero:    "bg-hero-kids",
  special: "bg-shop-rare border-2 border-coin",
  success: "bg-primary/5 border-2 border-primary/30",
  flat:    "bg-surface-muted",
};

interface KidsCardProps {
  variant?: KidsCardVariant;
  rounded?: "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  children: React.ReactNode;
}

export function KidsCard({
  variant = "default",
  rounded = "3xl",
  className = "",
  children,
}: KidsCardProps) {
  return (
    <div
      className={`rounded-${rounded} overflow-hidden ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
