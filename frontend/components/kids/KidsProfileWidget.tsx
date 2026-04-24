/**
 * KidsProfileWidget — floating "Профіль" card in the bottom-right of every
 * /kids/* page. Shows the signed-in student's name + a logout button.
 *
 * Replaces the older top-right ⚙️ settings gear (KidsSettingsMenu) — the
 * gear was overlapping the ContinueLessonWidget on desktop, and students
 * only ever needed it to log out.
 *
 * Sits above KidsFooter (which is fixed bottom-0 with safe-area padding).
 * Compact on mobile: circle avatar + logout icon only. Desktop widens the
 * card to also render the student's first name.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';

export function KidsProfileWidget() {
  const { session, logout } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!session) return null;

  const name = session.profile.firstName || session.user.username || 'Учень';
  const initial = (name[0] ?? 'У').toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className="fixed z-50 bottom-[calc(env(safe-area-inset-bottom,0px)+156px)] right-2 sm:bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] sm:right-3 flex flex-col items-end gap-2"
    >
      {open && (
        <div
          role="menu"
          className="w-56 rounded-2xl bg-surface-raised shadow-overlay border border-border overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-primary text-white font-black text-base flex items-center justify-center flex-shrink-0">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="font-black text-sm text-ink truncate">{name}</p>
              <p className="font-bold text-[10.5px] uppercase tracking-wider text-ink-faint mt-0.5">
                Учень
              </p>
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm font-bold text-danger hover:bg-danger/5 disabled:opacity-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {loggingOut ? 'Вихід…' : 'Вийти з акаунту'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Профіль"
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          'flex items-center rounded-full bg-surface-raised/95 backdrop-blur-md shadow-card-md border border-border/50 transition-transform active:scale-95',
          // Mobile: compact (just the avatar circle, ~44px tall)
          'gap-0 px-1 py-1',
          // Desktop: expanded pill with name + chevron
          'sm:gap-2 sm:pl-1 sm:pr-3 sm:py-1',
        ].join(' ')}
      >
        <span className="w-9 h-9 rounded-full bg-primary text-white font-black text-base flex items-center justify-center flex-shrink-0">
          {initial}
        </span>
        <span className="hidden sm:inline font-black text-[13px] text-ink max-w-[120px] truncate">
          {name}
        </span>
        <svg
          className={`hidden sm:block w-3.5 h-3.5 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}
