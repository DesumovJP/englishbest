/**
 * Teacher controller.
 *
 * Read-only aggregation for the teacher dashboard. No content-type — this API
 * exposes route-only endpoints that stitch together existing records:
 *
 *   GET /api/teacher/me/students   — distinct students the caller teaches,
 *                                    with last/next session + homework stats.
 *
 * Student population model: students are `user-profile` rows with role in
 * ('kids', 'adult') who appear as `session.attendees` on the caller's
 * sessions. We do not require a separate `student` content-type.
 *
 * Role gate: caller must have role=teacher (admin uses analytics for the
 * platform-wide view — no admin shortcut here to keep scoping simple).
 */

const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const SESSION_UID = 'api::session.session';
const SUBMISSION_UID = 'api::homework-submission.homework-submission';
const PROFILE_UID = 'api::user-profile.user-profile';

function roleType(ctxUser: any): string {
  return (ctxUser?.role?.type ?? '').toLowerCase();
}

async function callerTeacherProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return tp?.documentId ?? null;
}

export default {
  async students(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'teacher') return ctx.forbidden('teacher role required');

    const teacherId = await callerTeacherProfileId(strapi, user.id);
    if (!teacherId) return ctx.notFound('teacher-profile not found');

    const nowIso = new Date().toISOString();

    const [sessions, submissions] = await Promise.all([
      strapi.documents(SESSION_UID).findMany({
        filters: { teacher: { documentId: { $eq: teacherId } } },
        fields: ['documentId', 'startAt', 'status'],
        populate: {
          attendees: {
            fields: ['documentId', 'displayName', 'firstName', 'lastName', 'level', 'role'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
        },
        sort: ['startAt:desc'],
        pagination: { pageSize: 500, page: 1 },
      }),
      strapi.documents(SUBMISSION_UID).findMany({
        filters: { homework: { teacher: { documentId: { $eq: teacherId } } } },
        fields: ['documentId', 'status', 'submittedAt', 'gradedAt', 'score'],
        populate: {
          student: { fields: ['documentId'] },
          homework: { fields: ['documentId', 'status'] },
        },
        pagination: { pageSize: 1000, page: 1 },
      }),
    ]);

    type StudentAgg = {
      documentId: string;
      firstName: string;
      lastName: string;
      displayName: string;
      level: string | null;
      avatarUrl: string | null;
      lastSessionAt: string | null;
      nextSessionAt: string | null;
      pendingHomework: number;
      totalHomework: number;
      completedHomework: number;
    };

    const map = new Map<string, StudentAgg>();

    for (const s of sessions as any[]) {
      for (const a of (s.attendees ?? []) as any[]) {
        if (!a?.documentId) continue;
        if (a.role !== 'kids' && a.role !== 'adult') continue;
        let row = map.get(a.documentId);
        if (!row) {
          const first = a.firstName ?? '';
          const last = a.lastName ?? '';
          row = {
            documentId: a.documentId,
            firstName: first,
            lastName: last,
            displayName: a.displayName || `${first} ${last}`.trim() || '—',
            level: a.level ?? null,
            avatarUrl: a.avatar?.url ?? null,
            lastSessionAt: null,
            nextSessionAt: null,
            pendingHomework: 0,
            totalHomework: 0,
            completedHomework: 0,
          };
          map.set(a.documentId, row);
        }
        const startAt = s.startAt;
        if (!startAt) continue;
        if (startAt < nowIso) {
          if (!row.lastSessionAt || startAt > row.lastSessionAt) row.lastSessionAt = startAt;
        } else {
          if (!row.nextSessionAt || startAt < row.nextSessionAt) row.nextSessionAt = startAt;
        }
      }
    }

    for (const sub of submissions as any[]) {
      const sid = sub?.student?.documentId;
      if (!sid) continue;
      const row = map.get(sid);
      if (!row) continue;
      row.totalHomework += 1;
      if (sub.status === 'reviewed') {
        row.completedHomework += 1;
      } else if (
        sub.status === 'submitted' ||
        sub.status === 'notStarted' ||
        sub.status === 'inProgress' ||
        sub.status === 'overdue'
      ) {
        row.pendingHomework += 1;
      }
    }

    const students = Array.from(map.values()).sort((a, b) => {
      // Sort: students with upcoming lessons first, then by last session desc.
      const aNext = a.nextSessionAt ?? '';
      const bNext = b.nextSessionAt ?? '';
      if (aNext && !bNext) return -1;
      if (!aNext && bNext) return 1;
      if (aNext && bNext) return aNext.localeCompare(bNext);
      return (b.lastSessionAt ?? '').localeCompare(a.lastSessionAt ?? '');
    });

    return { data: students };
  },
};
