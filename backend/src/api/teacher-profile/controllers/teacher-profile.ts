/**
 * Teacher-profile controller.
 *
 * Extends the core CRUD with `/me` endpoints:
 *   GET   /api/teacher-profile/me   → own teacher-profile (404 if caller is not a teacher)
 *   PATCH /api/teacher-profile/me   → self-update allow-listed fields
 *
 * Self-update allow-list:
 *   - bio (text)
 *   - specializations (json — string[])
 *   - languagesSpoken (json — string[])
 *   - yearsExperience (int >=0)
 *   - hourlyRate (biginteger >=0)
 *   - videoMeetUrl (string)
 *   - maxStudents (int >=1)
 *   - acceptsTrial (bool)
 *   - publicSlug (string, unique check at Strapi level)
 *
 * NOT self-writable: `verified`, `rating`, `ratingCount`, `verificationDoc`,
 * `user` link. Any other key in the body is silently ignored.
 *
 * Stock `update` is tightened: non-admin callers may only update their own
 * teacher-profile via `/me`; direct `PUT /api/teacher-profiles/:id` is
 * admin-only at the controller layer too.
 */
import { factories } from '@strapi/strapi';

const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const PROFILE_UID = 'api::user-profile.user-profile';

function roleType(ctxUser: any): string {
  return (ctxUser?.role?.type ?? '').toLowerCase();
}

async function callerTeacherProfile(strapi: any, userId: number | string) {
  const [tp] = await strapi.documents(TEACHER_UID).findMany({
    filters: { user: { user: { id: userId } } },
    populate: {
      user: {
        populate: { avatar: { fields: ['url'] } },
      },
    },
    limit: 1,
  });
  return tp ?? null;
}

function toPositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.trunc(value));
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Math.max(0, Math.trunc(Number(value)));
  }
  return null;
}

function sanitizeStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out: string[] = [];
  for (const x of v) {
    if (typeof x === 'string') {
      const t = x.trim();
      if (t && out.length < 50) out.push(t);
    }
  }
  return out;
}

function buildPatch(data: any): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  if ('bio' in data) {
    const v = data.bio;
    if (v === null || typeof v === 'string') patch.bio = v;
  }
  if ('specializations' in data) {
    const v = sanitizeStringArray(data.specializations);
    if (v !== null) patch.specializations = v;
  }
  if ('languagesSpoken' in data) {
    const v = sanitizeStringArray(data.languagesSpoken);
    if (v !== null) patch.languagesSpoken = v;
  }
  if ('yearsExperience' in data) {
    const n = toPositiveInt(data.yearsExperience);
    if (n !== null) patch.yearsExperience = n;
  }
  if ('hourlyRate' in data) {
    const n = toPositiveInt(data.hourlyRate);
    if (n !== null) patch.hourlyRate = String(n); // biginteger serialized as string
  }
  if ('videoMeetUrl' in data) {
    const v = data.videoMeetUrl;
    if (v === null || typeof v === 'string') patch.videoMeetUrl = v;
  }
  if ('maxStudents' in data) {
    const n = toPositiveInt(data.maxStudents);
    if (n !== null && n >= 1) patch.maxStudents = n;
  }
  if ('acceptsTrial' in data) {
    if (typeof data.acceptsTrial === 'boolean') patch.acceptsTrial = data.acceptsTrial;
  }
  if ('publicSlug' in data) {
    const v = data.publicSlug;
    if (v === null || (typeof v === 'string' && /^[a-z0-9-]+$/i.test(v))) {
      patch.publicSlug = v;
    }
  }

  return patch;
}

export default factories.createCoreController(TEACHER_UID, ({ strapi }) => ({
  async findMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'teacher') return ctx.forbidden('not a teacher');

    const tp = await callerTeacherProfile(strapi, user.id);
    if (!tp) return ctx.notFound('teacher-profile not found');
    return { data: tp };
  },

  async updateMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'teacher') return ctx.forbidden('not a teacher');

    const tp = await callerTeacherProfile(strapi, user.id);
    if (!tp) return ctx.notFound('teacher-profile not found');

    const body = ctx.request.body ?? {};
    const data = body?.data ?? body;
    const patch = buildPatch(data);

    if (Object.keys(patch).length === 0) {
      return { data: tp };
    }

    await strapi.documents(TEACHER_UID).update({
      documentId: (tp as any).documentId,
      data: patch,
    });

    const fresh = await strapi.documents(TEACHER_UID).findOne({
      documentId: (tp as any).documentId,
      populate: {
        user: {
          populate: { avatar: { fields: ['url'] } },
        },
      },
    });
    return { data: fresh };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const role = roleType(user);

    if (role === 'admin') return (super.update as any)(ctx);

    // Teachers must use `/me`. Non-admin `PUT /api/teacher-profiles/:id` is
    // rejected to prevent one teacher from overwriting another's profile
    // (even fields like `verified` that the schema allows).
    return ctx.forbidden('use PATCH /api/teacher-profile/me');
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();
    return (super.delete as any)(ctx);
  },
}));
