/**
 * Public API surface — every reader/writer against the Strapi backend goes
 * through here. Consumers import typed domain objects, not raw envelopes.
 *
 * Layering:
 *   - Public catalog reads (courses, lessons, sessions): anonymous HTTP with
 *     `fetcher`; safe to call from RSC or browser.
 *   - Auth'd reads/writes (user-progress, my sessions): go through
 *     `fetcherAuth` when server-side, or through same-origin Next proxies
 *     (`/api/user-progress`) when client-side, so the httpOnly access cookie
 *     is attached as Bearer without exposing it to the browser.
 *
 * All results flow through `lib/normalize.ts` so the UI never handles raw
 * Strapi envelopes.
 */
import { API_BASE_URL } from './config';
import { fetcher, fetcherAuth, fetcherClient } from './fetcher';
import {
  normalizeCourses,
  normalizeCourse,
  normalizeLessons,
  normalizeLesson,
  normalizeSessions,
} from './normalize';
import type {
  Course,
  Lesson,
  CalendarSession,
  ProgressStatus,
  StrapiCollection,
  StrapiSingle,
} from './types';

// ─── URL helpers ────────────────────────────────────────────────────────────

const BASE = () => API_BASE_URL.replace(/\/+$/, '');
const q = (params: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') s.append(k, String(v));
  }
  const str = s.toString();
  return str ? `?${str}` : '';
};

/**
 * Populate spec for a Course: teacher + its user (+ avatar), thumbnail, sections.
 * Strapi v5 nested populate: bracket notation.
 */
const COURSE_POPULATE =
  'populate[teacher][populate][user][populate][avatar]=true' +
  '&populate[thumbnail]=true' +
  '&populate[sections]=true';

const LESSON_POPULATE =
  'populate[exercises]=true' +
  '&populate[cover]=true' +
  '&populate[video]=true' +
  '&populate[course][fields][0]=slug&populate[course][fields][1]=documentId';

const SESSION_POPULATE =
  'populate[course][fields][0]=slug' +
  '&populate[teacher][fields][0]=publicSlug';

// ─── Courses ────────────────────────────────────────────────────────────────

export async function fetchCourses(): Promise<Course[]> {
  const env = await fetcher<StrapiCollection<any>>(
    `${BASE()}/api/courses?${COURSE_POPULATE}`,
  );
  return normalizeCourses(env);
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const env = await fetcher<StrapiCollection<any>>(
    `${BASE()}/api/courses${q({ 'filters[slug][$eq]': slug })}&${COURSE_POPULATE}`,
  );
  const first = (env?.data ?? [])[0];
  return first ? normalizeCourse(first) : null;
}

// ─── Lessons ────────────────────────────────────────────────────────────────

export async function fetchLessonsByCourse(courseSlug: string): Promise<Lesson[]> {
  const env = await fetcher<StrapiCollection<any>>(
    `${BASE()}/api/lessons${q({
      'filters[course][slug][$eq]': courseSlug,
      'sort[0]': 'orderIndex:asc',
    })}&${LESSON_POPULATE}`,
  );
  return normalizeLessons(env);
}

export async function fetchLesson(
  courseSlug: string,
  lessonSlug: string,
): Promise<Lesson | null> {
  const env = await fetcher<StrapiCollection<any>>(
    `${BASE()}/api/lessons${q({
      'filters[course][slug][$eq]': courseSlug,
      'filters[slug][$eq]': lessonSlug,
      'pagination[pageSize]': 1,
    })}&${LESSON_POPULATE}`,
  );
  const first = (env?.data ?? [])[0];
  return first ? normalizeLesson(first) : null;
}

// ─── Calendar (sessions) ────────────────────────────────────────────────────

/**
 * Server-only: lists sessions visible to the caller. The default
 * `find` permission is AUTH_ALL (any signed-in role), and any per-caller
 * scoping lives in a future session-controller override. For now we pass
 * the common filters the UI needs.
 */
export async function fetchMySessions(): Promise<CalendarSession[]> {
  const env = await fetcherAuth<StrapiCollection<any>>(
    `/api/sessions?sort[0]=startAt:asc&${SESSION_POPULATE}`,
  );
  return normalizeSessions(env);
}

// ─── User progress (auth'd write) ───────────────────────────────────────────

export type ProgressInput = {
  lessonDocumentId: string;
  courseDocumentId?: string;
  status: ProgressStatus;
  score?: number;
};

/**
 * Client-side progress write. Hits the same-origin Next proxy at
 * `/api/user-progress`, which attaches the access JWT and forwards to
 * Strapi. Strapi's user-progress controller scopes `user` to the caller
 * automatically — we do not send it from the client.
 */
export async function createProgress(input: ProgressInput): Promise<void> {
  await fetcherClient<StrapiSingle<any>>('/api/user-progress', {
    method: 'POST',
    body: {
      data: {
        lesson: input.lessonDocumentId,
        course: input.courseDocumentId,
        status: input.status,
        score: input.score,
      },
    },
  });
}
