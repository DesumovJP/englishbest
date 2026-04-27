/**
 * Reward-event controller — read-only ledger.
 *
 * Scoping:
 *   - admin   — sees all (audit / debug).
 *   - kids / adult / student — own events only (motivation report, weekly
 *     summary).
 *   - parent  — own children's events.
 *   - teacher — own students' events (today: any kid; tightened in Phase D).
 */
import { factories } from '@strapi/strapi';
import { scopedFind } from '../../../lib/scoped-find';

const EVENT_UID = 'api::reward-event.reward-event';
const PROFILE_UID = 'api::user-profile.user-profile';

function roleType(u: any): string {
  return (u?.role?.type ?? '').toLowerCase();
}

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [p] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return p?.documentId ?? null;
}

async function childProfileIds(strapi: any, parentProfileId: string): Promise<string[]> {
  const kids = await strapi.documents(PROFILE_UID).findMany({
    filters: { parentalConsentBy: { documentId: { $eq: parentProfileId } } },
    fields: ['documentId'],
    limit: 200,
  });
  return kids
    .map((k: any) => k.documentId)
    .filter((x: unknown): x is string => typeof x === 'string');
}

export default factories.createCoreController(EVENT_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    let scopeFilter: Record<string, unknown>;
    if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      if (kidIds.length === 0) {
        ctx.body = {
          data: [],
          meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } },
        };
        return;
      }
      scopeFilter = { user: { documentId: { $in: kidIds } } };
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      scopeFilter = { user: { documentId: { $eq: profileId } } };
    }

    return scopedFind(ctx, this, EVENT_UID, scopeFilter, {
      populate: { user: { fields: ['documentId'] } },
    });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity: any = await strapi.documents(EVENT_UID).findOne({
      documentId: ctx.params.id,
      populate: { user: { fields: ['documentId'] } },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    const ownerId = entity.user?.documentId ?? null;
    if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      if (!ownerId || !kidIds.includes(ownerId)) return ctx.forbidden();
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId || ownerId !== profileId) return ctx.forbidden();
    }
    return (super.findOne as any)(ctx);
  },
}));
