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
import { scopedFind } from '../../../lib/scoped-find';

const PROFILE_UID = 'api::user-profile.user-profile';
const PROGRESS_UID = 'api::user-progress.user-progress';

// Server-trusted populate. Non-admin teachers lack `find` on user-profile, so
// sanitizeQuery strips populate[user]; lesson + course are public so those
// pass through, but pinning the spec keeps the response consistent.
const FIND_POPULATE: any = {
  user: { fields: ['documentId', 'firstName', 'lastName', 'displayName'] },
  lesson: {
    fields: ['documentId', 'slug', 'title', 'orderIndex', 'type'],
    populate: { course: { fields: ['documentId', 'slug', 'title', 'level', 'iconEmoji'] } },
  },
  course: { fields: ['documentId', 'slug', 'title', 'level', 'iconEmoji'] },
};

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

/**
 * Pull `filters[user]` out of `ctx.query.filters` and return it. Mutates the
 * input ctx so validateQuery (which doesn't know about the caller's scoped
 * permission on user-profile) can't reject it. The extracted clause is
 * re-attached at the document-service layer via scopedFind's scopeFilter arg.
 */
function extractUserFilter(ctx: any): unknown | null {
  const filters = (ctx.query as any)?.filters;
  if (!filters || typeof filters !== 'object') return null;
  const node = filters.user;
  if (node === undefined) return null;
  delete filters.user;
  return node;
}

export default factories.createCoreController(
  'api::user-progress.user-progress',
  ({ strapi }) => ({
    async find(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      if (isStaff(user)) {
        // Staff filter by `filters[user][documentId][$eq]=<profileId>` to read
        // a specific learner's progress. The relation is rejected by
        // validateQuery for non-admin teachers (no `find` on user-profile),
        // so we extract it here and re-attach as a server-side scope.
        const userFilter = extractUserFilter(ctx);
        const scopeFilter = userFilter ? { user: userFilter } : {};
        return scopedFind(ctx, this, PROGRESS_UID, scopeFilter, {
          populate: FIND_POPULATE,
        });
      }

      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');

      return scopedFind(
        ctx,
        this,
        PROGRESS_UID,
        { user: { documentId: { $eq: profileId } } },
        { populate: FIND_POPULATE },
      );
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
