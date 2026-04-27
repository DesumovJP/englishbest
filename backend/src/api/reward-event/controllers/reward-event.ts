/**
 * Reward-event controller — read-only ledger.
 *
 * Scoping:
 *   - admin   — sees all (audit / debug).
 *   - kids / adult / student — own events only (motivation report, weekly
 *     summary).
 *   - parent  — own children's events.
 *   - teacher — own students' events (today: any kid; tightened in Phase D).
 */
import { factories } from '@strapi/strapi';
import { scopedFind } from '../../../lib/scoped-find';
import { awardOnAction } from '../../../lib/rewards';

const EVENT_UID = 'api::reward-event.reward-event';
const PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const KIDS_PROFILE_UID = 'api::kids-profile.kids-profile';
const ADULT_PROFILE_UID = 'api::adult-profile.adult-profile';
const USER_ACHIEVEMENT_UID = 'api::user-achievement.user-achievement';

const MAX_GRANT_COINS = 500;
const MAX_GRANT_XP = 200;

function roleType(u: any): string {
  return (u?.role?.type ?? '').toLowerCase();
}

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [p] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return p?.documentId ?? null;
}

async function callerTeacherProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return tp?.documentId ?? null;
}

async function childProfileIds(strapi: any, parentProfileId: string): Promise<string[]> {
  const kids = await strapi.documents(PROFILE_UID).findMany({
    filters: { parentalConsentBy: { documentId: { $eq: parentProfileId } } },
    fields: ['documentId'],
    limit: 200,
  });
  return kids
    .map((k: any) => k.documentId)
    .filter((x: unknown): x is string => typeof x === 'string');
}

export default factories.createCoreController(EVENT_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    let scopeFilter: Record<string, unknown>;
    if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      if (kidIds.length === 0) {
        ctx.body = {
          data: [],
          meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } },
        };
        return;
      }
      scopeFilter = { user: { documentId: { $in: kidIds } } };
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      scopeFilter = { user: { documentId: { $eq: profileId } } };
    }

    return scopedFind(ctx, this, EVENT_UID, scopeFilter, {
      populate: { user: { fields: ['documentId'] } },
    });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity: any = await strapi.documents(EVENT_UID).findOne({
      documentId: ctx.params.id,
      populate: { user: { fields: ['documentId'] } },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    const ownerId = entity.user?.documentId ?? null;
    if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      if (!ownerId || !kidIds.includes(ownerId)) return ctx.forbidden();
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId || ownerId !== profileId) return ctx.forbidden();
    }
    return (super.findOne as any)(ctx);
  },

  /**
   * POST /rewards/grant — teacher / admin awards bonus coins (and optionally
   * XP) to a single student. Body:
   *   { studentId: string, coins?: number, xp?: number, reason?: string }
   *
   * Routes through the central rewards service so the bonus credit is
   * indistinguishable in the kids HUD from any other reward, and the
   * `reward-event` ledger row carries `action='grant'` plus
   * `meta.grantedBy` / `meta.reason` for audit. Idempotency: the
   * sourceKey embeds caller + millisecond timestamp, so two concurrent
   * grant clicks always produce two distinct ledger rows on purpose
   * (re-grant is a deliberate teacher action, not a retry).
   *
   * Caps: per-grant 500 coins / 200 XP, server-side. Larger grants
   * require admin DB access.
   */
  async grant(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    const data = (body.data ?? body) as Record<string, unknown>;
    const studentId = typeof data.studentId === 'string' ? data.studentId : null;
    if (!studentId) return ctx.badRequest('studentId required');

    const coins = typeof data.coins === 'number' && Number.isFinite(data.coins)
      ? Math.max(0, Math.min(MAX_GRANT_COINS, Math.round(data.coins)))
      : 0;
    const xp = typeof data.xp === 'number' && Number.isFinite(data.xp)
      ? Math.max(0, Math.min(MAX_GRANT_XP, Math.round(data.xp)))
      : 0;
    if (coins === 0 && xp === 0) {
      return ctx.badRequest('grant must include coins > 0 or xp > 0');
    }

    const reason = typeof data.reason === 'string' && data.reason.trim().length > 0
      ? data.reason.trim().slice(0, 280)
      : null;

    // Caller identity in the audit row — teacher-profile docId, falling
    // back to user-profile (admin without a teacher-profile is fine).
    const grantedByTeacher = await callerTeacherProfileId(strapi, user.id);
    const grantedByProfile = await callerProfileId(strapi, user.id);
    const grantedBy = grantedByTeacher ?? grantedByProfile ?? `user:${user.id}`;

    const sourceKey = `grant:${grantedBy}:${Date.now()}`;

    const award = await awardOnAction(strapi, {
      userProfileId: studentId,
      action: 'grant',
      sourceKey,
      meta: {
        coins,
        xp,
        grantedBy,
        grantedByRole: role,
        reason,
      },
      // Manual grants don't trigger achievement evaluation — they're
      // discretionary teacher actions, not progress signals.
      skipAchievementEval: true,
    });

    ctx.body = { data: award };
  },

  /**
   * GET /rewards/student/:studentId/motivation — aggregate motivation
   * snapshot for one student. Powers the teacher StudentDetail
   * "motivation" tab and the parent dashboard per-child widget. One
   * round-trip instead of three.
   *
   * Scope:
   *   - admin   — any student.
   *   - teacher — any student (loose; tighten when teacher↔student
   *     relationship is formalised).
   *   - parent  — only own children (parentalConsentBy).
   *   - self    — own snapshot.
   *   - others  — forbidden.
   */
  async motivationSummary(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const studentId = ctx.params?.studentId;
    if (typeof studentId !== 'string' || !studentId) {
      return ctx.badRequest('studentId required');
    }

    if (role !== 'admin' && role !== 'teacher') {
      const callerProfile = await callerProfileId(strapi, user.id);
      if (!callerProfile) return ctx.forbidden();
      if (role === 'parent') {
        const kidIds = await childProfileIds(strapi, callerProfile);
        if (!kidIds.includes(studentId)) return ctx.forbidden('not your child');
      } else if (callerProfile !== studentId) {
        return ctx.forbidden();
      }
    }

    // Profile + role-specific currency holder.
    const target: any = await strapi.documents(PROFILE_UID).findOne({
      documentId: studentId,
      populate: { kidsProfile: true, adultProfile: true },
    });
    if (!target) return ctx.notFound('student not found');

    const kp = target.kidsProfile ?? null;
    const ap = target.adultProfile ?? null;
    const totalCoins =
      kp ? Number(kp.totalCoins ?? 0)
      : ap ? Number((ap as any).totalCoins ?? 0)
      : 0;
    const totalXp =
      kp ? Number(kp.totalXp ?? 0)
      : ap ? Number((ap as any).totalXp ?? 0)
      : 0;
    const streakDays = kp ? Number(kp.streakDays ?? 0) : 0;
    const streakLastAt = kp?.streakLastAt ?? null;
    const characterMood = kp?.characterMood ?? null;

    // Recent achievements (newest first).
    const achievementsRaw: any[] = await strapi.documents(USER_ACHIEVEMENT_UID).findMany({
      filters: { user: { documentId: { $eq: studentId } } },
      populate: { achievement: { fields: ['slug', 'title', 'tier', 'category', 'coinReward', 'xpReward'] } },
      sort: { earnedAt: 'desc' as any },
      pagination: { pageSize: 50, page: 1 } as any,
    });
    const achievements = achievementsRaw.map((ua: any) => ({
      slug: ua?.achievement?.slug ?? null,
      title: ua?.achievement?.title ?? null,
      tier: ua?.achievement?.tier ?? null,
      category: ua?.achievement?.category ?? null,
      coinReward: Number(ua?.achievement?.coinReward ?? 0),
      xpReward: Number(ua?.achievement?.xpReward ?? 0),
      earnedAt: ua?.earnedAt ?? null,
    })).filter((a) => a.slug);

    // Recent reward-events (newest first) — used to render "what fed the
    // bar today" timeline.
    const recentEventsRaw: any[] = await strapi.documents(EVENT_UID).findMany({
      filters: { user: { documentId: { $eq: studentId } } },
      sort: { createdAt: 'desc' as any },
      pagination: { pageSize: 30, page: 1 } as any,
    });
    const recentEvents = recentEventsRaw.map((e: any) => ({
      documentId: e.documentId,
      action: e.action,
      xpDelta: Number(e.xpDelta ?? 0),
      coinsDelta: Number(e.coinsDelta ?? 0),
      createdAt: e.createdAt,
      meta: e.meta ?? null,
    }));

    // Last active = max(streakLastAt, latest reward-event.createdAt).
    const lastEventAt = recentEvents[0]?.createdAt ?? null;
    const lastActiveAt = streakLastAt && lastEventAt
      ? (streakLastAt > lastEventAt ? streakLastAt : lastEventAt)
      : (streakLastAt ?? lastEventAt ?? null);

    ctx.body = {
      data: {
        studentId,
        totalCoins,
        totalXp,
        streakDays,
        streakLastAt,
        characterMood,
        achievements,
        recentEvents,
        lastActiveAt,
      },
    };
  },
}));
