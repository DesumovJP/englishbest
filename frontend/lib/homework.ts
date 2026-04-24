/**
 * Homework + homework-submission loaders / mutators.
 *
 * `Homework`   = teacher-authored task (parent).
 * `Submission` = per-student instance created on publish by the backend
 * lifecycle; carries answers, submittedAt, score, teacherFeedback.
 *
 * Both hit their respective `/api/*` proxies which forward the auth cookie
 * to Strapi. No module-level cache — submissions mutate often and teachers
 * expect fresh state per page-view.
 */

export type HomeworkStatus = 'draft' | 'published' | 'closed' | 'archived';
export type SubmissionStatus =
  | 'notStarted'
  | 'inProgress'
  | 'submitted'
  | 'reviewed'
  | 'returned'
  | 'overdue';

export interface HomeworkRef {
  documentId: string;
  title: string;
  description: string;
  dueAt: string | null;
  status: HomeworkStatus;
}

export interface StudentRef {
  documentId: string;
  displayName: string;
  avatarUrl: string | null;
  level: string | null;
}

export interface Submission {
  documentId: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  gradedAt: string | null;
  score: number | null;
  teacherFeedback: string | null;
  answers: Record<string, unknown> | null;
  attachments: Array<{ url: string; name: string; mime: string }>;
  homework: HomeworkRef | null;
  student: StudentRef | null;
}

const SUBMISSION_STATUSES = new Set<SubmissionStatus>([
  'notStarted',
  'inProgress',
  'submitted',
  'reviewed',
  'returned',
  'overdue',
]);
const HOMEWORK_STATUSES = new Set<HomeworkStatus>([
  'draft',
  'published',
  'closed',
  'archived',
]);

function pickSubStatus(v: unknown): SubmissionStatus {
  return typeof v === 'string' && SUBMISSION_STATUSES.has(v as SubmissionStatus)
    ? (v as SubmissionStatus)
    : 'notStarted';
}

function pickHwStatus(v: unknown): HomeworkStatus {
  return typeof v === 'string' && HOMEWORK_STATUSES.has(v as HomeworkStatus)
    ? (v as HomeworkStatus)
    : 'draft';
}

function nullableStr(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function nullableNum(v: unknown): number | null {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function mediaUrl(media: unknown): string | null {
  if (!media || typeof media !== 'object') return null;
  const url = (media as { url?: unknown }).url;
  return typeof url === 'string' && url.length > 0 ? url : null;
}

function normalizeStudent(raw: any): StudentRef | null {
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

function normalizeHomework(raw: any): HomeworkRef | null {
  if (!raw?.documentId) return null;
  return {
    documentId: String(raw.documentId),
    title: typeof raw.title === 'string' ? raw.title : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    dueAt: nullableStr(raw.dueAt),
    status: pickHwStatus(raw.status),
  };
}

function normalizeAttachment(raw: any): { url: string; name: string; mime: string } | null {
  if (!raw || typeof raw !== 'object') return null;
  const url = (raw as { url?: unknown }).url;
  if (typeof url !== 'string' || url.length === 0) return null;
  return {
    url,
    name: typeof raw.name === 'string' ? raw.name : '',
    mime: typeof raw.mime === 'string' ? raw.mime : '',
  };
}

function normalizeSubmission(raw: any): Submission | null {
  if (!raw?.documentId) return null;
  const attachments: Array<{ url: string; name: string; mime: string }> = Array.isArray(raw.attachments)
    ? raw.attachments
        .map(normalizeAttachment)
        .filter((a: any): a is { url: string; name: string; mime: string } => a !== null)
    : [];
  return {
    documentId: String(raw.documentId),
    status: pickSubStatus(raw.status),
    submittedAt: nullableStr(raw.submittedAt),
    gradedAt: nullableStr(raw.gradedAt),
    score: nullableNum(raw.score),
    teacherFeedback: nullableStr(raw.teacherFeedback),
    answers:
      raw.answers && typeof raw.answers === 'object'
        ? (raw.answers as Record<string, unknown>)
        : null,
    attachments,
    homework: normalizeHomework(raw.homework),
    student: normalizeStudent(raw.student),
  };
}

const LIST_QUERY =
  'populate[homework][fields][0]=title' +
  '&populate[homework][fields][1]=description' +
  '&populate[homework][fields][2]=dueAt' +
  '&populate[homework][fields][3]=status' +
  '&populate[student][fields][0]=firstName' +
  '&populate[student][fields][1]=lastName' +
  '&populate[student][fields][2]=displayName' +
  '&populate[student][fields][3]=level' +
  '&populate[student][populate][avatar][fields][0]=url' +
  '&populate[attachments][fields][0]=url' +
  '&populate[attachments][fields][1]=name' +
  '&populate[attachments][fields][2]=mime' +
  '&pagination[pageSize]=200' +
  '&sort=createdAt:desc';

export async function fetchSubmissions(): Promise<Submission[]> {
  const res = await fetch(`/api/homework-submissions?${LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchSubmissions ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map(normalizeSubmission)
    .filter((s): s is Submission => s !== null);
}

export async function fetchSubmission(documentId: string): Promise<Submission | null> {
  const res = await fetch(`/api/homework-submissions/${documentId}?${LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`fetchSubmission ${res.status}`);
  }
  const json = await res.json().catch(() => ({}));
  return normalizeSubmission(json?.data);
}

export interface GradeInput {
  score?: number | null;
  teacherFeedback?: string | null;
  status?: 'reviewed' | 'returned';
}

export async function gradeSubmission(
  documentId: string,
  input: GradeInput,
): Promise<Submission> {
  const res = await fetch(`/api/homework-submissions/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: input }),
  });
  if (!res.ok) throw new Error(`gradeSubmission ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalizeSubmission(json?.data);
  if (!n) throw new Error('gradeSubmission: malformed response');
  return n;
}

export interface StudentSubmitInput {
  answers?: Record<string, unknown>;
  status?: 'inProgress' | 'submitted';
  attachments?: string[]; // media ids
}

export async function updateMySubmission(
  documentId: string,
  input: StudentSubmitInput,
): Promise<Submission> {
  const res = await fetch(`/api/homework-submissions/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: input }),
  });
  if (!res.ok) throw new Error(`updateMySubmission ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalizeSubmission(json?.data);
  if (!n) throw new Error('updateMySubmission: malformed response');
  return n;
}

// ─── Homework parent (teacher CRUD) ─────────────────────────────────────────

export interface Homework {
  documentId: string;
  title: string;
  description: string;
  dueAt: string | null;
  status: HomeworkStatus;
  assignees: StudentRef[];
}

function normalizeHomeworkFull(raw: any): Homework | null {
  if (!raw?.documentId) return null;
  const assignees: StudentRef[] = Array.isArray(raw.assignees)
    ? raw.assignees
        .map(normalizeStudent)
        .filter((s: StudentRef | null): s is StudentRef => s !== null)
    : [];
  return {
    documentId: String(raw.documentId),
    title: typeof raw.title === 'string' ? raw.title : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    dueAt: nullableStr(raw.dueAt),
    status: pickHwStatus(raw.status),
    assignees,
  };
}

const HOMEWORK_LIST_QUERY =
  'populate[assignees][fields][0]=firstName' +
  '&populate[assignees][fields][1]=lastName' +
  '&populate[assignees][fields][2]=displayName' +
  '&populate[assignees][fields][3]=level' +
  '&populate[assignees][populate][avatar][fields][0]=url' +
  '&pagination[pageSize]=200' +
  '&sort=createdAt:desc';

export async function fetchHomeworks(): Promise<Homework[]> {
  const res = await fetch(`/api/homeworks?${HOMEWORK_LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchHomeworks ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map(normalizeHomeworkFull)
    .filter((h): h is Homework => h !== null);
}

export interface HomeworkInput {
  title: string;
  description?: string;
  dueAt?: string | null;
  status?: HomeworkStatus;
  assigneeIds?: string[];
  lessonId?: string;
  courseId?: string;
}

export async function createHomework(input: HomeworkInput): Promise<Homework> {
  const res = await fetch('/api/homeworks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: toHomeworkPayload(input) }),
  });
  if (!res.ok) throw new Error(`createHomework ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalizeHomeworkFull(json?.data);
  if (!n) throw new Error('createHomework: malformed response');
  return n;
}

export async function publishHomework(documentId: string): Promise<Homework> {
  const res = await fetch(`/api/homeworks/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { status: 'published' } }),
  });
  if (!res.ok) throw new Error(`publishHomework ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalizeHomeworkFull(json?.data);
  if (!n) throw new Error('publishHomework: malformed response');
  return n;
}

export async function updateHomework(
  documentId: string,
  input: Partial<HomeworkInput>,
): Promise<Homework> {
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.dueAt !== undefined) data.dueAt = input.dueAt;
  if (input.status !== undefined) data.status = input.status;
  if (input.assigneeIds !== undefined) data.assignees = input.assigneeIds;
  if (input.lessonId !== undefined) data.lesson = input.lessonId;
  if (input.courseId !== undefined) data.course = input.courseId;
  const res = await fetch(`/api/homeworks/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`updateHomework ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalizeHomeworkFull(json?.data);
  if (!n) throw new Error('updateHomework: malformed response');
  return n;
}

export async function deleteHomework(documentId: string): Promise<void> {
  const res = await fetch(`/api/homeworks/${documentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteHomework ${res.status}`);
}

function toHomeworkPayload(input: HomeworkInput): Record<string, unknown> {
  const out: Record<string, unknown> = { title: input.title };
  if (input.description !== undefined) out.description = input.description;
  if (input.dueAt !== undefined) out.dueAt = input.dueAt;
  if (input.status !== undefined) out.status = input.status;
  if (input.assigneeIds !== undefined) out.assignees = input.assigneeIds;
  if (input.lessonId !== undefined) out.lesson = input.lessonId;
  if (input.courseId !== undefined) out.course = input.courseId;
  return out;
}
