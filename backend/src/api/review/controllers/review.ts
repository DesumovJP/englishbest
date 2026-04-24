/**
 * Review controller.
 *
 * Scoping:
 *   - find/findOne: public (anyone, including anon, can read reviews).
 *   - create: authenticated adult/parent/teacher/admin. `author` is forced to
 *     caller's user-profile (teachers/parents may post as learners on their
 *     own behalf). Admin may override via payload.
 *   - update: owner-only (caller's user-profile === review.author). Admin bypass.
 *     `author` is stripped from payload to prevent hijacking.
 *   - delete: admin-only (permission seed), but if ever granted to users we
 *     still enforce the owner check here defensively.
 */
import { factories } from '@strapi/strapi';

const UID = 'api::review.review';
const PROFILE_UID = 'api::user-profile.user-profile';

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

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role !== 'admin') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');
      ctx.request.body = ctx.request.body || {};
      (ctx.request.body as any).data = {
        ...((ctx.request.body as any).data ?? {}),
        author: profileId,
      };
    }
    return (super.create as any)(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role !== 'admin') {
      const existing = await strapi.documents(UID).findOne({
        documentId: ctx.params.id,
        populate: { author: true },
      });
      if (!existing) return ctx.notFound();
      const authorId = (existing as any)?.author?.documentId;
      const myProfileId = await callerProfileId(strapi, user.id);
      if (!authorId || authorId !== myProfileId) return ctx.forbidden();
      if ((ctx.request.body as any)?.data?.author) delete (ctx.request.body as any).data.author;
    }
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role !== 'admin') {
      const existing = await strapi.documents(UID).findOne({
        documentId: ctx.params.id,
        populate: { author: true },
      });
      if (!existing) return ctx.notFound();
      const authorId = (existing as any)?.author?.documentId;
      const myProfileId = await callerProfileId(strapi, user.id);
      if (!authorId || authorId !== myProfileId) return ctx.forbidden();
    }
    return (super.delete as any)(ctx);
  },
}));
