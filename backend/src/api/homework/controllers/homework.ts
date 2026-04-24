/**
 * Homework controller.
 *
 * Scoping:
 *   - admin      — full bypass.
 *   - teacher    — sees / mutates own homework (teacher = caller's
 *                  teacher-profile); `teacher` is forced on create; cannot
 *                  be reassigned on update.
 *   - student    — sees homework where caller's user-profile is in assignees.
 *   - parent     — sees homework assigned to linked children.
 *
 * Publishing (status=published) fires the homework lifecycle, which
 * auto-creates per-assignee `homework-submission` rows.
 */
import { factories } from '@strapi/strapi';

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

export default factories.createCoreController(HOMEWORK_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    ctx.query = ctx.query || {};
    const existing = ((ctx.query as any).filters ?? {}) as Record<string, unknown>;

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      (ctx.query as any).filters = {
        ...existing,
        teacher: { documentId: { $eq: teacherId } },
      };
    } else if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      if (kidIds.length === 0) {
        ctx.body = { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } };
        return;
      }
      (ctx.query as any).filters = {
        ...existing,
        assignees: { documentId: { $in: kidIds } },
      };
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      (ctx.query as any).filters = {
        ...existing,
        assignees: { documentId: { $eq: profileId } },
      };
    }
    return (super.find as any)(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(HOMEWORK_UID).findOne({
      documentId: ctx.params.id,
      populate: { teacher: true, assignees: true },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || (entity as any).teacher?.documentId !== teacherId) return ctx.forbidden();
    } else if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      const assigneeIds: string[] = ((entity as any).assignees ?? []).map((a: any) => a?.documentId).filter(Boolean);
      if (!assigneeIds.some((id) => kidIds.includes(id))) return ctx.forbidden();
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      const assigneeIds: string[] = ((entity as any).assignees ?? []).map((a: any) => a?.documentId).filter(Boolean);
      if (!profileId || !assigneeIds.includes(profileId)) return ctx.forbidden();
    }
    return (super.findOne as any)(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      ctx.request.body = ctx.request.body || {};
      (ctx.request.body as any).data = {
        ...((ctx.request.body as any).data ?? {}),
        teacher: teacherId,
      };
    }
    return (super.create as any)(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const existing = await strapi.documents(HOMEWORK_UID).findOne({
        documentId: ctx.params.id,
        populate: { teacher: true },
      });
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || (existing as any)?.teacher?.documentId !== teacherId) return ctx.forbidden();
      if ((ctx.request.body as any)?.data?.teacher) delete (ctx.request.body as any).data.teacher;
    }
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const existing = await strapi.documents(HOMEWORK_UID).findOne({
        documentId: ctx.params.id,
        populate: { teacher: true },
      });
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || (existing as any)?.teacher?.documentId !== teacherId) return ctx.forbidden();
    }
    return (super.delete as any)(ctx);
  },
}));
