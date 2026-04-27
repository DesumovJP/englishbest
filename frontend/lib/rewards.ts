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
