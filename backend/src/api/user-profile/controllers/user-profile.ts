/**
 * User-profile controller.
 *
 * Extends the core CRUD with `/me` endpoints:
 *   GET   /api/user-profile/me   → own user-profile (populated with user+avatar+org)
 *   PATCH /api/user-profile/me   → self-update allow-listed fields
 *
 * Self-update allow-list:
 *   - firstName / lastName / displayName (strings; trimmed)
 *   - phone (+? plus 9-15 digits — mirror schema regex)
 *   - dateOfBirth (YYYY-MM-DD string or null)
 *   - locale (enum: uk | en | ru)
 *   - timezone (IANA string, basic shape)
 *   - marketingOptIn (bool)
 *   - level (CEFR enum: A0..C2) — written by the onboarding placement quiz
 *
 * NOT self-writable: user link, role, organization, *Profile links,
 * status, tokenVersion, deletedAt, consent*, parentalConsentBy, avatar.
 *
 * Stock `update` is tightened: non-admin callers may only update their own
 * user-profile via `/me`; direct `PUT /api/user-profiles/:id` is admin-only.
 */
import { factories } from '@strapi/strapi';

const PROFILE_UID = 'api::user-profile.user-profile';

const LOCALES = new Set(['uk', 'en', 'ru']);
const LEVELS = new Set(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const PHONE_RE = /^\+?[0-9]{9,15}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TZ_RE = /^[A-Za-z_]+(?:\/[A-Za-z_+-]+)*$/;

function roleType(ctxUser: any): string {
  return (ctxUser?.role?.type ?? '').toLowerCase();
}

const POPULATE: Record<string, { fields: string[] }> = {
  user: { fields: ['id', 'email', 'username'] },
  avatar: { fields: ['url'] },
  organization: { fields: ['name', 'slug'] },
};

async function callerProfile(strapi: any, userId: number | string) {
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    populate: POPULATE,
    limit: 1,
  });
  return profile ?? null;
}

function sanitizeName(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (trimmed.length === 0 || trimmed.length > 80) return null;
  return trimmed;
}

function buildPatch(data: any): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  if ('firstName' in data) {
    const v = sanitizeName(data.firstName);
    if (v !== null) patch.firstName = v;
  }
  if ('lastName' in data) {
    if (data.lastName === null || data.lastName === '') {
      patch.lastName = null;
    } else {
      const v = sanitizeName(data.lastName);
      if (v !== null) patch.lastName = v;
    }
  }
  if ('displayName' in data) {
    if (data.displayName === null || data.displayName === '') {
      patch.displayName = null;
    } else {
      const v = sanitizeName(data.displayName);
      if (v !== null) patch.displayName = v;
    }
  }
  if ('phone' in data) {
    if (data.phone === null || data.phone === '') {
      patch.phone = null;
    } else if (typeof data.phone === 'string' && PHONE_RE.test(data.phone.trim())) {
      patch.phone = data.phone.trim();
    }
  }
  if ('dateOfBirth' in data) {
    if (data.dateOfBirth === null || data.dateOfBirth === '') {
      patch.dateOfBirth = null;
    } else if (typeof data.dateOfBirth === 'string' && DATE_RE.test(data.dateOfBirth)) {
      patch.dateOfBirth = data.dateOfBirth;
    }
  }
  if ('locale' in data) {
    if (typeof data.locale === 'string' && LOCALES.has(data.locale)) {
      patch.locale = data.locale;
    }
  }
  if ('timezone' in data) {
    if (typeof data.timezone === 'string') {
      const tz = data.timezone.trim();
      if (tz.length > 0 && tz.length <= 64 && TZ_RE.test(tz)) {
        patch.timezone = tz;
      }
    }
  }
  if ('marketingOptIn' in data) {
    if (typeof data.marketingOptIn === 'boolean') {
      patch.marketingOptIn = data.marketingOptIn;
    }
  }
  if ('level' in data) {
    if (typeof data.level === 'string' && LEVELS.has(data.level)) {
      patch.level = data.level;
    }
  }

  return patch;
}

export default factories.createCoreController(PROFILE_UID, ({ strapi }) => ({
  async findMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const profile = await callerProfile(strapi, user.id);
    if (!profile) return ctx.notFound('user-profile not found');
    return { data: profile };
  },

  async updateMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const profile = await callerProfile(strapi, user.id);
    if (!profile) return ctx.notFound('user-profile not found');

    const body = ctx.request.body ?? {};
    const data = body?.data ?? body;
    const patch = buildPatch(data);

    if (Object.keys(patch).length === 0) {
      return { data: profile };
    }

    await strapi.documents(PROFILE_UID).update({
      documentId: (profile as any).documentId,
      data: patch,
    });

    const fresh = await strapi.documents(PROFILE_UID).findOne({
      documentId: (profile as any).documentId,
      populate: POPULATE,
    });
    return { data: fresh };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) === 'admin') return (super.update as any)(ctx);
    return ctx.forbidden('use PATCH /api/user-profile/me');
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    if (roleType(user) !== 'admin') return ctx.forbidden();
    return (super.delete as any)(ctx);
  },
}));
