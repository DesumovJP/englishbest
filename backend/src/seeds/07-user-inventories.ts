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
const CHARACTER_UID = 'api::character.character';
const ROOM_UID = 'api::room.room';

const STARTER_CHARACTER_SLUG = 'fox';
const STARTER_ROOM_SLUG = 'bedroom';

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
        ownedCharacters: foxDocId ? [foxDocId] : [],
        activeCharacter: foxDocId ?? null,
        unlockedRooms: bedroomDocId ? [bedroomDocId] : [],
        activeRoom: bedroomDocId ?? null,
      },
    });
    created += 1;
  }

  strapi.log.info(
    `[seed] user-inventories: created=${created}, backfilled=${backfilled}, skipped=${skipped}, kids=${kidsProfiles.length}`,
  );
}
