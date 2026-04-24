/**
 * Lesson controller.
 *
 * Scoping:
 *   - admin    — full bypass.
 *   - teacher  — sees own (owner=mine) + platform/template (source in {platform, template}).
 *                `owner` is forced on create; `owner` + `source` are immutable on update.
 *                Cannot edit/delete `source=platform` lessons (must clone via `cloneAsCopy`).
 *   - student  — sees platform/template lessons + own-course lessons where isFree
 *                is already exposed via the course listing. At this stage we allow
 *                read-only access to any source in {platform, template} and any
 *                lesson under a course whose `isFree` is true. (Course-scoped reads
 *                happen via course API; here we only widen to public pool.)
 *   - parent   — same visibility as student (read-only public pool).
 *
 * Create/update/delete are restricted to teacher + admin.
 */
import { factories } from '@strapi/strapi';
import { scopedFind } from '../../../lib/scoped-find';

const LESSON_UID = 'api::lesson.lesson';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const PUBLIC_SOURCES = ['platform', 'template'] as const;

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

export default factories.createCoreController(LESSON_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    // Non-admin callers lack permission on the `owner` relation filter —
    // scopedFind merges the scope at the document-service layer.
    let scopeFilter: Record<string, unknown>;
    if (user && role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      scopeFilter = {
        $or: [
          { owner: { documentId: { $eq: teacherId } } },
          { source: { $in: PUBLIC_SOURCES as unknown as string[] } },
        ],
      };
    } else {
      scopeFilter = { source: { $in: PUBLIC_SOURCES as unknown as string[] } };
    }
    return scopedFind(ctx, this, LESSON_UID, scopeFilter);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const role = roleType(user);

    const entity = await strapi.documents(LESSON_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    const source = (entity as any).source;
    const ownerId = (entity as any).owner?.documentId ?? null;

    if (user && role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const mine = teacherId && ownerId === teacherId;
      const isPublic = PUBLIC_SOURCES.includes(source);
      if (!mine && !isPublic) return ctx.forbidden();
    } else {
      if (!PUBLIC_SOURCES.includes(source)) return ctx.forbidden();
    }
    return (super.findOne as any)(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    ctx.request.body = ctx.request.body || {};
    const data = ((ctx.request.body as any).data ?? {}) as Record<string, unknown>;

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');

      const requestedSource = typeof data.source === 'string' ? data.source : 'own';
      const source = requestedSource === 'copy' ? 'copy' : 'own';

      (ctx.request.body as any).data = {
        ...data,
        owner: teacherId,
        source,
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
      const existing = await strapi.documents(LESSON_UID).findOne({
        documentId: ctx.params.id,
        populate: { owner: true },
      });
      if (!existing) return ctx.notFound();
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (existing as any).owner?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
      if ((existing as any).source === 'platform') {
        return ctx.forbidden('platform lessons are read-only — clone first');
      }

      const data = (ctx.request.body as any)?.data ?? {};
      delete data.owner;
      delete data.source;
      delete data.originalLesson;
      (ctx.request.body as any).data = data;
    }
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const existing = await strapi.documents(LESSON_UID).findOne({
        documentId: ctx.params.id,
        populate: { owner: true },
      });
      if (!existing) return ctx.notFound();
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (existing as any).owner?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
      if ((existing as any).source === 'platform') {
        return ctx.forbidden('cannot delete platform lesson');
      }
    }
    return (super.delete as any)(ctx);
  },

  async publish(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    const existing = await strapi.documents(LESSON_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (existing as any).owner?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
      if ((existing as any).source === 'platform') {
        return ctx.forbidden('platform lessons are managed by admin');
      }
    }

    await strapi.documents(LESSON_UID).publish({ documentId: ctx.params.id });
    const fresh = await strapi.documents(LESSON_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    return { data: fresh };
  },

  async unpublish(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    const existing = await strapi.documents(LESSON_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (existing as any).owner?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
      if ((existing as any).source === 'platform') {
        return ctx.forbidden('platform lessons are managed by admin');
      }
    }

    await strapi.documents(LESSON_UID).unpublish({ documentId: ctx.params.id });
    const fresh = await strapi.documents(LESSON_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
      status: 'draft',
    });
    return { data: fresh };
  },
}));
