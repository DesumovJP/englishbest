/**
 * KidsSettingsMenu — floating ⚙️ button in the top-right of every /kids/* page.
 *
 * Opens a small popover with the signed-in user's name + a logout button.
 * Kids/adult accounts can't reach /dashboard/profile (the staff logout surface
 * bounces them away), so this is their only logout path inside /kids/*.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';

export function KidsSettingsMenu() {
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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!session) return null;

  const name = session.profile.firstName || session.user.username || 'Учень';
  const role = session.profile.role;

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
      className="fixed z-50 top-[calc(env(safe-area-inset-top,0px)+8px)] right-2 sm:top-4 sm:right-4"
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Налаштування"
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-11 h-11 rounded-full bg-white/85 backdrop-blur-md shadow-card-md flex items-center justify-center active:scale-95 transition-transform hover:bg-white"
      >
        <svg className="w-5 h-5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card-md border border-border overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="font-black text-sm text-ink truncate">{name}</p>
            <p className="font-bold text-[11px] uppercase tracking-wider text-ink-faint mt-0.5">{role}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm font-bold text-danger hover:bg-danger/5 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {loggingOut ? 'Вихід…' : 'Вийти з акаунту'}
          </button>
        </div>
      )}
    </div>
  );
}
