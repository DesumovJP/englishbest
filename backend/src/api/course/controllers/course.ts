/**
 * Course controller.
 *
 * Default core controller is permissive on read (anonymous catalog) but
 * write actions are gated to teacher/admin via Strapi RBAC. The seeded
 * permissions don't include `delete` for teacher role, so the default
 * controller would 403 the dashboard "Видалити курс" button. We override
 * `create`/`update`/`delete` here to allow either role explicitly, and
 * add custom `publish`/`unpublish` methods that delegate to the
 * Documents API (Strapi v5 doesn't expose them on the public REST
 * surface by default).
 */
import { factories } from '@strapi/strapi';

const COURSE_UID = 'api::course.course';
const STAFF_ROLES = new Set(['teacher', 'admin']);

function roleType(user: unknown): string {
  return ((user as { role?: { type?: string } })?.role?.type ?? '').toLowerCase();
}

export default factories.createCoreController(COURSE_UID, ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (!STAFF_ROLES.has(roleType(user))) return ctx.forbidden();
    return (super.create as never as (c: typeof ctx) => unknown)(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (!STAFF_ROLES.has(roleType(user))) return ctx.forbidden();
    return (super.update as never as (c: typeof ctx) => unknown)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (!STAFF_ROLES.has(roleType(user))) return ctx.forbidden();
    return (super.delete as never as (c: typeof ctx) => unknown)(ctx);
  },

  async publish(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (!STAFF_ROLES.has(roleType(user))) return ctx.forbidden();

    const existing = await strapi.documents(COURSE_UID).findOne({
      documentId: ctx.params.id,
    });
    if (!existing) return ctx.notFound();

    await strapi.documents(COURSE_UID).publish({ documentId: ctx.params.id });
    const fresh = await strapi.documents(COURSE_UID).findOne({
      documentId: ctx.params.id,
    });
    return { data: fresh };
  },

  async unpublish(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (!STAFF_ROLES.has(roleType(user))) return ctx.forbidden();

    const existing = await strapi.documents(COURSE_UID).findOne({
      documentId: ctx.params.id,
    });
    if (!existing) return ctx.notFound();

    await strapi.documents(COURSE_UID).unpublish({ documentId: ctx.params.id });
    const fresh = await strapi.documents(COURSE_UID).findOne({
      documentId: ctx.params.id,
    });
    return { data: fresh };
  },
}));
