/**
 * user-progress lifecycles — reward engine for Phase E2 / E5.
 *
 * When a user-progress transitions to `status: 'completed'` (either via
 * create or update), we:
 *   1. Credit coins + xp into the role-specific profile (kids or adult).
 *   2. Advance the streak counter (same-day = no-op, +1 day = ++, else reset).
 *   3. Set `characterMood` for kids based on the event.
 *   4. Evaluate all published achievements with criteria types that this
 *      event could satisfy (lessons-completed, streak-days, coins-earned).
 *      Newly-satisfied criteria → create `user-achievement` + apply reward.
 *
 * Idempotency: achievement creation is guarded by (user, achievement)
 * uniqueness; credit is guarded by the status transition (we only credit
 * when prev status wasn't 'completed').
 *
 * Triggered from `user-progress` create/update regardless of which FE route
 * wrote the record, so any code path that marks a lesson complete yields
 * the same downstream effects.
 */
const PROFILE_UID = 'api::user-profile.user-profile';
const KIDS_PROFILE_UID = 'api::kids-profile.kids-profile';
const ADULT_PROFILE_UID = 'api::adult-profile.adult-profile';
const ACHIEVEMENT_UID = 'api::achievement.achievement';
const USER_ACHIEVEMENT_UID = 'api::user-achievement.user-achievement';
const PROGRESS_UID = 'api::user-progress.user-progress';

/** Flat rewards for completing one lesson. Tunable; later we can read per-lesson values. */
const LESSON_COIN_REWARD = 10;
const LESSON_XP_REWARD = 15;

type Strapi = any;

type ProfileKind = 'kids' | 'adult' | 'other';

interface ProgressRow {
  id: number | string;
  documentId?: string;
  status?: string | null;
  user?: { documentId?: string; id?: number } | null;
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

function daysBetweenUTC(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  const aDay = Math.floor(a.getTime() / msPerDay);
  const bDay = Math.floor(b.getTime() / msPerDay);
  return aDay - bDay;
}

async function loadProfileContext(
  strapi: Strapi,
  userProfileDocumentId: string,
): Promise<{
  profileId: string;
  role: string | null;
  kind: ProfileKind;
  kidsProfileId: string | null;
  adultProfileId: string | null;
} | null> {
  const profile: any = await strapi.documents(PROFILE_UID).findOne({
    documentId: userProfileDocumentId,
    populate: { kidsProfile: true, adultProfile: true },
  });
  if (!profile) return null;
  const role = profile.role ?? null;
  const kind: ProfileKind = role === 'kids' ? 'kids' : role === 'adult' ? 'adult' : 'other';
  return {
    profileId: profile.documentId,
    role,
    kind,
    kidsProfileId: profile.kidsProfile?.documentId ?? null,
    adultProfileId: profile.adultProfile?.documentId ?? null,
  };
}

async function applyRewards(
  strapi: Strapi,
  ctx: Awaited<ReturnType<typeof loadProfileContext>>,
  coinsDelta: number,
  xpDelta: number,
): Promise<{ totalCoins: number; totalXp: number } | null> {
  if (!ctx) return null;
  const uid = ctx.kind === 'kids' ? KIDS_PROFILE_UID : ctx.kind === 'adult' ? ADULT_PROFILE_UID : null;
  const targetId = ctx.kind === 'kids' ? ctx.kidsProfileId : ctx.kind === 'adult' ? ctx.adultProfileId : null;
  if (!uid || !targetId) return null;

  const current: any = await strapi.documents(uid).findOne({ documentId: targetId });
  if (!current) return null;

  const nextCoins = Math.max(0, toNum(current.totalCoins) + coinsDelta);
  const nextXp = Math.max(0, toNum(current.totalXp) + xpDelta);

  await strapi.documents(uid).update({
    documentId: targetId,
    data: { totalCoins: nextCoins, totalXp: nextXp },
  });

  return { totalCoins: nextCoins, totalXp: nextXp };
}

async function advanceStreak(
  strapi: Strapi,
  ctx: Awaited<ReturnType<typeof loadProfileContext>>,
  now: Date,
): Promise<number | null> {
  if (!ctx) return null;
  const uid = ctx.kind === 'kids' ? KIDS_PROFILE_UID : ctx.kind === 'adult' ? ADULT_PROFILE_UID : null;
  const targetId = ctx.kind === 'kids' ? ctx.kidsProfileId : ctx.kind === 'adult' ? ctx.adultProfileId : null;
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
      // Same day — don't advance; keep the count stable and refresh lastAt.
      nextDays = Math.max(1, currentDays);
    } else if (delta === 1) {
      nextDays = currentDays + 1;
    } else {
      nextDays = 1;
    }
  }

  await strapi.documents(uid).update({
    documentId: targetId,
    data: { streakDays: nextDays, streakLastAt: now.toISOString() },
  });
  return nextDays;
}

async function setKidsMood(
  strapi: Strapi,
  ctx: Awaited<ReturnType<typeof loadProfileContext>>,
  mood: string,
): Promise<void> {
  if (!ctx || ctx.kind !== 'kids' || !ctx.kidsProfileId) return;
  await strapi.documents(KIDS_PROFILE_UID).update({
    documentId: ctx.kidsProfileId,
    data: { characterMood: mood },
  });
}

async function evaluateAchievements(
  strapi: Strapi,
  ctx: Awaited<ReturnType<typeof loadProfileContext>>,
  snapshot: { lessonsCompleted: number; streakDays: number; totalCoins: number },
): Promise<void> {
  if (!ctx) return;

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
    existing.map((ua) => ua?.achievement?.slug).filter((s): s is string => Boolean(s)),
  );

  for (const ach of achievements) {
    if (earnedSlugs.has(ach.slug)) continue;
    if (!ach.criteria || typeof ach.criteria !== 'object') continue;
    const c = ach.criteria as Record<string, unknown>;
    const type = c.type;
    let met = false;

    if (type === 'lessons-completed' && typeof c.count === 'number') {
      met = snapshot.lessonsCompleted >= c.count;
    } else if (type === 'streak-days' && typeof c.count === 'number') {
      met = snapshot.streakDays >= c.count;
    } else if (type === 'coins-earned' && typeof c.count === 'number') {
      met = snapshot.totalCoins >= c.count;
    }

    if (!met) continue;

    await strapi.documents(USER_ACHIEVEMENT_UID).create({
      data: {
        user: ctx.profileId,
        achievement: ach.documentId,
        earnedAt: new Date().toISOString(),
        progress: 100,
      },
    });

    // Apply achievement reward on top of the lesson reward.
    const reward = {
      coins: toNum(ach.coinReward),
      xp: toNum(ach.xpReward),
    };
    if (reward.coins > 0 || reward.xp > 0) {
      await applyRewards(strapi, ctx, reward.coins, reward.xp);
    }
  }
}

async function handleCompletion(strapi: Strapi, progressId: string | number): Promise<void> {
  const progress: any = await strapi.db.query(PROGRESS_UID).findOne({
    where: { id: progressId },
    populate: { user: true },
  });
  if (!progress?.user?.documentId) return;

  const ctx = await loadProfileContext(strapi, progress.user.documentId);
  if (!ctx || ctx.kind === 'other') return;

  const now = new Date();

  const rewarded = await applyRewards(strapi, ctx, LESSON_COIN_REWARD, LESSON_XP_REWARD);
  const streakDays = await advanceStreak(strapi, ctx, now);
  await setKidsMood(strapi, ctx, 'happy');

  const lessonsCompleted: number = await strapi.db.query(PROGRESS_UID).count({
    where: { user: { id: progress.user.id }, status: 'completed' },
  });

  await evaluateAchievements(strapi, ctx, {
    lessonsCompleted,
    streakDays: streakDays ?? 0,
    totalCoins: rewarded?.totalCoins ?? 0,
  });
}

export default {
  async beforeUpdate(event: any) {
    const id = event.params?.where?.id;
    if (!id) return;
    const existing = await (global as any).strapi.db.query(PROGRESS_UID).findOne({
      where: { id },
      select: ['status'],
    });
    event.state = event.state || {};
    event.state.prevStatus = existing?.status ?? null;
  },

  async afterCreate(event: any) {
    const status = event.result?.status;
    if (status !== 'completed') return;
    await handleCompletion((global as any).strapi, event.result.id);
  },

  async afterUpdate(event: any) {
    const status = event.result?.status;
    if (status !== 'completed') return;
    if (event.state?.prevStatus === 'completed') return;
    await handleCompletion((global as any).strapi, event.result.id);
  },
};
