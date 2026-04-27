/**
 * Parent controller.
 *
 * Read-only aggregation for the parent dashboard. No content-type — this API
 * just exposes two endpoints:
 *
 *   GET /api/parent/me/children              — list of linked children + summaries
 *   GET /api/parent/me/children/:kidDocId    — deep view for one child
 *
 * Linkage model: a kid is a `user-profile` row with `parentalConsentBy` set to
 * the parent's `user-profile.documentId`. This mirrors what the
 * `homework-submission` scoped controller already relies on; `parent-link` is
 * the richer m2m model but not yet wired end-to-end.
 *
 * Role gate: caller must have `role=parent` OR `role=admin`. Admin may pass
 * `?parentId=<userProfileDocId>` to inspect another parent's view (handy for
 * support). Scoping is applied even for admin when they don't pass the param.
 */

const PROFILE_UID = 'api::user-profile.user-profile';
const KIDS_PROFILE_UID = 'api::kids-profile.kids-profile';
const SESSION_UID = 'api::session.session';
const SUBMISSION_UID = 'api::homework-submission.homework-submission';
const PROGRESS_UID = 'api::user-progress.user-progress';

function roleType(ctxUser: any): string {
  return (ctxUser?.role?.type ?? '').toLowerCase();
}

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

async function loadChildren(strapi: any, parentProfileDocId: string) {
  return strapi.documents(PROFILE_UID).findMany({
    filters: {
      parentalConsentBy: { documentId: { $eq: parentProfileDocId } },
      role: { $in: ['kids', 'adult'] },
    },
    fields: ['documentId', 'firstName', 'lastName', 'displayName', 'role', 'level', 'locale'],
    populate: {
      avatar: { fields: ['url'] },
      kidsProfile: {
        fields: [
          'documentId',
          'companionAnimal',
          'companionName',
          'characterMood',
          'streakDays',
          'streakLastAt',
          'totalCoins',
          'totalXp',
          'hardCurrency',
          'ageGroup',
        ],
      },
    },
    pagination: { pageSize: 50, page: 1 },
    sort: ['firstName:asc'],
  });
}

async function summaryForChild(strapi: any, childDocId: string) {
  const nowIso = new Date().toISOString();

  const [upcoming, pending, recentProgress] = await Promise.all([
    strapi.documents(SESSION_UID).findMany({
      filters: {
        attendees: { documentId: { $eq: childDocId } },
        startAt: { $gte: nowIso },
        status: { $in: ['scheduled', 'live'] },
      },
      // Fields/populate kept in sync with `lib/session-display` canonical
      // textual content — parent dashboard renders the same vocabulary
      // (status / type / duration / course / attendees) as every other
      // surface.
      fields: ['documentId', 'title', 'startAt', 'durationMin', 'type', 'status', 'joinUrl'],
      populate: {
        teacher: {
          fields: ['documentId'],
          populate: {
            user: {
              fields: ['documentId', 'displayName', 'firstName', 'lastName'],
            },
          },
        },
        course: { fields: ['documentId', 'title'] },
        attendees: { fields: ['documentId', 'displayName', 'firstName', 'lastName'] },
      },
      sort: ['startAt:asc'],
      pagination: { pageSize: 5, page: 1 },
    }),
    strapi.documents(SUBMISSION_UID).findMany({
      filters: {
        student: { documentId: { $eq: childDocId } },
        status: { $in: ['notStarted', 'inProgress', 'submitted', 'overdue'] },
      },
      fields: ['documentId', 'status', 'submittedAt'],
      populate: {
        homework: {
          fields: ['documentId', 'title', 'dueAt', 'status'],
        },
      },
      sort: ['updatedAt:desc'],
      pagination: { pageSize: 20, page: 1 },
    }),
    strapi.documents(PROGRESS_UID).findMany({
      filters: {
        user: { documentId: { $eq: childDocId } },
      },
      fields: ['documentId', 'status', 'score', 'completedAt', 'lastAttemptAt'],
      populate: {
        lesson: { fields: ['documentId', 'title', 'level'] },
      },
      sort: ['lastAttemptAt:desc'],
      pagination: { pageSize: 5, page: 1 },
    }),
  ]);

  const homeworkDue = (pending as any[]).filter(s => s.homework?.status === 'published');
  const progressDone = (recentProgress as any[]).filter(r => r.status === 'completed');
  const scores = progressDone
    .map(r => (typeof r.score === 'number' ? r.score : null))
    .filter((n): n is number => n !== null);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return {
    upcomingSessions: upcoming,
    pendingHomework: homeworkDue,
    pendingHomeworkCount: homeworkDue.length,
    recentProgress,
    completedLessons: progressDone.length,
    avgScore,
  };
}

async function resolveParentScope(strapi: any, ctx: any): Promise<{ parentProfileId: string } | null> {
  const user = ctx.state.user;
  if (!user) {
    ctx.unauthorized();
    return null;
  }
  const role = roleType(user);
  if (role === 'admin' && typeof ctx.query?.parentId === 'string') {
    return { parentProfileId: ctx.query.parentId };
  }
  if (role !== 'parent' && role !== 'admin') {
    ctx.forbidden('parent role required');
    return null;
  }
  const profileId = await callerProfileId(strapi, user.id);
  if (!profileId) {
    ctx.notFound('user-profile not found');
    return null;
  }
  return { parentProfileId: profileId };
}

export default {
  async children(ctx: any) {
    const scope = await resolveParentScope(strapi, ctx);
    if (!scope) return;

    const children = await loadChildren(strapi, scope.parentProfileId);

    const summaries = await Promise.all(
      (children as any[]).map(async c => ({
        child: c,
        ...(await summaryForChild(strapi, c.documentId)),
      })),
    );

    return { data: summaries };
  },

  async child(ctx: any) {
    const scope = await resolveParentScope(strapi, ctx);
    if (!scope) return;

    const kidDocId = ctx.params?.kidDocId;
    if (!kidDocId || typeof kidDocId !== 'string') {
      return ctx.badRequest('kidDocId required');
    }

    const [kid] = await strapi.documents(PROFILE_UID).findMany({
      filters: {
        documentId: { $eq: kidDocId },
        parentalConsentBy: { documentId: { $eq: scope.parentProfileId } },
      },
      fields: ['documentId', 'firstName', 'lastName', 'displayName', 'role', 'level', 'locale'],
      populate: {
        avatar: { fields: ['url'] },
        kidsProfile: true,
      },
      limit: 1,
    });
    if (!kid) return ctx.notFound('child not linked to caller');

    const summary = await summaryForChild(strapi, kidDocId);

    // Extended window for the detail view — more upcoming + more recent progress.
    const nowIso = new Date().toISOString();
    const [allUpcoming, allPending, allProgress] = await Promise.all([
      strapi.documents(SESSION_UID).findMany({
        filters: {
          attendees: { documentId: { $eq: kidDocId } },
          startAt: { $gte: nowIso },
        },
        fields: ['documentId', 'title', 'startAt', 'durationMin', 'type', 'status', 'joinUrl'],
        populate: {
          teacher: {
            fields: ['documentId'],
            populate: {
              user: { fields: ['documentId', 'displayName', 'firstName', 'lastName'] },
            },
          },
        },
        sort: ['startAt:asc'],
        pagination: { pageSize: 20, page: 1 },
      }),
      strapi.documents(SUBMISSION_UID).findMany({
        filters: { student: { documentId: { $eq: kidDocId } } },
        fields: ['documentId', 'status', 'score', 'submittedAt', 'gradedAt', 'teacherFeedback'],
        populate: {
          homework: { fields: ['documentId', 'title', 'dueAt', 'status'] },
        },
        sort: ['updatedAt:desc'],
        pagination: { pageSize: 50, page: 1 },
      }),
      strapi.documents(PROGRESS_UID).findMany({
        filters: { user: { documentId: { $eq: kidDocId } } },
        fields: ['documentId', 'status', 'score', 'completedAt', 'lastAttemptAt', 'timeSpentSec'],
        populate: {
          lesson: { fields: ['documentId', 'title', 'level'] },
          course: { fields: ['documentId', 'title'] },
        },
        sort: ['lastAttemptAt:desc'],
        pagination: { pageSize: 50, page: 1 },
      }),
    ]);

    return {
      data: {
        child: kid,
        ...summary,
        upcomingSessions: allUpcoming,
        homeworkSubmissions: allPending,
        progress: allProgress,
      },
    };
  },
};
