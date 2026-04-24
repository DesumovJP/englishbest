/**
 * User-achievement controller.
 *
 * Scopes `find`/`findOne` to the caller's user-profile. Staff (teacher/admin)
 * bypass the scope so they can query per-user via query filters.
 * Create/update/delete stay on the default policy (admin-only via
 * `03-permissions`) — rows are written by the `user-progress` lifecycle, not
 * by end users.
 */
import { factories } from '@strapi/strapi';
import { scopedFind } from '../../../lib/scoped-find';

const PROFILE_UID = 'api::user-profile.user-profile';
const USER_ACHIEVEMENT_UID = 'api::user-achievement.user-achievement';

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

export default factories.createCoreController(USER_ACHIEVEMENT_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (isStaff(user)) return (super.find as any)(ctx);

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    // Non-staff callers lack permission on the `user` relation filter —
    // scopedFind merges the scope at the document-service layer.
    return scopedFind(ctx, this, USER_ACHIEVEMENT_UID, {
      user: { documentId: { $eq: profileId } },
    });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const result = await (super.findOne as any)(ctx);

    if (!isStaff(user)) {
      const entity = await strapi
        .documents(USER_ACHIEVEMENT_UID)
        .findOne({ documentId: ctx.params.id, populate: { user: true } });
      const ownerProfileId = (entity as any)?.user?.documentId;
      const myProfileId = await callerProfileId(strapi, user.id);
      if (!ownerProfileId || ownerProfileId !== myProfileId) {
        return ctx.forbidden();
      }
    }
    return result;
  },
}));
