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
}

export interface CourseDetail extends CourseSummary {
  description: string | null;
  descriptionShort: string | null;
  subtitle: string | null;
  sections: CourseSection[];
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
  };
}

function normalizeDetail(raw: RawCourse | null | undefined): CourseDetail | null {
  const sum = normalizeSummary(raw);
  if (!sum || !raw) return null;

  // Derive per-section lesson slug-lists from the lessons relation
  // (post-backfill source of truth). Each section keeps the stored
  // lessonSlugs[] as fallback if the relation has nothing for that section —
  // this keeps the editor working on not-yet-backfilled courses.
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
  };
}

const LIST_QUERY =
  'fields[0]=slug&fields[1]=title&fields[2]=titleUa&fields[3]=level&fields[4]=audience&fields[5]=kind&fields[6]=status&fields[7]=iconEmoji' +
  '&populate[lessons][fields][0]=documentId' +
  '&populate[vocabularySets][fields][0]=documentId' +
  '&filters[status][$ne]=archived' +
  '&pagination[pageSize]=200&sort=title:asc';

export async function fetchTeacherCourses(): Promise<CourseSummary[]> {
  const res = await fetch(`/api/courses?${LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchTeacherCourses ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: RawCourse[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalizeSummary).filter((c): c is CourseSummary => c !== null);
}

const DETAIL_QUERY =
  'fields[0]=slug&fields[1]=title&fields[2]=titleUa&fields[3]=subtitle&fields[4]=description&fields[5]=descriptionShort&fields[6]=level&fields[7]=audience&fields[8]=kind&fields[9]=status&fields[10]=iconEmoji' +
  '&populate[sections]=*' +
  '&populate[lessons][fields][0]=documentId&populate[lessons][fields][1]=slug&populate[lessons][fields][2]=sectionSlug&populate[lessons][fields][3]=orderIndex' +
  '&populate[vocabularySets][fields][0]=documentId';

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
