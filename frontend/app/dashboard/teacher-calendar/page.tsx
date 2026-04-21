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

const MODE_LABEL: Record<ScheduledLesson['mode'], string> = {
  individual:      'Індивід.',
  pair:            'Парний',
  group:           'Груповий',
  'speaking-club': 'Speaking',
};
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
  const day = d.getDay();
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
      ? `${anchorDate.getDate()} ${MONTHS_UA[anchorDate.getMonth()]}`
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
            className="ios-btn ios-btn-primary"
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
            className="ios-btn ios-btn-secondary w-9 p-0"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button type="button" onClick={() => setAnchor(MOCK_TODAY)} className="ios-btn ios-btn-secondary">
            Сьогодні
          </button>
          <button
            type="button"
            onClick={() => shiftAnchor(+1)}
            aria-label="Вперед"
            className="ios-btn ios-btn-secondary w-9 p-0"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <h2 className="ml-2 text-[15px] font-semibold text-ink tracking-tight">{headerLabel}</h2>
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
                    <span className="ios-dot" />
                    <span className="truncate tabular-nums">{l.time} · {subjectName(l).split(' ')[0]}</span>
                  </div>
                ))}
                {list.length > 3 && (
                  <span className="text-[10px] text-ink-faint font-semibold">+{list.length - 3}</span>
                )}
              </>
            );
          }}
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
  const d = parseDate(date);
  const weekdayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const isToday = date === MOCK_TODAY;

  return (
    <div className="ios-card overflow-hidden">
      <div className="grid grid-cols-[56px_1fr] border-b border-border">
        <div />
        <div className="px-2 py-2.5 text-center border-l border-border">
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wide">{WEEKDAYS_SHORT[weekdayIdx]}</p>
          <p className={`text-[14px] font-semibold mt-0.5 tabular-nums ${isToday ? 'text-ink' : 'text-ink-muted'}`}>
            {d.getDate()}
            {isToday && <span className="block w-1 h-1 rounded-full bg-primary mx-auto mt-1" aria-hidden />}
          </p>
        </div>
      </div>

      {HOURS.map(h => {
        const timeLabel = `${String(h).padStart(2, '0')}:00`;
        const slotLessons = lessons.filter(l => Number(l.time.slice(0, 2)) === h);
        return (
          <div key={h} className="grid grid-cols-[56px_1fr] border-b border-border last:border-b-0 min-h-14">
            <div className="px-2 py-1 text-[10px] font-semibold text-ink-faint tabular-nums">
              {timeLabel}
            </div>
            <div className="border-l border-border p-1.5 flex flex-col gap-1.5">
              {slotLessons.length === 0 ? (
                <button
                  type="button"
                  onClick={() => onPickSlot(timeLabel)}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-[11px] text-ink-faint hover:bg-surface-muted hover:text-ink-muted transition-colors"
                  aria-label={`Створити урок о ${timeLabel}`}
                >
                  + Урок
                </button>
              ) : (
                slotLessons.map(l => (
                  <LessonRow key={l.id} lesson={l} onClick={() => onPickLesson(l)} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LessonRow({ lesson, onClick }: { lesson: ScheduledLesson; onClick: () => void }) {
  const status = LESSON_STATUS_STYLES[lesson.status];
  const isActive = lesson.status === 'in-progress';
  const student = lesson.studentId ? getStudent(lesson.studentId) : null;
  const group = lesson.groupId ? getGroup(lesson.groupId) : null;
  const name = student?.name ?? group?.name ?? '—';
  const photo = student?.photo;
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const endHour = Math.floor((Number(lesson.time.slice(0, 2)) * 60 + Number(lesson.time.slice(3, 5)) + lesson.duration) / 60);
  const endMin = (Number(lesson.time.slice(0, 2)) * 60 + Number(lesson.time.slice(3, 5)) + lesson.duration) % 60;
  const endLabel = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors flex items-center gap-3 ${
        isActive
          ? 'border-primary bg-primary/[0.06] hover:bg-primary/[0.09]'
          : 'border-border bg-white hover:border-primary/30 hover:bg-surface-muted/40'
      }`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0 text-[11px] font-semibold text-ink-muted">
          {initials || '—'}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-ink truncate">{name}</p>
          <LevelBadge level={lesson.level} />
        </div>
        <p className="text-[11px] text-ink-muted truncate mt-0.5">{lesson.topic}</p>
      </div>

      <div className="hidden md:flex items-center gap-3 flex-shrink-0 text-[11px] tabular-nums">
        <span className="text-ink-muted">
          {lesson.time}–{endLabel}
        </span>
        <span className="w-px h-3 bg-border" aria-hidden />
        <span className="text-ink-faint">{MODE_LABEL[lesson.mode]}</span>
      </div>

      <span className="flex items-center gap-1.5 flex-shrink-0 text-[11px] font-semibold text-ink-muted">
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} aria-hidden />
        <span className="hidden sm:inline">{status.label}</span>
      </span>

      <svg className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

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
    <div className="ios-card overflow-x-auto">
      <div className="min-w-[880px]">
        <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border">
          <div />
          {days.map((d, i) => {
            const dateStr = fmtDate(d);
            const isToday = dateStr === MOCK_TODAY;
            return (
              <div key={i} className="px-2 py-2.5 text-center border-l border-border">
                <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wide">{WEEKDAYS_SHORT[i]}</p>
                <p className={`text-[14px] font-semibold mt-0.5 tabular-nums ${isToday ? 'text-ink' : 'text-ink-muted'}`}>
                  {d.getDate()}
                  {isToday && <span className="block w-1 h-1 rounded-full bg-primary mx-auto mt-1" aria-hidden />}
                </p>
              </div>
            );
          })}
        </div>

        {HOURS.map(h => {
          const timeLabel = `${String(h).padStart(2, '0')}:00`;
          return (
            <div key={h} className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border last:border-b-0 min-h-14">
              <div className="px-2 py-1 text-[10px] font-semibold text-ink-faint tabular-nums">
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
                      cellLessons.length === 0 ? 'hover:bg-surface-muted/70' : ''
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
  const isActive = lesson.status === 'in-progress';
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left rounded-lg px-2 py-1.5 border transition-colors ${
        isActive
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-white hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
        <span className={`text-[10px] font-semibold tabular-nums ${isActive ? 'text-white/90' : 'text-ink-muted'}`}>{lesson.time}</span>
      </div>
      <p className={`font-semibold truncate mt-0.5 ${compact ? 'text-[11px]' : 'text-[12px]'} ${isActive ? 'text-white' : 'text-ink'}`}>
        {subjectName(lesson)}
      </p>
      {!compact && <p className={`text-[11px] truncate ${isActive ? 'text-white/70' : 'text-ink-muted'}`}>{lesson.topic}</p>}
    </button>
  );
}
