/**
 * Mini-task loader / mutator.
 *
 * Hits `/api/mini-tasks` proxy (auth cookie → Strapi). Backend scopes by
 * role: teacher sees own + public; student/parent — public only. Authoring
 * is limited to teacher + admin (create forces `author` to caller).
 */

export type MiniTaskKind =
  | 'quiz'
  | 'level-quiz'
  | 'daily-challenge'
  | 'word-of-day'
  | 'listening'
  | 'sentence-builder';

export type MiniTaskLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ExerciseType =
  | 'mcq'
  | 'fill-blank'
  | 'match-pairs'
  | 'translate'
  | 'word-order'
  | 'reading'
  | 'theory'
  | 'frame'
  | 'image'
  | 'video';

export interface MiniTaskExercise {
  type: ExerciseType;
  question: string | null;
  options: unknown;
  answer: unknown;
  explanation: string | null;
  meta: unknown;
  points: number;
}

export interface MiniTask {
  documentId: string;
  slug: string;
  title: string;
  topic: string;
  kind: MiniTaskKind;
  level: MiniTaskLevel | null;
  durationMin: number;
  coinReward: number;
  isPublic: boolean;
  createdAt: string | null;
  authorId: string | null;
  exercise: MiniTaskExercise | null;
}

const KINDS = new Set<MiniTaskKind>([
  'quiz',
  'level-quiz',
  'daily-challenge',
  'word-of-day',
  'listening',
  'sentence-builder',
]);
const LEVELS = new Set<MiniTaskLevel>(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const EXERCISE_TYPES = new Set<ExerciseType>([
  'mcq', 'fill-blank', 'match-pairs', 'translate', 'word-order',
  'reading', 'theory', 'frame', 'image', 'video',
]);

function pickKind(v: unknown): MiniTaskKind {
  return typeof v === 'string' && KINDS.has(v as MiniTaskKind)
    ? (v as MiniTaskKind)
    : 'quiz';
}

function pickLevel(v: unknown): MiniTaskLevel | null {
  return typeof v === 'string' && LEVELS.has(v as MiniTaskLevel)
    ? (v as MiniTaskLevel)
    : null;
}

function pickExerciseType(v: unknown): ExerciseType {
  return typeof v === 'string' && EXERCISE_TYPES.has(v as ExerciseType)
    ? (v as ExerciseType)
    : 'mcq';
}

function toNum(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}

function normalizeExercise(raw: unknown): MiniTaskExercise | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    type: pickExerciseType(r.type),
    question: typeof r.question === 'string' ? r.question : null,
    options: r.options ?? null,
    answer: r.answer ?? null,
    explanation: typeof r.explanation === 'string' ? r.explanation : null,
    meta: r.meta ?? null,
    points: toNum(r.points, 10),
  };
}

function normalize(raw: any): MiniTask | null {
  if (!raw?.documentId || !raw?.slug || !raw?.title) return null;
  return {
    documentId: String(raw.documentId),
    slug: String(raw.slug),
    title: String(raw.title),
    topic: typeof raw.topic === 'string' ? raw.topic : '',
    kind: pickKind(raw.kind),
    level: pickLevel(raw.level),
    durationMin: toNum(raw.durationMin, 5),
    coinReward: toNum(raw.coinReward, 5),
    isPublic: Boolean(raw.isPublic),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : null,
    authorId:
      raw.author && typeof raw.author === 'object' && typeof raw.author.documentId === 'string'
        ? raw.author.documentId
        : null,
    exercise: normalizeExercise(raw.exercise),
  };
}

const LIST_QUERY =
  'populate[author][fields][0]=documentId'
  + '&populate[author][fields][1]=displayName'
  + '&populate[exercise]=*'
  + '&pagination[pageSize]=200'
  + '&sort=createdAt:desc';

export async function fetchMiniTasks(): Promise<MiniTask[]> {
  const res = await fetch(`/api/mini-tasks?${LIST_QUERY}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchMiniTasks ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((m): m is MiniTask => m !== null);
}

export interface MiniTaskExerciseInput {
  type: ExerciseType;
  question?: string | null;
  options?: unknown;
  answer?: unknown;
  explanation?: string | null;
  meta?: unknown;
  points?: number;
}

export interface MiniTaskInput {
  title: string;
  topic?: string;
  kind?: MiniTaskKind;
  level?: MiniTaskLevel | null;
  durationMin?: number;
  coinReward?: number;
  isPublic?: boolean;
  exercise?: MiniTaskExerciseInput;
}

export async function createMiniTask(input: MiniTaskInput): Promise<MiniTask> {
  const res = await fetch('/api/mini-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: input }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const message =
      (errBody && typeof errBody === 'object' && 'error' in errBody
        ? (errBody as { error?: { message?: string } }).error?.message
        : undefined) ?? `createMiniTask ${res.status}`;
    throw new Error(message);
  }
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data);
  if (!n) throw new Error('createMiniTask: malformed response');
  return n;
}

export async function updateMiniTask(
  documentId: string,
  input: Partial<MiniTaskInput>,
): Promise<MiniTask> {
  const res = await fetch(`/api/mini-tasks/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: input }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const message =
      (errBody && typeof errBody === 'object' && 'error' in errBody
        ? (errBody as { error?: { message?: string } }).error?.message
        : undefined) ?? `updateMiniTask ${res.status}`;
    throw new Error(message);
  }
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data);
  if (!n) throw new Error('updateMiniTask: malformed response');
  return n;
}

export async function deleteMiniTask(documentId: string): Promise<void> {
  const res = await fetch(`/api/mini-tasks/${documentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`deleteMiniTask ${res.status}`);
}

export const KIND_LABEL: Record<MiniTaskKind, string> = {
  quiz: 'Вікторина',
  'level-quiz': 'Міні-тест по рівню',
  'daily-challenge': 'Щоденний виклик',
  'word-of-day': 'Word of the Day',
  listening: 'Listening',
  'sentence-builder': 'Sentence builder',
};
