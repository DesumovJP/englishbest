/**
 * Tiny className joiner — filters falsy, joins with single space.
 * Kept dep-free (no clsx / tailwind-merge) to keep bundle lean.
 *
 * Usage:
 *   cn("base", isActive && "active", className)
 *   cn(["row", idx === 0 && "first"])
 */
export function cn(...parts: Array<string | false | null | undefined | readonly (string | false | null | undefined)[]>): string {
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (typeof p === "string") {
      out.push(p);
    } else {
      for (const q of p) if (q) out.push(q);
    }
  }
  return out.join(" ");
}
