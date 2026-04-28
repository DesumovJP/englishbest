/**
 * Teacher-side vocabulary helpers.
 *
 * Live calls to `/api/vocabulary-sets` (staff-write proxy). Used by the
 * lesson editor to attach existing sets to a lesson, detach them, and
 * create brand-new sets inline without leaving the editor.
 *
 * Public reads still happen via `lib/vocabulary.ts` (kids fetch path).
 * That cache is reset whenever the teacher mutates a set so kids see
 * the new copy on next navigation.
 */
import { resetVocabularyCache } from './vocabulary';

export interface VocabWord {
  word: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
  partOfSpeech?: string;
}

export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface VocabSetSummary {
  documentId: string;
  slug: string;
  title: string;
  titleUa?: string;
  level?: Level | null;
  iconEmoji?: string | null;
  wordCount: number;
  /** Linked-lesson documentId, if any. */
  lessonDocumentId: string | null;
  lessonSlug: string | null;
  /** Linked-course documentId, if any. */
  courseDocumentId: string | null;
  courseSlug: string | null;
  /** Moderation state — see CONTENT_LIFECYCLE_PLAN.md §6. */
  reviewStatus: 'draft' | 'submitted' | 'approved' | 'rejected' | null;
  /** documentId of the owning teacher-profile (null = platform/admin). */
  ownerDocumentId: string | null;
}

interface RawSet {
  documentId?: string;
  slug?: string;
  title?: string;
  titleUa?: string;
  level?: string;
  iconEmoji?: string;
  words?: unknown[];
  course?: { documentId?: string; slug?: string } | null;
  lesson?: { documentId?: string; slug?: string } | null;
  reviewStatus?: string;
  rejectionReason?: string;
  owner?: { documentId?: string } | null;
}

const VOCAB_REVIEW_STATUSES = new Set(['draft', 'submitted', 'approved', 'rejected'] as const);
function pickVocabReviewStatus(v: unknown): VocabSetSummary['reviewStatus'] {
  return typeof v === 'string' && VOCAB_REVIEW_STATUSES.has(v as never)
    ? (v as never)
    : null;
}

const LIST_QUERY =
  'fields[0]=slug&fields[1]=title&fields[2]=titleUa&fields[3]=level&fields[4]=iconEmoji&fields[5]=words&fields[6]=reviewStatus&fields[7]=rejectionReason' +
  '&populate[course][fields][0]=documentId&populate[course][fields][1]=slug' +
  '&populate[lesson][fields][0]=documentId&populate[lesson][fields][1]=slug' +
  '&populate[owner][fields][0]=documentId' +
  '&pagination[pageSize]=200&sort=title:asc' +
  // Without `status=draft` Strapi returns only published rows. Vocab
  // sets seeded as drafts (or any non-published) would appear empty in
  // the library tab — admin sees nothing despite having full read.
  '&status=draft';

const LEVELS = new Set<Level>(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

function pickLevel(v: unknown): Level | null {
  return typeof v === 'string' && LEVELS.has(v as Level) ? (v as Level) : null;
}

function normalize(raw: RawSet | null | undefined): VocabSetSummary | null {
  if (!raw?.documentId || !raw?.slug || !raw?.title) return null;
  return {
    documentId: raw.documentId,
    slug: raw.slug,
    title: raw.title,
    titleUa: raw.titleUa || undefined,
    level: pickLevel(raw.level),
    iconEmoji: raw.iconEmoji || null,
    wordCount: Array.isArray(raw.words) ? raw.words.length : 0,
    lessonDocumentId: raw.lesson?.documentId ?? null,
    lessonSlug: raw.lesson?.slug ?? null,
    courseDocumentId: raw.course?.documentId ?? null,
    courseSlug: raw.course?.slug ?? null,
    reviewStatus: pickVocabReviewStatus(raw.reviewStatus),
    ownerDocumentId: raw.owner?.documentId ?? null,
  };
}

/** Lists ALL vocab sets visible to the caller (Strapi enforces RBAC). */
export async function fetchAllVocabSets(): Promise<VocabSetSummary[]> {
  const res = await fetch(`/api/vocabulary-sets?${LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchAllVocabSets ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: RawSet[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((s): s is VocabSetSummary => s !== null);
}

export type ParentKind = 'lesson' | 'course';

/** Sets attached to a given parent (lesson OR course). */
export async function fetchVocabSetsForParent(
  parent: ParentKind,
  parentDocumentId: string,
): Promise<VocabSetSummary[]> {
  const filterKey = parent === 'lesson' ? 'lesson' : 'course';
  const q =
    `${LIST_QUERY}&filters[${filterKey}][documentId][$eq]=${encodeURIComponent(parentDocumentId)}`;
  const res = await fetch(`/api/vocabulary-sets?${q}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchVocabSetsForParent ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: RawSet[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((s): s is VocabSetSummary => s !== null);
}

/** Back-compat alias. */
export const fetchVocabSetsForLesson = (lessonDocumentId: string) =>
  fetchVocabSetsForParent('lesson', lessonDocumentId);

export interface VocabSetDetail extends VocabSetSummary {
  topic: string | null;
  description: string | null;
  words: VocabWord[];
  rejectionReason: string | null;
  coverImageUrl: string | null;
}

const DETAIL_QUERY =
  'fields[0]=slug&fields[1]=title&fields[2]=titleUa&fields[3]=level&fields[4]=iconEmoji&fields[5]=words&fields[6]=topic&fields[7]=description&fields[8]=reviewStatus&fields[9]=rejectionReason' +
  '&populate[course][fields][0]=documentId&populate[course][fields][1]=slug' +
  '&populate[lesson][fields][0]=documentId&populate[lesson][fields][1]=slug' +
  '&populate[owner][fields][0]=documentId' +
  '&populate[coverImage][fields][0]=url';

interface RawDetail extends RawSet {
  topic?: string;
  description?: string;
  coverImage?: { url?: string } | null;
}

function absolutizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  // Same shape as lib/normalize.ts.mediaUrl, scoped to this module to
  // avoid pulling the kids-side normalizer into a teacher-write path.
  // Browser context — read NEXT_PUBLIC_API_BASE_URL via the lib config.
  const base =
    (typeof window !== 'undefined'
      ? (window as unknown as { __API_BASE_URL__?: string }).__API_BASE_URL__
      : null) ??
    (process.env.NEXT_PUBLIC_API_BASE_URL ?? '');
  const trimmed = base.replace(/\/+$/, '');
  return trimmed ? `${trimmed}${url.startsWith('/') ? '' : '/'}${url}` : url;
}

function normalizeDetail(raw: RawDetail | null | undefined): VocabSetDetail | null {
  const sum = normalize(raw);
  if (!sum || !raw) return null;
  const words = Array.isArray(raw.words)
    ? (raw.words as unknown[])
        .filter((w): w is Record<string, unknown> => Boolean(w) && typeof w === 'object')
        .map((w) => ({
          word: String(w.word ?? ''),
          translation: String(w.translation ?? ''),
          example: typeof w.example === 'string' ? w.example : undefined,
          exampleTranslation:
            typeof w.exampleTranslation === 'string' ? w.exampleTranslation : undefined,
          partOfSpeech: typeof w.partOfSpeech === 'string' ? w.partOfSpeech : undefined,
        }))
        .filter((w) => w.word || w.translation)
    : [];
  return {
    ...sum,
    topic: typeof raw.topic === 'string' ? raw.topic : null,
    description: typeof raw.description === 'string' ? raw.description : null,
    words,
    rejectionReason: typeof raw.rejectionReason === 'string' ? raw.rejectionReason : null,
    coverImageUrl: absolutizeMediaUrl(raw.coverImage?.url ?? null),
  };
}

export async function fetchVocabSet(documentId: string): Promise<VocabSetDetail | null> {
  const res = await fetch(`/api/vocabulary-sets/${documentId}?${DETAIL_QUERY}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchVocabSet ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return normalizeDetail(json?.data);
}

export interface VocabSetPatch {
  title?: string;
  titleUa?: string | null;
  description?: string | null;
  level?: Level | null;
  topic?: string | null;
  iconEmoji?: string | null;
  words?: VocabWord[];
  /** Strapi media id (number) — pass `null` to detach the cover. */
  coverImage?: number | null;
}

export async function updateVocabSet(
  documentId: string,
  patch: VocabSetPatch,
): Promise<VocabSetDetail | null> {
  const res = await fetch(`/api/vocabulary-sets/${documentId}?${DETAIL_QUERY}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: patch }),
  });
  if (!res.ok) throw new Error(`updateVocabSet ${res.status}`);
  const json = await res.json().catch(() => ({}));
  resetVocabularyCache();
  return normalizeDetail(json?.data);
}

export async function deleteVocabSet(documentId: string): Promise<void> {
  const res = await fetch(`/api/vocabulary-sets/${documentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteVocabSet ${res.status}`);
  resetVocabularyCache();
}

export type ReviewStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

async function postVocabModeration(
  documentId: string,
  action: 'submit' | 'approve' | 'reject' | 'publish' | 'unpublish',
  body?: Record<string, unknown>,
): Promise<VocabSetDetail | null> {
  const res = await fetch(`/api/vocabulary-sets/${documentId}/${action}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg =
      (errBody && typeof errBody === 'object' && 'error' in errBody
        ? (errBody as { error?: { message?: string } }).error?.message
        : undefined) ?? `${action}VocabSet ${res.status}`;
    throw new Error(msg);
  }
  const json = await res.json().catch(() => ({}));
  resetVocabularyCache();
  return normalizeDetail(json?.data);
}

export const submitVocabSet    = (id: string)                  => postVocabModeration(id, 'submit');
export const approveVocabSet   = (id: string)                  => postVocabModeration(id, 'approve');
export const rejectVocabSet    = (id: string, reason: string)  => postVocabModeration(id, 'reject', { reason });
export const publishVocabSet   = (id: string)                  => postVocabModeration(id, 'publish');
export const unpublishVocabSet = (id: string)                  => postVocabModeration(id, 'unpublish');

/** Admin queue: vocab sets currently in `reviewStatus='submitted'`. */
export async function fetchSubmittedVocabSets(): Promise<VocabSetSummary[]> {
  const q = LIST_QUERY + '&filters[reviewStatus][$eq]=submitted';
  const res = await fetch(`/api/vocabulary-sets?${q}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchSubmittedVocabSets ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: RawSet[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((s): s is VocabSetSummary => s !== null);
}

/**
 * Reassigns the parent relation on a vocab set. Pass `null` to detach
 * from the given parent kind without touching the other side.
 */
export async function setVocabSetParent(
  setDocumentId: string,
  parent: ParentKind,
  parentDocumentId: string | null,
): Promise<void> {
  const data = parent === 'lesson'
    ? { lesson: parentDocumentId }
    : { course: parentDocumentId };
  const res = await fetch(`/api/vocabulary-sets/${setDocumentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`setVocabSetParent ${res.status}`);
  resetVocabularyCache();
}

/** Back-compat alias. */
export const setVocabSetLesson = (setId: string, lessonId: string | null) =>
  setVocabSetParent(setId, 'lesson', lessonId);

export interface NewVocabSet {
  title: string;
  titleUa?: string;
  description?: string;
  level?: Level;
  topic?: string;
  iconEmoji?: string;
  words: VocabWord[];
  /** Optional initial attachment. */
  lessonDocumentId?: string | null;
  courseDocumentId?: string | null;
}

function toSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || `vocab-${Date.now().toString(36)}`;
}

/** Creates a new vocab set; returns its summary (with documentId). */
export async function createVocabSet(input: NewVocabSet): Promise<VocabSetSummary> {
  const data: Record<string, unknown> = {
    slug: toSlug(input.title),
    title: input.title,
    titleUa: input.titleUa,
    description: input.description,
    level: input.level,
    topic: input.topic,
    iconEmoji: input.iconEmoji ?? '📚',
    words: input.words,
    lesson: input.lessonDocumentId ?? null,
    course: input.courseDocumentId ?? null,
    publishedAt: new Date().toISOString(),
  };
  const res = await fetch('/api/vocabulary-sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`createVocabSet ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data);
  if (!n) throw new Error('createVocabSet: malformed response');
  resetVocabularyCache();
  return n;
}

/**
 * Parses a freeform "word — translation" textarea into a VocabWord[].
 * Empty lines skipped. Splitter accepts: " — " " - " " : " or "TAB".
 */
export function parseWordsTextarea(input: string): VocabWord[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line): VocabWord | null => {
      const m = line.match(/^(.+?)\s*[—\-:|\t]\s*(.+)$/);
      if (!m) return null;
      const [, word, translation] = m;
      return { word: word.trim(), translation: translation.trim() };
    })
    .filter((w): w is VocabWord => w !== null);
}
