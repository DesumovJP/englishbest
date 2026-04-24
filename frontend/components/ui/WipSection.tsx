import { cn } from "@/lib/cn";

interface WipSectionProps {
  title: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

/**
 * "В розробці" placeholder for features that exist in UI navigation but have
 * no backing data yet. NEVER accepts fake data — use it to communicate that a
 * section is intentionally unimplemented, not to hide broken state.
 *
 * Phase K rule: wherever mocks would otherwise appear in the runtime path,
 * render <WipSection> instead.
 */
export function WipSection({ title, description, className, compact = false }: WipSectionProps) {
  return (
    <div
      role="status"
      aria-label="Section in development"
      className={cn(
        "flex flex-col items-center justify-center text-center gap-2 rounded-card border border-dashed border-border bg-surface-subtle",
        compact ? "py-8 px-4" : "py-14 px-6",
        className,
      )}
    >
      <span className="type-label text-ink-faint">В розробці</span>
      <p className="type-h3 text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted max-w-md">{description}</p>}
    </div>
  );
}
