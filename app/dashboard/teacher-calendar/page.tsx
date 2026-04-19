'use client';
import { useMemo, useState } from 'react';
import { CalendarGrid } from '@/components/molecules/CalendarGrid';
import {
  LESSON_STATUS_STYLES,
  MOCK_SCHEDULE,
  MOCK_TODAY,
  getGroup,
  getStudent,
  type ScheduledLesson,
} from '@/lib/teacher-mocks';
import {
  LevelBadge,
  PageHeader,
  SegmentedControl,
  type SegmentedControlOption,
} from '@/components/teacher/ui';
import { CreateLessonModal } from '@/components/teacher/CreateLessonModal';
import { LessonActionSheet } from '@/components/teacher/LessonActionSheet';

type View = 'day' | 'week' | 'month';

const VIEW_OPTIONS: ReadonlyArray<SegmentedControlOption<View>> = [
  { value: 'day',   label: 'День' },
  { value: 'week',  label: 'Тиждень' },
  { value: 'month', label: 'Місяць' },
];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08-22
const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS_UA = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

function parseDate(s: string) {
  return new Date(`${s}T00:00:00`);
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(d: Date, delta: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + delta);
  return out;
}
function startOfWeek(d: Date) {
  const day = d.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(d, mondayOffset);
}

function subjectName(l: ScheduledLesson) {
  return l.studentId
    ? getStudent(l.studentId)?.name ?? '—'
    : l.groupId
      ? getGroup(l.groupId)?.name ?? '—'
      : '—';
}

export default function TeacherCalendarPage() {
  const [view, setView] = useState<View>('day');
  const [anchor, setAnchor] = useState(MOCK_TODAY);
  const [creating, setCreating] = useState<{ open: boolean; date?: string; time?: string }>({ open: false });
  const [active, setActive] = useState<ScheduledLesson | null>(null);

  const anchorDate = parseDate(anchor);
  const weekStart = startOfWeek(anchorDate);

  const lessonsByDate = useMemo(() => {
    const map = new Map<string, ScheduledLesson[]>();
    MOCK_SCHEDULE.forEach(l => {
      if (!map.has(l.date)) map.set(l.date, []);
      map.get(l.date)!.push(l);
    });
    map.forEach(arr => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, []);

  function shiftAnchor(delta: number) {
    const step = view === 'day' ? 1 : view === 'week' ? 7 : 30;
    setAnchor(fmtDate(addDays(anchorDate, delta * step)));
  }

  const headerLabel =
    view === 'day'
      ? `${anchorDate.getDate()} ${MONTHS_UA[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
      : view === 'week'
        ? `${weekStart.getDate()} ${MONTHS_UA[weekStart.getMonth()]} – ${addDays(weekStart, 6).getDate()} ${MONTHS_UA[addDays(weekStart, 6).getMonth()]}`
        : `${MONTHS_UA[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Розклад"
        subtitle={`${MOCK_SCHEDULE.length} уроків у плані`}
        action={
          <button
            type="button"
            onClick={() => setCreating({ open: true, date: anchor })}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity"
          >
            + Урок
          </button>
        }
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftAnchor(-1)}
            aria-label="Назад"
            className="w-9 h-9 rounded-xl border border-border text-ink-muted hover:text-ink hover:border-primary/40 flex items-center justify-center transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setAnchor(MOCK_TODAY)}
            className="h-9 px-3 rounded-xl border border-border text-sm font-bold text-ink-muted hover:text-ink hover:border-primary/40 transition-colors"
          >
            Сьогодні
          </button>
          <button
            type="button"
            onClick={() => shiftAnchor(+1)}
            aria-label="Вперед"
            className="w-9 h-9 rounded-xl border border-border text-ink-muted hover:text-ink hover:border-primary/40 flex items-center justify-center transition-colors"
          >
            ›
          </button>
          <h2 className="ml-2 text-lg font-black text-ink">{headerLabel}</h2>
        </div>

        <SegmentedControl value={view} onChange={setView} options={VIEW_OPTIONS} label="Вид" />
      </div>

      {view === 'day' && (
        <DayView
          date={anchor}
          lessons={lessonsByDate.get(anchor) ?? []}
          onPickSlot={time => setCreating({ open: true, date: anchor, time })}
          onPickLesson={setActive}
        />
      )}

      {view === 'week' && (
        <WeekView
          weekStart={weekStart}
          lessonsByDate={lessonsByDate}
          onPickSlot={(date, time) => setCreating({ open: true, date, time })}
          onPickLesson={setActive}
        />
      )}

      {view === 'month' && (
        <CalendarGrid
          initialYear={anchorDate.getFullYear()}
          initialMonth={anchorDate.getMonth()}
          onDayClick={dateStr => {
            const list = lessonsByDate.get(dateStr);
            if (list && list.length > 0) {
              setActive(list[0]);
            } else {
              setCreating({ open: true, date: dateStr });
            }
          }}
          renderDay={({ dateStr }) => {
            const list = lessonsByDate.get(dateStr) ?? [];
            return (
              <>
                {list.slice(0, 3).map(l => (
                  <div key={l.id} className="flex items-center gap-1 text-[10px] text-ink-muted leading-tight">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${LESSON_STATUS_STYLES[l.status].dot}`} />
                    <span className="truncate">{l.time} · {subjectName(l).split(' ')[0]}</span>
                  </div>
                ))}
                {list.length > 3 && (
                  <span className="text-[10px] text-ink-muted font-bold">+{list.length - 3}</span>
                )}
              </>
            );
          }}
          footer={
            <div className="flex items-center gap-4 px-5 py-3 bg-surface-muted">
              {(Object.entries(LESSON_STATUS_STYLES) as Array<[keyof typeof LESSON_STATUS_STYLES, typeof LESSON_STATUS_STYLES[keyof typeof LESSON_STATUS_STYLES]]>).map(([k, cfg]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              ))}
            </div>
          }
        />
      )}

      <CreateLessonModal
        open={creating.open}
        onClose={() => setCreating({ open: false })}
        defaultDate={creating.date}
        defaultTime={creating.time}
      />

      {active && <LessonActionSheet lesson={active} onClose={() => setActive(null)} />}
    </div>
  );
}

/* ── Day view ─────────────────────────────────────────────── */

function DayView({
  date,
  lessons,
  onPickSlot,
  onPickLesson,
}: {
  date: string;
  lessons: ScheduledLesson[];
  onPickSlot: (time: string) => void;
  onPickLesson: (l: ScheduledLesson) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {HOURS.map(h => {
          const timeLabel = `${String(h).padStart(2, '0')}:00`;
          const slotLessons = lessons.filter(l => Number(l.time.slice(0, 2)) === h);
          return (
            <div key={h} className="grid grid-cols-[72px_1fr] min-h-14">
              <div className="px-3 py-2 text-xs font-black text-ink-muted border-r border-border bg-surface-muted/50">
                {timeLabel}
              </div>
              <button
                type="button"
                onClick={() => slotLessons.length === 0 && onPickSlot(timeLabel)}
                className={`text-left px-3 py-2 transition-colors ${
                  slotLessons.length === 0 ? 'hover:bg-primary/5 cursor-pointer' : ''
                }`}
                aria-label={slotLessons.length === 0 ? `Створити урок о ${timeLabel}` : undefined}
              >
                {slotLessons.length === 0 ? (
                  <span className="text-xs text-ink-faint">+ Урок</span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {slotLessons.map(l => (
                      <LessonPill key={l.id} lesson={l} onClick={() => onPickLesson(l)} />
                    ))}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
      <p className="px-4 py-2 text-[11px] text-ink-muted bg-surface-muted border-t border-border">
        {date} · {lessons.length} уроків сьогодні
      </p>
    </div>
  );
}

/* ── Week view ────────────────────────────────────────────── */

function WeekView({
  weekStart,
  lessonsByDate,
  onPickSlot,
  onPickLesson,
}: {
  weekStart: Date;
  lessonsByDate: Map<string, ScheduledLesson[]>;
  onPickSlot: (date: string, time: string) => void;
  onPickLesson: (l: ScheduledLesson) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="bg-white rounded-2xl border border-border overflow-x-auto">
      <div className="min-w-[880px]">
        <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-border bg-surface-muted/50">
          <div />
          {days.map((d, i) => {
            const dateStr = fmtDate(d);
            const isToday = dateStr === MOCK_TODAY;
            return (
              <div key={i} className="px-2 py-2.5 text-center border-l border-border">
                <p className="text-[10px] font-black text-ink-muted uppercase">{WEEKDAYS_SHORT[i]}</p>
                <p className={`text-sm font-black mt-0.5 ${isToday ? 'text-primary-dark' : 'text-ink'}`}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {HOURS.map(h => {
          const timeLabel = `${String(h).padStart(2, '0')}:00`;
          return (
            <div key={h} className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-border last:border-b-0 min-h-14">
              <div className="px-2 py-1 text-[11px] font-black text-ink-muted border-r border-border bg-surface-muted/30">
                {timeLabel}
              </div>
              {days.map((d, i) => {
                const dateStr = fmtDate(d);
                const cellLessons = (lessonsByDate.get(dateStr) ?? []).filter(
                  l => Number(l.time.slice(0, 2)) === h,
                );
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => cellLessons.length === 0 && onPickSlot(dateStr, timeLabel)}
                    className={`border-l border-border text-left px-1.5 py-1.5 flex flex-col gap-1 transition-colors ${
                      cellLessons.length === 0 ? 'hover:bg-primary/5' : ''
                    }`}
                  >
                    {cellLessons.map(l => (
                      <LessonPill key={l.id} lesson={l} compact onClick={() => onPickLesson(l)} />
                    ))}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Lesson pill (day + week) ────────────────────────────── */

function LessonPill({
  lesson,
  compact,
  onClick,
}: {
  lesson: ScheduledLesson;
  compact?: boolean;
  onClick: () => void;
}) {
  const status = LESSON_STATUS_STYLES[lesson.status];
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left rounded-xl px-2.5 py-1.5 border border-transparent hover:border-primary/30 transition-colors ${status.cls}`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        <span className="text-[11px] font-black">{lesson.time}</span>
        {!compact && <LevelBadge level={lesson.level} />}
      </div>
      <p className={`font-bold text-ink truncate ${compact ? 'text-[11px]' : 'text-xs mt-0.5'}`}>
        {subjectName(lesson)}
      </p>
      {!compact && <p className="text-[11px] text-ink-muted truncate">{lesson.topic}</p>}
    </button>
  );
}
