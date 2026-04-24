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

const SUB_UID = 'api::homework-submission.homework-submission';
const HOMEWORK_UID = 'api::homework.homework';
const PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';

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

    ctx.query = ctx.query || {};
    const existing = ((ctx.query as any).filters ?? {}) as Record<string, unknown>;

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      (ctx.query as any).filters = {
        ...existing,
        homework: { teacher: { documentId: { $eq: teacherId } } },
      };
    } else if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');
      const kidIds = await childProfileIds(strapi, profileId);
      if (kidIds.length === 0) {
        ctx.body = { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } };
        return;
      }
      (ctx.query as any).filters = {
        ...existing,
        student: { documentId: { $in: kidIds } },
      };
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');
      (ctx.query as any).filters = {
        ...existing,
        student: { documentId: { $eq: profileId } },
      };
    }

    return (super.find as any)(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(SUB_UID).findOne({
      documentId: ctx.params.id,
      populate: { student: true, homework: { populate: { teacher: true } } },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    const studentProfileId = (entity as any).student?.documentId;
    const homeworkTeacherId = (entity as any).homework?.teacher?.documentId;

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

    return (super.findOne as any)(ctx);
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
      return (super.update as any)(ctx);
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
