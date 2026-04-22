/**
 * Seed: backfill empty `user-inventory` for every existing kids-profile.
 *
 * Idempotent — skips profiles that already have an inventory. Always runs,
 * so new kids signups created before Phase B's auth-hook lands still get an
 * inventory lazily on next boot. Phase B's controller also auto-creates on
 * first `GET /api/user-inventory/me`, so this seed is belt-and-suspenders.
 */
const INVENTORY_UID = 'api::user-inventory.user-inventory';
const PROFILE_UID = 'api::user-profile.user-profile';

export async function up(strapi: any) {
  const kidsProfiles = await strapi.documents(PROFILE_UID).findMany({
    filters: { role: { $eq: 'kids' } },
    fields: ['documentId'],
    limit: 1000,
  });

  let created = 0;
  let skipped = 0;

  for (const p of kidsProfiles) {
    const [existing] = await strapi.documents(INVENTORY_UID).findMany({
      filters: { user: { documentId: { $eq: p.documentId } } },
      limit: 1,
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    await strapi.documents(INVENTORY_UID).create({
      data: {
        user: p.documentId,
        ownedShopItems: [],
        equippedItems: [],
        outfit: {},
        placedItems: [],
        seedVersion: 0,
      },
    });
    created += 1;
  }

  strapi.log.info(`[seed] user-inventories: created=${created}, skipped=${skipped}, kids=${kidsProfiles.length}`);
}
