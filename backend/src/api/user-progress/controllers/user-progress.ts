/**
 * User-progress controller.
 *
 * Scopes every operation to the caller's user-profile so learners cannot read
 * or mutate other users' progress. Staff roles (teacher/admin) are exempt —
 * their filters come from query params (e.g. `filters[user][id][$eq]=…`).
 *
 * On create/update, we force the `user` relation to the caller's user-profile
 * (ignoring any value the client sent). This is the single enforcement point —
 * the route-level `find-me` style scoping falls out of this.
 */
import { factories } from '@strapi/strapi';

const PROFILE_UID = 'api::user-profile.user-profile';

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

function isStaff(ctxUser: any): boolean {
  const role = (ctxUser?.role?.type ?? '').toLowerCase();
  return role === 'teacher' || role === 'admin';
}

export default factories.createCoreController(
  'api::user-progress.user-progress',
  ({ strapi }) => ({
    async find(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      if (!isStaff(user)) {
        const profileId = await callerProfileId(strapi, user.id);
        if (!profileId) return ctx.forbidden('no user-profile');
        ctx.query = ctx.query || {};
        (ctx.query as any).filters = {
          ...((ctx.query as any).filters ?? {}),
          user: { documentId: { $eq: profileId } },
        };
      }

      return (super.find as any)(ctx);
    },

    async findOne(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const result = await (super.findOne as any)(ctx);

      if (!isStaff(user)) {
        const entity = await strapi
          .documents('api::user-progress.user-progress')
          .findOne({ documentId: ctx.params.id, populate: { user: true } });
        const ownerProfileId = (entity as any)?.user?.documentId;
        const myProfileId = await callerProfileId(strapi, user.id);
        if (!ownerProfileId || ownerProfileId !== myProfileId) {
          return ctx.forbidden();
        }
      }
      return result;
    },

    async create(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');

      ctx.request.body = ctx.request.body || {};
      (ctx.request.body as any).data = {
        ...((ctx.request.body as any).data ?? {}),
        user: profileId,
      };
      return (super.create as any)(ctx);
    },

    async update(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      if (!isStaff(user)) {
        const existing = await strapi
          .documents('api::user-progress.user-progress')
          .findOne({ documentId: ctx.params.id, populate: { user: true } });
        const ownerProfileId = (existing as any)?.user?.documentId;
        const myProfileId = await callerProfileId(strapi, user.id);
        if (!ownerProfileId || ownerProfileId !== myProfileId) {
          return ctx.forbidden();
        }
        // Prevent re-assigning ownership via payload.
        if ((ctx.request.body as any)?.data?.user) {
          delete (ctx.request.body as any).data.user;
        }
      }
      return (super.update as any)(ctx);
    },
  })
);
