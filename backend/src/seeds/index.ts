/**
 * Seed orchestrator.
 *
 * Called from `src/index.ts` bootstrap(). Runs each seed in order. All seeds
 * are idempotent — safe to invoke on every boot. A failure in one seed is
 * logged but does not prevent subsequent seeds (to avoid a partial failure
 * bricking startup in long-running envs).
 */
import * as roles from './00-roles';
import * as organizations from './01-organizations';
import * as admins from './02-admins';

const SEEDS: { name: string; up: (strapi: any) => Promise<void> }[] = [
  { name: '00-roles', up: roles.up },
  { name: '01-organizations', up: organizations.up },
  { name: '02-admins', up: admins.up },
];

export async function runSeeds(strapi: any) {
  if (process.env.SEED_DISABLED === 'true') {
    strapi.log.info('[seed] disabled via SEED_DISABLED=true');
    return;
  }

  for (const seed of SEEDS) {
    try {
      await seed.up(strapi);
    } catch (err) {
      strapi.log.error(`[seed] ${seed.name} failed:`, err);
    }
  }
}
