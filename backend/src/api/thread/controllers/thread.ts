/**
 * Thread controller.
 *
 * Scoping:
 *   - admin  — bypass.
 *   - others — must be in `participants`. `find`/`findOne` filter by membership;
 *              `create` forces caller into participants; `update` strips
 *              participants/lastMessage* to prevent hijacking.
 *   - delete — admin only.
 */
import { factories } from '@strapi/strapi';
import { scopedFind, sanitizeOutputTrusted } from '../../../lib/scoped-find';

const THREAD_UID = 'api::thread.thread';
const PROFILE_UID = 'api::user-profile.user-profile';

// Server-trusted populate: participants (user-profile) with display + avatar.
// Non-admin callers lack `find` on api::user-profile.user-profile, so the
// default sanitizeOutput would strip the populate after fetch. We re-inject
// via document-service + schema-only output sanitize.
const FIND_POPULATE: any = {
  participants: {
    fields: ['documentId', 'firstName', 'lastName', 'displayName', 'level'],
    populate: { avatar: { fields: ['url'] } },
  },
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

async function isParticipant(strapi: any, threadDocId: string, profileId: string): Promise<boolean> {
  const thread = await strapi.documents(THREAD_UID).findOne({
    documentId: threadDocId,
    populate: { participants: { fields: ['documentId'] } },
  });
  if (!thread) return false;
  const ids: string[] = ((thread as any).participants ?? []).map((p: any) => p?.documentId).filter(Boolean);
  return ids.includes(profileId);
}

export default factories.createCoreController(THREAD_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    // Non-admin callers lack permission on `participants` — scopedFind applies
    // the filter at the document-service layer.
    return scopedFind(
      ctx,
      this,
      THREAD_UID,
      { participants: { documentId: { $eq: profileId } } },
      { populate: FIND_POPULATE },
    );
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(THREAD_UID).findOne({
      documentId: ctx.params.id,
      populate: FIND_POPULATE,
    });
    if (!entity) return ctx.notFound();

    if (role !== 'admin') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');
      const ids: string[] = ((entity as any).participants ?? [])
        .map((p: any) => p?.documentId)
        .filter((x: unknown): x is string => typeof x === 'string');
      if (!ids.includes(profileId)) return ctx.forbidden();
    }

    const sanitized = await sanitizeOutputTrusted(THREAD_UID, entity);
    return this.transformResponse(sanitized);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    ctx.request.body = ctx.request.body || {};
    const data = ((ctx.request.body as any).data ?? {}) as Record<string, unknown>;

    if (role === 'teacher') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');
      const requested = Array.isArray((data as any).participants) ? (data as any).participants : [];
      const set = new Set<string>();
      for (const p of requested) {
        if (typeof p === 'string') set.add(p);
        else if (p && typeof p === 'object' && typeof (p as any).documentId === 'string') {
          set.add((p as any).documentId);
        }
      }
      set.add(profileId);
      data.participants = Array.from(set);
    }
    (ctx.request.body as any).data = data;
    return (super.create as any)(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.update as any)(ctx);

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden();
    const ok = await isParticipant(strapi, ctx.params.id, profileId);
    if (!ok) return ctx.forbidden();

    const data = ((ctx.request.body as any)?.data ?? {}) as Record<string, unknown>;
    delete data.participants;
    delete data.lastMessageAt;
    delete data.lastMessageBody;
    delete data.messages;
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
