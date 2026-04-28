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
}

const LIST_QUERY =
  'fields[0]=slug&fields[1]=title&fields[2]=titleUa&fields[3]=level&fields[4]=iconEmoji&fields[5]=words' +
  '&populate[course][fields][0]=documentId&populate[course][fields][1]=slug' +
  '&populate[lesson][fields][0]=documentId&populate[lesson][fields][1]=slug' +
  '&pagination[pageSize]=200&sort=title:asc';

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
}

const DETAIL_QUERY =
  'fields[0]=slug&fields[1]=title&fields[2]=titleUa&fields[3]=level&fields[4]=iconEmoji&fields[5]=words&fields[6]=topic&fields[7]=description' +
  '&populate[course][fields][0]=documentId&populate[course][fields][1]=slug' +
  '&populate[lesson][fields][0]=documentId&populate[lesson][fields][1]=slug';

interface RawDetail extends RawSet {
  topic?: string;
  description?: string;
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
