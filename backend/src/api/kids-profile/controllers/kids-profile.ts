/**
 * kids-profile controller.
 *
 * Extends the core CRUD with `/me` endpoints:
 *   GET  /api/kids-profile/me   → own kids-profile (404 if caller is not a kid)
 *   PATCH /api/kids-profile/me  → self-update; coins are delta-only (see below)
 *
 * Client-writable fields on PATCH:
 *   - totalCoins  → *delta* (positive or negative integer); server applies it.
 *                   Negative deltas cannot drive balance below 0.
 *                   This prevents a compromised client from writing an
 *                   arbitrary absolute value (e.g. `{totalCoins: 999999}`).
 *   - totalXp     → delta (non-negative; XP never decreases).
 *   - streakDays  → absolute; server clamps to >=0.
 *   - streakLastAt → ISO datetime (client sets when it detects a new day).
 *   - characterMood → enum.
 * Any other field in the body is ignored.
 */
import { factories } from '@strapi/strapi';

const KIDS_PROFILE_UID = 'api::kids-profile.kids-profile';
const PROFILE_UID = 'api::user-profile.user-profile';

const MOOD_ENUM = new Set([
  'happy', 'excited', 'neutral', 'thinking', 'surprised',
  'sleepy', 'proud', 'sad', 'confused', 'celebrating',
]);

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

async function callerKidsProfile(strapi: any, profileDocId: string) {
  const [kp] = await strapi.documents(KIDS_PROFILE_UID).findMany({
    filters: { user: { documentId: { $eq: profileDocId } } },
    limit: 1,
  });
  return kp ?? null;
}

function toInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Math.trunc(Number(value));
  }
  return null;
}

export default factories.createCoreController(
  KIDS_PROFILE_UID,
  ({ strapi }) => ({
    async findMe(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');

      const kp = await callerKidsProfile(strapi, profileId);
      if (!kp) return ctx.notFound('kids-profile not found');
      return { data: kp };
    },

    async updateMe(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized();

      const profileId = await callerProfileId(strapi, user.id);
      if (!profileId) return ctx.forbidden('no user-profile');

      const kp = await callerKidsProfile(strapi, profileId);
      if (!kp) return ctx.notFound('kids-profile not found');

      const body = ctx.request.body ?? {};
      const data = body?.data ?? body;
      const patch: Record<string, unknown> = {};

      if ('totalCoinsDelta' in data) {
        const delta = toInt((data as any).totalCoinsDelta);
        if (delta === null) return ctx.badRequest('totalCoinsDelta must be integer');
        const current = Number((kp as any).totalCoins ?? 0);
        const next = current + delta;
        if (next < 0) return ctx.badRequest('insufficient coins');
        patch.totalCoins = next;
      }

      if ('totalXpDelta' in data) {
        const delta = toInt((data as any).totalXpDelta);
        if (delta === null || delta < 0) return ctx.badRequest('totalXpDelta must be non-negative integer');
        patch.totalXp = Number((kp as any).totalXp ?? 0) + delta;
      }

      if ('streakDays' in data) {
        const v = toInt((data as any).streakDays);
        if (v === null || v < 0) return ctx.badRequest('streakDays must be non-negative integer');
        patch.streakDays = v;
      }

      if ('streakLastAt' in data) {
        const raw = (data as any).streakLastAt;
        if (raw === null) {
          patch.streakLastAt = null;
        } else if (typeof raw === 'string' && !Number.isNaN(Date.parse(raw))) {
          patch.streakLastAt = raw;
        } else {
          return ctx.badRequest('streakLastAt must be ISO datetime or null');
        }
      }

      if ('characterMood' in data) {
        const mood = (data as any).characterMood;
        if (mood !== null && !MOOD_ENUM.has(mood)) {
          return ctx.badRequest('characterMood invalid');
        }
        patch.characterMood = mood;
      }

      await strapi.documents(KIDS_PROFILE_UID).update({
        documentId: (kp as any).documentId,
        data: patch,
      });

      const fresh = await strapi.documents(KIDS_PROFILE_UID).findOne({
        documentId: (kp as any).documentId,
      });
      return { data: fresh };
    },
  }),
);
