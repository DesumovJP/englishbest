/**
 * Homework-submission controller.
 *
 * Scoping:
 *   - student (kids/adult) — finds own submissions only; may `update` pre-submit
 *     (set answers / status=inProgress|submitted / attachments); cannot set
 *     `score`, `teacherFeedback`, `gradedAt`, `status=reviewed|returned`.
 *   - teacher — sees submissions on own homework (homework.teacher = caller's
 *     teacher-profile); may grade (score/feedback/status=reviewed|returned).
 *   - parent — read-only; sees submissions of linked children (kids-profile
 *     with parentalConsentBy = caller's profile).
 *   - admin — bypass.
 *
 * Create is blocked for everyone except admin — rows are inserted by the
 * homework lifecycle on publish.
 */
import { factories } from '@strapi/strapi';
import { scopedFind, sanitizeOutputTrusted } from '../../../lib/scoped-find';
import { awardOnAction } from '../../../lib/rewards';

const SUB_UID = 'api::homework-submission.homework-submission';
const HOMEWORK_UID = 'api::homework.homework';
const PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';

// Server-trusted populate for find/findOne. Non-admin teachers lack `find` on
// api::user-profile.user-profile, so sanitizeQuery strips populate[student] →
// the dashboard ends up rendering placeholder names. Re-injecting at the
// document-service layer restores the names + avatar.
const FIND_POPULATE: any = {
  student: {
    fields: ['documentId', 'firstName', 'lastName', 'displayName', 'level'],
    populate: { avatar: { fields: ['url'] } },
  },
  homework: {
    fields: ['documentId', 'title', 'description', 'dueAt', 'status'],
    populate: {
      teacher: { fields: ['documentId'] },
      lesson: { fields: ['documentId', 'slug', 'title'] },
    },
  },
  attachments: { fields: ['url', 'name', 'mime'] },
};

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
  return kids.map((k: any) => k.documentId).filter((x: unknown): x is string => typeof x === 'string');
}

const TEACHER_GRADE_FIELDS = ['score', 'teacherFeedback', 'gradedAt'];
const TEACHER_ALLOWED_STATUSES = new Set(['reviewed', 'returned']);
const STUDENT_ALLOWED_STATUSES = new Set(['inProgress', 'submitted']);
const STUDENT_ALLOWED_FIELDS = new Set(['answers', 'attachments', 'status', 'submittedAt']);

export default factories.createCoreController(SUB_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') {
      return (super.find as any)(ctx);
    }

    // Non-admin callers don't hold read permission on the `student`/`homework`
    // relations, so merging these into ctx.query.filters before validateQuery
    // would trigger 400 "Invalid key student/homework". scopedFind validates
    // the client's own query first, then merges the scope filter at the
    // document-service layer.
    let scopeFilter: Record<string, unknown>;
    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      scopeFilter = { homework: { teacher: { documentId: { $eq: teacherId } } } };
    } else if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');
      const kidIds = await childProfileIds(strapi, profileId);
      if (kidIds.length === 0) {
        ctx.body = { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } };
        return;
      }
      scopeFilter = { student: { documentId: { $in: kidIds } } };
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');
      scopeFilter = { student: { documentId: { $eq: profileId } } };
    }

    return scopedFind(ctx, this, SUB_UID, scopeFilter, { populate: FIND_POPULATE });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(SUB_UID).findOne({
      documentId: ctx.params.id,
      populate: FIND_POPULATE,
    });
    if (!entity) return ctx.notFound();

    const studentProfileId = (entity as any).student?.documentId;
    const homeworkTeacherId = (entity as any).homework?.teacher?.documentId;

    if (role !== 'admin') {
      if (role === 'teacher') {
        const teacherId = await callerTeacherProfileId(strapi, user.id);
        if (!teacherId || homeworkTeacherId !== teacherId) return ctx.forbidden();
      } else if (role === 'parent') {
        const profileId = await callerProfileId(strapi, user.id);
        if (!profileId) return ctx.forbidden();
        const kidIds = await childProfileIds(strapi, profileId);
        if (!studentProfileId || !kidIds.includes(studentProfileId)) return ctx.forbidden();
      } else {
        const profileId = await callerProfileId(strapi, user.id);
        if (!profileId || studentProfileId !== profileId) return ctx.forbidden();
      }
    }

    const sanitized = await sanitizeOutputTrusted(SUB_UID, entity);
    return this.transformResponse(sanitized);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden('submissions created by system');
    return (super.create as any)(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    const data = ((ctx.request.body as any)?.data ?? {}) as Record<string, unknown>;

    const entity = await strapi.documents(SUB_UID).findOne({
      documentId: ctx.params.id,
      populate: { student: true, homework: { populate: { teacher: true } } },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') {
      return (super.update as any)(ctx);
    }

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const homeworkTeacherId = (entity as any).homework?.teacher?.documentId;
      if (!teacherId || homeworkTeacherId !== teacherId) return ctx.forbidden();
      // Strip fields the teacher shouldn't touch.
      for (const k of Object.keys(data)) {
        if (!['score', 'teacherFeedback', 'gradedAt', 'status'].includes(k)) delete data[k];
      }
      if (data.status !== undefined && !TEACHER_ALLOWED_STATUSES.has(String(data.status))) {
        return ctx.badRequest(`teacher status must be one of ${Array.from(TEACHER_ALLOWED_STATUSES).join(',')}`);
      }
      if (TEACHER_GRADE_FIELDS.some((f) => f in data) && !data.gradedAt) {
        data.gradedAt = new Date().toISOString();
      }
      (ctx.request.body as any).data = data;
      const result = await (super.update as any)(ctx);

      // Fire the homework reward on the FIRST grading. SourceKey is the
      // submission docId (no gradedAt) so re-grades don't re-credit. If a
      // teacher needs to correct a wrong grade after the fact, use a manual
      // `grant` action — see REWARDS.md. Reward failures must not roll
      // back the grade — the academic record is the source of truth, the
      // gamification is decoration.
      if (typeof data.score === 'number' && Number.isFinite(data.score)) {
        const studentProfileId = (entity as any).student?.documentId;
        if (studentProfileId) {
          try {
            await awardOnAction(strapi, {
              userProfileId: studentProfileId,
              action: 'homework',
              sourceKey: `homework:${ctx.params.id}`,
              meta: { score: data.score },
              setMood: 'proud',
            });
          } catch (err) {
            strapi.log.error(
              `[homework-submission] reward pipeline failed (submission=${ctx.params.id}): ${(err as Error).message}`,
            );
          }
        }
      }
      return result;
    }

    if (role === 'parent') {
      return ctx.forbidden('parent is read-only');
    }

    // student (kids/adult)
    const profileId = await callerProfileId(strapi, user.id);
    const studentProfileId = (entity as any).student?.documentId;
    if (!profileId || studentProfileId !== profileId) return ctx.forbidden();

    const existingStatus = (entity as any).status;
    if (existingStatus === 'reviewed' || existingStatus === 'returned' || existingStatus === 'submitted') {
      // Post-submission: student cannot modify (teacher may return for rework
      // by setting status=returned; then student submits anew — handled via
      // a separate returned→inProgress transition; MVP forbids).
      if (existingStatus !== 'returned') return ctx.forbidden('already submitted');
    }

    for (const k of Object.keys(data)) {
      if (!STUDENT_ALLOWED_FIELDS.has(k)) delete data[k];
    }
    if (data.status !== undefined && !STUDENT_ALLOWED_STATUSES.has(String(data.status))) {
      return ctx.badRequest(`student status must be one of ${Array.from(STUDENT_ALLOWED_STATUSES).join(',')}`);
    }
    if (data.status === 'submitted' && !data.submittedAt) {
      data.submittedAt = new Date().toISOString();
    }
    (ctx.request.body as any).data = data;
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();
    return (super.delete as any)(ctx);
  },
}));
