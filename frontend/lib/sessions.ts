/**
 * Sessions loader / mutator.
 *
 * Hits `/api/sessions` → Strapi `api::session.session`. Backend controller
 * scopes by role (teacher sees own, student/parent sees own/children's,
 * admin all). `teacher` is forced to caller's teacher-profile on create.
 */

export type SessionType = "group" | "one-to-one" | "trial" | "consultation";
export type SessionStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled"
  | "no-show";

export interface SessionAttendee {
  documentId: string;
  displayName: string;
  level: string | null;
  avatarUrl: string | null;
}

export interface SessionTeacher {
  documentId: string;
  displayName: string;
}

export interface SessionCourse {
  documentId: string;
  title: string;
}

export interface Session {
  documentId: string;
  title: string;
  startAt: string;
  durationMin: number;
  type: SessionType;
  status: SessionStatus;
  joinUrl: string | null;
  recordingUrl: string | null;
  notes: string | null;
  grade: number | null;
  maxAttendees: number | null;
  teacher: SessionTeacher | null;
  course: SessionCourse | null;
  attendees: SessionAttendee[];
}

const TYPES = new Set<SessionType>([
  "group",
  "one-to-one",
  "trial",
  "consultation",
]);
const STATUSES = new Set<SessionStatus>([
  "scheduled",
  "live",
  "completed",
  "cancelled",
  "no-show",
]);

function pickType(v: unknown): SessionType {
  return typeof v === "string" && TYPES.has(v as SessionType)
    ? (v as SessionType)
    : "group";
}

function pickStatus(v: unknown): SessionStatus {
  return typeof v === "string" && STATUSES.has(v as SessionStatus)
    ? (v as SessionStatus)
    : "scheduled";
}

function toInt(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) {
    return Math.round(Number(v));
  }
  return 0;
}

function toIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = toInt(v);
  return Number.isFinite(n) ? n : null;
}

function nullableStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function mediaUrl(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const url = (media as { url?: unknown }).url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function attendeeName(raw: any): string {
  if (typeof raw?.displayName === "string" && raw.displayName) return raw.displayName;
  const first = typeof raw?.firstName === "string" ? raw.firstName : "";
  const last = typeof raw?.lastName === "string" ? raw.lastName : "";
  return `${first} ${last}`.trim() || "—";
}

function normalizeAttendee(raw: any): SessionAttendee | null {
  if (!raw?.documentId) return null;
  return {
    documentId: String(raw.documentId),
    displayName: attendeeName(raw),
    level: typeof raw.level === "string" && raw.level ? raw.level : null,
    avatarUrl: mediaUrl(raw.avatar),
  };
}

function normalizeTeacher(raw: any): SessionTeacher | null {
  if (!raw?.documentId) return null;
  // teacher-profile has no display fields — they live on the linked user-profile.
  const u = raw.user ?? {};
  const display =
    typeof u.displayName === "string" && u.displayName
      ? u.displayName
      : `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—";
  return { documentId: String(raw.documentId), displayName: display };
}

function normalizeCourse(raw: any): SessionCourse | null {
  if (!raw?.documentId) return null;
  return {
    documentId: String(raw.documentId),
    title: typeof raw.title === "string" ? raw.title : "",
  };
}

function normalize(raw: any): Session | null {
  if (!raw?.documentId) return null;
  const attendees: SessionAttendee[] = Array.isArray(raw.attendees)
    ? raw.attendees
        .map(normalizeAttendee)
        .filter((a: SessionAttendee | null): a is SessionAttendee => a !== null)
    : [];
  return {
    documentId: String(raw.documentId),
    title: typeof raw.title === "string" ? raw.title : "",
    startAt: typeof raw.startAt === "string" ? raw.startAt : "",
    durationMin: toInt(raw.durationMin) || 60,
    type: pickType(raw.type),
    status: pickStatus(raw.status),
    joinUrl: nullableStr(raw.joinUrl),
    recordingUrl: nullableStr(raw.recordingUrl),
    notes: nullableStr(raw.notes),
    grade: toIntOrNull(raw.grade),
    maxAttendees: toIntOrNull(raw.maxAttendees),
    teacher: normalizeTeacher(raw.teacher),
    course: normalizeCourse(raw.course),
    attendees,
  };
}

const POPULATE_QUERY =
  // teacher → teacher-profile; display fields are on its nested user (user-profile).
  "populate[teacher][fields][0]=documentId" +
  "&populate[teacher][populate][user][fields][0]=displayName" +
  "&populate[teacher][populate][user][fields][1]=firstName" +
  "&populate[teacher][populate][user][fields][2]=lastName" +
  "&populate[course][fields][0]=title" +
  // attendees → user-profile directly.
  "&populate[attendees][fields][0]=firstName" +
  "&populate[attendees][fields][1]=lastName" +
  "&populate[attendees][fields][2]=displayName" +
  "&populate[attendees][fields][3]=level" +
  "&populate[attendees][populate][avatar][fields][0]=url";

const LIST_QUERY =
  POPULATE_QUERY +
  "&pagination[pageSize]=200" +
  "&sort=startAt:asc";

export interface SessionRangeFilter {
  fromISO?: string;
  toISO?: string;
  status?: SessionStatus | SessionStatus[];
}

function buildListUrl(filter?: SessionRangeFilter): string {
  const qs = [LIST_QUERY];
  if (filter?.fromISO) {
    qs.push(`filters[startAt][$gte]=${encodeURIComponent(filter.fromISO)}`);
  }
  if (filter?.toISO) {
    qs.push(`filters[startAt][$lte]=${encodeURIComponent(filter.toISO)}`);
  }
  if (filter?.status) {
    const arr = Array.isArray(filter.status) ? filter.status : [filter.status];
    arr.forEach((s, i) => {
      qs.push(`filters[status][$in][${i}]=${encodeURIComponent(s)}`);
    });
  }
  return `/api/sessions?${qs.join("&")}`;
}

export async function fetchSessions(
  filter?: SessionRangeFilter,
): Promise<Session[]> {
  const res = await fetch(buildListUrl(filter), { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchSessions ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((s): s is Session => s !== null);
}

// ─── Range-keyed SWR cache ──────────────────────────────────────────────────
//
// The schedule UI mounts/unmounts as the user navigates between tabs and
// shifts week/month/day. Each unique range hits this cache; a fresh entry
// (<10 s) is returned synchronously, otherwise a network round-trip refreshes
// it. Mutations (create/update/delete) call `invalidateSessionsCache()` so the
// next read is authoritative.

interface CachedSessionsEntry {
  rows: Session[];
  storedAt: number;
}

const SESSIONS_TTL_MS = 10_000;
const sessionsCache = new Map<string, CachedSessionsEntry>();
const sessionsInflight = new Map<string, Promise<Session[]>>();

function rangeKey(filter?: SessionRangeFilter): string {
  if (!filter) return "*";
  const status = Array.isArray(filter.status)
    ? filter.status.slice().sort().join(",")
    : (filter.status ?? "");
  return `${filter.fromISO ?? ""}..${filter.toISO ?? ""}|${status}`;
}

export function peekSessions(filter?: SessionRangeFilter): Session[] | null {
  const entry = sessionsCache.get(rangeKey(filter));
  return entry ? entry.rows : null;
}

export async function fetchSessionsCached(
  filter?: SessionRangeFilter,
): Promise<Session[]> {
  const key = rangeKey(filter);
  const cached = sessionsCache.get(key);
  if (cached && Date.now() - cached.storedAt < SESSIONS_TTL_MS) {
    return cached.rows;
  }
  const inflight = sessionsInflight.get(key);
  if (inflight) return inflight;
  const p = fetchSessions(filter)
    .then((rows) => {
      sessionsCache.set(key, { rows, storedAt: Date.now() });
      return rows;
    })
    .finally(() => {
      sessionsInflight.delete(key);
    });
  sessionsInflight.set(key, p);
  return p;
}

/** Drop every cached range. Call after create/update/delete. */
export function invalidateSessionsCache(): void {
  sessionsCache.clear();
  sessionsInflight.clear();
}

export async function fetchSession(documentId: string): Promise<Session | null> {
  const res = await fetch(
    `/api/sessions/${documentId}?${POPULATE_QUERY}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`fetchSession ${res.status}`);
  }
  const json = await res.json().catch(() => ({}));
  return normalize(json?.data);
}

export interface SessionInput {
  title: string;
  startAt: string;
  durationMin: number;
  type: SessionType;
  status?: SessionStatus;
  attendeeIds?: string[];
  courseId?: string | null;
  joinUrl?: string | null;
  notes?: string | null;
  maxAttendees?: number | null;
}

function toPayload(input: Partial<SessionInput>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (input.title !== undefined) out.title = input.title;
  if (input.startAt !== undefined) out.startAt = input.startAt;
  if (input.durationMin !== undefined) out.durationMin = input.durationMin;
  if (input.type !== undefined) out.type = input.type;
  if (input.status !== undefined) out.status = input.status;
  if (input.attendeeIds !== undefined) out.attendees = input.attendeeIds;
  if (input.courseId !== undefined) out.course = input.courseId;
  if (input.joinUrl !== undefined) out.joinUrl = input.joinUrl;
  if (input.notes !== undefined) out.notes = input.notes;
  if (input.maxAttendees !== undefined) out.maxAttendees = input.maxAttendees;
  return out;
}

export async function createSession(input: SessionInput): Promise<Session> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: toPayload(input) }),
  });
  if (!res.ok) throw new Error(`createSession ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const normalized = normalize(json?.data);
  if (!normalized) throw new Error("createSession: malformed response");
  invalidateSessionsCache();
  return normalized;
}

export async function updateSession(
  documentId: string,
  input: Partial<SessionInput>,
): Promise<Session> {
  const res = await fetch(`/api/sessions/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: toPayload(input) }),
  });
  if (!res.ok) throw new Error(`updateSession ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const normalized = normalize(json?.data);
  if (!normalized) throw new Error("updateSession: malformed response");
  invalidateSessionsCache();
  return normalized;
}

export async function deleteSession(documentId: string): Promise<void> {
  const res = await fetch(`/api/sessions/${documentId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`deleteSession ${res.status}`);
  invalidateSessionsCache();
}

export function splitStartAt(startAt: string): { date: string; time: string } {
  if (!startAt) return { date: "", time: "" };
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

export function combineStartAt(date: string, time: string): string {
  if (!date || !time) return "";
  const iso = new Date(`${date}T${time}:00`);
  if (Number.isNaN(iso.getTime())) return "";
  return iso.toISOString();
}
