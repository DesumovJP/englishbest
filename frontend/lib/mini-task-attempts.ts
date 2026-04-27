/**
 * Mini-task attempt client.
 *
 * Self-scoped surface (`/me`) for kids/students:
 *   - submitAttempt — POST answer; BE auto-grades closed-form types and
 *     awards coins on the FIRST attempt only.
 *   - fetchMyAttempts — list caller's own attempts (scored + pending).
 *
 * Teacher / admin / parent surface (factory CRUD, scoped server-side):
 *   - fetchAttemptsForTask — read attempts on a single mini-task (teacher's
 *     own authored tasks).
 *   - reviewAttempt — set score + feedback on a pending attempt.
 */

import type { MiniTaskKind, MiniTaskLevel } from './mini-tasks';

export type AttemptStatus = 'submitted' | 'reviewed';

export interface MiniTaskAttempt {
  documentId: string;
  taskId: string;
  taskSlug: string | null;
  taskTitle: string | null;
  taskKind: MiniTaskKind | null;
  taskLevel: MiniTaskLevel | null;
  taskCoinReward: number | null;
  userId: string | null;
  userDisplayName: string | null;
  answer: unknown;
  score: number | null;
  correct: boolean;
  awardedCoins: number;
  status: AttemptStatus;
  teacherFeedback: string | null;
  completedAt: string | null;
  timeSpentSec: number | null;
}

export interface AchievementEarnedLite {
  slug: string;
  title: string;
  xpReward: number;
  coinReward: number;
}

export interface SubmitAttemptResult extends MiniTaskAttempt {
  /** True when this submission was the user's first for the task. Coin
   *  reward is non-zero only on first submissions. */
  isFirstAttempt: boolean;
  /** XP delta credited by the rewards service for this attempt. 0 when no
   *  earn fired (retry, score below pass threshold). */
  xpDelta: number;
  /** True when this submission crossed an XP-level threshold. */
  levelUp: boolean;
  /** Current XP level after this submission (post-credit). */
  level: number | null;
  /** Achievements that were unlocked by this submission (post-credit
   *  snapshot). Empty array on retries / no-progress submissions. */
  achievementsEarned: AchievementEarnedLite[];
}

function pickStatus(v: unknown): AttemptStatus {
  return v === 'reviewed' ? 'reviewed' : 'submitted';
}

function nullableStr(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function nullableNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function attendeeName(raw: any): string | null {
  if (!raw) return null;
  if (typeof raw.displayName === 'string' && raw.displayName) return raw.displayName;
  const f = typeof raw.firstName === 'string' ? raw.firstName : '';
  const l = typeof raw.lastName === 'string' ? raw.lastName : '';
  const composed = `${f} ${l}`.trim();
  return composed || null;
}

function normalize(raw: any): MiniTaskAttempt | null {
  if (!raw?.documentId) return null;
  const task = raw.task ?? null;
  const user = raw.user ?? null;
  return {
    documentId: String(raw.documentId),
    taskId: task?.documentId ? String(task.documentId) : '',
    taskSlug: nullableStr(task?.slug),
    taskTitle: nullableStr(task?.title),
    taskKind: (typeof task?.kind === 'string' ? task.kind : null) as MiniTaskKind | null,
    taskLevel: (typeof task?.level === 'string' ? task.level : null) as MiniTaskLevel | null,
    taskCoinReward: nullableNum(task?.coinReward),
    userId: user?.documentId ? String(user.documentId) : null,
    userDisplayName: attendeeName(user),
    answer: raw.answer ?? null,
    score: nullableNum(raw.score),
    correct: Boolean(raw.correct),
    awardedCoins:
      typeof raw.awardedCoins === 'number' ? raw.awardedCoins : 0,
    status: pickStatus(raw.status),
    teacherFeedback: nullableStr(raw.teacherFeedback),
    completedAt: nullableStr(raw.completedAt),
    timeSpentSec: nullableNum(raw.timeSpentSec),
  };
}

export async function submitAttempt(input: {
  taskId: string;
  answer: unknown;
  timeSpentSec?: number;
}): Promise<SubmitAttemptResult> {
  const res = await fetch('/api/mini-task-attempts/me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        task: input.taskId,
        answer: input.answer,
        timeSpentSec: input.timeSpentSec,
      },
    }),
  });
  if (!res.ok) {
    let message = `submitAttempt ${res.status}`;
    try {
      const errJson: any = await res.json();
      if (errJson?.error?.message) message = errJson.error.message;
    } catch {
      /* swallow */
    }
    throw new Error(message);
  }
  const json: any = await res.json().catch(() => ({}));
  const normalized = normalize(json?.data);
  if (!normalized) throw new Error('submitAttempt: malformed response');
  const earned = Array.isArray(json?.data?.achievementsEarned)
    ? (json.data.achievementsEarned as any[]).map((a) => ({
        slug: typeof a?.slug === 'string' ? a.slug : '',
        title: typeof a?.title === 'string' ? a.title : a?.slug ?? '',
        xpReward: typeof a?.xpReward === 'number' ? a.xpReward : 0,
        coinReward: typeof a?.coinReward === 'number' ? a.coinReward : 0,
      })).filter((a) => a.slug)
    : [];
  return {
    ...normalized,
    isFirstAttempt: Boolean(json?.data?.isFirstAttempt),
    xpDelta: typeof json?.data?.xpDelta === 'number' ? json.data.xpDelta : 0,
    levelUp: Boolean(json?.data?.levelUp),
    level: typeof json?.data?.level === 'number' ? json.data.level : null,
    achievementsEarned: earned,
  };
}

export async function fetchMyAttempts(): Promise<MiniTaskAttempt[]> {
  const res = await fetch('/api/mini-task-attempts/me', { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchMyAttempts ${res.status}`);
  const json: any = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((a): a is MiniTaskAttempt => a !== null);
}

/** All attempts visible to the caller (BE scopes by role). Used by the
 *  teacher results dashboard to compute per-task stats in a single round-trip. */
export async function fetchAllAttempts(): Promise<MiniTaskAttempt[]> {
  const qs =
    'populate[task][fields][0]=documentId' +
    '&populate[task][fields][1]=slug' +
    '&populate[task][fields][2]=title' +
    '&populate[task][fields][3]=kind' +
    '&populate[task][fields][4]=coinReward' +
    '&populate[user][fields][0]=documentId' +
    '&populate[user][fields][1]=displayName' +
    '&populate[user][fields][2]=firstName' +
    '&populate[user][fields][3]=lastName' +
    '&sort=completedAt:desc' +
    '&pagination[pageSize]=500';
  const res = await fetch(`/api/mini-task-attempts?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchAllAttempts ${res.status}`);
  const json: any = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((a): a is MiniTaskAttempt => a !== null);
}

export async function fetchAttemptsForTask(
  taskId: string,
): Promise<MiniTaskAttempt[]> {
  const qs =
    `filters[task][documentId][$eq]=${encodeURIComponent(taskId)}` +
    '&populate[task][fields][0]=documentId' +
    '&populate[task][fields][1]=slug' +
    '&populate[task][fields][2]=title' +
    '&populate[task][fields][3]=kind' +
    '&populate[task][fields][4]=coinReward' +
    '&populate[user][fields][0]=documentId' +
    '&populate[user][fields][1]=displayName' +
    '&populate[user][fields][2]=firstName' +
    '&populate[user][fields][3]=lastName' +
    '&sort=completedAt:desc' +
    '&pagination[pageSize]=200';
  const res = await fetch(`/api/mini-task-attempts?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchAttemptsForTask ${res.status}`);
  const json: any = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((a): a is MiniTaskAttempt => a !== null);
}

export async function reviewAttempt(
  attemptId: string,
  patch: { score?: number | null; teacherFeedback?: string | null },
): Promise<MiniTaskAttempt> {
  const res = await fetch(`/api/mini-task-attempts/${attemptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: patch }),
  });
  if (!res.ok) throw new Error(`reviewAttempt ${res.status}`);
  const json: any = await res.json().catch(() => ({}));
  const normalized = normalize(json?.data);
  if (!normalized) throw new Error('reviewAttempt: malformed response');
  return normalized;
}
