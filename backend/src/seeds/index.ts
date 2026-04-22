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
import * as permissions from './03-permissions';
import * as demoAccounts from './04-demo-accounts';
import * as shopItems from './05-shop-items';
import * as achievements from './06-achievements';
import * as userInventories from './07-user-inventories';
import * as characters from './08-characters';
import * as rooms from './09-rooms';

const SEEDS: { name: string; up: (strapi: any) => Promise<void> }[] = [
  { name: '00-roles', up: roles.up },
  { name: '01-organizations', up: organizations.up },
  { name: '02-admins', up: admins.up },
  { name: '03-permissions', up: permissions.up },
  { name: '04-demo-accounts', up: demoAccounts.up },
  { name: '05-shop-items', up: shopItems.up },
  { name: '06-achievements', up: achievements.up },
  // Characters and rooms must run before user-inventories so the starter
  // bootstrap can reference them when backfilling existing inventories.
  { name: '08-characters', up: characters.up },
  { name: '09-rooms', up: rooms.up },
  { name: '07-user-inventories', up: userInventories.up },
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
