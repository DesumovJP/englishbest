/**
 * Course controller.
 *
 * Default core controller for find/findOne/create/update/delete (Strapi
 * RBAC enforces teacher/admin role on writes). Adds custom publish/
 * unpublish actions that delegate to the Documents API — needed because
 * Strapi v5 doesn't expose publish/unpublish on the public REST surface
 * by default.
 */
import { factories } from '@strapi/strapi';

const COURSE_UID = 'api::course.course';
const PUBLISHABLE_ROLES = new Set(['teacher', 'admin']);

function roleType(user: unknown): string {
  return ((user as { role?: { type?: string } })?.role?.type ?? '').toLowerCase();
}

export default factories.createCoreController(COURSE_UID, ({ strapi }) => ({
  async publish(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (!PUBLISHABLE_ROLES.has(roleType(user))) return ctx.forbidden();

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
    if (!PUBLISHABLE_ROLES.has(roleType(user))) return ctx.forbidden();

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
