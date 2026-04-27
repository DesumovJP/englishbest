/**
 * Shared schedule view for teacher (`/dashboard/teacher-calendar`) and
 * parent/student (`/calendar`).
 *
 * `editable` toggles the create button + the LessonActionSheet path used by
 * the teacher; read-only callers get a simple session detail modal.
 *
 * Day/Week/Month layouts share STATUS_DOT and click handling so the role-aware
 * pages stay visually consistent.
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
  fetchSessionsCached,
  peekSessions,
  splitStartAt,
  type Session,
  type SessionStatus,
} from '@/lib/sessions';
// Status / type labels come from `lib/session-display` so every surface
// (kids, teacher, parent, student calendar, student detail modal) reads
// identically. Don't fork these locally.
import {
  SESSION_STATUS_LABEL as STATUS_LABEL,
  sessionTypeLabel,
  formatDuration,
  attendeesCountLabel,
} from '@/lib/session-display';

type View = 'month' | 'week' | 'day';

const VIEW_OPTIONS: ReadonlyArray<SegmentedControlOption<View>> = [
  { value: 'month', label: 'Місяць' },
  { value: 'week',  label: 'Тиждень' },
  { value: 'day',   label: 'День' },
];

const STATUS_DOT: Record<SessionStatus, string> = {
  scheduled: 'bg-primary',
  live:      'bg-success',
  completed: 'bg-ink-muted',
  cancelled: 'bg-danger',
  'no-show': 'bg-warning',
};

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTH_LABELS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}
function startOfWeek(d: Date): Date {
  const out = startOfDay(d);
  const diff = (out.getDay() + 6) % 7;
  out.setDate(out.getDate() - diff);
  return out;
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}
function startOfMonth(d: Date): Date {
  const out = new Date(d);
  out.setDate(1);
  out.setHours(0, 0, 0, 0);
  return out;
}
function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}
function toIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function formatRangeLabel(start: Date, end: Date): string {
  const s = start.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  const e = end.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} \u2014 ${e}`;
}
function formatDayLabel(d: Date): string {
  return d.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatMonthLabel(d: Date): string {
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleString('uk-UA', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export interface ScheduleProps {
  /** Page title shown in the shell. */
  title: string;
  /** Show "+ Урок" button + per-day "+" + LessonActionSheet for clicks. */
  editable: boolean;
  /** Optional: override default view. */
  initialView?: View;
}

export function Schedule({ title, editable, initialView = 'week' }: ScheduleProps) {
  const [view, setView] = useState<View>(initialView);
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));

  const range = useMemo(() => {
    if (view === 'day') {
      const start = startOfDay(anchor);
      return { start, end: addDays(start, 1) };
    }
    if (view === 'week') {
      const start = startOfWeek(anchor);
      return { start, end: addDays(start, 7) };
    }
    // Month: pad to whole weeks so the grid is rectangular.
    const monthStart = startOfMonth(anchor);
    const monthEnd = startOfMonth(addMonths(anchor, 1));
    const start = startOfWeek(monthStart);
    const tailDays = ((monthEnd.getDay() + 6) % 7);
    const end = tailDays === 0 ? monthEnd : addDays(monthEnd, 7 - tailDays);
    return { start, end };
  }, [anchor, view]);

  // Peek the SWR cache synchronously so a previously-visited range hydrates
  // without flashing a skeleton. Effect below revalidates in the background.
  const cachedRows = peekSessions({
    fromISO: range.start.toISOString(),
    toISO: range.end.toISOString(),
  });
  const [sessions, setSessions] = useState<Session[]>(cachedRows ?? []);
  const [loading, setLoading] = useState(cachedRows === null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{ date?: string; time?: string }>({});
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [readOnlySelection, setReadOnlySelection] = useState<Session | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSessionsCached({
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
    const filter = {
      fromISO: range.start.toISOString(),
      toISO: range.end.toISOString(),
    };
    const peek = peekSessions(filter);
    // If we already have fresh-ish data, render it instantly and revalidate
    // silently in the background. Otherwise, show the skeleton.
    if (peek) {
      setSessions(peek);
      setError(null);
      setLoading(false);
    } else {
      setLoading(true);
    }
    fetchSessionsCached(filter)
      .then((rows) => {
        if (!alive) return;
        setSessions(rows);
        setError(null);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
        setLoading(false);
      });
    return () => { alive = false; };
  }, [range.start, range.end]);

  const days = useMemo(() => {
    const count = view === 'day'
      ? 1
      : Math.round((range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000));
    return Array.from({ length: count }, (_, i) => addDays(range.start, i));
  }, [range.start, range.end, view]);

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const d of days) map.set(toIsoDate(d), []);
    for (const s of sessions) {
      const d = new Date(s.startAt);
      if (Number.isNaN(d.getTime())) continue;
      const bucket = map.get(toIsoDate(d));
      if (bucket) bucket.push(s);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.startAt.localeCompare(b.startAt));
    }
    return map;
  }, [days, sessions]);

  function shiftRange(direction: -1 | 1) {
    if (view === 'month') {
      setAnchor(prev => addMonths(prev, direction));
    } else {
      const step = view === 'day' ? 1 : 7;
      setAnchor(prev => addDays(prev, step * direction));
    }
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

  function handleSessionClick(s: Session) {
    if (editable) setSelectedSession(s);
    else setReadOnlySelection(s);
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
    view === 'day'   ? formatDayLabel(range.start) :
    view === 'week'  ? formatRangeLabel(range.start, addDays(range.start, 6)) :
    formatMonthLabel(anchor);

  const shellStatus: 'loading' | 'error' | 'empty' | 'ready' =
    error ? 'error'
    : loading ? 'loading'
    : sessions.length === 0 ? 'empty'
    : 'ready';

  return (
    <>
      <DashboardPageShell
        title={title}
        subtitle={rangeLabel}
        actions={editable ? <Button onClick={() => openCreate()}>+ Урок</Button> : undefined}
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
          description: editable
            ? 'Додайте перший урок \u2014 він з\u2019явиться у сітці'
            : 'У цьому періоді ще немає запланованих уроків',
        }}
      >
        {view === 'month' ? (
          <MonthGrid
            days={days}
            anchorMonth={anchor.getMonth()}
            sessionsByDay={sessionsByDay}
            onSessionClick={handleSessionClick}
            onCreateAt={editable ? d => openCreate(d, '16:00') : undefined}
          />
        ) : view === 'week' ? (
          <WeekGrid
            days={days}
            sessionsByDay={sessionsByDay}
            onSessionClick={handleSessionClick}
            onCreateAt={editable ? (d, t) => openCreate(d, t) : undefined}
          />
        ) : (
          <DayList
            day={days[0]}
            sessions={sessionsByDay.get(toIsoDate(days[0])) ?? []}
            onSessionClick={handleSessionClick}
            onCreateAt={editable ? t => openCreate(days[0], t) : undefined}
          />
        )}
      </DashboardPageShell>

      {editable && (
        <>
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
      )}

      {!editable && readOnlySelection && (
        <SessionDetailModal
          session={readOnlySelection}
          onClose={() => setReadOnlySelection(null)}
        />
      )}
    </>
  );
}

interface DayCellProps {
  d: Date;
  rows: Session[];
  isToday: boolean;
  onSessionClick: (s: Session) => void;
  onCreateAt?: (date: Date, time: string) => void;
  label: string;
}

function WeekGrid({
  days,
  sessionsByDay,
  onSessionClick,
  onCreateAt,
}: {
  days: Date[];
  sessionsByDay: Map<string, Session[]>;
  onSessionClick: (s: Session) => void;
  onCreateAt?: (date: Date, time: string) => void;
}) {
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
                {onCreateAt && (
                  <button
                    type="button"
                    onClick={() => onCreateAt(d, '16:00')}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    +
                  </button>
                )}
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
                        <p className="text-[12px] text-ink truncate mt-0.5">{s.title || '\u2014'}</p>
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

function DayList({
  day,
  sessions,
  onSessionClick,
  onCreateAt,
}: {
  day: Date;
  sessions: Session[];
  onSessionClick: (s: Session) => void;
  onCreateAt?: (time: string) => void;
}) {
  const hours = useMemo(() => Array.from({ length: 14 }, (_, i) => i + 8), []);
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
                  onCreateAt ? (
                    <button
                      type="button"
                      onClick={() => onCreateAt(timeLabel)}
                      className="text-[11px] text-ink-faint hover:text-primary px-2 py-1 rounded-md hover:bg-primary/5 transition-colors"
                    >
                      + урок
                    </button>
                  ) : (
                    <span className="text-[11px] text-ink-faint px-2 py-1">—</span>
                  )
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
                      <p className="text-[13px] font-semibold text-ink mt-0.5">{s.title || '\u2014'}</p>
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

function MonthGrid({
  days,
  anchorMonth,
  sessionsByDay,
  onSessionClick,
  onCreateAt,
}: {
  days: Date[];
  anchorMonth: number;
  sessionsByDay: Map<string, Session[]>;
  onSessionClick: (s: Session) => void;
  onCreateAt?: (date: Date) => void;
}) {
  const today = toIsoDate(new Date());
  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <div className="hidden md:grid grid-cols-7 border-b border-border bg-surface-muted/40">
        {DAY_LABELS.map(lbl => (
          <div
            key={lbl}
            className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint text-center"
          >
            {lbl}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7">
        {days.map(d => {
          const key = toIsoDate(d);
          const rows = sessionsByDay.get(key) ?? [];
          const isToday = key === today;
          const inMonth = d.getMonth() === anchorMonth;
          return (
            <div
              key={key}
              className={`border-t md:border-l first:md:border-l-0 border-border min-h-28 md:min-h-32 ${
                isToday ? 'bg-primary/5' : !inMonth ? 'bg-surface-muted/30' : ''
              }`}
            >
              <div className="px-2 py-1.5 flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    !inMonth ? 'text-ink-faint/60' : isToday ? 'text-primary' : 'text-ink-muted'
                  }`}
                >
                  {d.getDate()}
                </span>
                {onCreateAt && inMonth && (
                  <button
                    type="button"
                    onClick={() => onCreateAt(d)}
                    className="text-[11px] font-semibold text-primary hover:underline opacity-0 hover:opacity-100 focus:opacity-100"
                  >
                    +
                  </button>
                )}
              </div>
              <ul className="flex flex-col gap-0.5 px-1.5 pb-1.5">
                {rows.slice(0, 3).map(s => (
                  <li key={s.documentId}>
                    <button
                      type="button"
                      onClick={() => onSessionClick(s)}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[11px] hover:bg-surface-muted/60 transition-colors flex items-center gap-1.5"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[s.status]}`} />
                      <span className="font-semibold tabular-nums text-ink">{splitStartAt(s.startAt).time}</span>
                      <span className="truncate text-ink-muted">{s.title || '\u2014'}</span>
                    </button>
                  </li>
                ))}
                {rows.length > 3 && (
                  <li className="px-1.5 text-[10px] text-ink-faint">+{rows.length - 3}</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SessionDetailModal({ session, onClose }: { session: Session; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {session.course?.title && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark">
                  {session.course.title}
                </span>
              )}
              {session.type && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-muted text-ink-muted">
                  {sessionTypeLabel(session.type)}
                </span>
              )}
            </div>
            <h3 className="font-black text-ink text-lg mt-2">{session.title || 'Урок'}</h3>
            {session.teacher?.displayName && (
              <p className="text-sm text-ink-muted mt-0.5">
                Вчитель: {session.teacher.displayName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="text-ink-muted hover:text-ink flex-shrink-0 mt-1"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 text-sm text-ink-muted">
          <div className="tabular-nums">
            {formatDateTime(session.startAt)}
            {session.durationMin ? ` · ${formatDuration(session.durationMin)}` : ''}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[session.status]}`} />
            <span className="font-semibold text-ink">{STATUS_LABEL[session.status]}</span>
          </div>
          {session.attendees.length > 0 && (
            <div>
              <span className="font-semibold text-ink">{attendeesCountLabel(session.attendees)}: </span>
              {session.attendees.slice(0, 4).map(a => a.displayName).join(', ')}
              {session.attendees.length > 4 ? ` +${session.attendees.length - 4}` : ''}
            </div>
          )}
        </div>

        {session.joinUrl && (session.status === 'scheduled' || session.status === 'live') && (
          <a
            href={session.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            Приєднатися
          </a>
        )}
        {session.recordingUrl && session.status === 'completed' && (
          <a
            href={session.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-2.5 rounded-xl font-semibold text-sm bg-surface-muted text-ink hover:bg-border transition-colors"
          >
            Переглянути запис
          </a>
        )}
      </div>
    </div>
  );
}
