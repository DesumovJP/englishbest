/**
 * CalendarWidget — "today + upcoming sessions" HUD surface.
 *
 * Mini card for the kids dashboard top-left. Shows the current date and up to
 * three upcoming live sessions. Tap → opens `CalendarDialog` with the expanded
 * schedule. Kids module never navigates to the staff `/calendar` route.
 */
'use client';
import { useEffect, useState } from 'react';
import { HudCard } from '@/components/kids/ui';
import { fetchSessions, type Session } from '@/lib/sessions';

const MONTHS_UA = [
  'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
  'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру',
];
const WEEKDAYS_UA = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function formatSessionTime(startAt: string): string {
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatSessionDay(startAt: string, todayISO: string): string {
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return '';
  const iso = d.toISOString().slice(0, 10);
  if (iso === todayISO) return 'Сьогодні';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())} ${MONTHS_UA[d.getMonth()]}`;
}

function useSessions(enabled: boolean) {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetchSessions()
      .then(rows => {
        if (!alive) return;
        setSessions(rows);
      })
      .catch(() => {
        if (!alive) return;
        setSessions([]);
      });
    return () => { alive = false; };
  }, [enabled]);

  return sessions;
}

export function CalendarDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sessions = useSessions(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const dayNum = today.getDate();
  const monthAbbr = MONTHS_UA[today.getMonth()];
  const weekday = WEEKDAYS_UA[today.getDay()];

  const upcoming = (sessions ?? [])
    .filter(s => s.status === 'scheduled' || s.status === 'live')
    .filter(s => !!s.startAt && new Date(s.startAt).getTime() >= Date.now() - 60 * 60 * 1000)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Розклад занять"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[80vh] overflow-y-auto bg-white rounded-3xl shadow-card-md p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-muted hover:bg-border flex items-center justify-center transition-colors"
          aria-label="Закрити"
        >
          <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex flex-col items-center justify-center rounded-xl w-12 h-12 bg-danger shadow-press-danger">
            <span className="font-black text-white leading-none text-lg">{dayNum}</span>
            <span className="font-bold text-white/85 leading-none text-[8px]">{monthAbbr}</span>
          </div>
          <div>
            <h2 className="font-black text-ink text-lg leading-none">Мій розклад</h2>
            <p className="font-medium text-xs text-ink-muted mt-1">{weekday}, сьогодні</p>
          </div>
        </div>

        {sessions === null ? (
          <div className="flex flex-col gap-2">
            <div className="h-10 w-full rounded-xl bg-ink-faint/10 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-ink-faint/10 animate-pulse" />
            <div className="h-10 w-3/4 rounded-xl bg-ink-faint/10 animate-pulse" />
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-ink-muted font-medium py-6 text-center">
            Найближчих занять поки немає.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map(ev => (
              <div key={ev.documentId} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 bg-surface-muted">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-primary" />
                <p className="font-bold text-sm text-ink flex-1 truncate">{ev.title || 'Заняття'}</p>
                <p className="font-black text-xs text-ink-muted flex-shrink-0">
                  {formatSessionDay(ev.startAt, todayISO)} · {formatSessionTime(ev.startAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarWidget() {
  const [open, setOpen] = useState(false);
  const sessions = useSessions(true);

  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  const dayNum = today.getDate();
  const monthAbbr = MONTHS_UA[today.getMonth()];
  const weekday = WEEKDAYS_UA[today.getDay()];

  const upcomingPreview = (sessions ?? [])
    .filter(s => s.status === 'scheduled' || s.status === 'live')
    .filter(s => !!s.startAt && new Date(s.startAt).getTime() >= Date.now() - 60 * 60 * 1000)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 3);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full text-left active:scale-[0.97] transition-transform"
      >
        <HudCard className="p-2.5 sm:p-3.5 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-2.5">
            <div className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl flex-shrink-0 w-[36px] h-[36px] sm:w-[46px] sm:h-[46px] bg-danger shadow-press-danger">
              <span className="font-black text-white leading-none text-[15px] sm:text-[20px]">{dayNum}</span>
              <span className="font-bold text-white/85 leading-none text-[7px] sm:text-[8px]">{monthAbbr}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black leading-none text-[12px] sm:text-[15px] text-ink">Розклад</p>
              <p className="font-medium text-[9.5px] sm:text-[11px] text-ink-muted mt-0.5 truncate">{weekday}, сьогодні</p>
            </div>
            <span className="text-ink-muted text-sm">›</span>
          </div>

          {sessions === null ? (
            <div className="flex flex-col gap-1.5 [@media(max-height:500px)]:hidden">
              <div className="h-2.5 w-full rounded bg-ink-faint/15 animate-pulse" />
              <div className="h-2.5 w-3/4 rounded bg-ink-faint/15 animate-pulse" />
            </div>
          ) : upcomingPreview.length === 0 ? (
            <p className="font-medium text-[10.5px] sm:text-[11.5px] text-ink-faint [@media(max-height:500px)]:hidden">
              Поки подій немає
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 [@media(max-height:500px)]:hidden">
              {upcomingPreview.map(ev => (
                <div key={ev.documentId} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-primary" />
                  <p className="font-bold truncate text-[11.5px] text-ink flex-1">{ev.title || 'Заняття'}</p>
                  <p className="font-bold flex-shrink-0 text-[11px] text-ink-muted">
                    {formatSessionDay(ev.startAt, todayISO)} · {formatSessionTime(ev.startAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </HudCard>
      </button>

      <CalendarDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
