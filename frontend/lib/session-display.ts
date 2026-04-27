/**
 * session-display — single source of truth for textual presentation of a
 * scheduled / past lesson across every audience (kids, teacher, parent,
 * student, admin). Visual styling stays per-surface; the *labels* and
 * field selection live here so the same session reads identically
 * everywhere.
 *
 * Canonical fields: title, course.title, startAt + durationMin, type
 * chip, status badge, teacher.displayName, attendees summary,
 * joinUrl / recordingUrl. `notes` is teacher-internal and never surfaces
 * to learners / parents.
 */
import type { SessionStatus, SessionType, SessionAttendee, SessionTeacher } from './sessions';

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: 'Заплановано',
  live:      'В ефірі',
  completed: 'Завершено',
  cancelled: 'Скасовано',
  'no-show': 'Не зʼявилися',
};

/** Tone hints — pick a paint key (primary / success / danger / muted / accent)
 *  to colour the badge. Per-surface CSS picks the actual class. */
export type StatusTone = 'live' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export function sessionStatusTone(status: SessionStatus): StatusTone {
  return status;
}

export const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  group:        'Груповий',
  'one-to-one': 'Індивідуальний',
  trial:        'Пробний',
  consultation: 'Консультація',
};

export function sessionTypeLabel(type: SessionType | string | null | undefined): string {
  if (!type) return '';
  return (SESSION_TYPE_LABEL as Record<string, string>)[type] ?? type;
}

export function sessionStatusLabel(status: SessionStatus | string | null | undefined): string {
  if (!status) return '';
  return (SESSION_STATUS_LABEL as Record<string, string>)[status] ?? status;
}

const WEEKDAYS_UA = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS_SHORT_UA = [
  'січ', 'лют', 'бер', 'кві', 'тра', 'чер',
  'лип', 'сер', 'вер', 'жов', 'лис', 'гру',
];

export function formatSessionTime(startAt: string): string {
  if (!startAt) return '';
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "12 кві" or "Сьогодні" / "Завтра" when applicable. */
export function formatSessionDayShort(startAt: string, todayISO?: string): string {
  if (!startAt) return '';
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return '';
  const today = todayISO ?? new Date().toISOString().slice(0, 10);
  const iso = d.toISOString().slice(0, 10);
  if (iso === today) return 'Сьогодні';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (iso === tomorrow.toISOString().slice(0, 10)) return 'Завтра';
  return `${d.getDate()} ${MONTHS_SHORT_UA[d.getMonth()]}`;
}

/** "Пн, 12 кві · 15:30" — single-line summary for compact rows. */
export function formatSessionWhen(startAt: string): string {
  if (!startAt) return '';
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return '';
  return `${WEEKDAYS_UA[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT_UA[d.getMonth()]} · ${formatSessionTime(startAt)}`;
}

export function formatDuration(min: number | null | undefined): string {
  if (!min || min <= 0) return '';
  return `${min} хв`;
}

export function teacherDisplayName(teacher: SessionTeacher | null | undefined): string {
  return teacher?.displayName ?? '';
}

/** Compact attendees summary: "Анна М., Петро К., +2 ще" or "Гру·па (5)". */
export function formatAttendees(attendees: SessionAttendee[] | null | undefined, max = 2): string {
  if (!attendees || attendees.length === 0) return '';
  if (attendees.length <= max) return attendees.map(a => a.displayName).join(', ');
  const head = attendees.slice(0, max).map(a => a.displayName).join(', ');
  return `${head}, +${attendees.length - max} ще`;
}

/** "5 учнів" / "1 учень" — just the count. Use when names are too long. */
export function attendeesCountLabel(attendees: SessionAttendee[] | null | undefined): string {
  const n = attendees?.length ?? 0;
  if (n === 0) return '';
  if (n === 1) return '1 учень';
  if (n >= 2 && n <= 4) return `${n} учні`;
  return `${n} учнів`;
}
