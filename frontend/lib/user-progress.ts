/**
 * User-progress reader + helpers — Kids Zone progress surface.
 *
 * Writes live in `lib/api.ts::createProgress` (unchanged). This module is the
 * read-side companion: fetch the caller's own progress rows via the Next
 * `/api/user-progress` proxy (which forwards the httpOnly access JWT). The
 * backend's scoped controller already filters to `user = caller`, so we never
 * send a user filter from the client.
 *
 * Strapi v5 plural endpoint is `user-progresses`, but our proxy sits at the
 * singular path — keep consumers calling `/api/user-progress` only.
 */
import type { ProgressStatus } from './types';

export interface ProgressLessonRef {
  documentId: string;
  slug: string;
  title: string;
  orderIndex: number;
  type: string;
  courseSlug?: string;
  courseDocumentId?: string;
}

export interface ProgressCourseRef {
  documentId: string;
  slug: string;
  title: string;
  level?: string;
  iconEmoji?: string;
}

export interface UserProgressRow {
  documentId: string;
  status: ProgressStatus;
  score: number | null;
  attempts: number;
  completedAt: string | null;
  lastAttemptAt: string | null;
  timeSpentSec: number;
  updatedAt: string;
  lesson: ProgressLessonRef | null;
  course: ProgressCourseRef | null;
}

const POPULATE = [
  'populate[lesson][populate][course]=true',
  'populate[course]=true',
].join('&');

function normalizeRow(raw: any): UserProgressRow {
  const lesson = raw?.lesson ?? null;
  const course = raw?.course ?? null;
  const lessonCourse = lesson?.course ?? null;
  return {
    documentId: raw?.documentId ?? raw?.id ?? '',
    status: (raw?.status ?? 'notStarted') as ProgressStatus,
    score: typeof raw?.score === 'number' ? raw.score : null,
    attempts: typeof raw?.attempts === 'number' ? raw.attempts : 0,
    completedAt: raw?.completedAt ?? null,
    lastAttemptAt: raw?.lastAttemptAt ?? null,
    timeSpentSec: typeof raw?.timeSpentSec === 'number' ? raw.timeSpentSec : 0,
    updatedAt: raw?.updatedAt ?? raw?.createdAt ?? '',
    lesson: lesson
      ? {
          documentId: lesson.documentId,
          slug: lesson.slug,
          title: lesson.title,
          orderIndex: lesson.orderIndex ?? 0,
          type: lesson.type ?? 'video',
          courseSlug: lessonCourse?.slug,
          courseDocumentId: lessonCourse?.documentId,
        }
      : null,
    course: course
      ? {
          documentId: course.documentId,
          slug: course.slug,
          title: course.title,
          level: course.level,
          iconEmoji: course.iconEmoji,
        }
      : null,
  };
}

export interface FetchProgressOptions {
  status?: ProgressStatus | ProgressStatus[];
  pageSize?: number;
  sort?: string;
}

/**
 * Fetch the caller's own progress rows. Server enforces ownership.
 * Default sort: most recently attempted first (fallback to updatedAt for rows
 * that have never been attempted).
 */
export async function fetchMyProgress(
  opts: FetchProgressOptions = {},
): Promise<UserProgressRow[]> {
  const params = new URLSearchParams();
  const pageSize = opts.pageSize ?? 100;
  params.set('pagination[pageSize]', String(pageSize));
  params.set('sort[0]', opts.sort ?? 'lastAttemptAt:desc');
  params.set('sort[1]', 'updatedAt:desc');
  if (opts.status) {
    const arr = Array.isArray(opts.status) ? opts.status : [opts.status];
    arr.forEach((s, i) => params.set(`filters[status][$in][${i}]`, s));
  }
  const qs = `${params.toString()}&${POPULATE}`;

  const res = await fetch(`/api/user-progress?${qs}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`fetchMyProgress ${res.status}`);
  }
  const json = await res.json().catch(() => ({}));
  const data = Array.isArray(json?.data) ? json.data : [];
  return data.map(normalizeRow);
}

/**
 * The single "continue here" lesson: most recent inProgress row.
 * Falls back to null if the learner has not started anything.
 */
export async function fetchContinueLesson(): Promise<UserProgressRow | null> {
  const rows = await fetchMyProgress({ status: 'inProgress', pageSize: 1 });
  return rows[0] ?? null;
}

/**
 * Teacher/admin read of a specific student's progress rows.
 * Backend controller bypasses the owner-scope for staff roles, so the
 * explicit `filters[user][documentId]` is respected.
 */
export async function fetchStudentProgress(
  studentProfileId: string,
  opts: FetchProgressOptions = {},
): Promise<UserProgressRow[]> {
  const params = new URLSearchParams();
  const pageSize = opts.pageSize ?? 200;
  params.set('pagination[pageSize]', String(pageSize));
  params.set('sort[0]', opts.sort ?? 'lastAttemptAt:desc');
  params.set('sort[1]', 'updatedAt:desc');
  params.set('filters[user][documentId][$eq]', studentProfileId);
  if (opts.status) {
    const arr = Array.isArray(opts.status) ? opts.status : [opts.status];
    arr.forEach((s, i) => params.set(`filters[status][$in][${i}]`, s));
  }
  const qs = `${params.toString()}&${POPULATE}`;

  const res = await fetch(`/api/user-progress?${qs}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`fetchStudentProgress ${res.status}`);
  }
  const json = await res.json().catch(() => ({}));
  const data = Array.isArray(json?.data) ? json.data : [];
  return data.map(normalizeRow);
}
