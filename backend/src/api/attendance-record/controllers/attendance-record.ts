/**
 * Attendance-record controller.
 *
 * Scoping:
 *   - admin    — bypass.
 *   - teacher  — sees/mutates records on own sessions (session.teacher = caller's
 *                teacher-profile). On create/update forces `recordedBy` + enforces
 *                session ownership.
 *   - parent   — read-only; records whose `student` is one of caller's children.
 *   - student  — read-only own records.
 */
import { factories } from '@strapi/strapi';
import { scopedFind, sanitizeOutputTrusted } from '../../../lib/scoped-find';

const RECORD_UID = 'api::attendance-record.attendance-record';
const SESSION_UID = 'api::session.session';
const PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';

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

async function callerTeacherProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    fields: ['documentId'],
    limit: 1,
  });
  return tp?.documentId ?? null;
}

async function childProfileIds(strapi: any, parentProfileId: string): Promise<string[]> {
  const kids = await strapi.documents(PROFILE_UID).findMany({
    filters: { parentalConsentBy: { documentId: { $eq: parentProfileId } } },
    fields: ['documentId'],
    limit: 200,
  });
  return kids.map((k: any) => k.documentId).filter((x: unknown): x is string => typeof x === 'string');
}

async function sessionTeacherId(strapi: any, sessionDocId: string): Promise<string | null> {
  const session = await strapi.documents(SESSION_UID).findOne({
    documentId: sessionDocId,
    populate: { teacher: { fields: ['documentId'] } },
  });
  return (session as any)?.teacher?.documentId ?? null;
}

export default factories.createCoreController(RECORD_UID, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.find as any)(ctx);

    // Non-admin callers lack permission on `session`/`student` relation filters
    // — scopedFind merges the scope at the document-service layer to avoid
    // 400 "Invalid key …" from validateQuery.
    let scopeFilter: Record<string, unknown>;
    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      scopeFilter = { session: { teacher: { documentId: { $eq: teacherId } } } };
    } else if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      if (kidIds.length === 0) {
        ctx.body = { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } };
        return;
      }
      scopeFilter = { student: { documentId: { $in: kidIds } } };
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      scopeFilter = { student: { documentId: { $eq: profileId } } };
    }
    // Trusted populate: teachers/students/parents lack `user-profile.find`, so
    // `sanitizeQuery` would strip `populate.student` and the FE would receive
    // records with no studentId — making the grid render empty. We've already
    // scoped by ownership above, so it's safe to force the relations through.
    return scopedFind(ctx, this, RECORD_UID, scopeFilter, {
      populate: {
        session: { fields: ['documentId', 'startAt'] },
        student: { fields: ['documentId'] },
      },
    });
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    const entity = await strapi.documents(RECORD_UID).findOne({
      documentId: ctx.params.id,
      populate: {
        student: { fields: ['documentId'] },
        session: { populate: { teacher: { fields: ['documentId'] } } },
      },
    });
    if (!entity) return ctx.notFound();

    if (role === 'admin') return (super.findOne as any)(ctx);

    const studentId = (entity as any).student?.documentId;
    const sessionTeacherIdVal = (entity as any).session?.teacher?.documentId;

    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId || sessionTeacherIdVal !== teacherId) return ctx.forbidden();
    } else if (role === 'parent') {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden();
      const kidIds = await childProfileIds(strapi, profileId);
      if (!studentId || !kidIds.includes(studentId)) return ctx.forbidden();
    } else {
      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId || studentId !== profileId) return ctx.forbidden();
    }
    return (super.findOne as any)(ctx);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    const body = ((ctx.request.body as any)?.data ?? {}) as Record<string, unknown>;
    const sessionId =
      typeof body.session === 'string'
        ? body.session
        : body.session && typeof body.session === 'object' && typeof (body.session as any).documentId === 'string'
          ? (body.session as any).documentId
          : null;
    const studentId =
      typeof body.student === 'string'
        ? body.student
        : body.student && typeof body.student === 'object' && typeof (body.student as any).documentId === 'string'
          ? (body.student as any).documentId
          : null;
    if (!sessionId || !studentId) return ctx.badRequest('session + student required');

    let recordedBy: string | null = null;
    if (role === 'teacher') {
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      if (!teacherId) return ctx.forbidden('no teacher-profile');
      const ownerId = await sessionTeacherId(strapi, sessionId);
      if (ownerId !== teacherId) return ctx.forbidden('not your session');
      recordedBy = teacherId;
    }

    // Bypass super.create/super.update — core's input validator runs
    // throwRestrictedRelations against `student`, but teachers lack `find`
    // on api::user-profile (only `findOne`/`findMe`), which yields
    // 400 "Invalid key student". We've already enforced session ownership
    // above, so it's safe to write through the document service directly.
    const data: Record<string, unknown> = {
      session: sessionId,
      student: studentId,
      status: typeof body.status === 'string' ? body.status : 'present',
      recordedAt:
        typeof body.recordedAt === 'string' ? body.recordedAt : new Date().toISOString(),
    };
    if (typeof body.note === 'string' || body.note === null) data.note = body.note;
    if (recordedBy) data.recordedBy = recordedBy;

    // Idempotent upsert: if a record already exists for this (session, student),
    // update it instead of creating a duplicate.
    const [existing] = await strapi.documents(RECORD_UID).findMany({
      filters: {
        session: { documentId: { $eq: sessionId } },
        student: { documentId: { $eq: studentId } },
      },
      fields: ['documentId'],
      limit: 1,
    });

    if (existing?.documentId) {
      // Immutable links on update.
      delete data.session;
      delete data.student;
      delete data.recordedBy;
      const updated = await strapi.documents(RECORD_UID).update({
        documentId: existing.documentId,
        data: data as any,
      });
      const sanitized = await sanitizeOutputTrusted(RECORD_UID, updated);
      return this.transformResponse(sanitized);
    }

    const created = await strapi.documents(RECORD_UID).create({ data: data as any });
    const sanitized = await sanitizeOutputTrusted(RECORD_UID, created);
    ctx.status = 201;
    return this.transformResponse(sanitized);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const entity = await strapi.documents(RECORD_UID).findOne({
        documentId: ctx.params.id,
        populate: { session: { populate: { teacher: { fields: ['documentId'] } } } },
      });
      if (!entity) return ctx.notFound();
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (entity as any).session?.teacher?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();

      const data = ((ctx.request.body as any)?.data ?? {}) as Record<string, unknown>;
      // Immutable links.
      delete data.session;
      delete data.student;
      delete data.recordedBy;
      data.recordedAt = new Date().toISOString();
      (ctx.request.body as any).data = data;
    }
    return (super.update as any)(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);
    if (role !== 'teacher' && role !== 'admin') return ctx.forbidden();

    if (role === 'teacher') {
      const entity = await strapi.documents(RECORD_UID).findOne({
        documentId: ctx.params.id,
        populate: { session: { populate: { teacher: { fields: ['documentId'] } } } },
      });
      if (!entity) return ctx.notFound();
      const teacherId = await callerTeacherProfileId(strapi, user.id);
      const ownerId = (entity as any).session?.teacher?.documentId ?? null;
      if (!teacherId || ownerId !== teacherId) return ctx.forbidden();
    }
    return (super.delete as any)(ctx);
  },
}));
