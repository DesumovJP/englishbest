/**
 * Seed: backfill empty `user-inventory` for every existing kids-profile,
 * and backfill starter character/room ownership on inventories that were
 * created before the Phase C bootstrap landed.
 *
 * Always runs; idempotent:
 *   - skips create if an inventory already exists
 *   - on existing inventories, only writes fox/bedroom when the relevant
 *     relations are empty, so a kid who's already swapped their active
 *     character or unlocked other rooms is never disturbed.
 */
const INVENTORY_UID = 'api::user-inventory.user-inventory';
const PROFILE_UID = 'api::user-profile.user-profile';
const KIDS_PROFILE_UID = 'api::kids-profile.kids-profile';
const CHARACTER_UID = 'api::character.character';
const ROOM_UID = 'api::room.room';

const STARTER_CHARACTER_SLUG = 'fox';
const STARTER_ROOM_SLUG = 'bedroom';
const STARTER_COINS = 500;
const STARTER_FREE_LOOT_BOXES = 1;

async function findDocIdBySlug(strapi: any, uid: string, slug: string): Promise<string | null> {
  const [doc] = await strapi.documents(uid).findMany({
    filters: { slug: { $eq: slug } },
    fields: ['documentId'],
    limit: 1,
  });
  return doc?.documentId ?? null;
}

export async function up(strapi: any) {
  const kidsProfiles = await strapi.documents(PROFILE_UID).findMany({
    filters: { role: { $eq: 'kids' } },
    fields: ['documentId'],
    limit: 1000,
  });

  const foxDocId = await findDocIdBySlug(strapi, CHARACTER_UID, STARTER_CHARACTER_SLUG);
  const bedroomDocId = await findDocIdBySlug(strapi, ROOM_UID, STARTER_ROOM_SLUG);

  let created = 0;
  let skipped = 0;
  let backfilled = 0;

  for (const p of kidsProfiles) {
    const [existing] = await strapi.documents(INVENTORY_UID).findMany({
      filters: { user: { documentId: { $eq: p.documentId } } },
      populate: {
        ownedCharacters: { fields: ['slug'] },
        activeCharacter: { fields: ['slug'] },
        unlockedRooms: { fields: ['slug'] },
        activeRoom: { fields: ['slug'] },
      },
      limit: 1,
    });

    if (existing) {
      const patch: Record<string, unknown> = {};
      const ownedChars = (existing as any).ownedCharacters ?? [];
      if (foxDocId && ownedChars.length === 0) {
        patch.ownedCharacters = [foxDocId];
      }
      if (foxDocId && !(existing as any).activeCharacter) {
        patch.activeCharacter = foxDocId;
      }
      const unlocked = (existing as any).unlockedRooms ?? [];
      if (bedroomDocId && unlocked.length === 0) {
        patch.unlockedRooms = [bedroomDocId];
      }
      if (bedroomDocId && !(existing as any).activeRoom) {
        patch.activeRoom = bedroomDocId;
      }
      // One-time starter mystery box — only granted when the counter is
      // still at seed default (null/undefined). Kids who have already
      // spent or been granted something via `freeLootBoxes` are left alone.
      if ((existing as any).freeLootBoxes == null) {
        patch.freeLootBoxes = STARTER_FREE_LOOT_BOXES;
      }

      if (Object.keys(patch).length > 0) {
        await strapi.documents(INVENTORY_UID).update({
          documentId: (existing as any).documentId,
          data: patch,
        });
        backfilled += 1;
      } else {
        skipped += 1;
      }
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
        freeLootBoxes: STARTER_FREE_LOOT_BOXES,
        ownedCharacters: foxDocId ? [foxDocId] : [],
        activeCharacter: foxDocId ?? null,
        unlockedRooms: bedroomDocId ? [bedroomDocId] : [],
        activeRoom: bedroomDocId ?? null,
      },
    });
    created += 1;
  }

  // Starter coins — grant STARTER_COINS to any kids-profile whose totalCoins
  // is still 0. Kids who have earned/spent anything are untouched.
  let coinsGranted = 0;
  const kidsProfileDocs = await strapi.documents(KIDS_PROFILE_UID).findMany({
    filters: { totalCoins: { $eq: 0 } },
    fields: ['documentId', 'totalCoins'],
    limit: 1000,
  });
  for (const kp of kidsProfileDocs) {
    await strapi.documents(KIDS_PROFILE_UID).update({
      documentId: (kp as any).documentId,
      data: { totalCoins: STARTER_COINS },
    });
    coinsGranted += 1;
  }

  strapi.log.info(
    `[seed] user-inventories: created=${created}, backfilled=${backfilled}, skipped=${skipped}, coinsGranted=${coinsGranted}, kids=${kidsProfiles.length}`,
  );
}
