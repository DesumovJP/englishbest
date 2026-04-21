/**
 * KidsButton — 3D press-effect button for the kids section.
 *
 * Variants map directly to design tokens in globals.css.
 * The "press" shadow (0 5px 0 darker-shade) is applied via
 * `shadow-press-*` utilities; active:translate-y-1 simulates the press.
 *
 * Usage:
 *   <KidsButton>ПОЧАТИ УРОК 🎯</KidsButton>
 *   <KidsButton variant="secondary" size="sm">Купити</KidsButton>
 *   <KidsButton variant="accent" fullWidth>Зберегти</KidsButton>
 */

import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

export type KidsButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "purple"
  | "ghost";

export type KidsButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<KidsButtonVariant, string> = {
  primary:   "bg-primary   text-white shadow-press-primary   active:shadow-none",
  secondary: "bg-secondary text-white shadow-press-secondary active:shadow-none",
  accent:    "bg-accent    text-white shadow-press-accent    active:shadow-none",
  danger:    "bg-danger    text-white shadow-press-danger    active:shadow-none",
  purple:    "bg-purple    text-white shadow-press-purple    active:shadow-none",
  ghost:     "bg-surface-muted text-ink border-2 border-border",
};

const SIZE_CLASSES: Record<KidsButtonSize, string> = {
  sm: "py-2   px-4  text-sm  rounded-xl  font-black",
  md: "py-3   px-5  text-base rounded-2xl font-black",
  lg: "py-4   px-6  text-xl  rounded-2xl font-black",
};

interface BaseProps {
  variant?: KidsButtonVariant;
  size?: KidsButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

type LinkProps = BaseProps & { href: string; onClick?: never };

type KidsButtonProps = ButtonProps | LinkProps;

export function KidsButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: KidsButtonProps) {
  const base = [
    "inline-flex items-center justify-center gap-2 transition-transform active:translate-y-1 cursor-pointer select-none",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={base} {...(linkRest as object)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={base} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
