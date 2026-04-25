/**
 * Attendance loaders + mutators for the teacher calendar grid.
 *
 * Wires `/api/sessions` and `/api/attendance-records` for a month view.
 * Grid derivation lives in the page: attendance rows are keyed by
 * (sessionId, studentDocumentId) — we do NOT compute per-day marks here.
 *
 * The BE scopes attendance-records by session ownership for teachers, and
 * the `create` endpoint is an upsert on the (session, student) pair so the
 * FE just calls `upsertAttendance()` on every cell click.
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

const ATTENDANCE_STATUSES = new Set<AttendanceStatus>([
  'present',
  'absent',
  'late',
  'excused',
]);

function pickStatus(v: unknown): AttendanceStatus {
  return typeof v === 'string' && ATTENDANCE_STATUSES.has(v as AttendanceStatus)
    ? (v as AttendanceStatus)
    : 'present';
}

function nullableStr(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function mediaUrl(media: unknown): string | null {
  if (!media || typeof media !== 'object') return null;
  const url = (media as { url?: unknown }).url;
  return typeof url === 'string' && url.length > 0 ? url : null;
}

export interface AttendanceStudent {
  documentId: string;
  displayName: string;
  avatarUrl: string | null;
  level: string | null;
}

export interface SessionLite {
  documentId: string;
  title: string;
  startAt: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled' | 'no-show';
  attendees: AttendanceStudent[];
}

export interface AttendanceRecord {
  documentId: string;
  status: AttendanceStatus;
  note: string | null;
  recordedAt: string | null;
  sessionId: string;
  studentId: string;
}

function normalizeStudent(raw: any): AttendanceStudent | null {
  if (!raw?.documentId) return null;
  const name =
    (typeof raw.displayName === 'string' && raw.displayName) ||
    `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim() ||
    '—';
  return {
    documentId: String(raw.documentId),
    displayName: name,
    avatarUrl: mediaUrl(raw.avatar),
    level: typeof raw.level === 'string' ? raw.level : null,
  };
}

function normalizeSession(raw: any): SessionLite | null {
  if (!raw?.documentId || typeof raw.startAt !== 'string') return null;
  const statusAllowed = new Set(['scheduled', 'live', 'completed', 'cancelled', 'no-show']);
  const status = statusAllowed.has(raw.status) ? raw.status : 'scheduled';
  const attendees: AttendanceStudent[] = Array.isArray(raw.attendees)
    ? raw.attendees
        .map(normalizeStudent)
        .filter((s: AttendanceStudent | null): s is AttendanceStudent => s !== null)
    : [];
  return {
    documentId: String(raw.documentId),
    title: typeof raw.title === 'string' ? raw.title : '',
    startAt: raw.startAt,
    status,
    attendees,
  };
}

function normalizeRecord(raw: any): AttendanceRecord | null {
  if (!raw?.documentId) return null;
  const sessionId =
    raw.session?.documentId != null ? String(raw.session.documentId) : null;
  const studentId =
    raw.student?.documentId != null ? String(raw.student.documentId) : null;
  if (!sessionId || !studentId) return null;
  return {
    documentId: String(raw.documentId),
    status: pickStatus(raw.status),
    note: nullableStr(raw.note),
    recordedAt: nullableStr(raw.recordedAt),
    sessionId,
    studentId,
  };
}

function monthRange(year: number, month: number): { from: string; to: string } {
  // month is 0-indexed.
  const from = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const to = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
  return { from: from.toISOString(), to: to.toISOString() };
}

const SESSION_LIST_QUERY_BASE =
  'populate[attendees][fields][0]=firstName' +
  '&populate[attendees][fields][1]=lastName' +
  '&populate[attendees][fields][2]=displayName' +
  '&populate[attendees][fields][3]=level' +
  '&populate[attendees][populate][avatar][fields][0]=url' +
  '&populate[teacher][fields][0]=documentId' +
  '&sort=startAt:asc' +
  '&pagination[pageSize]=500';

export async function fetchTeacherMonthSessions(
  teacherId: string,
  year: number,
  month: number,
): Promise<SessionLite[]> {
  const { from, to } = monthRange(year, month);
  const qs =
    `${SESSION_LIST_QUERY_BASE}` +
    `&filters[teacher][documentId][$eq]=${encodeURIComponent(teacherId)}` +
    `&filters[startAt][$gte]=${encodeURIComponent(from)}` +
    `&filters[startAt][$lt]=${encodeURIComponent(to)}`;
  const res = await fetch(`/api/sessions?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchTeacherMonthSessions ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map(normalizeSession)
    .filter((s): s is SessionLite => s !== null);
}

const RECORD_LIST_QUERY_BASE =
  'populate[session][fields][0]=documentId' +
  '&populate[session][fields][1]=startAt' +
  '&populate[student][fields][0]=documentId' +
  '&pagination[pageSize]=1000';

export async function fetchMonthAttendance(
  year: number,
  month: number,
): Promise<AttendanceRecord[]> {
  const { from, to } = monthRange(year, month);
  const qs =
    `${RECORD_LIST_QUERY_BASE}` +
    `&filters[session][startAt][$gte]=${encodeURIComponent(from)}` +
    `&filters[session][startAt][$lt]=${encodeURIComponent(to)}`;
  const res = await fetch(`/api/attendance-records?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchMonthAttendance ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map(normalizeRecord)
    .filter((r): r is AttendanceRecord => r !== null);
}

export async function upsertAttendance(input: {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string | null;
  /** Falls back to this when the BE response omits documentId (e.g. trimmed by sanitizeOutput). */
  fallbackDocumentId?: string;
}): Promise<AttendanceRecord> {
  const data: Record<string, unknown> = {
    session: input.sessionId,
    student: input.studentId,
    status: input.status,
  };
  if (input.note !== undefined) data.note = input.note;

  const res = await fetch('/api/attendance-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    let message = `upsertAttendance ${res.status}`;
    try {
      const errJson: any = await res.json();
      if (errJson?.error?.message) message = errJson.error.message;
    } catch {
      /* ignore body parse failure */
    }
    throw new Error(message);
  }
  const json: any = await res.json().catch(() => ({}));
  const responseDocId =
    typeof json?.data?.documentId === 'string' ? json.data.documentId : null;
  const documentId = responseDocId ?? input.fallbackDocumentId ?? null;
  if (!documentId) {
    // Response had no documentId AND no fallback — fail loud so caller can recover.
    throw new Error('upsertAttendance: missing documentId');
  }
  return {
    documentId,
    status: input.status,
    note:
      typeof json?.data?.note === 'string'
        ? json.data.note
        : input.note ?? null,
    recordedAt:
      typeof json?.data?.recordedAt === 'string'
        ? json.data.recordedAt
        : new Date().toISOString(),
    sessionId: input.sessionId,
    studentId: input.studentId,
  };
}

export async function deleteAttendance(documentId: string): Promise<void> {
  const res = await fetch(`/api/attendance-records/${documentId}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`deleteAttendance ${res.status}`);
  }
}
