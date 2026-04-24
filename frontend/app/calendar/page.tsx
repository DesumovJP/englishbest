/**
 * /calendar — персональний календар сесій.
 *
 * BE-scoping (`api::session.session`):
 *   - teacher → свої сесії
 *   - student (kids/adult) → сесії, де учасник — сам
 *   - parent  → сесії, де учасник — дитина з `parentalConsentBy`
 *   - admin   → всі сесії
 *
 * Клієнт просто викликає `fetchSessions()` — scoping робиться на BE.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { CalendarGrid } from '@/components/molecules/CalendarGrid';
import { fetchSessions, splitStartAt, type Session, type SessionStatus } from '@/lib/sessions';

const STATUS_BG: Record<SessionStatus, string> = {
  scheduled: 'bg-primary',
  live:      'bg-success',
  completed: 'bg-surface-muted text-ink-muted',
  cancelled: 'bg-danger',
  'no-show': 'bg-warning',
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: 'Заплановано',
  live:      'У процесі',
  completed: 'Завершено',
  cancelled: 'Скасовано',
  'no-show': 'Не з’явився',
};

function isUpcoming(s: SessionStatus) {
  return s === 'scheduled' || s === 'live';
}
function isPast(s: SessionStatus) {
  return s === 'completed' || s === 'cancelled' || s === 'no-show';
}

export default function CalendarPage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [selected, setSelected] = useState<Session | null>(null);

  useEffect(() => {
    let alive = true;
    setSessions(null);
    setError(null);
    fetchSessions()
      .then((rows) => { if (alive) setSessions(rows); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'failed'); });
    return () => { alive = false; };
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessions ?? []) {
      const { date } = splitStartAt(s.startAt);
      if (!date) continue;
      const arr = map.get(date) ?? [];
      arr.push(s);
      map.set(date, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.startAt.localeCompare(b.startAt));
    }
    return map;
  }, [sessions]);

  const upcomingCount = (sessions ?? []).filter((s) => isUpcoming(s.status)).length;
  const completedCount = (sessions ?? []).filter((s) => isPast(s.status)).length;

  const now = new Date();
  const initialYear = now.getFullYear();
  const initialMonth = now.getMonth();

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-ink">Календар</h1>
        <p className="text-ink-muted mt-0.5 text-sm">
          {sessions === null && !error ? (
            'Завантаження…'
          ) : error ? (
            <span className="text-danger">Не вдалось завантажити</span>
          ) : (
            <>
              <span className="font-semibold text-primary-dark">{upcomingCount} запланованих</span>
              {' · '}{completedCount} завершених
            </>
          )}
        </p>
      </div>

      <CalendarGrid
        initialYear={initialYear}
        initialMonth={initialMonth}
        renderDay={({ dateStr }) => {
          const dayEvents = byDate.get(dateStr) ?? [];
          return (
            <>
              {dayEvents.slice(0, 2).map((ev) => {
                const { time } = splitStartAt(ev.startAt);
                const completed = isPast(ev.status);
                return (
                  <button
                    key={ev.documentId}
                    onClick={() => setSelected(ev)}
                    className={`w-full text-left px-1.5 py-1 rounded-lg text-xs font-bold leading-tight truncate transition-opacity hover:opacity-80 ${
                      completed
                        ? 'bg-surface-muted text-ink-muted'
                        : `${STATUS_BG[ev.status]} text-white`
                    }`}
                  >
                    {time} {ev.title || 'Урок'}
                  </button>
                );
              })}
              {dayEvents.length > 2 && (
                <span className="text-xs text-ink-muted font-semibold">
                  +{dayEvents.length - 2}
                </span>
              )}
            </>
          );
        }}
        footer={
          <div className="flex items-center gap-4 px-5 py-3 bg-surface-muted flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
              Запланований
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-muted border border-border flex-shrink-0" />
              Завершений
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0" />
              Сьогодні
            </div>
          </div>
        }
      />

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                {selected.course?.title && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark">
                    {selected.course.title}
                  </span>
                )}
                <h3 className="font-black text-ink text-lg mt-2">
                  {selected.title || 'Урок'}
                </h3>
                {selected.teacher?.displayName && (
                  <p className="text-sm text-ink-muted">
                    👩‍🏫 {selected.teacher.displayName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Закрити"
                className="text-ink-muted hover:text-ink flex-shrink-0 mt-1"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2 text-sm text-ink-muted">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{formatWhen(selected.startAt)} · {selected.durationMin} хв</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPast(selected.status)
                      ? 'bg-ink-faint'
                      : selected.status === 'live'
                        ? 'bg-success'
                        : 'bg-primary'
                  }`}
                />
                <span
                  className={`font-semibold ${
                    isPast(selected.status) ? 'text-ink-muted' : 'text-primary-dark'
                  }`}
                >
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>
              {selected.attendees.length > 0 && (
                <div className="flex items-start gap-2">
                  <span>👥</span>
                  <span>
                    {selected.attendees
                      .slice(0, 4)
                      .map((a) => a.displayName)
                      .join(', ')}
                    {selected.attendees.length > 4 ? ` +${selected.attendees.length - 4}` : ''}
                  </span>
                </div>
              )}
            </div>

            {isUpcoming(selected.status) && selected.joinUrl && (
              <a
                href={selected.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3 rounded-xl font-black text-sm bg-gradient-to-br from-primary to-primary-dark text-white hover:opacity-90 transition-opacity"
              >
                Приєднатись до уроку →
              </a>
            )}
            {selected.status === 'completed' && selected.recordingUrl && (
              <a
                href={selected.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3 rounded-xl font-black text-sm bg-surface-muted text-ink hover:bg-border transition-colors"
              >
                Переглянути запис →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatWhen(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
