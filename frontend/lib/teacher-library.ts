/**
 * Teacher-library loader / mutator.
 *
 * Hits `/api/lessons` proxy. Backend scopes by role:
 *   - teacher → own (owner=mine) + platform/template
 *   - student/parent → platform/template
 *
 * Editor block array is stored in Strapi `steps` (json). Other scalars map
 * 1:1 with the FE `LibraryLesson` shape used by the existing UI.
 *
 * SWR layer (`fetchLessonsCached/peekLessons`) keeps tab-back to /dashboard/teacher-library
 * instant; mutations call `resetTeacherLibraryCache()` so create/update/delete/publish/unpublish
 * are visible on next read. The lesson-detail fetch is single-keyed and lower-value so it
 * stays uncached.
 */

import { createCachedFetcher } from './data-cache';
import type {
  BlockKind,
  LessonBlock,
  LessonSource,
  LibraryLesson,
  Level,
} from '@/lib/types/teacher';

const LEVELS: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const SOURCES: LessonSource[] = ['platform', 'copy', 'own', 'template'];
const BLOCK_KINDS: BlockKind[] = [
  'text',
  'image',
  'audio',
  'video',
  'exercise-multiple-choice',
  'exercise-text-input',
  'exercise-matching',
  'exercise-word-order',
  'exercise-fill-gap',
  'flashcards',
  'link',
  'teacher-note',
];

function pickLevel(v: unknown): Level {
  return typeof v === 'string' && LEVELS.includes(v as Level) ? (v as Level) : 'A1';
}
function pickSource(v: unknown): LessonSource {
  return typeof v === 'string' && SOURCES.includes(v as LessonSource)
    ? (v as LessonSource)
    : 'platform';
}
function toNum(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}
// Bridge legacy player step (uses `type`, e.g. seeded lesson-content) to the
// teacher-editor `LessonBlock` shape (uses `kind`). Read-only preview only —
// platform/template lessons round-trip back as steps untouched because the
// editor blocks them from saving.
function legacyStepToBlock(raw: any, idx: number): LessonBlock | null {
  const id = typeof raw.id === 'string' ? raw.id : `b${idx}`;
  const t = raw.type;
  if (typeof t !== 'string') return null;
  if (t === 'theory') {
    const examples = Array.isArray(raw.examples) ? raw.examples : [];
    const tip = typeof raw.tip === 'string' ? `\n\n${raw.tip}` : '';
    const examplesText = examples
      .map((e: any) => (e?.en && e?.ua ? `• ${e.en} — ${e.ua}` : ''))
      .filter(Boolean)
      .join('\n');
    const body = [raw.body, examplesText].filter(Boolean).join('\n\n') + tip;
    return {
      id,
      kind: 'text',
      title: typeof raw.title === 'string' ? raw.title : undefined,
      body,
    };
  }
  if (t === 'multiple-choice') {
    const opts: string[] = Array.isArray(raw.options) ? raw.options : [];
    const correctIndex = Number(raw.correctIndex);
    return {
      id,
      kind: 'exercise-multiple-choice',
      title: typeof raw.question === 'string' ? raw.question : undefined,
      options: opts.map((text, i) => ({ text: String(text), correct: i === correctIndex })),
    };
  }
  if (t === 'match-pairs') {
    const pairs: any[] = Array.isArray(raw.pairs) ? raw.pairs : [];
    return {
      id,
      kind: 'exercise-matching',
      title: typeof raw.prompt === 'string' ? raw.prompt : undefined,
      items: pairs
        .filter(p => p && typeof p.left === 'string' && typeof p.right === 'string')
        .map(p => ({ left: p.left, right: p.right })),
    };
  }
  if (t === 'fill-blank') {
    const before = typeof raw.before === 'string' ? raw.before : '';
    const after = typeof raw.after === 'string' ? raw.after : '';
    return {
      id,
      kind: 'exercise-fill-gap',
      body: `${before}_____${after}`,
      correctAnswer: typeof raw.answer === 'string' ? raw.answer : undefined,
    };
  }
  if (t === 'word-order') {
    const words: string[] = Array.isArray(raw.words) ? raw.words.map(String) : [];
    return {
      id,
      kind: 'exercise-word-order',
      title: typeof raw.prompt === 'string' ? raw.prompt : undefined,
      body: typeof raw.translation === 'string' ? raw.translation : undefined,
      words,
      correctAnswer: Array.isArray(raw.answer) ? raw.answer.join('') : undefined,
    };
  }
  return null;
}

function parseBlocks(v: unknown): LessonBlock[] {
  if (!Array.isArray(v)) return [];
  const out: LessonBlock[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== 'object') continue;
    const kind = (raw as any).kind;
    if (typeof kind === 'string' && BLOCK_KINDS.includes(kind as BlockKind)) {
      const id = typeof (raw as any).id === 'string' ? (raw as any).id : `b${out.length}`;
      out.push({ ...(raw as LessonBlock), id, kind: kind as BlockKind });
      continue;
    }
    const bridged = legacyStepToBlock(raw, out.length);
    if (bridged) out.push(bridged);
  }
  return out;
}

function toDateStr(v: unknown): string {
  if (typeof v !== 'string') return '';
  const t = Date.parse(v);
  if (Number.isNaN(t)) return '';
  return new Date(t).toISOString().slice(0, 10);
}

function normalize(raw: any): LibraryLesson | null {
  if (!raw?.documentId || !raw?.title) return null;
  const blocks = parseBlocks(raw.steps);
  return {
    id: String(raw.documentId),
    title: String(raw.title),
    level: pickLevel(raw.level),
    topic: typeof raw.topic === 'string' ? raw.topic : '',
    durationMin: toNum(raw.durationMin, 30),
    source: pickSource(raw.source),
    updatedAt: toDateStr(raw.updatedAt) || toDateStr(raw.createdAt),
    blocksCount: blocks.length,
    ownerId:
      raw.owner && typeof raw.owner === 'object' && typeof raw.owner.documentId === 'string'
        ? raw.owner.documentId
        : undefined,
    originalId:
      raw.originalLesson &&
      typeof raw.originalLesson === 'object' &&
      typeof raw.originalLesson.documentId === 'string'
        ? raw.originalLesson.documentId
        : undefined,
    hasUpdateFromOriginal: false,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    published: Boolean(raw.publishedAt),
  };
}

const LIST_QUERY =
  'fields[0]=title&fields[1]=level&fields[2]=topic&fields[3]=durationMin&fields[4]=source&fields[5]=updatedAt&fields[6]=createdAt&fields[7]=tags&fields[8]=steps&fields[9]=publishedAt' +
  '&populate[owner][fields][0]=documentId' +
  '&populate[originalLesson][fields][0]=documentId' +
  '&pagination[pageSize]=200&sort=updatedAt:desc' +
  '&status=draft';

export async function fetchLessons(): Promise<LibraryLesson[]> {
  const res = await fetch(`/api/lessons?${LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchLessons ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((l): l is LibraryLesson => l !== null);
}

const teacherLibraryCache = createCachedFetcher<LibraryLesson[]>({
  key: 'teacher-library',
  ttlMs: 60 * 1000,
  fetch: fetchLessons,
});

export const fetchLessonsCached = teacherLibraryCache.get;
export const peekLessons = teacherLibraryCache.peek;
export const resetTeacherLibraryCache = teacherLibraryCache.reset;

export interface LessonDetail extends LibraryLesson {
  blocks: LessonBlock[];
}

export async function fetchLesson(documentId: string): Promise<LessonDetail | null> {
  const q =
    'populate[owner][fields][0]=documentId&populate[originalLesson][fields][0]=documentId';
  const res = await fetch(`/api/lessons/${documentId}?${q}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchLesson ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data);
  if (!n) return null;
  return { ...n, blocks: parseBlocks(json?.data?.steps) };
}

export interface LessonInput {
  title: string;
  slug?: string;
  level?: Level | null;
  topic?: string;
  durationMin?: number;
  tags?: string[];
  steps?: LessonBlock[];
  source?: 'own' | 'copy';
  originalLessonId?: string;
}

function toPayload(input: LessonInput): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.level !== undefined) data.level = input.level;
  if (input.topic !== undefined) data.topic = input.topic;
  if (input.durationMin !== undefined) data.durationMin = input.durationMin;
  if (input.tags !== undefined) data.tags = input.tags;
  if (input.steps !== undefined) data.steps = input.steps;
  if (input.source !== undefined) data.source = input.source;
  if (input.originalLessonId) data.originalLesson = input.originalLessonId;
  return data;
}

// Lazy-resolved invalidator for the catalog/lessons SWR caches living in
// `lib/api.ts`. Importing eagerly would create a cycle (api → user-progress →
// data-cache); the dynamic import keeps the module graph acyclic.
async function invalidateCatalogCaches(): Promise<void> {
  teacherLibraryCache.reset();
  try {
    const mod = await import('./api');
    mod.resetCoursesCache?.();
    mod.resetLessonsByCourseCache?.();
  } catch {
    /* api module not yet loaded — no caches to clear */
  }
}

export async function createLesson(input: LessonInput): Promise<LessonDetail> {
  const res = await fetch('/api/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: toPayload(input) }),
  });
  if (!res.ok) throw new Error(`createLesson ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data);
  if (!n) throw new Error('createLesson: malformed response');
  await invalidateCatalogCaches();
  return { ...n, blocks: parseBlocks(json?.data?.steps) };
}

export async function updateLesson(
  documentId: string,
  input: LessonInput,
): Promise<LessonDetail> {
  const res = await fetch(`/api/lessons/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: toPayload(input) }),
  });
  if (!res.ok) throw new Error(`updateLesson ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data);
  if (!n) throw new Error('updateLesson: malformed response');
  await invalidateCatalogCaches();
  return { ...n, blocks: parseBlocks(json?.data?.steps) };
}

export async function deleteLesson(documentId: string): Promise<void> {
  const res = await fetch(`/api/lessons/${documentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteLesson ${res.status}`);
  await invalidateCatalogCaches();
}

export async function publishLesson(documentId: string): Promise<LibraryLesson> {
  const res = await fetch(`/api/lessons/${documentId}/publish`, { method: 'POST' });
  if (!res.ok) throw new Error(`publishLesson ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data);
  if (!n) throw new Error('publishLesson: malformed response');
  await invalidateCatalogCaches();
  return { ...n, published: true };
}

export async function unpublishLesson(documentId: string): Promise<LibraryLesson> {
  const res = await fetch(`/api/lessons/${documentId}/unpublish`, { method: 'POST' });
  if (!res.ok) throw new Error(`unpublishLesson ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data);
  if (!n) throw new Error('unpublishLesson: malformed response');
  await invalidateCatalogCaches();
  return { ...n, published: false };
}

/**
 * Clone a platform/template lesson into the caller's library as a `copy`.
 * Backend sets owner + source via controller.
 */
export async function cloneLesson(src: LessonDetail): Promise<LessonDetail> {
  return createLesson({
    title: `${src.title} (копія)`,
    level: src.level,
    topic: src.topic,
    durationMin: src.durationMin,
    tags: src.tags,
    steps: src.blocks,
    source: 'copy',
    originalLessonId: src.id,
  });
}
