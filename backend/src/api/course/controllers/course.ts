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
import { writeAudit } from '../../../lib/audit';
import {
  approveContent,
  rejectContent,
  submitContent,
} from '../../../lib/content-moderation';

const COURSE_UID = 'api::course.course';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const STAFF_ROLES = new Set(['teacher', 'admin']);

async function callerTeacherProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return tp?.documentId ?? null;
}

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

    // Use the Documents API directly. The default core-controller delete
    // legacy-serializes the deleted entity (with populate) AFTER the row
    // is gone, which 500s on courses that had `sections` components +
    // related lessons. This path returns a clean envelope.
    const existing = await strapi.documents(COURSE_UID).findOne({
      documentId: ctx.params.id,
    });
    if (!existing) return ctx.notFound();

    await strapi.documents(COURSE_UID).delete({ documentId: ctx.params.id });
    await writeAudit(strapi, ctx, {
      action: 'delete',
      entityType: COURSE_UID,
      entityId: ctx.params.id,
      before: existing,
    });
    return { data: { documentId: ctx.params.id } };
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
    await writeAudit(strapi, ctx, {
      action: 'publish',
      entityType: COURSE_UID,
      entityId: ctx.params.id,
      before: existing,
      after: fresh,
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
    await writeAudit(strapi, ctx, {
      action: 'unpublish',
      entityType: COURSE_UID,
      entityId: ctx.params.id,
      before: existing,
      after: fresh,
    });
    return { data: fresh };
  },

  async submit(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (!STAFF_ROLES.has(role)) return ctx.forbidden();

    const existing = await (strapi as any).documents(COURSE_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    return submitContent({
      strapi,
      ctx,
      uid: COURSE_UID,
      existing: existing as any,
      callerTeacherProfileId: await callerTeacherProfileId(strapi, user.id),
      isAdmin: role === 'admin',
    });
  },

  async approve(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();

    const existing = await (strapi as any).documents(COURSE_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    return approveContent({
      strapi,
      ctx,
      uid: COURSE_UID,
      existing: existing as any,
      isAdmin: true,
    });
  },

  async reject(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();

    const existing = await (strapi as any).documents(COURSE_UID).findOne({
      documentId: ctx.params.id,
      populate: { owner: true },
    });
    if (!existing) return ctx.notFound();

    const reason = ((ctx.request.body as any)?.data?.reason ?? '') as string;
    return rejectContent({
      strapi,
      ctx,
      uid: COURSE_UID,
      existing: existing as any,
      isAdmin: true,
      reason,
    });
  },
}));
