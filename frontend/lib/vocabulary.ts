/**
 * Vocabulary catalog loader — `vocabulary-set` content type.
 *
 * Public read-only API. The list page on `/kids/vocab` and per-set detail
 * pages call into this; sets are independent of the lesson catalog and
 * may optionally be linked to a `course` via the `course` relation.
 */

import { createCachedFetcher } from './data-cache';

export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface VocabularyWord {
  word: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  partOfSpeech?: string;
}

export interface VocabularySet {
  slug: string;
  title: string;
  titleUa: string;
  description: string;
  level: Level;
  topic: string;
  iconEmoji: string;
  /** Cover image — set's own when present, falls back to linked course's. */
  coverImageUrl: string | null;
  words: VocabularyWord[];
  courseSlug: string | null;
  courseTitle: string | null;
  lessonSlug: string | null;
  lessonTitle: string | null;
}

const LEVELS = new Set<Level>(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

function pickLevel(v: unknown): Level {
  return typeof v === 'string' && LEVELS.has(v as Level) ? (v as Level) : 'A1';
}

function normalizeWord(raw: unknown): VocabularyWord | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.word !== 'string' || typeof r.translation !== 'string') return null;
  return {
    word: r.word,
    translation: r.translation,
    example: typeof r.example === 'string' ? r.example : '',
    exampleTranslation:
      typeof r.exampleTranslation === 'string' ? r.exampleTranslation : '',
    partOfSpeech:
      typeof r.partOfSpeech === 'string' && r.partOfSpeech ? r.partOfSpeech : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: any): VocabularySet | null {
  if (!raw?.slug || !raw?.title) return null;
  const words = Array.isArray(raw.words)
    ? raw.words.map(normalizeWord).filter((w: VocabularyWord | null): w is VocabularyWord => w !== null)
    : [];
  const courseSlug =
    raw.course && typeof raw.course === 'object' && typeof raw.course.slug === 'string'
      ? raw.course.slug
      : null;
  const courseTitle =
    raw.course && typeof raw.course === 'object' && typeof raw.course.title === 'string'
      ? (raw.course.titleUa as string) || (raw.course.title as string)
      : null;
  const lessonSlug =
    raw.lesson && typeof raw.lesson === 'object' && typeof raw.lesson.slug === 'string'
      ? raw.lesson.slug
      : null;
  const lessonTitle =
    raw.lesson && typeof raw.lesson === 'object' && typeof raw.lesson.title === 'string'
      ? raw.lesson.title
      : null;
  // Prefer set-specific cover, then derive from linked course's cover. The
  // backend exposes covers as media relations (`coverImage`, `thumbnail`),
  // not scalar URL strings — we read `.url` off the populated objects.
  const ownCover =
    typeof raw.coverImageUrl === 'string' && raw.coverImageUrl
      ? raw.coverImageUrl
      : null;
  const pickMediaUrl = (m: unknown): string | null => {
    if (!m || typeof m !== 'object') return null;
    const url = (m as { url?: unknown }).url;
    return typeof url === 'string' && url ? url : null;
  };
  const courseCover =
    raw.course && typeof raw.course === 'object'
      ? pickMediaUrl((raw.course as { coverImage?: unknown }).coverImage) ??
        pickMediaUrl((raw.course as { thumbnail?: unknown }).thumbnail)
      : null;
  return {
    slug: String(raw.slug),
    title: String(raw.title),
    titleUa: typeof raw.titleUa === 'string' && raw.titleUa ? raw.titleUa : String(raw.title),
    description: typeof raw.description === 'string' ? raw.description : '',
    level: pickLevel(raw.level),
    topic: typeof raw.topic === 'string' ? raw.topic : '',
    iconEmoji: typeof raw.iconEmoji === 'string' && raw.iconEmoji ? raw.iconEmoji : '📚',
    coverImageUrl: ownCover ?? courseCover,
    words,
    courseSlug,
    courseTitle,
    lessonSlug,
    lessonTitle,
  };
}

const LIST_URL =
  '/api/vocabulary-sets' +
  '?populate[course][fields][0]=slug' +
  '&populate[course][fields][1]=title' +
  '&populate[course][fields][2]=titleUa' +
  '&populate[course][populate][thumbnail][fields][0]=url' +
  '&populate[course][populate][coverImage][fields][0]=url' +
  '&populate[lesson][fields][0]=slug' +
  '&populate[lesson][fields][1]=title' +
  '&pagination[pageSize]=200' +
  '&sort=level:asc' +
  '&publicationState=live'; // Strapi v5 still honours this — keeps drafts out.

const cache = createCachedFetcher<VocabularySet[]>({
  key: 'vocabulary:v2',
  ttlMs: 5 * 60 * 1000,
  fetch: async () => {
    const res = await fetch(LIST_URL, { cache: 'no-store' });
    if (!res.ok) {
      // Surface the status so the empty-state page can hint at the cause
      // instead of silently rendering "Словничок наповнюється".
      console.error('[vocabulary] fetch failed', res.status, await res.text().catch(() => ''));
      throw new Error(`fetchVocabularySets ${res.status}`);
    }
    const json = await res.json().catch(() => ({}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = Array.isArray(json?.data) ? json.data : [];
    if (rows.length === 0) {
      console.warn('[vocabulary] fetch returned 0 rows', json);
    }
    return rows.map(normalize).filter((x): x is VocabularySet => x !== null);
  },
});

export const fetchVocabularySets = cache.get;
export const peekVocabularySets = cache.peek;
export const resetVocabularyCache = cache.reset;

export async function fetchVocabularySetBySlug(slug: string): Promise<VocabularySet | null> {
  const all = await fetchVocabularySets();
  return all.find((s) => s.slug === slug) ?? null;
}
