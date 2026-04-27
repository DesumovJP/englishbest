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

    /**
     * Patch self-mutable fields on the caller's kids-profile.
     *
     * Currency / XP / streak are FULLY server-owned after Phase F:
     *   - Earning flows only through `lib/rewards.ts:awardOnAction`.
     *   - Spending (cosmetic purchases, loot boxes, room unlocks, room
     *     backgrounds) flows only through the matching `user-inventory`
     *     endpoint, which debits coins atomically.
     *   - The previous `totalCoinsDelta` (positive AND negative) path is
     *     closed — it was a client-trusted balance mutation surface and
     *     no longer has any legitimate caller.
     *
     * Free-form profile fields (mood, companion, showRealName) pass through.
     */
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

      // Hard-block currency / XP / streak fields. The client may not move
      // these in either direction. Earn → rewards service. Spend →
      // user-inventory endpoints. Anything else is forgery.
      const SERVER_OWNED = [
        'totalCoinsDelta',
        'totalXpDelta',
        'totalCoins',
        'totalXp',
        'streakDays',
        'streakLastAt',
      ];
      const forbidden = SERVER_OWNED.filter((k) => k in data);
      if (forbidden.length > 0) {
        return ctx.badRequest(
          `field(s) ${forbidden.join(', ')} are server-owned — coins / XP / streak flow only through the rewards + user-inventory services`,
        );
      }

      if ('characterMood' in data) {
        const mood = (data as any).characterMood;
        if (mood !== null && !MOOD_ENUM.has(mood)) {
          return ctx.badRequest('characterMood invalid');
        }
        patch.characterMood = mood;
      }

      if ('companionAnimal' in data) {
        patch.companionAnimal = (data as any).companionAnimal;
      }
      if ('companionName' in data) {
        patch.companionName = (data as any).companionName;
      }
      if ('showRealName' in data) {
        patch.showRealName = Boolean((data as any).showRealName);
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
