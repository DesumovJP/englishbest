/**
 * Rewards client — talks to the BE rewards/motivation endpoints.
 *
 * Two surfaces:
 *   - fetchMotivationSummary(studentId) — for teacher StudentDetail, parent
 *     dashboard per-child widget, kid self-view. BE scopes by role.
 *   - grantBonus({ studentId, coins, xp, reason }) — teacher / admin manual
 *     award. Routes through the central rewards service server-side, so
 *     the kid HUD will refresh with the bonus already credited.
 */

export type RewardAction =
  | 'lesson'
  | 'minitask'
  | 'homework'
  | 'attendance'
  | 'streak'
  | 'achievement'
  | 'grant';

export interface MotivationAchievement {
  slug: string;
  title: string | null;
  tier: string | null;
  category: string | null;
  coinReward: number;
  xpReward: number;
  earnedAt: string | null;
}

export interface MotivationEvent {
  documentId: string;
  action: RewardAction | string;
  xpDelta: number;
  coinsDelta: number;
  createdAt: string | null;
  meta: Record<string, unknown> | null;
}

export interface MotivationSummary {
  studentId: string;
  totalCoins: number;
  totalXp: number;
  streakDays: number;
  streakLastAt: string | null;
  characterMood: string | null;
  achievements: MotivationAchievement[];
  recentEvents: MotivationEvent[];
  lastActiveAt: string | null;
}

export interface WeeklyDailyBucket {
  /** ISO yyyy-mm-dd. */
  date: string;
  xp: number;
  coins: number;
  active: boolean;
}

export interface WeeklySummary {
  studentId: string;
  weekStart: string;
  weekEnd: string;
  xpEarned: number;
  coinsEarned: number;
  lessonsCompleted: number;
  miniTasksCompleted: number;
  homeworksGraded: number;
  /** Average homework score in [0..100] for items graded this week.
   *  Null when no homework was graded. UI converts via `pointsForScore`
   *  for the canonical 12-point display. */
  homeworkAvgScore: number | null;
  achievementsEarned: number;
  /** Number of distinct calendar days within the window where the kid
   *  earned at least one reward event (any action). */
  activeDays: number;
  daily: WeeklyDailyBucket[];
}

export async function fetchWeeklySummary(
  studentId: string,
): Promise<WeeklySummary> {
  const res = await fetch(
    `/api/rewards/student/${encodeURIComponent(studentId)}/weekly`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`fetchWeeklySummary ${res.status}`);
  const json: any = await res.json().catch(() => ({}));
  const d = json?.data;
  if (!d) throw new Error('fetchWeeklySummary: malformed response');
  return {
    studentId: String(d.studentId ?? studentId),
    weekStart: typeof d.weekStart === 'string' ? d.weekStart : '',
    weekEnd: typeof d.weekEnd === 'string' ? d.weekEnd : '',
    xpEarned: Number(d.xpEarned ?? 0),
    coinsEarned: Number(d.coinsEarned ?? 0),
    lessonsCompleted: Number(d.lessonsCompleted ?? 0),
    miniTasksCompleted: Number(d.miniTasksCompleted ?? 0),
    homeworksGraded: Number(d.homeworksGraded ?? 0),
    homeworkAvgScore:
      typeof d.homeworkAvgScore === 'number' ? d.homeworkAvgScore : null,
    achievementsEarned: Number(d.achievementsEarned ?? 0),
    activeDays: Number(d.activeDays ?? 0),
    daily: Array.isArray(d.daily) ? d.daily : [],
  };
}

export async function fetchMotivationSummary(
  studentId: string,
): Promise<MotivationSummary> {
  const res = await fetch(
    `/api/rewards/student/${encodeURIComponent(studentId)}/motivation`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`fetchMotivationSummary ${res.status}`);
  const json: any = await res.json().catch(() => ({}));
  const d = json?.data;
  if (!d) throw new Error('fetchMotivationSummary: malformed response');
  return {
    studentId: String(d.studentId ?? studentId),
    totalCoins: Number(d.totalCoins ?? 0),
    totalXp: Number(d.totalXp ?? 0),
    streakDays: Number(d.streakDays ?? 0),
    streakLastAt: typeof d.streakLastAt === 'string' ? d.streakLastAt : null,
    characterMood: typeof d.characterMood === 'string' ? d.characterMood : null,
    achievements: Array.isArray(d.achievements) ? d.achievements : [],
    recentEvents: Array.isArray(d.recentEvents) ? d.recentEvents : [],
    lastActiveAt: typeof d.lastActiveAt === 'string' ? d.lastActiveAt : null,
  };
}

export interface GrantInput {
  studentId: string;
  coins?: number;
  xp?: number;
  reason?: string;
}

export interface GrantResult {
  applied: boolean;
  xpDelta: number;
  coinsDelta: number;
  totalCoins: number;
  totalXp: number;
  level: number;
}

export async function grantBonus(input: GrantInput): Promise<GrantResult> {
  const res = await fetch('/api/rewards/grant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: input }),
  });
  if (!res.ok) {
    let message = `grantBonus ${res.status}`;
    try {
      const errJson: any = await res.json();
      if (errJson?.error?.message) message = errJson.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const json: any = await res.json().catch(() => ({}));
  const d = json?.data;
  return {
    applied: Boolean(d?.applied),
    xpDelta: Number(d?.xpDelta ?? 0),
    coinsDelta: Number(d?.coinsDelta ?? 0),
    totalCoins: Number(d?.totalCoins ?? 0),
    totalXp: Number(d?.totalXp ?? 0),
    level: Number(d?.level ?? 0),
  };
}
