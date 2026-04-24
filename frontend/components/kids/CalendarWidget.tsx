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

const MONTHS_FULL_UA = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];
const WEEK_HEADER_UA = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function toISODay(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildMonthGrid(year: number, month: number): Array<{ iso: string; date: Date; inMonth: boolean }> {
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = Monday
  const startDate = new Date(year, month, 1 - firstWeekday);
  const cells: Array<{ iso: string; date: Date; inMonth: boolean }> = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    cells.push({ iso: toISODay(d), date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

export function CalendarDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sessions = useSessions(open);
  const today = new Date();
  const todayISO = toISODay(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedISO, setSelectedISO] = useState(todayISO);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
      setSelectedISO(toISODay(now));
    }
  }, [open]);

  if (!open) return null;

  const grid = buildMonthGrid(viewYear, viewMonth);
  const activeSessions = (sessions ?? []).filter(s => s.status === 'scheduled' || s.status === 'live');
  const daysWithSession = new Set(
    activeSessions
      .map(s => (s.startAt ? toISODay(new Date(s.startAt)) : null))
      .filter((x): x is string => !!x),
  );
  const daySessions = activeSessions
    .filter(s => s.startAt && toISODay(new Date(s.startAt)) === selectedISO)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  function prevMonth() {
    const m = viewMonth - 1;
    if (m < 0) { setViewMonth(11); setViewYear(viewYear - 1); } else { setViewMonth(m); }
  }
  function nextMonth() {
    const m = viewMonth + 1;
    if (m > 11) { setViewMonth(0); setViewYear(viewYear + 1); } else { setViewMonth(m); }
  }

  const selectedDate = new Date(selectedISO + 'T00:00:00');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Розклад занять"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-card-md flex flex-col sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-surface-muted hover:bg-border flex items-center justify-center transition-colors"
          aria-label="Закрити"
        >
          <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-border">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-full bg-surface-muted hover:bg-border flex items-center justify-center"
              aria-label="Попередній місяць"
            >
              <svg className="w-3.5 h-3.5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <h2 className="font-black text-ink text-base">
              {MONTHS_FULL_UA[viewMonth]} {viewYear}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-full bg-surface-muted hover:bg-border flex items-center justify-center"
              aria-label="Наступний місяць"
            >
              <svg className="w-3.5 h-3.5 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEK_HEADER_UA.map(w => (
              <div key={w} className="text-[10px] font-black uppercase text-ink-faint text-center py-1">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map(cell => {
              const isToday = cell.iso === todayISO;
              const isSelected = cell.iso === selectedISO;
              const hasSession = daysWithSession.has(cell.iso);
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => setSelectedISO(cell.iso)}
                  className={[
                    'relative aspect-square rounded-lg text-[12px] font-black flex items-center justify-center transition-colors',
                    !cell.inMonth ? 'text-ink-faint/50' : 'text-ink',
                    isSelected
                      ? 'bg-primary text-white'
                      : isToday
                        ? 'bg-primary/15 text-primary-dark'
                        : 'hover:bg-surface-muted',
                  ].join(' ')}
                  aria-pressed={isSelected}
                >
                  {cell.date.getDate()}
                  {hasSession && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-danger" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 p-5 sm:p-6 overflow-y-auto min-h-[220px]">
          <div className="mb-3">
            <p className="font-black uppercase tracking-widest text-[10px] text-ink-faint">
              {selectedISO === todayISO ? 'Сьогодні' : WEEKDAYS_UA[selectedDate.getDay()]}
            </p>
            <h3 className="font-black text-ink text-base mt-0.5">
              {selectedDate.getDate()} {MONTHS_FULL_UA[selectedDate.getMonth()]}
            </h3>
          </div>

          {sessions === null ? (
            <div className="flex flex-col gap-2">
              <div className="h-10 w-full rounded-xl bg-ink-faint/10 animate-pulse" />
              <div className="h-10 w-full rounded-xl bg-ink-faint/10 animate-pulse" />
            </div>
          ) : daySessions.length === 0 ? (
            <p className="text-sm text-ink-muted font-medium py-4">
              У цей день занять немає.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {daySessions.map(ev => (
                <li
                  key={ev.documentId}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 bg-surface-muted"
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-ink truncate">{ev.title || 'Заняття'}</p>
                    <p className="font-bold text-[11px] text-ink-muted mt-0.5">
                      {formatSessionTime(ev.startAt)}
                      {ev.status === 'live' ? ' · в ефірі' : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
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
