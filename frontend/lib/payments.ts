/**
 * Teacher payments loader.
 *
 * `teacher-payout` = monthly aggregate (lessonsCount, ratePerLesson, total,
 *   status). Teacher reads own list via scoped controller.
 * `lesson-payment` = per-session earning. Not yet surfaced in the payments
 *   page; exposed for future drill-down / analytics wiring.
 */

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'cancelled';

const PAYOUT_STATUSES = new Set<PayoutStatus>([
  'pending',
  'processing',
  'paid',
  'cancelled',
]);

function pickStatus(v: unknown): PayoutStatus {
  return typeof v === 'string' && PAYOUT_STATUSES.has(v as PayoutStatus)
    ? (v as PayoutStatus)
    : 'pending';
}

function nullableStr(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

export interface TeacherPayout {
  documentId: string;
  periodYear: number;
  periodMonth: number;
  lessonsCount: number;
  ratePerLesson: number;
  total: number;
  currency: string;
  status: PayoutStatus;
  paidAt: string | null;
  note: string | null;
}

function normalizePayout(raw: any): TeacherPayout | null {
  if (!raw?.documentId) return null;
  const year = Number(raw.periodYear);
  const month = Number(raw.periodMonth);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  return {
    documentId: String(raw.documentId),
    periodYear: year,
    periodMonth: month,
    lessonsCount: toNum(raw.lessonsCount),
    ratePerLesson: toNum(raw.ratePerLesson),
    total: toNum(raw.total),
    currency: typeof raw.currency === 'string' && raw.currency ? raw.currency : 'UAH',
    status: pickStatus(raw.status),
    paidAt: nullableStr(raw.paidAt),
    note: nullableStr(raw.note),
  };
}

const PAYOUT_LIST_QUERY =
  'sort=periodYear:desc&sort=periodMonth:desc&pagination[pageSize]=200';

export async function fetchTeacherPayouts(): Promise<TeacherPayout[]> {
  const res = await fetch(`/api/teacher-payouts?${PAYOUT_LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchTeacherPayouts ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map(normalizePayout)
    .filter((p): p is TeacherPayout => p !== null);
}

// ─── Lesson-payment (drill-down, not yet used by payments page) ────────────

export interface LessonPayment {
  documentId: string;
  grossAmount: number;
  netAmount: number;
  currency: string;
  status: PayoutStatus;
  paidAt: string | null;
  note: string | null;
  sessionId: string | null;
}

function normalizeLessonPayment(raw: any): LessonPayment | null {
  if (!raw?.documentId) return null;
  return {
    documentId: String(raw.documentId),
    grossAmount: toNum(raw.grossAmount),
    netAmount: toNum(raw.netAmount),
    currency: typeof raw.currency === 'string' && raw.currency ? raw.currency : 'UAH',
    status: pickStatus(raw.status),
    paidAt: nullableStr(raw.paidAt),
    note: nullableStr(raw.note),
    sessionId:
      raw.session?.documentId != null ? String(raw.session.documentId) : null,
  };
}

const LESSON_PAYMENT_QUERY =
  'populate[session][fields][0]=documentId' +
  '&populate[session][fields][1]=startAt' +
  '&sort=createdAt:desc' +
  '&pagination[pageSize]=500';

export async function fetchLessonPayments(): Promise<LessonPayment[]> {
  const res = await fetch(`/api/lesson-payments?${LESSON_PAYMENT_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchLessonPayments ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map(normalizeLessonPayment)
    .filter((p): p is LessonPayment => p !== null);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const MONTHS_UA = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

export function periodLabel(p: TeacherPayout): string {
  const m = MONTHS_UA[p.periodMonth - 1] ?? String(p.periodMonth);
  return `${m} ${p.periodYear}`;
}
