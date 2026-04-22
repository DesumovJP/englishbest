/* eslint-disable @typescript-eslint/no-explicit-any -- Boundary parser: raw Strapi shapes are unknown by design; all narrowing and typing happens in this file so callers receive domain types. */
/**
 * Strapi v5 → domain types normalizer.
 *
 * Single drift boundary between the backend envelope shape and the canonical
 * types in `lib/types.ts`. Every consumer in the app should read post-normalize
 * data — never raw Strapi responses.
 *
 * Responsibilities:
 *  1. Unwrap `{ data, meta }` envelopes (collection + single).
 *  2. Absolutize media URLs (`/uploads/...` → `${API_BASE_URL}/uploads/...`).
 *  3. Split `session.startAt` into legacy `date`/`time`/`duration` fields.
 *  4. Flatten nested relations (teacher → TeacherSummary).
 *  5. Populate legacy aliases so existing mock consumers keep working during
 *     the chunked FE migration (teacherSlug/teacherName/thumbnail/rating on
 *     Course; lessonSlug/content on Lesson).
 *
 * Kyiv-time assumption for date/time extraction: the session `startAt` is
 * stored as UTC; we format using `Europe/Kyiv` so the UI shows local wall-clock
 * consistent with how lessons were scheduled.
 */

import { API_BASE_URL } from './config';
import type {
  Course,
  Lesson,
  Exercise,
  TeacherSummary,
  CalendarSession,
  Review,
  StrapiCollection,
  StrapiSingle,
  StrapiMedia,
  StrapiPagination,
} from './types';

// ─── Envelope helpers ───────────────────────────────────────────────────────

export function unwrapCollection<T>(env: StrapiCollection<T>): T[] {
  return Array.isArray(env?.data) ? env.data : [];
}

export function unwrapSingle<T>(env: StrapiSingle<T> | null | undefined): T | null {
  return env?.data ?? null;
}

export function pagination(env: StrapiCollection<unknown>): StrapiPagination {
  return (
    env?.meta?.pagination ?? { page: 1, pageSize: 0, pageCount: 0, total: 0 }
  );
}

// ─── Media ──────────────────────────────────────────────────────────────────

/** Join a Strapi media URL with the backend base. Pass-through for absolute URLs. */
export function mediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function mediaFrom(m?: StrapiMedia | null): string | undefined {
  return mediaUrl(m?.url);
}

// ─── Time ───────────────────────────────────────────────────────────────────

const KYIV_DATE_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Kyiv',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const KYIV_TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Kyiv',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function splitKyiv(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return {
    date: KYIV_DATE_FMT.format(d), // YYYY-MM-DD
    time: KYIV_TIME_FMT.format(d), // HH:MM
  };
}

// ─── Exercise ───────────────────────────────────────────────────────────────

export function normalizeExercise(raw: any): Exercise {
  return {
    slug: raw?.slug ?? raw?.id?.toString() ?? '',
    type: raw?.type ?? 'mcq',
    question: raw?.question ?? '',
    options: raw?.options,
    answer: raw?.answer,
    explanation: raw?.explanation ?? undefined,
    meta: raw?.meta ?? undefined,
    points: raw?.points ?? undefined,
  };
}

// ─── Teacher summary ────────────────────────────────────────────────────────

export function normalizeTeacherSummary(raw: any): TeacherSummary | undefined {
  if (!raw) return undefined;
  const user = raw?.user ?? {};
  const joinedName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || undefined;
  const displayName = user?.displayName ?? joinedName;
  const avatar = mediaFrom(user?.avatar) ?? undefined;
  return {
    documentId: raw.documentId,
    publicSlug: raw.publicSlug ?? undefined,
    displayName,
    bio: raw.bio ?? undefined,
    rating: typeof raw.rating === 'number' ? raw.rating : Number(raw.rating) || undefined,
    avatarUrl: avatar,
  };
}

// ─── Course ─────────────────────────────────────────────────────────────────

export function normalizeCourse(raw: any): Course {
  const teacher = normalizeTeacherSummary(raw?.teacher);
  const thumbnailUrl = mediaFrom(raw?.thumbnail);
  const sections = Array.isArray(raw?.sections)
    ? raw.sections.map((s: any) => {
        const lessonSlugs = Array.isArray(s?.lessonSlugs) ? s.lessonSlugs : [];
        return {
          slug: s?.slug ?? '',
          title: s?.title ?? '',
          order: typeof s?.order === 'number' ? s.order : undefined,
          lessonSlugs,
          // Legacy alias for older consumers.
          lessons: lessonSlugs,
        };
      })
    : [];

  const ratingAvg =
    typeof raw?.ratingAvg === 'number' ? raw.ratingAvg : Number(raw?.ratingAvg) || undefined;
  const price =
    typeof raw?.price === 'number' ? raw.price : Number(raw?.price) || undefined;

  return {
    documentId: raw?.documentId,
    slug: raw?.slug ?? '',
    title: raw?.title ?? '',
    description: raw?.description ?? undefined,
    level: raw?.level ?? undefined,
    price,
    currency: raw?.currency ?? undefined,
    thumbnailUrl,
    teacher,
    sections,
    tags: Array.isArray(raw?.tags) ? raw.tags : undefined,
    ratingAvg,
    reviewCount: typeof raw?.reviewCount === 'number' ? raw.reviewCount : undefined,
    status: raw?.status ?? 'available',
    audience: raw?.audience ?? undefined,
    durationWeeks: raw?.durationWeeks ?? undefined,
    maxStudents: raw?.maxStudents ?? undefined,

    // Legacy aliases — delete from Course type once all consumers migrate.
    teacherSlug: teacher?.publicSlug,
    teacherName: teacher?.displayName,
    thumbnail: thumbnailUrl,
    rating: ratingAvg,
  };
}

// ─── Lesson ─────────────────────────────────────────────────────────────────

export function normalizeLesson(raw: any): Lesson {
  const exercises = Array.isArray(raw?.exercises)
    ? raw.exercises.map(normalizeExercise)
    : [];
  const videoUrl = raw?.videoUrl ?? mediaFrom(raw?.video) ?? undefined;
  const coverUrl = mediaFrom(raw?.cover);
  const courseSlug = raw?.course?.slug ?? undefined;
  const courseDocumentId = raw?.course?.documentId ?? undefined;

  const steps = Array.isArray(raw?.steps) ? (raw.steps as unknown[]) : undefined;
  const xp = typeof raw?.xp === 'number' ? raw.xp : undefined;

  return {
    documentId: raw?.documentId,
    slug: raw?.slug ?? '',
    title: raw?.title ?? '',
    courseSlug,
    courseDocumentId,
    sectionSlug: raw?.sectionSlug ?? undefined,
    orderIndex: typeof raw?.orderIndex === 'number' ? raw.orderIndex : undefined,
    type: raw?.type ?? 'video',
    durationMin: raw?.durationMin ?? undefined,
    videoUrl,
    transcript: raw?.transcript ?? undefined,
    coverUrl,
    exercises,
    isFree: raw?.isFree ?? undefined,
    steps,
    xp,

    // Legacy aliases.
    lessonSlug: raw?.slug ?? '',
    content: {
      videoUrl,
      transcript: raw?.transcript ?? undefined,
      exercises,
    },
  };
}

// ─── Calendar session ───────────────────────────────────────────────────────

export function normalizeSession(raw: any): CalendarSession {
  const startAt = raw?.startAt ?? '';
  const { date, time } = splitKyiv(startAt);
  const durationMin = typeof raw?.durationMin === 'number' ? raw.durationMin : 0;

  return {
    documentId: raw?.documentId,
    title: raw?.title ?? '',
    courseSlug: raw?.course?.slug ?? undefined,
    teacherSlug: raw?.teacher?.publicSlug ?? undefined,
    startAt,
    durationMin,
    type: raw?.type ?? 'group',
    status: raw?.status ?? 'scheduled',
    joinUrl: raw?.joinUrl ?? undefined,
    recordingUrl: raw?.recordingUrl ?? undefined,
    grade: typeof raw?.grade === 'number' ? raw.grade : undefined,

    // Legacy aliases used by CalendarView.
    date,
    time,
    duration: durationMin,
  };
}

// ─── Review ─────────────────────────────────────────────────────────────────

function reviewAuthorName(author: any): string | undefined {
  if (!author) return undefined;
  if (author.displayName) return author.displayName;
  const joined = [author.firstName, author.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return joined || undefined;
}


export function normalizeReview(raw: any): Review {
  return {
    documentId: raw?.documentId,
    rating: typeof raw?.rating === 'number' ? raw.rating : Number(raw?.rating) || 0,
    title: raw?.title ?? undefined,
    body: raw?.body ?? undefined,
    verified: raw?.verified ?? undefined,
    authorName: reviewAuthorName(raw?.author),
    createdAt: raw?.createdAt ?? '',
  };
}

// ─── Collection normalizers (convenience) ───────────────────────────────────

export function normalizeCourses(env: StrapiCollection<any>): Course[] {
  return unwrapCollection(env).map(normalizeCourse);
}

export function normalizeLessons(env: StrapiCollection<any>): Lesson[] {
  return unwrapCollection(env).map(normalizeLesson);
}

export function normalizeSessions(env: StrapiCollection<any>): CalendarSession[] {
  return unwrapCollection(env).map(normalizeSession);
}

export function normalizeReviews(env: StrapiCollection<any>): Review[] {
  return unwrapCollection(env).map(normalizeReview);
}
