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
     * EARNING is server-owned: `totalCoinsDelta > 0`, `totalXpDelta`,
     * `streakDays`, `streakLastAt` are rejected — coins and XP only flow
     * through `lib/rewards.ts:awardOnAction`, streaks advance there too.
     * The previous unlocked path was a forge surface (compromised auth →
     * arbitrary credit).
     *
     * SPENDING coins via `totalCoinsDelta < 0` is still accepted for legacy
     * cosmetic purchases (room background) that haven't been migrated to a
     * server-side endpoint yet (see REWARDS.md → Phase E). Server validates
     * balance — never goes negative.
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

      // Hard-block fields that should never come from the client — earning,
      // XP, streak. (Spending via negative coin delta is handled below.)
      const SERVER_OWNED = ['totalXpDelta', 'totalCoins', 'totalXp', 'streakDays', 'streakLastAt'];
      const forbidden = SERVER_OWNED.filter((k) => k in data);
      if (forbidden.length > 0) {
        return ctx.badRequest(
          `field(s) ${forbidden.join(', ')} are server-owned — coins/XP/streak flow only through the rewards service`,
        );
      }

      if ('totalCoinsDelta' in data) {
        const delta = toInt((data as any).totalCoinsDelta);
        if (delta === null) return ctx.badRequest('totalCoinsDelta must be integer');
        if (delta > 0) {
          return ctx.badRequest(
            'totalCoinsDelta > 0 forbidden — earning is server-owned (rewards service)',
          );
        }
        if (delta < 0) {
          const current = Number((kp as any).totalCoins ?? 0);
          const next = current + delta;
          if (next < 0) return ctx.badRequest('insufficient coins');
          patch.totalCoins = next;
        }
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
