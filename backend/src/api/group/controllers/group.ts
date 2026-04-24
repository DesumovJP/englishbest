/**
 * Group controller.
 *
 * Scoping rules:
 *   - teacher  → sees / mutates only groups where `teacher` = caller's
 *     teacher-profile.
 *   - admin    → sees everything.
 *   - student (kids/adult) → sees groups they're a member of (read-only).
 *   - parent   → sees groups their children are members of (read-only).
 *
 * On create/update, `teacher` is forced to the caller's teacher-profile
 * (teachers cannot assign groups to peers; admin bypass applies).
 */
import { factories } from '@strapi/strapi';

const GROUP_UID = 'api::group.group';
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

export default factories.createCoreController(GROUP_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') {
      return (super.find as any)(ctx);
    }

    ctx.query = ctx.query || {};
    const existingFilters = ((ctx.query as any).filters ?? {}) as Record<string, unknown>;

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      (ctx.query as any).filters = {
        ...existingFilters,
        teacher: { documentId: { $eq: teacherId } },
      };
    } else {
      // student / parent — only groups where they are a member.
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');
      (ctx.query as any).filters = {
        ...existingFilters,
        members: { documentId: { $eq: profileId } },
      };
    }

    return (super.find as any)(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(GROUP_UID).findOne({
      documentId: ctx.params.id,
      populate: { teacher: true, members: true },
    });

    if (!entity) return ctx.notFound();

    if (role === 'admin') {
      return (super.findOne as any)(ctx);
    }

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || (entity as any).teacher?.documentId !== teacherId) {
        return ctx.forbidden();
      }
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      const isMember = ((entity as any).members ?? []).some(
        (m: any) => m?.documentId === profileId,
      );
      if (!profileId || !isMember) return ctx.forbidden();
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
      const existing = await strapi.documents(GROUP_UID).findOne({
        documentId: ctx.params.id,
        populate: { teacher: true },
      });
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || (existing as any)?.teacher?.documentId !== teacherId) {
        return ctx.forbidden();
      }
      if ((ctx.request.body as any)?.data?.teacher) {
        delete (ctx.request.body as any).data.teacher;
      }
    }
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const existing = await strapi.documents(GROUP_UID).findOne({
        documentId: ctx.params.id,
        populate: { teacher: true },
      });
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || (existing as any)?.teacher?.documentId !== teacherId) {
        return ctx.forbidden();
      }
    }
    return (super.delete as any)(ctx);
  },
}));
