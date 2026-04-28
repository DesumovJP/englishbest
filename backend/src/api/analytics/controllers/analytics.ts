/**
 * Analytics controller.
 *
 * Read-only aggregation endpoints. No content-type, no CRUD — this API exists
 * solely to expose pre-computed dashboards that would be expensive (and
 * permission-fragile) to assemble on the client.
 *
 *   GET /api/analytics/teacher   — own dashboard (teacher role)
 *   GET /api/analytics/admin     — platform-wide dashboard (admin role)
 *
 * Scoping happens inside the controller. The seed grants AUTH_ALL on both
 * actions; each handler checks `ctx.state.user.role.type` and filters by
 * the caller's teacher-profile when relevant.
 */

const SESSION_UID = 'api::session.session';
const HOMEWORK_UID = 'api::homework.homework';
const SUBMISSION_UID = 'api::homework-submission.homework-submission';
const ATTENDANCE_UID = 'api::attendance-record.attendance-record';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const USER_PROFILE_UID = 'api::user-profile.user-profile';

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = (typeof LEVELS)[number];

const MONTHS_UA = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

function roleType(ctxUser: any): string {
  return (ctxUser?.role?.type ?? '').toLowerCase();
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d: Date): string {
  return MONTHS_UA[d.getUTCMonth()];
}

function startOfMonthUtc(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0));
}

function lastSixMonths(now: Date): Array<{ key: string; label: string; year: number; month: number; from: string; to: string }> {
  const out: Array<{ key: string; label: string; year: number; month: number; from: string; to: string }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    out.push({
      key: monthKey(d),
      label: monthLabel(d),
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      from: d.toISOString(),
      to: next.toISOString(),
    });
  }
  return out;
}

async function callerTeacherProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return tp?.documentId ?? null;
}

function toNumberOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

/**
 * Homework grading UI is on the Ukrainian 1–12 scale, but legacy seeds and
 * imports stored scores on a 0–100 scale. Normalize on read so the analytics
 * stays in 12-point units regardless of source.
 */
function normalizeScoreTo12(n: number | null): number | null {
  if (n === null) return null;
  if (n <= 12) return n;
  return Math.round((n / 100) * 12 * 100) / 100;
}

export default {
  async teacher(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'teacher') return ctx.forbidden('teacher role required');

    const teacherId = await callerTeacherProfileId(strapi, user.id);
    if (!teacherId) return ctx.notFound('teacher-profile not found');

    const now = new Date();
    const months = lastSixMonths(now);
    const windowFrom = months[0].from;
    const windowTo = months[months.length - 1].to;
    const currentMonth = months[months.length - 1];

    const [sessions, submissions, attendance] = await Promise.all([
      strapi.documents(SESSION_UID).findMany({
        filters: {
          teacher: { documentId: { $eq: teacherId } },
          startAt: { $gte: windowFrom, $lt: windowTo },
        },
        fields: ['documentId', 'startAt', 'status'],
        populate: {
          attendees: {
            fields: ['documentId', 'displayName', 'firstName', 'lastName', 'level'],
          },
        },
        pagination: { pageSize: 500, page: 1 },
      }),
      strapi.documents(SUBMISSION_UID).findMany({
        filters: {
          homework: { teacher: { documentId: { $eq: teacherId } } },
          $or: [
            { submittedAt: { $gte: windowFrom, $lt: windowTo } },
            { gradedAt: { $gte: windowFrom, $lt: windowTo } },
            { status: { $eq: 'submitted' } },
          ],
        },
        fields: ['documentId', 'status', 'submittedAt', 'gradedAt', 'score'],
        populate: {
          student: { fields: ['documentId', 'displayName', 'firstName', 'lastName', 'level'] },
        },
        pagination: { pageSize: 500, page: 1 },
      }),
      strapi.documents(ATTENDANCE_UID).findMany({
        filters: {
          session: {
            teacher: { documentId: { $eq: teacherId } },
            startAt: { $gte: windowFrom, $lt: windowTo },
          },
        },
        fields: ['documentId', 'status'],
        populate: {
          session: { fields: ['documentId', 'startAt'] },
        },
        pagination: { pageSize: 500, page: 1 },
      }),
    ]);

    // Time series buckets per month.
    type Bucket = { lessons: number; homeworkGraded: number; gradeSum: number; gradeCount: number };
    const buckets = new Map<string, Bucket>();
    for (const m of months) buckets.set(m.key, { lessons: 0, homeworkGraded: 0, gradeSum: 0, gradeCount: 0 });

    for (const s of sessions as any[]) {
      if (s.status !== 'completed') continue;
      const d = new Date(s.startAt);
      const k = monthKey(d);
      const b = buckets.get(k);
      if (b) b.lessons += 1;
    }

    for (const sub of submissions as any[]) {
      const graded = sub.status === 'reviewed' || sub.status === 'returned';
      const whenIso = sub.gradedAt ?? sub.submittedAt;
      if (!graded || !whenIso) continue;
      const d = new Date(whenIso);
      const k = monthKey(d);
      const b = buckets.get(k);
      if (!b) continue;
      b.homeworkGraded += 1;
      const score = normalizeScoreTo12(toNumberOrNull(sub.score));
      if (score !== null) {
        b.gradeSum += score;
        b.gradeCount += 1;
      }
    }

    const timeSeries = months.map(m => {
      const b = buckets.get(m.key)!;
      return {
        key: m.key,
        label: m.label,
        lessons: b.lessons,
        homeworkGraded: b.homeworkGraded,
        avgGrade: b.gradeCount > 0 ? Number((b.gradeSum / b.gradeCount).toFixed(2)) : null,
      };
    });

    // Current-month KPIs.
    const thisBucket = buckets.get(currentMonth.key)!;
    const lessonsThisMonth = thisBucket.lessons;
    const pendingHomework = (submissions as any[]).filter(s => s.status === 'submitted').length;

    const attendanceThisMonth = (attendance as any[]).filter(r => {
      const iso = r?.session?.startAt;
      if (!iso) return false;
      return monthKey(new Date(iso)) === currentMonth.key;
    });
    const attCount = attendanceThisMonth.length;
    const attWeighted = attendanceThisMonth.reduce((acc, r) => {
      if (r.status === 'present') return acc + 1;
      if (r.status === 'late') return acc + 0.5;
      if (r.status === 'excused') return acc + 0.5;
      return acc;
    }, 0);
    const attendancePct = attCount > 0 ? Math.round((attWeighted / attCount) * 100) : null;

    const allGraded = (submissions as any[])
      .map(s => normalizeScoreTo12(toNumberOrNull(s.score)))
      .filter((n): n is number => n !== null);
    const avgGrade = allGraded.length > 0
      ? Number((allGraded.reduce((a, b) => a + b, 0) / allGraded.length).toFixed(2))
      : null;

    // Level buckets — distinct attendees across the window.
    type StudentRow = { documentId: string; name: string; level: Level | null; avatar?: string | null };
    const studentsMap = new Map<string, StudentRow>();
    for (const s of sessions as any[]) {
      for (const a of (s.attendees ?? []) as any[]) {
        if (!a?.documentId) continue;
        if (!studentsMap.has(a.documentId)) {
          const name = a.displayName || `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() || '—';
          studentsMap.set(a.documentId, {
            documentId: a.documentId,
            name,
            level: (LEVELS as readonly string[]).includes(a.level) ? (a.level as Level) : null,
          });
        }
      }
    }

    const levelBuckets: Array<{ level: Level; count: number }> = LEVELS.map(lvl => ({
      level: lvl,
      count: Array.from(studentsMap.values()).filter(s => s.level === lvl).length,
    })).filter(b => b.count > 0);

    // Honor roll — top 3 students by homework completion rate within window.
    type StudentStat = { documentId: string; name: string; level: Level | null; completed: number; total: number };
    const studentStats = new Map<string, StudentStat>();
    for (const sub of submissions as any[]) {
      const st = sub.student;
      if (!st?.documentId) continue;
      let row = studentStats.get(st.documentId);
      if (!row) {
        const name = st.displayName || `${st.firstName ?? ''} ${st.lastName ?? ''}`.trim() || '—';
        row = {
          documentId: st.documentId,
          name,
          level: (LEVELS as readonly string[]).includes(st.level) ? (st.level as Level) : null,
          completed: 0,
          total: 0,
        };
        studentStats.set(st.documentId, row);
      }
      row.total += 1;
      if (sub.status === 'reviewed' || sub.status === 'returned' || sub.status === 'submitted') {
        row.completed += 1;
      }
    }
    const honorRoll = Array.from(studentStats.values())
      .filter(s => s.total >= 3)
      .map(s => ({ ...s, rate: s.total > 0 ? s.completed / s.total : 0 }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);

    return {
      data: {
        kpis: {
          lessonsThisMonth,
          pendingHomework,
          attendancePct,
          avgGrade,
        },
        timeSeries,
        levelBuckets,
        honorRoll,
      },
    };
  },

  async admin(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden('admin role required');

    const now = new Date();
    const months = lastSixMonths(now);
    const windowFrom = months[0].from;
    const windowTo = months[months.length - 1].to;
    const currentMonth = months[months.length - 1];

    const [sessions, payouts, students, teachers] = await Promise.all([
      strapi.documents(SESSION_UID).findMany({
        filters: { startAt: { $gte: windowFrom, $lt: windowTo } },
        fields: ['documentId', 'startAt', 'status'],
        populate: {
          teacher: { fields: ['documentId', 'hourlyRate', 'rating'], populate: { user: { fields: ['documentId', 'displayName', 'firstName', 'lastName'] } } },
          attendees: { fields: ['documentId'] },
        },
        pagination: { pageSize: 500, page: 1 },
      }),
      strapi.documents('api::teacher-payout.teacher-payout').findMany({
        filters: {
          periodYear: { $gte: months[0].year },
        },
        fields: ['documentId', 'periodYear', 'periodMonth', 'total', 'currency', 'status'],
        populate: {
          teacher: { fields: ['documentId'], populate: { user: { fields: ['documentId', 'displayName', 'firstName', 'lastName'] } } },
        },
        pagination: { pageSize: 500, page: 1 },
      }),
      strapi.documents(USER_PROFILE_UID).findMany({
        filters: { role: { $in: ['kids', 'adult'] } },
        fields: ['documentId', 'level'],
        pagination: { pageSize: 1000, page: 1 },
      }),
      strapi.documents(TEACHER_UID).findMany({
        fields: ['documentId', 'rating', 'ratingCount'],
        populate: { user: { fields: ['documentId', 'displayName', 'firstName', 'lastName'] } },
        pagination: { pageSize: 200, page: 1 },
      }),
    ]);

    // Monthly revenue + lessons + active-students.
    type MonthAgg = { revenue: number; lessons: number; studentSet: Set<string> };
    const monthAgg = new Map<string, MonthAgg>();
    for (const m of months) monthAgg.set(m.key, { revenue: 0, lessons: 0, studentSet: new Set() });

    for (const s of sessions as any[]) {
      if (s.status !== 'completed') continue;
      const d = new Date(s.startAt);
      const k = monthKey(d);
      const b = monthAgg.get(k);
      if (!b) continue;
      b.lessons += 1;
      for (const a of (s.attendees ?? []) as any[]) {
        if (a?.documentId) b.studentSet.add(a.documentId);
      }
    }
    for (const p of payouts as any[]) {
      const k = `${p.periodYear}-${String(p.periodMonth).padStart(2, '0')}`;
      const b = monthAgg.get(k);
      if (!b) continue;
      const total = toNumberOrNull(p.total) ?? 0;
      b.revenue += total;
    }

    const timeSeries = months.map(m => {
      const b = monthAgg.get(m.key)!;
      return {
        key: m.key,
        label: m.label,
        revenue: Math.round(b.revenue),
        lessons: b.lessons,
        students: b.studentSet.size,
      };
    });

    const thisBucket = monthAgg.get(currentMonth.key)!;

    // Top teachers by revenue this month, aggregated from payouts.
    type TeacherAgg = { documentId: string; name: string; rating: number | null; ratingCount: number; revenue: number; lessons: number; students: Set<string> };
    const teacherAgg = new Map<string, TeacherAgg>();
    const teacherMeta = new Map<string, { name: string; rating: number | null; ratingCount: number }>();
    for (const t of teachers as any[]) {
      const u = t.user;
      const name = u?.displayName || `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() || '—';
      teacherMeta.set(t.documentId, {
        name,
        rating: toNumberOrNull(t.rating),
        ratingCount: toNumberOrNull(t.ratingCount) ?? 0,
      });
    }
    for (const p of payouts as any[]) {
      const tid = p?.teacher?.documentId;
      if (!tid) continue;
      if (p.periodYear !== currentMonth.year || p.periodMonth !== currentMonth.month) continue;
      const meta = teacherMeta.get(tid);
      let row = teacherAgg.get(tid);
      if (!row) {
        row = {
          documentId: tid,
          name: meta?.name ?? '—',
          rating: meta?.rating ?? null,
          ratingCount: meta?.ratingCount ?? 0,
          revenue: 0,
          lessons: 0,
          students: new Set(),
        };
        teacherAgg.set(tid, row);
      }
      row.revenue += toNumberOrNull(p.total) ?? 0;
    }
    for (const s of sessions as any[]) {
      const tid = s?.teacher?.documentId;
      if (!tid || s.status !== 'completed') continue;
      if (monthKey(new Date(s.startAt)) !== currentMonth.key) continue;
      let row = teacherAgg.get(tid);
      if (!row) {
        const meta = teacherMeta.get(tid);
        if (!meta) continue;
        row = {
          documentId: tid,
          name: meta.name,
          rating: meta.rating,
          ratingCount: meta.ratingCount,
          revenue: 0,
          lessons: 0,
          students: new Set(),
        };
        teacherAgg.set(tid, row);
      }
      row.lessons += 1;
      for (const a of (s.attendees ?? []) as any[]) {
        if (a?.documentId) row.students.add(a.documentId);
      }
    }
    const topTeachers = Array.from(teacherAgg.values())
      .map(t => ({
        documentId: t.documentId,
        name: t.name,
        rating: t.rating,
        students: t.students.size,
        revenue: Math.round(t.revenue),
        lessons: t.lessons,
      }))
      .sort((a, b) => b.lessons - a.lessons || b.revenue - a.revenue)
      .slice(0, 5);

    // Level distribution across all learners.
    const levelBuckets: Array<{ level: Level; count: number; pct: number }> = [];
    const totalLearners = (students as any[]).length;
    for (const lvl of LEVELS) {
      const count = (students as any[]).filter(s => s.level === lvl).length;
      if (count === 0) continue;
      levelBuckets.push({
        level: lvl,
        count,
        pct: totalLearners > 0 ? Math.round((count / totalLearners) * 100) : 0,
      });
    }

    // Platform-wide rating avg.
    const ratingVals = (teachers as any[])
      .map(t => toNumberOrNull(t.rating))
      .filter((n): n is number => n !== null && n > 0);
    const avgRating = ratingVals.length > 0
      ? Number((ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length).toFixed(2))
      : null;
    const reviewsTotal = (teachers as any[]).reduce((acc, t) => acc + (toNumberOrNull(t.ratingCount) ?? 0), 0);

    return {
      data: {
        kpis: {
          revenueThisMonth: Math.round(thisBucket.revenue),
          activeStudents: thisBucket.studentSet.size,
          lessonsThisMonth: thisBucket.lessons,
          avgRating,
          reviewsTotal,
          learnersTotal: totalLearners,
          teachersTotal: (teachers as any[]).length,
        },
        timeSeries,
        topTeachers,
        levelBuckets,
      },
    };
  },
};
