/**
 * Mini-task controller.
 *
 * Scoping:
 *   - teacher — sees own (author = caller's teacher-profile) + any `isPublic`
 *     tasks authored by others; `author` is forced on create.
 *   - admin — bypass.
 *   - student (kids/adult) — sees only `isPublic` tasks (for assignment
 *     by parent/self-practice).
 *   - parent — read-only on `isPublic`.
 */
import { factories } from '@strapi/strapi';
import { scopedFind } from '../../../lib/scoped-find';

const UID = 'api::mini-task.mini-task';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';

// Mini-task `coinReward` is what a kid earns on a perfect first attempt.
// Clamping it keeps the reward economy balanced — without this an author
// could set 9999 and tip the entire motivation curve. Anything below 5
// would make the reward feel meaningless. See REWARDS.md → Phase E.
const COIN_REWARD_MIN = 5;
const COIN_REWARD_MAX = 100;

const DURATION_MIN = 1;
const DURATION_MAX = 30;

function clampCoinReward(v: unknown): number | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== 'number' || !Number.isFinite(v)) return COIN_REWARD_MIN;
  return Math.max(COIN_REWARD_MIN, Math.min(COIN_REWARD_MAX, Math.round(v)));
}

function clampDuration(v: unknown): number | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== 'number' || !Number.isFinite(v)) return undefined;
  return Math.max(DURATION_MIN, Math.min(DURATION_MAX, Math.round(v)));
}

function normalizeWriteData(data: Record<string, unknown> | undefined | null): void {
  if (!data) return;
  if ('coinReward' in data) {
    const clamped = clampCoinReward(data.coinReward);
    if (clamped !== undefined) data.coinReward = clamped;
  }
  if ('durationMin' in data) {
    const clamped = clampDuration(data.durationMin);
    if (clamped !== undefined) data.durationMin = clamped;
  }
}

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

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    // Non-admin callers lack permission on the `author` relation filter —
    // scopedFind merges the scope at the document-service layer to avoid 400.
    let scopeFilter: Record<string, unknown>;
    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      scopeFilter = {
        $or: [
          { author: { documentId: { $eq: teacherId } } },
          { isPublic: { $eq: true } },
        ],
      };
    } else {
      scopeFilter = { isPublic: { $eq: true } };
    }
    return scopedFind(ctx, this, UID, scopeFilter);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(UID).findOne({
      documentId: ctx.params.id,
      populate: { author: true },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    const isPublic = Boolean((entity as any).isPublic);
    const authorId = (entity as any).author?.documentId;

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      if (authorId !== teacherId && !isPublic) return ctx.forbidden();
    } else if (!isPublic) {
      return ctx.forbidden();
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
        author: teacherId,
      };
    }
    normalizeWriteData((ctx.request.body as any)?.data);
    return (super.create as any)(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const existing = await strapi.documents(UID).findOne({
        documentId: ctx.params.id,
        populate: { author: true },
      });
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || (existing as any)?.author?.documentId !== teacherId) {
        return ctx.forbidden();
      }
      if ((ctx.request.body as any)?.data?.author) delete (ctx.request.body as any).data.author;
    }
    normalizeWriteData((ctx.request.body as any)?.data);
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const existing = await strapi.documents(UID).findOne({
        documentId: ctx.params.id,
        populate: { author: true },
      });
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || (existing as any)?.author?.documentId !== teacherId) {
        return ctx.forbidden();
      }
    }
    return (super.delete as any)(ctx);
  },
}));
