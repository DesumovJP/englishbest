/**
 * Teacher-payout controller.
 *
 * Scoping:
 *   - admin    — bypass, full CRUD.
 *   - teacher  — read-only own records (`teacher = caller`).
 *   - anyone else — forbidden.
 *
 * Payouts are admin-curated aggregates. Teachers never mutate them.
 */
import { factories } from '@strapi/strapi';
import { scopedFind } from '../../../lib/scoped-find';

const PAYOUT_UID = 'api::teacher-payout.teacher-payout';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';

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

export default factories.createCoreController(PAYOUT_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);
    if (role !== 'teacher') return ctx.forbidden();

    const teacherId = await callerTeacherProfileId(strapi, user.id);
    if (!teacherId) return ctx.forbidden('no teacher-profile');

    // Teachers lack permission on `teacher` relation filter — scopedFind
    // merges the scope at the document-service layer.
    return scopedFind(ctx, this, PAYOUT_UID, {
      teacher: { documentId: { $eq: teacherId } },
    });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.findOne as any)(ctx);
    if (role !== 'teacher') return ctx.forbidden();

    const entity = await strapi.documents(PAYOUT_UID).findOne({
      documentId: ctx.params.id,
      populate: { teacher: { fields: ['documentId'] } },
    });
    if (!entity) return ctx.notFound();
    const teacherId = await callerTeacherProfileId(strapi, user.id);
    const ownerId = (entity as any).teacher?.documentId ?? null;
    if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
    return (super.findOne as any)(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();
    return (super.create as any)(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();
    return (super.delete as any)(ctx);
  },
}));
