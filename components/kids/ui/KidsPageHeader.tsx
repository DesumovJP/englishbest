/**
 * KidsPageHeader — sticky page header for kids pages.
 *
 * Layout: [back button] [title + subtitle] [right slot]
 * Back button is rendered only when `backHref` is provided.
 *
 * Usage:
 *   <KidsPageHeader
 *     title="Магазин 🛒"
 *     subtitle="Куплено 3 з 16"
 *     backHref="/kids/dashboard"
 *     right={<KidsCoinBadge amount={340} />}
 *   />
 */

import Link from "next/link";

interface KidsPageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  /** Rendered in the right slot (e.g. KidsCoinBadge) */
  right?: React.ReactNode;
  /** Extra classes on the outer wrapper */
  className?: string;
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

export function KidsPageHeader({
  title,
  subtitle,
  backHref,
  right,
  className = "",
}: KidsPageHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-20 bg-surface border-b-2 border-border ${className}`}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-muted text-ink-muted hover:text-ink transition-colors active:scale-90 shrink-0"
            aria-label="Назад"
          >
            <BackIcon />
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="font-black text-xl text-ink leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs font-bold text-ink-faint leading-none mt-0.5">{subtitle}</p>
          )}
        </div>

        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}
