/**
 * /dashboard/teacher-calendar — teacher's own calendar, live.
 *
 * Week-at-a-glance grid keyed by day. Sessions come from `fetchSessions()`;
 * the `api::session.session` controller scopes by role (teacher sees own).
 * Click a session → LessonActionSheet (update/cancel/delete in place).
 * "+ Урок" → CreateLessonModal with the clicked day/time as defaults.
 */
'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardPageShell } from '@/components/ui/shells';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import { CreateLessonModal } from '@/components/teacher/CreateLessonModal';
import { LessonActionSheet } from '@/components/teacher/LessonActionSheet';
import {
  fetchSessions,
  splitStartAt,
  type Session,
  type SessionStatus,
} from '@/lib/sessions';

type View = 'week' | 'day';

const VIEW_OPTIONS: ReadonlyArray<SegmentedControlOption<View>> = [
  { value: 'week', label: 'Тиждень' },
  { value: 'day',  label: 'День' },
];

const STATUS_DOT: Record<SessionStatus, string> = {
  scheduled: 'bg-primary',
  live:      'bg-success',
  completed: 'bg-ink-muted',
  cancelled: 'bg-danger',
  'no-show': 'bg-warning',
};

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function startOfWeek(d: Date): Date {
  const out = startOfDay(d);
  const day = out.getDay();
  const diff = (day + 6) % 7; // Monday as first day
  out.setDate(out.getDate() - diff);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function toIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

function formatRangeLabel(start: Date, end: Date): string {
  const s = start.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  const e = end.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} — ${e}`;
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function TeacherCalendarPage() {
  const [view, setView] = useState<View>('week');
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{ date?: string; time?: string }>({});
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const range = useMemo(() => {
    if (view === 'day') {
      const start = startOfDay(anchor);
      const end = addDays(start, 1);
      return { start, end };
    }
    const start = startOfWeek(anchor);
    const end = addDays(start, 7);
    return { start, end };
  }, [anchor, view]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSessions({
        fromISO: range.start.toISOString(),
        toISO: range.end.toISOString(),
      });
      setSessions(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'failed');
    } finally {
      setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await fetchSessions({
          fromISO: range.start.toISOString(),
          toISO: range.end.toISOString(),
        });
        if (!alive) return;
        setSessions(rows);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [range.start, range.end]);

  const days = useMemo(() => {
    const count = view === 'day' ? 1 : 7;
    return Array.from({ length: count }, (_, i) => addDays(range.start, i));
  }, [range.start, view]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const d of days) map.set(toIsoDate(d), []);
    for (const s of sessions) {
      const d = new Date(s.startAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = toIsoDate(d);
      const bucket = map.get(key);
      if (bucket) bucket.push(s);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.startAt.localeCompare(b.startAt));
    }
    return map;
  }, [days, sessions]);

  function shiftRange(direction: -1 | 1) {
    const step = view === 'day' ? 1 : 7;
    setAnchor(prev => addDays(prev, step * direction));
  }

  function goToday() {
    setAnchor(startOfDay(new Date()));
  }

  function openCreate(date?: Date, time?: string) {
    setCreateDefaults({
      date: date ? toIsoDate(date) : toIsoDate(anchor),
      time: time ?? '16:00',
    });
    setCreateOpen(true);
  }

  function handleCreated() {
    setCreateOpen(false);
    load();
  }

  function handleSessionChanged(next: Session) {
    setSessions(prev => prev.map(s => (s.documentId === next.documentId ? next : s)));
    setSelectedSession(next);
  }

  function handleSessionDeleted(documentId: string) {
    setSessions(prev => prev.filter(s => s.documentId !== documentId));
    setSelectedSession(null);
  }

  const rangeLabel =
    view === 'day'
      ? formatDayLabel(range.start)
      : formatRangeLabel(range.start, addDays(range.start, 6));

  const shellStatus: 'loading' | 'error' | 'empty' | 'ready' =
    error ? 'error'
    : loading ? 'loading'
    : sessions.length === 0 ? 'empty'
    : 'ready';

  return (
    <>
      <DashboardPageShell
        title="Розклад вчителя"
        subtitle={rangeLabel}
        actions={
          <Button onClick={() => openCreate()}>+ Урок</Button>
        }
        toolbar={
          <div className="flex flex-wrap items-center gap-3 w-full">
            <SegmentedControl value={view} onChange={setView} options={VIEW_OPTIONS} label="Режим" />
            <div className="inline-flex items-center gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => shiftRange(-1)}>‹</Button>
              <Button variant="secondary" size="sm" onClick={goToday}>Сьогодні</Button>
              <Button variant="secondary" size="sm" onClick={() => shiftRange(1)}>›</Button>
            </div>
            <span className="ml-auto text-[12px] text-ink-muted tabular-nums">
              {sessions.length} уроків у періоді
            </span>
          </div>
        }
        status={shellStatus}
        error={error ?? undefined}
        onRetry={load}
        loadingShape="card"
        empty={{
          title: 'Немає уроків',
          description: 'Додайте перший урок — він з’явиться у сітці',
        }}
      >
        {view === 'week' ? (
          <WeekGrid
            days={days}
            sessionsByDay={sessionsByDay}
            onSessionClick={setSelectedSession}
            onCreateAt={(date, time) => openCreate(date, time)}
          />
        ) : (
          <DayList
            day={days[0]}
            sessions={sessionsByDay.get(toIsoDate(days[0])) ?? []}
            onSessionClick={setSelectedSession}
            onCreateAt={time => openCreate(days[0], time)}
          />
        )}
      </DashboardPageShell>

      <CreateLessonModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        defaultDate={createDefaults.date}
        defaultTime={createDefaults.time}
      />

      <LessonActionSheet
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onChanged={handleSessionChanged}
        onDeleted={handleSessionDeleted}
      />
    </>
  );
}

interface WeekGridProps {
  days: Date[];
  sessionsByDay: Map<string, Session[]>;
  onSessionClick: (s: Session) => void;
  onCreateAt: (date: Date, time: string) => void;
}

function WeekGrid({ days, sessionsByDay, onSessionClick, onCreateAt }: WeekGridProps) {
  const today = toIsoDate(new Date());
  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-7 border-t border-border">
        {days.map((d, i) => {
          const key = toIsoDate(d);
          const rows = sessionsByDay.get(key) ?? [];
          const isToday = key === today;
          return (
            <div
              key={key}
              className={`border-b md:border-b-0 md:border-r last:border-r-0 border-border min-h-40 ${
                isToday ? 'bg-primary/5' : ''
              }`}
            >
              <div className="px-3 py-2 flex items-center justify-between border-b border-border">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  {DAY_LABELS[i]} · {d.getDate()}
                </span>
                <button
                  type="button"
                  onClick={() => onCreateAt(d, '16:00')}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  +
                </button>
              </div>
              <ul className="flex flex-col">
                {rows.length === 0 ? (
                  <li className="px-3 py-3 text-[12px] text-ink-faint">—</li>
                ) : (
                  rows.map(s => (
                    <li key={s.documentId} className="border-t border-border first:border-t-0">
                      <button
                        type="button"
                        onClick={() => onSessionClick(s)}
                        className="w-full text-left px-3 py-2 hover:bg-surface-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s.status]}`} />
                          <span className="text-[12px] font-semibold text-ink tabular-nums">
                            {splitStartAt(s.startAt).time}
                          </span>
                        </div>
                        <p className="text-[12px] text-ink truncate mt-0.5">{s.title || '—'}</p>
                        <p className="text-[11px] text-ink-muted truncate">
                          {s.attendees.length === 1
                            ? s.attendees[0].displayName
                            : `${s.attendees.length} учнів`}
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface DayListProps {
  day: Date;
  sessions: Session[];
  onSessionClick: (s: Session) => void;
  onCreateAt: (time: string) => void;
}

function DayList({ day, sessions, onSessionClick, onCreateAt }: DayListProps) {
  const hours = useMemo(() => Array.from({ length: 14 }, (_, i) => i + 8), []); // 08..21
  const byHour = useMemo(() => {
    const map = new Map<number, Session[]>();
    for (const h of hours) map.set(h, []);
    for (const s of sessions) {
      const d = new Date(s.startAt);
      if (Number.isNaN(d.getTime())) continue;
      const h = d.getHours();
      const bucket = map.get(h) ?? [];
      bucket.push(s);
      map.set(h, bucket);
    }
    return map;
  }, [hours, sessions]);

  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[13px] font-semibold text-ink">{formatDayLabel(day)}</p>
      </div>
      <ul>
        {hours.map(h => {
          const rows = byHour.get(h) ?? [];
          const timeLabel = `${String(h).padStart(2, '0')}:00`;
          return (
            <li key={h} className="grid grid-cols-[80px_1fr] border-t border-border first:border-t-0">
              <div className="px-3 py-3 text-[12px] text-ink-muted tabular-nums">{timeLabel}</div>
              <div className="px-2 py-2 flex flex-wrap gap-2">
                {rows.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onCreateAt(timeLabel)}
                    className="text-[11px] text-ink-faint hover:text-primary px-2 py-1 rounded-md hover:bg-primary/5 transition-colors"
                  >
                    + урок
                  </button>
                ) : (
                  rows.map(s => (
                    <button
                      type="button"
                      key={s.documentId}
                      onClick={() => onSessionClick(s)}
                      className="text-left px-3 py-2 rounded-lg border border-border bg-surface hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s.status]}`} />
                        <span className="text-[12px] font-semibold text-ink tabular-nums">
                          {splitStartAt(s.startAt).time} · {s.durationMin} хв
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-ink mt-0.5">{s.title || '—'}</p>
                      <p className="text-[11px] text-ink-muted">
                        {s.attendees.length === 1
                          ? s.attendees[0].displayName
                          : `${s.attendees.length} учнів`}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
