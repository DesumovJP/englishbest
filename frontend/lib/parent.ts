/**
 * Parent dashboard loaders.
 *
 *   GET /api/parent/me/children             — list of children + summaries
 *   GET /api/parent/me/children/:kidDocId   — deep view for one child
 *
 * Both endpoints are parent-role-only (admin may impersonate via `?parentId=`).
 *
 * SWR layer (`fetchMyChildrenCached/peekMyChildren`) keeps tab-back to the
 * parent dashboard instant. 60 s TTL: parent-side data shifts on session/HW
 * lifecycle so we accept short-window staleness rather than per-mutation
 * invalidation (parent app has no direct mutators here).
 */

import { createCachedFetcher } from './data-cache';

export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ChildKidsProfile {
  documentId: string;
  companionAnimal: string | null;
  companionName: string | null;
  characterMood: string | null;
  streakDays: number;
  streakLastAt: string | null;
  totalCoins: number;
  totalXp: number;
  hardCurrency: number;
  ageGroup: string | null;
}

export interface ChildProfile {
  documentId: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  role: string;
  level: Level | null;
  locale: string | null;
  avatar?: { url: string } | null;
  kidsProfile?: ChildKidsProfile | null;
}

export interface SessionLite {
  documentId: string;
  title: string;
  startAt: string;
  durationMin: number;
  type: string;
  status: string;
  joinUrl: string | null;
  teacher?: {
    documentId: string;
    user?: {
      documentId: string;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
    } | null;
  } | null;
  /** Course title — populated by /api/parent/me/children for canonical
   *  session display (same field set as `Session` from `lib/sessions`). */
  course?: { documentId: string; title: string } | null;
  /** Attendee profiles — populated to render canonical "X учнів" labels.
   *  Includes the caller's own child plus their group peers. */
  attendees?: Array<{
    documentId: string;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  }>;
}

export interface HomeworkPending {
  documentId: string;
  status: string;
  submittedAt: string | null;
  homework: {
    documentId: string;
    title: string;
    dueAt: string | null;
    status: string;
  } | null;
}

export interface HomeworkSubmissionFull extends HomeworkPending {
  score: number | null;
  gradedAt: string | null;
  teacherFeedback: string | null;
}

export interface ProgressEntry {
  documentId: string;
  status: string;
  score: number | null;
  completedAt: string | null;
  lastAttemptAt: string | null;
  timeSpentSec?: number | null;
  lesson: { documentId: string; title: string; level: Level | null } | null;
  course?: { documentId: string; title: string } | null;
}

export interface ChildSummary {
  child: ChildProfile;
  upcomingSessions: SessionLite[];
  pendingHomework: HomeworkPending[];
  pendingHomeworkCount: number;
  recentProgress: ProgressEntry[];
  completedLessons: number;
  avgScore: number | null;
}

export interface ChildDetail extends ChildSummary {
  homeworkSubmissions: HomeworkSubmissionFull[];
  progress: ProgressEntry[];
}

export function childDisplayName(child: ChildProfile): string {
  return child.displayName
    ?? [child.firstName, child.lastName].filter(Boolean).join(' ')
    ?? '—';
}

export async function fetchMyChildren(): Promise<ChildSummary[]> {
  const res = await fetch('/api/parent/me/children', { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchMyChildren ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const data = json?.data;
  return Array.isArray(data) ? (data as ChildSummary[]) : [];
}

const myChildrenCache = createCachedFetcher<ChildSummary[]>({
  key: 'my-children',
  ttlMs: 60 * 1000,
  fetch: fetchMyChildren,
});

export const fetchMyChildrenCached = myChildrenCache.get;
export const peekMyChildren = myChildrenCache.peek;
export const resetMyChildrenCache = myChildrenCache.reset;

export async function fetchChildDetail(kidDocId: string): Promise<ChildDetail> {
  const res = await fetch(
    `/api/parent/me/children/${encodeURIComponent(kidDocId)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`fetchChildDetail ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return json?.data as ChildDetail;
}
