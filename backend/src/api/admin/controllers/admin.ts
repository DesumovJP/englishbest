/**
 * Admin controller — read-only platform-wide aggregations.
 *
 *   GET /api/admin/students  — all user-profiles with role in (kids, adult),
 *                              enriched with last/next session + homework stats
 *                              and the list of teachers they interact with.
 *
 * Role gate: admin only. Mirrors the teacher aggregator (api::teacher.teacher
 * .students) but without the "only own sessions" filter.
 */

const SESSION_UID = 'api::session.session';
const SUBMISSION_UID = 'api::homework-submission.homework-submission';
const PROFILE_UID = 'api::user-profile.user-profile';

function roleType(ctxUser: any): string {
  return (ctxUser?.role?.type ?? '').toLowerCase();
}

export default {
  async students(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden('admin role required');

    const nowIso = new Date().toISOString();

    const [profiles, sessions, submissions] = await Promise.all([
      strapi.documents(PROFILE_UID).findMany({
        filters: { role: { $in: ['kids', 'adult'] } },
        fields: ['documentId', 'displayName', 'firstName', 'lastName', 'level', 'role', 'createdAt'],
        populate: { avatar: { fields: ['url'] } },
        pagination: { pageSize: 1000, page: 1 },
        sort: ['displayName:asc'],
      }),
      strapi.documents(SESSION_UID).findMany({
        fields: ['documentId', 'startAt', 'status'],
        populate: {
          attendees: { fields: ['documentId', 'role'] },
          teacher: {
            fields: ['documentId'],
            populate: { user: { fields: ['documentId', 'displayName'] } },
          },
        },
        sort: ['startAt:desc'],
        pagination: { pageSize: 2000, page: 1 },
      }),
      strapi.documents(SUBMISSION_UID).findMany({
        fields: ['documentId', 'status'],
        populate: { student: { fields: ['documentId'] } },
        pagination: { pageSize: 2000, page: 1 },
      }),
    ]);

    type StudentAgg = {
      documentId: string;
      firstName: string;
      lastName: string;
      displayName: string;
      role: 'kids' | 'adult';
      level: string | null;
      avatarUrl: string | null;
      createdAt: string | null;
      lastSessionAt: string | null;
      nextSessionAt: string | null;
      pendingHomework: number;
      totalHomework: number;
      completedHomework: number;
      teacherNames: string[];
    };

    const map = new Map<string, StudentAgg>();
    const teacherSet = new Map<string, Set<string>>();

    for (const p of profiles as any[]) {
      if (!p?.documentId) continue;
      const first = p.firstName ?? '';
      const last = p.lastName ?? '';
      map.set(p.documentId, {
        documentId: p.documentId,
        firstName: first,
        lastName: last,
        displayName: p.displayName || `${first} ${last}`.trim() || '—',
        role: (p.role === 'adult' ? 'adult' : 'kids'),
        level: p.level ?? null,
        avatarUrl: p.avatar?.url ?? null,
        createdAt: p.createdAt ?? null,
        lastSessionAt: null,
        nextSessionAt: null,
        pendingHomework: 0,
        totalHomework: 0,
        completedHomework: 0,
        teacherNames: [],
      });
      teacherSet.set(p.documentId, new Set<string>());
    }

    for (const s of sessions as any[]) {
      const teacherName = s.teacher?.user?.displayName;
      for (const a of (s.attendees ?? []) as any[]) {
        if (!a?.documentId) continue;
        const row = map.get(a.documentId);
        if (!row) continue;
        const startAt = s.startAt;
        if (startAt) {
          if (startAt < nowIso) {
            if (!row.lastSessionAt || startAt > row.lastSessionAt) row.lastSessionAt = startAt;
          } else {
            if (!row.nextSessionAt || startAt < row.nextSessionAt) row.nextSessionAt = startAt;
          }
        }
        if (teacherName) {
          teacherSet.get(a.documentId)?.add(teacherName);
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

    for (const [id, names] of teacherSet) {
      const row = map.get(id);
      if (row) row.teacherNames = Array.from(names).sort();
    }

    const students = Array.from(map.values()).sort((a, b) => {
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
