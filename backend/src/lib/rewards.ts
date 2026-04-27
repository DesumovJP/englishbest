/**
 * Rewards service — single source of truth for every coin / XP credit.
 *
 * All earn paths (lesson lifecycle, mini-task submit, homework grading,
 * attendance create, streak milestones, achievement bonuses, manual grants)
 * route through `awardOnAction`. The reward-event ledger plus the
 * `sourceKey` idempotency check guarantee retries / replays / double-POSTs
 * cannot double-credit.
 *
 * The matrix (`resolveDeltas`) is the canonical reward table — see
 * `REWARDS.md` for the rationale and per-action values. Never fork the
 * matrix into another module.
 */

const PROFILE_UID = 'api::user-profile.user-profile';
const KIDS_PROFILE_UID = 'api::kids-profile.kids-profile';
const ADULT_PROFILE_UID = 'api::adult-profile.adult-profile';
const ACHIEVEMENT_UID = 'api::achievement.achievement';
const USER_ACHIEVEMENT_UID = 'api::user-achievement.user-achievement';
const PROGRESS_UID = 'api::user-progress.user-progress';
const HW_SUBMISSION_UID = 'api::homework-submission.homework-submission';
const ATTENDANCE_UID = 'api::attendance-record.attendance-record';
const ATTEMPT_UID = 'api::mini-task-attempt.mini-task-attempt';
const REWARD_EVENT_UID = 'api::reward-event.reward-event';

// ─── Matrix ─────────────────────────────────────────────────────────────
//
// Keep these constants tight and well-named. Tuning these is the lever for
// the whole motivation balance — change one number and every downstream
// surface (HUD, parent dashboard, achievement progress) follows.

const LESSON_XP = 15;
const LESSON_COINS = 10;

const HW_GOOD_THRESHOLD = 80;
const HW_PASS_THRESHOLD = 50;
const HW_GOOD_XP = 25;
const HW_GOOD_COINS = 20;
const HW_PASS_XP = 10;
const HW_PASS_COINS = 5;

const ATT_PRESENT_XP = 5;
const ATT_LATE_XP = 2;

const MINITASK_PASS_THRESHOLD = 50;
const MINITASK_PERFECT_XP = 10;
const MINITASK_PASS_XP = 5;

/**
 * Streak milestones — only firing days bring a bonus. Keeps the reward
 * spread thin so the kid feels gradual escalation rather than a daily flood.
 */
const STREAK_MILESTONES: Record<number, { xp: number; coins: number }> = {
  3:  { xp: 10, coins: 15 },
  7:  { xp: 20, coins: 30 },
  14: { xp: 30, coins: 50 },
  30: { xp: 50, coins: 100 },
  60: { xp: 100, coins: 200 },
};

// ─── Types ──────────────────────────────────────────────────────────────

export type RewardAction =
  | 'lesson'
  | 'minitask'
  | 'homework'
  | 'attendance'
  | 'streak'
  | 'achievement'
  | 'grant';

export interface AwardInput {
  /** user-profile.documentId of the recipient. */
  userProfileId: string;
  action: RewardAction;
  /** Idempotency key — see `REWARDS.md` for the per-action conventions. */
  sourceKey: string;
  /** Per-action context — score, status, days, etc. See `resolveDeltas`. */
  meta?: Record<string, unknown>;
  /** Skip achievement evaluation. Used internally when an achievement-bonus
   *  call must not recurse into its own evaluation. */
  skipAchievementEval?: boolean;
  /** Advance the streak counter as part of this award (lesson, mini-task,
   *  homework). Attendance / streak milestones do not re-advance. */
  advanceStreak?: boolean;
  /** Optional mood override for kids profile. */
  setMood?: string;
}

export interface AchievementEarn {
  slug: string;
  title: string;
  xpReward: number;
  coinReward: number;
}

export interface AwardResult {
  /** False when the sourceKey already existed in the ledger — caller
   *  should treat this as "no-op, already credited". */
  applied: boolean;
  xpDelta: number;
  coinsDelta: number;
  totalCoins: number;
  totalXp: number;
  prevLevel: number;
  level: number;
  levelUp: boolean;
  streakDays: number | null;
  achievementsEarned: AchievementEarn[];
}

// ─── Level computation ─────────────────────────────────────────────────
//
// Quadratic curve: level n requires 100 * n² cumulative XP.
//   level 1 → 100, level 2 → 400, level 3 → 900, level 5 → 2500,
//   level 10 → 10 000, level 20 → 40 000.
// High levels feel earned; low levels arrive fast for early dopamine.

export function computeLevel(xp: number): {
  level: number;
  currentInLevel: number;
  nextThreshold: number;
} {
  const safe = Math.max(0, xp);
  const level = Math.floor(Math.sqrt(safe / 100));
  const prev = 100 * level * level;
  const next = 100 * (level + 1) * (level + 1);
  return { level, currentInLevel: safe - prev, nextThreshold: next - prev };
}

// ─── Matrix resolver ────────────────────────────────────────────────────

function toNum(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

function resolveDeltas(
  action: RewardAction,
  meta: Record<string, unknown> | undefined,
): { xp: number; coins: number } {
  switch (action) {
    case 'lesson':
      return { xp: LESSON_XP, coins: LESSON_COINS };

    case 'minitask': {
      const score = toNum(meta?.score);
      const reward = toNum(meta?.coinReward);
      if (score < MINITASK_PASS_THRESHOLD) return { xp: 0, coins: 0 };
      const xp = score === 100 ? MINITASK_PERFECT_XP : MINITASK_PASS_XP;
      const coins = Math.floor((reward * score) / 100);
      return { xp, coins };
    }

    case 'homework': {
      const score = toNum(meta?.score);
      if (score >= HW_GOOD_THRESHOLD) return { xp: HW_GOOD_XP, coins: HW_GOOD_COINS };
      if (score >= HW_PASS_THRESHOLD) return { xp: HW_PASS_XP, coins: HW_PASS_COINS };
      return { xp: 0, coins: 0 };
    }

    case 'attendance': {
      const status = meta?.status;
      if (status === 'present') return { xp: ATT_PRESENT_XP, coins: 0 };
      if (status === 'late' || status === 'excused') return { xp: ATT_LATE_XP, coins: 0 };
      return { xp: 0, coins: 0 };
    }

    case 'streak': {
      const days = toNum(meta?.days);
      const m = STREAK_MILESTONES[days];
      return m ?? { xp: 0, coins: 0 };
    }

    case 'achievement':
      return {
        xp: toNum(meta?.xpReward),
        coins: toNum(meta?.coinReward),
      };

    case 'grant':
      return { xp: toNum(meta?.xp), coins: toNum(meta?.coins) };

    default:
      return { xp: 0, coins: 0 };
  }
}

// ─── Profile context (kids vs adult) ────────────────────────────────────

type ProfileKind = 'kids' | 'adult' | 'other';

interface ProfileCtx {
  profileId: string;
  role: string | null;
  kind: ProfileKind;
  kidsProfileId: string | null;
  adultProfileId: string | null;
  userId: number | string | null;
}

async function loadProfileContext(
  strapi: any,
  userProfileDocumentId: string,
): Promise<ProfileCtx | null> {
  const profile: any = await strapi.documents(PROFILE_UID).findOne({
    documentId: userProfileDocumentId,
    populate: { kidsProfile: true, adultProfile: true, user: true },
  });
  if (!profile) return null;
  const role = profile.role ?? null;
  const kind: ProfileKind =
    role === 'kids' ? 'kids' : role === 'adult' ? 'adult' : 'other';
  return {
    profileId: profile.documentId,
    role,
    kind,
    kidsProfileId: profile.kidsProfile?.documentId ?? null,
    adultProfileId: profile.adultProfile?.documentId ?? null,
    userId: profile.user?.id ?? null,
  };
}

// ─── Mutations ──────────────────────────────────────────────────────────

async function applyDeltas(
  strapi: any,
  ctx: ProfileCtx,
  coinsDelta: number,
  xpDelta: number,
): Promise<{ totalCoins: number; totalXp: number; prevTotalXp: number } | null> {
  const uid =
    ctx.kind === 'kids' ? KIDS_PROFILE_UID
    : ctx.kind === 'adult' ? ADULT_PROFILE_UID
    : null;
  const targetId =
    ctx.kind === 'kids' ? ctx.kidsProfileId
    : ctx.kind === 'adult' ? ctx.adultProfileId
    : null;
  if (!uid || !targetId) return null;

  const current: any = await strapi.documents(uid).findOne({ documentId: targetId });
  if (!current) return null;

  const prevTotalXp = toNum(current.totalXp);
  const nextCoins = Math.max(0, toNum(current.totalCoins) + coinsDelta);
  const nextXp = Math.max(0, prevTotalXp + xpDelta);

  if (coinsDelta === 0 && xpDelta === 0) {
    return { totalCoins: nextCoins, totalXp: nextXp, prevTotalXp };
  }

  await strapi.documents(uid).update({
    documentId: targetId,
    data: { totalCoins: nextCoins, totalXp: nextXp },
  });
  return { totalCoins: nextCoins, totalXp: nextXp, prevTotalXp };
}

function daysBetweenUTC(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  return Math.floor(a.getTime() / msPerDay) - Math.floor(b.getTime() / msPerDay);
}

async function advanceStreak(
  strapi: any,
  ctx: ProfileCtx,
  now: Date,
): Promise<{ days: number; crossedMilestone: boolean } | null> {
  const uid =
    ctx.kind === 'kids' ? KIDS_PROFILE_UID
    : ctx.kind === 'adult' ? ADULT_PROFILE_UID
    : null;
  const targetId =
    ctx.kind === 'kids' ? ctx.kidsProfileId
    : ctx.kind === 'adult' ? ctx.adultProfileId
    : null;
  if (!uid || !targetId) return null;

  const current: any = await strapi.documents(uid).findOne({ documentId: targetId });
  if (!current) return null;

  const lastAt = current.streakLastAt ? new Date(current.streakLastAt) : null;
  const currentDays = toNum(current.streakDays);

  let nextDays: number;
  if (!lastAt) {
    nextDays = 1;
  } else {
    const delta = daysBetweenUTC(now, lastAt);
    if (delta <= 0) {
      // Same day — keep counter, refresh lastAt; never count milestone.
      await strapi.documents(uid).update({
        documentId: targetId,
        data: { streakLastAt: now.toISOString() },
      });
      return { days: Math.max(1, currentDays), crossedMilestone: false };
    }
    nextDays = delta === 1 ? currentDays + 1 : 1;
  }

  await strapi.documents(uid).update({
    documentId: targetId,
    data: { streakDays: nextDays, streakLastAt: now.toISOString() },
  });
  return {
    days: nextDays,
    crossedMilestone: STREAK_MILESTONES[nextDays] !== undefined,
  };
}

async function setKidsMood(
  strapi: any,
  ctx: ProfileCtx,
  mood: string,
): Promise<void> {
  if (ctx.kind !== 'kids' || !ctx.kidsProfileId) return;
  await strapi.documents(KIDS_PROFILE_UID).update({
    documentId: ctx.kidsProfileId,
    data: { characterMood: mood },
  });
}

// ─── Achievement engine ────────────────────────────────────────────────

interface MotivationSnapshot {
  lessonsCompleted: number;
  streakDays: number;
  totalCoins: number;
  totalXp: number;
  level: number;
  homeworksGoodCount: number;     // HW with score >= 80
  miniTasksCompletedCount: number;
  miniTasksPerfectCount: number;
  perfectAttendanceWeek: boolean;
}

async function buildSnapshot(
  strapi: any,
  ctx: ProfileCtx,
  totalCoins: number,
  totalXp: number,
  streakDays: number,
): Promise<MotivationSnapshot> {
  const userIdNum = ctx.userId;
  const lessonsCompleted: number = userIdNum != null
    ? await strapi.db.query(PROGRESS_UID).count({
        where: { user: { id: userIdNum }, status: 'completed' },
      })
    : 0;

  const homeworksGoodCount: number = await strapi.db.query(HW_SUBMISSION_UID).count({
    where: {
      student: { documentId: ctx.profileId },
      score: { $gte: HW_GOOD_THRESHOLD },
    },
  });

  const miniTasksCompletedCount: number = await strapi.db.query(ATTEMPT_UID).count({
    where: {
      user: { documentId: ctx.profileId },
      score: { $gte: MINITASK_PASS_THRESHOLD },
    },
  });

  const miniTasksPerfectCount: number = await strapi.db.query(ATTEMPT_UID).count({
    where: {
      user: { documentId: ctx.profileId },
      score: 100,
    },
  });

  // Perfect-week-attendance: every recorded attendance in the last 7 days
  // is `present` AND there are at least 2 records (so a kid who skipped
  // every session this week doesn't pass on zero records).
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const recentAttendance: any[] = await strapi.db.query(ATTENDANCE_UID).findMany({
    where: {
      student: { documentId: ctx.profileId },
      recordedAt: { $gte: sevenDaysAgo },
    },
    select: ['status'],
  });
  const perfectAttendanceWeek =
    recentAttendance.length >= 2 &&
    recentAttendance.every((r: any) => r.status === 'present');

  const { level } = computeLevel(totalXp);

  return {
    lessonsCompleted,
    streakDays,
    totalCoins,
    totalXp,
    level,
    homeworksGoodCount,
    miniTasksCompletedCount,
    miniTasksPerfectCount,
    perfectAttendanceWeek,
  };
}

async function evaluateAchievements(
  strapi: any,
  ctx: ProfileCtx,
  snapshot: MotivationSnapshot,
): Promise<AchievementEarn[]> {
  const achievements: any[] = await strapi.documents(ACHIEVEMENT_UID).findMany({
    status: 'published',
    pagination: { pageSize: 200 },
  });

  const existing: any[] = await strapi.documents(USER_ACHIEVEMENT_UID).findMany({
    filters: { user: { documentId: ctx.profileId } },
    populate: { achievement: { fields: ['slug'] } },
    pagination: { pageSize: 200 },
  });
  const earnedSlugs = new Set(
    existing
      .map((ua: any) => ua?.achievement?.slug)
      .filter((s: unknown): s is string => Boolean(s)),
  );

  const newlyEarned: AchievementEarn[] = [];

  for (const ach of achievements) {
    if (earnedSlugs.has(ach.slug)) continue;
    if (!ach.criteria || typeof ach.criteria !== 'object') continue;
    const c = ach.criteria as Record<string, unknown>;
    const type = c.type;
    const count = typeof c.count === 'number' ? c.count : 0;
    let met = false;

    switch (type) {
      case 'lessons-completed':
        met = snapshot.lessonsCompleted >= count;
        break;
      case 'streak-days':
        met = snapshot.streakDays >= count;
        break;
      case 'coins-earned':
        met = snapshot.totalCoins >= count;
        break;
      case 'homeworks-graded-good':
        met = snapshot.homeworksGoodCount >= count;
        break;
      case 'mini-tasks-completed':
        met = snapshot.miniTasksCompletedCount >= count;
        break;
      case 'mini-tasks-perfect':
        met = snapshot.miniTasksPerfectCount >= count;
        break;
      case 'perfect-week-attendance':
        met = snapshot.perfectAttendanceWeek;
        break;
      case 'level-reached':
        met = snapshot.level >= count;
        break;
      default:
        met = false;
    }

    if (!met) continue;

    await strapi.documents(USER_ACHIEVEMENT_UID).create({
      data: {
        user: ctx.profileId,
        achievement: ach.documentId,
        earnedAt: new Date().toISOString(),
        progress: 100,
      } as any,
    });

    const xpReward = toNum(ach.xpReward);
    const coinReward = toNum(ach.coinReward);
    if (xpReward > 0 || coinReward > 0) {
      // Recursive but bounded: we tag it `skipAchievementEval=true` so the
      // bonus credit does NOT re-evaluate criteria; otherwise a coins-earned
      // achievement could rebound on its own bonus.
      await awardOnAction(strapi, {
        userProfileId: ctx.profileId,
        action: 'achievement',
        sourceKey: `achievement:${ctx.profileId}:${ach.slug}`,
        meta: { xpReward, coinReward },
        skipAchievementEval: true,
      });
    }

    newlyEarned.push({
      slug: ach.slug,
      title: ach.title ?? ach.slug,
      xpReward,
      coinReward,
    });
  }

  return newlyEarned;
}

// ─── Idempotency check ─────────────────────────────────────────────────

async function alreadyAwarded(
  strapi: any,
  sourceKey: string,
): Promise<boolean> {
  const [hit]: any[] = await strapi.documents(REWARD_EVENT_UID).findMany({
    filters: { sourceKey: { $eq: sourceKey } },
    fields: ['documentId'],
    limit: 1,
  });
  return Boolean(hit);
}

async function recordEvent(
  strapi: any,
  ctx: ProfileCtx,
  input: AwardInput,
  xpDelta: number,
  coinsDelta: number,
): Promise<void> {
  await strapi.documents(REWARD_EVENT_UID).create({
    data: {
      user: ctx.profileId,
      action: input.action,
      sourceKey: input.sourceKey,
      xpDelta,
      coinsDelta,
      meta: input.meta ?? null,
    } as any,
  });
}

// ─── Public entry point ────────────────────────────────────────────────

export async function awardOnAction(
  strapi: any,
  input: AwardInput,
): Promise<AwardResult> {
  const empty: AwardResult = {
    applied: false,
    xpDelta: 0,
    coinsDelta: 0,
    totalCoins: 0,
    totalXp: 0,
    prevLevel: 0,
    level: 0,
    levelUp: false,
    streakDays: null,
    achievementsEarned: [],
  };

  // 1. Idempotency — a previous successful call wrote the same key.
  if (await alreadyAwarded(strapi, input.sourceKey)) {
    return empty;
  }

  // 2. Resolve deltas from the matrix.
  const { xp: xpDelta, coins: coinsDelta } = resolveDeltas(input.action, input.meta);

  // 3. Profile context.
  const ctx = await loadProfileContext(strapi, input.userProfileId);
  if (!ctx || ctx.kind === 'other') return empty;

  // 4. Apply coin / XP deltas.
  const applied = await applyDeltas(strapi, ctx, coinsDelta, xpDelta);
  if (!applied) return empty;

  const prevLevel = computeLevel(applied.prevTotalXp).level;
  const nextLevel = computeLevel(applied.totalXp).level;
  const levelUp = nextLevel > prevLevel;

  // 5. Record ledger row (always — even when deltas are 0, we want the
  //    audit trace and the idempotency block on this sourceKey).
  await recordEvent(strapi, ctx, input, xpDelta, coinsDelta);

  // 6. Streak handling — only on the actions that should advance it.
  let streakDays: number | null = null;
  let streakMilestone: number | null = null;
  if (input.advanceStreak) {
    const r = await advanceStreak(strapi, ctx, new Date());
    if (r) {
      streakDays = r.days;
      if (r.crossedMilestone) streakMilestone = r.days;
    }
  }

  // 7. Mood for kids — caller-provided override or sensible default per action.
  const defaultMood =
    input.action === 'lesson' ? 'happy'
    : input.action === 'minitask' ? 'excited'
    : input.action === 'homework' ? 'proud'
    : null;
  const mood = input.setMood ?? defaultMood;
  if (mood) await setKidsMood(strapi, ctx, mood);

  // 8. Streak milestone bonus — separate award call so it gets its own
  //    ledger row and idempotency key.
  if (streakMilestone !== null) {
    const dayKey = new Date().toISOString().slice(0, 10);
    await awardOnAction(strapi, {
      userProfileId: ctx.profileId,
      action: 'streak',
      sourceKey: `streak:${ctx.profileId}:${dayKey}:${streakMilestone}`,
      meta: { days: streakMilestone },
      skipAchievementEval: false,
    });
  }

  // 9. Achievement evaluation against the post-credit snapshot.
  let achievementsEarned: AchievementEarn[] = [];
  if (!input.skipAchievementEval) {
    const snapshot = await buildSnapshot(
      strapi,
      ctx,
      applied.totalCoins,
      applied.totalXp,
      streakDays ?? 0,
    );
    achievementsEarned = await evaluateAchievements(strapi, ctx, snapshot);
  }

  return {
    applied: true,
    xpDelta,
    coinsDelta,
    totalCoins: applied.totalCoins,
    totalXp: applied.totalXp,
    prevLevel,
    level: nextLevel,
    levelUp,
    streakDays,
    achievementsEarned,
  };
}
