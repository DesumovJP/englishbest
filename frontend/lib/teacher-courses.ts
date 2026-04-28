/**
 * Teacher-side courses helpers.
 *
 * Live calls to `/api/courses` (staff-write proxy). Used by the course
 * editor to manage course metadata, the sections (units) component,
 * and to feed the course list page. Read-only catalog browsing keeps
 * using `lib/api.ts` (which serves the kids-school carousel).
 */
import { resetCoursesCache } from './api';

export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type CourseAudience = 'kids' | 'teens' | 'adults' | 'any';
export type CourseKind = 'course' | 'book' | 'video' | 'game';
export type CourseStatus = 'available' | 'soldOut' | 'comingSoon' | 'archived';

export interface CourseSection {
  /** Strapi component repeatable rows always have an id field. */
  id?: number;
  slug: string;
  title: string;
  order: number;
  lessonSlugs: string[];
}

export interface CourseSummary {
  documentId: string;
  slug: string;
  title: string;
  titleUa: string | null;
  level: Level | null;
  audience: CourseAudience | null;
  kind: CourseKind;
  status: CourseStatus;
  iconEmoji: string | null;
  lessonCount: number;
  vocabSetCount: number;
  published: boolean;
  reviewStatus: 'draft' | 'submitted' | 'approved' | 'rejected' | null;
  coverImageUrl: string | null;
}

export type ReviewStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface CourseDetail extends CourseSummary {
  description: string | null;
  descriptionShort: string | null;
  subtitle: string | null;
  sections: CourseSection[];
  reviewStatus: ReviewStatus | null;
  rejectionReason: string | null;
  ownerDocumentId: string | null;
  coverImageUrl: string | null;
}

interface RawCourse {
  documentId?: string;
  slug?: string;
  title?: string;
  titleUa?: string;
  description?: string;
  descriptionShort?: string;
  subtitle?: string;
  level?: string;
  audience?: string;
  kind?: string;
  status?: string;
  iconEmoji?: string;
  sections?: unknown[];
  lessons?: unknown[];
  vocabularySets?: unknown[];
  publishedAt?: string | null;
  reviewStatus?: string;
  rejectionReason?: string;
  owner?: { documentId?: string } | null;
  coverImage?: { url?: string } | null;
}

const REVIEW_STATUSES = new Set<ReviewStatus>(['draft', 'submitted', 'approved', 'rejected']);
function pickReviewStatus(v: unknown): ReviewStatus | null {
  return typeof v === 'string' && REVIEW_STATUSES.has(v as ReviewStatus) ? (v as ReviewStatus) : null;
}

const LEVELS = new Set<Level>(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const AUDIENCES = new Set<CourseAudience>(['kids', 'teens', 'adults', 'any']);
const KINDS = new Set<CourseKind>(['course', 'book', 'video', 'game']);
const STATUSES = new Set<CourseStatus>(['available', 'soldOut', 'comingSoon', 'archived']);

function pick<T extends string>(set: Set<T>, v: unknown, fallback: T | null): T | null {
  return typeof v === 'string' && set.has(v as T) ? (v as T) : fallback;
}

function normalizeSection(raw: unknown, idx: number): CourseSection | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.slug !== 'string' || typeof r.title !== 'string') return null;
  return {
    id: typeof r.id === 'number' ? r.id : undefined,
    slug: r.slug,
    title: r.title,
    order: typeof r.order === 'number' ? r.order : idx,
    lessonSlugs: Array.isArray(r.lessonSlugs)
      ? (r.lessonSlugs as unknown[]).filter((s): s is string => typeof s === 'string')
      : [],
  };
}

function normalizeSummary(raw: RawCourse | null | undefined): CourseSummary | null {
  if (!raw?.documentId || !raw?.slug || !raw?.title) return null;
  return {
    documentId: raw.documentId,
    slug: raw.slug,
    title: raw.title,
    titleUa: raw.titleUa || null,
    level: pick(LEVELS, raw.level, null),
    audience: pick(AUDIENCES, raw.audience, null),
    kind: pick(KINDS, raw.kind, 'course') ?? 'course',
    status: pick(STATUSES, raw.status, 'available') ?? 'available',
    iconEmoji: raw.iconEmoji || null,
    lessonCount: Array.isArray(raw.lessons) ? raw.lessons.length : 0,
    vocabSetCount: Array.isArray(raw.vocabularySets) ? raw.vocabularySets.length : 0,
    published: Boolean(raw.publishedAt),
    reviewStatus: pickReviewStatus(raw.reviewStatus),
    coverImageUrl: typeof raw.coverImage?.url === 'string' ? raw.coverImage.url : null,
  };
}

function normalizeDetail(raw: RawCourse | null | undefined): CourseDetail | null {
  const sum = normalizeSummary(raw);
  if (!sum || !raw) return null;

  // Stored slug-array (component) is the primary source while the relation
  // migration is incomplete — it survives backfill state, public-read scoping,
  // and draft/publish nuances on lesson.course. Fall back to the relation only
  // when stored is empty for a section (relation-only courses, e.g. once
  // Stage C.2 drops the component field).
  const lessonsBySection = new Map<string, Array<{ slug: string; order: number }>>();
  const rawLessons = Array.isArray(raw.lessons) ? raw.lessons : [];
  for (const l of rawLessons) {
    if (!l || typeof l !== 'object') continue;
    const lr = l as Record<string, unknown>;
    const slug = lr.slug;
    const sectionSlug = lr.sectionSlug;
    if (typeof slug !== 'string' || typeof sectionSlug !== 'string') continue;
    const order = typeof lr.orderIndex === 'number' ? lr.orderIndex : 0;
    if (!lessonsBySection.has(sectionSlug)) lessonsBySection.set(sectionSlug, []);
    lessonsBySection.get(sectionSlug)!.push({ slug, order });
  }
  for (const list of lessonsBySection.values()) {
    list.sort((a, b) => a.order - b.order);
  }

  const sections = (Array.isArray(raw.sections) ? raw.sections : [])
    .map((s, i) => normalizeSection(s, i))
    .filter((s): s is CourseSection => s !== null)
    .map((s) => {
      if (s.lessonSlugs.length > 0) return s;
      const derived = lessonsBySection.get(s.slug)?.map((x) => x.slug) ?? [];
      return derived.length > 0 ? { ...s, lessonSlugs: derived } : s;
    })
    .sort((a, b) => a.order - b.order);

  return {
    ...sum,
    description: raw.description ?? null,
    descriptionShort: raw.descriptionShort ?? null,
    subtitle: raw.subtitle ?? null,
    sections,
    reviewStatus: pickReviewStatus(raw.reviewStatus),
    rejectionReason: raw.rejectionReason ?? null,
    ownerDocumentId: raw.owner?.documentId ?? null,
    coverImageUrl: absolutizeMediaUrl(raw.coverImage?.url ?? null),
  };
}

function absolutizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const trimmed = base.replace(/\/+$/, '');
  return trimmed ? `${trimmed}${url.startsWith('/') ? '' : '/'}${url}` : url;
}

const LIST_QUERY =
  'fields[0]=slug&fields[1]=title&fields[2]=titleUa&fields[3]=level&fields[4]=audience&fields[5]=kind&fields[6]=status&fields[7]=iconEmoji&fields[8]=publishedAt&fields[9]=reviewStatus' +
  '&populate[lessons][fields][0]=documentId' +
  '&populate[vocabularySets][fields][0]=documentId' +
  '&populate[coverImage][fields][0]=url' +
  '&filters[status][$ne]=archived' +
  '&pagination[pageSize]=200&sort=title:asc' +
  '&status=draft';

export async function fetchTeacherCourses(): Promise<CourseSummary[]> {
  const res = await fetch(`/api/courses?${LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchTeacherCourses ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: RawCourse[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalizeSummary).filter((c): c is CourseSummary => c !== null);
}

const DETAIL_QUERY =
  'fields[0]=slug&fields[1]=title&fields[2]=titleUa&fields[3]=subtitle&fields[4]=description&fields[5]=descriptionShort&fields[6]=level&fields[7]=audience&fields[8]=kind&fields[9]=status&fields[10]=iconEmoji&fields[11]=publishedAt&fields[12]=reviewStatus&fields[13]=rejectionReason' +
  '&populate[sections]=*' +
  '&populate[lessons][fields][0]=documentId&populate[lessons][fields][1]=slug&populate[lessons][fields][2]=sectionSlug&populate[lessons][fields][3]=orderIndex' +
  '&populate[vocabularySets][fields][0]=documentId' +
  '&populate[owner][fields][0]=documentId' +
  '&populate[coverImage][fields][0]=url' +
  '&status=draft';

export async function fetchTeacherCourse(documentId: string): Promise<CourseDetail | null> {
  const res = await fetch(`/api/courses/${documentId}?${DETAIL_QUERY}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchTeacherCourse ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return normalizeDetail(json?.data);
}

/** Replaces the whole sections array on a course. */
export async function updateCourseSections(
  documentId: string,
  sections: CourseSection[],
): Promise<CourseDetail | null> {
  const data = {
    sections: sections.map((s, i) => ({
      slug: s.slug,
      title: s.title,
      order: typeof s.order === 'number' ? s.order : i,
      lessonSlugs: s.lessonSlugs,
    })),
  };
  const res = await fetch(`/api/courses/${documentId}?${DETAIL_QUERY}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`updateCourseSections ${res.status}`);
  const json = await res.json().catch(() => ({}));
  resetCoursesCache();
  return normalizeDetail(json?.data);
}

export interface CourseMetaPatch {
  title?: string;
  titleUa?: string | null;
  subtitle?: string | null;
  description?: string | null;
  descriptionShort?: string | null;
  level?: Level;
  audience?: CourseAudience;
  iconEmoji?: string | null;
  status?: CourseStatus;
  /** Strapi media id (number) — pass `null` to detach the cover. */
  coverImage?: number | null;
}

export async function updateCourseMeta(
  documentId: string,
  patch: CourseMetaPatch,
): Promise<CourseDetail | null> {
  const res = await fetch(`/api/courses/${documentId}?${DETAIL_QUERY}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: patch }),
  });
  if (!res.ok) throw new Error(`updateCourseMeta ${res.status}`);
  const json = await res.json().catch(() => ({}));
  resetCoursesCache();
  return normalizeDetail(json?.data);
}

function toCourseSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || `course-${Date.now().toString(36)}`;
}

export interface NewCourseInput {
  title: string;
  titleUa?: string;
  level: Level;
}

export async function createTeacherCourse(input: NewCourseInput): Promise<CourseDetail> {
  const data: Record<string, unknown> = {
    slug: `${toCourseSlug(input.title)}-${Date.now().toString(36).slice(-4)}`,
    title: input.title.trim(),
    titleUa: input.titleUa?.trim() || undefined,
    level: input.level,
    kind: 'course',
    audience: 'any',
  };
  const res = await fetch(`/api/courses?${DETAIL_QUERY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`createTeacherCourse ${res.status}`);
  const json = await res.json().catch(() => ({}));
  resetCoursesCache();
  const detail = normalizeDetail(json?.data);
  if (!detail) throw new Error('createTeacherCourse: malformed response');
  return detail;
}

export async function publishCourse(documentId: string): Promise<CourseDetail | null> {
  const res = await fetch(`/api/courses/${documentId}/publish`, { method: 'POST' });
  if (!res.ok) throw new Error(`publishCourse ${res.status}`);
  const json = await res.json().catch(() => ({}));
  resetCoursesCache();
  return normalizeDetail(json?.data);
}

export async function unpublishCourse(documentId: string): Promise<CourseDetail | null> {
  const res = await fetch(`/api/courses/${documentId}/unpublish`, { method: 'POST' });
  if (!res.ok) throw new Error(`unpublishCourse ${res.status}`);
  const json = await res.json().catch(() => ({}));
  resetCoursesCache();
  return normalizeDetail(json?.data);
}

export async function deleteTeacherCourse(documentId: string): Promise<void> {
  const res = await fetch(`/api/courses/${documentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteTeacherCourse ${res.status}`);
  resetCoursesCache();
}

async function postCourseModeration(
  documentId: string,
  action: 'submit' | 'approve' | 'reject',
  body?: Record<string, unknown>,
): Promise<CourseDetail | null> {
  const res = await fetch(`/api/courses/${documentId}/${action}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg =
      (errBody && typeof errBody === 'object' && 'error' in errBody
        ? (errBody as { error?: { message?: string } }).error?.message
        : undefined) ?? `${action}Course ${res.status}`;
    throw new Error(msg);
  }
  const json = await res.json().catch(() => ({}));
  resetCoursesCache();
  return normalizeDetail(json?.data);
}

export const submitCourse  = (id: string)                  => postCourseModeration(id, 'submit');
export const approveCourse = (id: string)                  => postCourseModeration(id, 'approve');
export const rejectCourse  = (id: string, reason: string)  => postCourseModeration(id, 'reject', { reason });

const SUBMITTED_COURSES_QUERY = LIST_QUERY + '&filters[reviewStatus][$eq]=submitted';

/** Admin queue: courses currently in `reviewStatus='submitted'`. */
export async function fetchSubmittedCourses(): Promise<CourseSummary[]> {
  const res = await fetch(`/api/courses?${SUBMITTED_COURSES_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchSubmittedCourses ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: RawCourse[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalizeSummary).filter((c): c is CourseSummary => c !== null);
}
