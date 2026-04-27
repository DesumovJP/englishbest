/* eslint-disable @typescript-eslint/no-explicit-any -- Strapi v5 envelopes arrive as unknown raw shapes; narrowing lives in `normalize.ts`. Callers receive typed domain objects. */
/**
 * Public API surface — every reader/writer against the Strapi backend goes
 * through here. Consumers import typed domain objects, not raw envelopes.
 *
 * Layering:
 *   - Public catalog reads (courses, lessons, sessions): anonymous HTTP with
 *     `fetcher`; safe to call from RSC or browser.
 *   - Auth'd client writes (user-progress): go through same-origin Next
 *     proxies (`/api/user-progress`) so the httpOnly access cookie is
 *     attached as Bearer without exposing it to the browser.
 *
 * Server-only auth'd reads (that need the httpOnly cookie directly) live in
 * their own module — keeping this file client-safe avoids leaking
 * `next/headers` into the browser bundle via Turbopack's static trace.
 *
 * All results flow through `lib/normalize.ts` so the UI never handles raw
 * Strapi envelopes.
 */
import { fetcher, fetcherClient } from './fetcher';
import { createCachedFetcher, type CachedFetcher } from './data-cache';
import {
  normalizeCourses,
  normalizeCourse,
  normalizeLessons,
  normalizeLesson,
} from './normalize';
import type {
  Course,
  Lesson,
  ProgressStatus,
  StrapiCollection,
  StrapiSingle,
} from './types';

// ─── URL helpers ────────────────────────────────────────────────────────────

const q = (params: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') s.append(k, String(v));
  }
  const str = s.toString();
  return str ? `?${str}` : '';
};

/**
 * Server-side (RSC/route-handler) needs an absolute URL for `fetch`. In the
 * browser we keep relative paths so the Next proxy at `/api/...` handles
 * auth/CORS. Public catalog reads (courses/lessons) don't need the proxy's
 * JWT forwarding — hitting Strapi directly is fine.
 */
const ORIGIN =
  typeof window === 'undefined'
    ? (process.env.STRAPI_API_URL ??
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        'http://localhost:1337'
      ).replace(/\/+$/, '')
    : '';

/**
 * Populate spec for a Course: teacher + its user (+ avatar), thumbnail, sections.
 * Strapi v5 nested populate: bracket notation.
 */
const COURSE_POPULATE =
  'populate[teacher][populate][user][populate][avatar]=true' +
  '&populate[thumbnail]=true' +
  '&populate[coverImage]=true' +
  '&populate[sections]=true';

const LESSON_POPULATE =
  'populate[exercises]=true' +
  '&populate[cover]=true' +
  '&populate[video]=true' +
  '&populate[course][fields][0]=slug&populate[course][fields][1]=documentId';

// ─── Courses ────────────────────────────────────────────────────────────────

export async function fetchCourses(
  opts: { kind?: 'course' | 'book' | 'video' | 'game' } = {},
): Promise<Course[]> {
  const filter = opts.kind ? `filters[kind][$eq]=${opts.kind}&` : '';
  // Hide v0/v1/placeholder rows (status='archived') so retired catalog
  // entries don't pollute the kids' lessons or library tabs.
  const env = await fetcher<StrapiCollection<any>>(
    `${ORIGIN}/api/courses?${filter}filters[status][$ne]=archived&${COURSE_POPULATE}`,
  );
  return normalizeCourses(env);
}

// ─── Cached courses (catalog) ───────────────────────────────────────────────
//
// /library reads the same course list on every mount. Wrap `fetchCourses`
// in a per-kind SWR cache so tab-back to /library is instant. The 5 min
// stale window matches our other catalog caches (rooms / shop / characters);
// admin edits in Strapi take effect on next load or after `resetCoursesCache`.

type CourseKind = 'course' | 'book' | 'video' | 'game';
const courseCacheByKind = new Map<string, CachedFetcher<Course[]>>();

function getCoursesCache(kind?: CourseKind): CachedFetcher<Course[]> {
  const key = `courses:${kind ?? 'all'}`;
  const existing = courseCacheByKind.get(key);
  if (existing) return existing;
  const cache = createCachedFetcher<Course[]>({
    key,
    ttlMs: 5 * 60 * 1000,
    fetch: () => fetchCourses({ kind }),
  });
  courseCacheByKind.set(key, cache);
  return cache;
}

export function fetchCoursesCached(
  opts: { kind?: CourseKind } = {},
): Promise<Course[]> {
  return getCoursesCache(opts.kind).get();
}

export function peekCourses(opts: { kind?: CourseKind } = {}): Course[] | null {
  return getCoursesCache(opts.kind).peek();
}

export function resetCoursesCache(): void {
  for (const cache of courseCacheByKind.values()) cache.reset();
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const env = await fetcher<StrapiCollection<any>>(
    `${ORIGIN}/api/courses${q({ 'filters[slug][$eq]': slug })}&${COURSE_POPULATE}`,
  );
  const first = (env?.data ?? [])[0];
  return first ? normalizeCourse(first) : null;
}

// ─── Lessons ────────────────────────────────────────────────────────────────

export async function fetchLessonsByCourse(courseSlug: string): Promise<Lesson[]> {
  const env = await fetcher<StrapiCollection<any>>(
    `${ORIGIN}/api/lessons${q({
      'filters[course][slug][$eq]': courseSlug,
      'sort[0]': 'orderIndex:asc',
    })}&${LESSON_POPULATE}`,
  );
  return normalizeLessons(env);
}

// ─── Cached lessons-by-course (per-slug SWR) ────────────────────────────────
//
// Kids "Школа" tab fans out a `fetchLessonsByCourse` per visible course on
// every mount (see LessonTreeSection / LessonCarouselSection). Wrapping each
// slug in its own cache makes return-visits instant.

const lessonsByCourseCache = new Map<string, CachedFetcher<Lesson[]>>();

function getLessonsByCourseCache(slug: string): CachedFetcher<Lesson[]> {
  const existing = lessonsByCourseCache.get(slug);
  if (existing) return existing;
  const cache = createCachedFetcher<Lesson[]>({
    key: `lessons:${slug}`,
    ttlMs: 5 * 60 * 1000,
    fetch: () => fetchLessonsByCourse(slug),
  });
  lessonsByCourseCache.set(slug, cache);
  return cache;
}

export function fetchLessonsByCourseCached(courseSlug: string): Promise<Lesson[]> {
  return getLessonsByCourseCache(courseSlug).get();
}

export function peekLessonsByCourse(courseSlug: string): Lesson[] | null {
  return getLessonsByCourseCache(courseSlug).peek();
}

export function resetLessonsByCourseCache(slug?: string): void {
  if (slug) {
    lessonsByCourseCache.get(slug)?.reset();
    return;
  }
  for (const cache of lessonsByCourseCache.values()) cache.reset();
}

export async function fetchLesson(
  courseSlug: string,
  lessonSlug: string,
): Promise<Lesson | null> {
  const env = await fetcher<StrapiCollection<any>>(
    `${ORIGIN}/api/lessons${q({
      'filters[course][slug][$eq]': courseSlug,
      'filters[slug][$eq]': lessonSlug,
      'pagination[pageSize]': 1,
    })}&${LESSON_POPULATE}`,
  );
  const first = (env?.data ?? [])[0];
  return first ? normalizeLesson(first) : null;
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
  // Refreshing my-progress is the caller's job (we lazy-import to avoid a
  // circular dep), but progress writes never affect the catalog caches.
  try {
    const mod = await import('./user-progress');
    mod.resetMyProgressCache?.();
  } catch {
    /* progress cache module not loaded yet — nothing to invalidate */
  }
}
