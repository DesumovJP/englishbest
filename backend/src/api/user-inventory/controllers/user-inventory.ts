/**
 * user-inventory controller.
 *
 * Endpoints:
 *   GET   /api/user-inventory/me                       → own inventory (auto-creates on first read)
 *   PATCH /api/user-inventory/me                       → partial update
 *   POST  /api/user-inventory/me/purchase-character    → debit coins, add to ownedCharacters
 *   POST  /api/user-inventory/me/unlock-room           → debit coins, add to unlockedRooms
 *   POST  /api/user-inventory/me/purchase-shop-item    → debit coins, add to ownedShopItems
 *   POST  /api/user-inventory/me/equip                 → toggle equipped state for an owned item
 *
 * Client-writable fields on PATCH:
 *   outfit, placedItems, equippedItems, ownedShopItems, seedVersion,
 *   activeCharacter (slug), activeRoom (slug).
 *
 *   - `equippedItems` must be a subset of `ownedShopItems` (post-patch set).
 *   - `activeCharacter` must already be in `ownedCharacters`.
 *   - `activeRoom` must already be in `unlockedRooms`.
 *   - `ownedShopItems` is accepted as an interim write channel for Phase B;
 *     Phase D will move purchase behind POST /purchase-shop-item.
 *   - `ownedCharacters` / `unlockedRooms` are NOT client-writable on PATCH —
 *     use the purchase endpoints (server-side coin debit).
 *
 * Starter bootstrap: on first read we auto-grant `fox` as owned+active
 * character and `bedroom` as unlocked+active room, so the kid has a
 * usable scene before spending anything.
 */
const INVENTORY_UID = 'api::user-inventory.user-inventory';
const PROFILE_UID = 'api::user-profile.user-profile';
const KIDS_PROFILE_UID = 'api::kids-profile.kids-profile';
const CHARACTER_UID = 'api::character.character';
const ROOM_UID = 'api::room.room';
const SHOP_ITEM_UID = 'api::shop-item.shop-item';

const STARTER_CHARACTER_SLUG = 'fox';
const STARTER_ROOM_SLUG = 'bedroom';

const POPULATE: any = {
  user: { fields: ['documentId'] },
  ownedShopItems: { fields: ['slug'] },
  equippedItems: { fields: ['slug'] },
  ownedCharacters: { fields: ['slug'] },
  activeCharacter: { fields: ['slug'] },
  unlockedRooms: { fields: ['slug'] },
  activeRoom: { fields: ['slug'] },
};

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

async function callerProfileWithLevel(
  strapi: any,
  userId: number | string,
): Promise<{ documentId: string; level: string | null } | null> {
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId', 'level'],
    limit: 1,
  });
  if (!profile) return null;
  return {
    documentId: profile.documentId,
    level: (profile as any).level ?? null,
  };
}

async function callerKidsProfile(strapi: any, profileDocId: string) {
  const [kp] = await strapi.documents(KIDS_PROFILE_UID).findMany({
    filters: { user: { documentId: { $eq: profileDocId } } },
    limit: 1,
  });
  return kp ?? null;
}

async function findDocIdBySlug(strapi: any, uid: string, slug: string): Promise<string | null> {
  if (!slug) return null;
  const [doc] = await strapi.documents(uid).findMany({
    filters: { slug: { $eq: slug } },
    fields: ['documentId'],
    limit: 1,
  });
  return doc?.documentId ?? null;
}

async function getOrCreateInventory(strapi: any, profileDocId: string) {
  const [existing] = await strapi.documents(INVENTORY_UID).findMany({
    filters: { user: { documentId: { $eq: profileDocId } } },
    populate: POPULATE,
    limit: 1,
  });
  if (existing) return existing;

  const foxDocId = await findDocIdBySlug(strapi, CHARACTER_UID, STARTER_CHARACTER_SLUG);
  const bedroomDocId = await findDocIdBySlug(strapi, ROOM_UID, STARTER_ROOM_SLUG);

  const created = await strapi.documents(INVENTORY_UID).create({
    data: {
      user: profileDocId,
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

  return strapi.documents(INVENTORY_UID).findOne({
    documentId: created.documentId,
    populate: POPULATE,
  });
}

async function slugsToDocIds(strapi: any, uid: string, slugs: unknown): Promise<string[]> {
  if (!Array.isArray(slugs)) return [];
  const clean = slugs
    .map((s: any) => (typeof s === 'string' ? s : s?.slug))
    .filter((s): s is string => typeof s === 'string' && s.length > 0);
  if (clean.length === 0) return [];
  const items = await strapi.documents(uid).findMany({
    filters: { slug: { $in: clean } },
    fields: ['documentId'],
  });
  return items.map((i: any) => i.documentId);
}

function pickPatchableFields(body: any) {
  const data = body?.data ?? body ?? {};
  const patch: Record<string, unknown> = {};
  if ('outfit' in data) patch.outfit = data.outfit;
  if ('placedItems' in data) patch.placedItems = data.placedItems;
  if ('equippedItems' in data) patch.equippedItems = data.equippedItems;
  if ('ownedShopItems' in data) patch.ownedShopItems = data.ownedShopItems;
  if ('seedVersion' in data) patch.seedVersion = data.seedVersion;
  if ('activeCharacter' in data) patch.activeCharacter = data.activeCharacter;
  if ('activeRoom' in data) patch.activeRoom = data.activeRoom;
  return patch;
}

function toInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Math.trunc(Number(value));
  }
  return null;
}

const LEVEL_ORDER: string[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Level gate. A user without an explicit `user-profile.level` is treated as
 * 'A1' — matches the seed default for most shop items, so new kids can buy
 * entry-level items without needing a placement test. Higher-tier items
 * stay gated until the user explicitly levels up.
 */
function levelMeets(userLevel: string | null | undefined, required: string | null | undefined): boolean {
  if (!required) return true;
  const u = LEVEL_ORDER.indexOf((userLevel && LEVEL_ORDER.includes(userLevel)) ? userLevel : 'A1');
  const r = LEVEL_ORDER.indexOf(required);
  if (u < 0 || r < 0) return true;
  return u >= r;
}

export default {
  async findMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    const inventory = await getOrCreateInventory(strapi, profileId);
    return { data: inventory };
  },

  async updateMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    const inventory = await getOrCreateInventory(strapi, profileId);
    const patch = pickPatchableFields(ctx.request.body);

    // Equipped-subset-of-owned check uses the *post-patch* owned set so a
    // client can legitimately purchase + equip in the same call.
    const incomingOwnedSlugs: string[] | null = Array.isArray(patch.ownedShopItems)
      ? (patch.ownedShopItems as any[])
          .map((i: any) => (typeof i === 'string' ? i : i?.slug))
          .filter((s): s is string => typeof s === 'string' && s.length > 0)
      : null;

    const effectiveOwned = new Set<string>(
      incomingOwnedSlugs ??
        ((inventory as any).ownedShopItems ?? []).map((i: any) => i.slug),
    );

    if (Array.isArray(patch.equippedItems)) {
      const incomingSlugs = (patch.equippedItems as any[]).map((i: any) =>
        typeof i === 'string' ? i : i?.slug,
      );
      const bad = incomingSlugs.filter((s: string) => !effectiveOwned.has(s));
      if (bad.length) {
        return ctx.badRequest(`equippedItems must be subset of owned: ${bad.join(',')}`);
      }
      patch.equippedItems = await slugsToDocIds(strapi, SHOP_ITEM_UID, incomingSlugs);
    }

    if (Array.isArray(patch.ownedShopItems)) {
      patch.ownedShopItems = await slugsToDocIds(strapi, SHOP_ITEM_UID, patch.ownedShopItems);
    }

    // activeCharacter / activeRoom — translate slug → docId after checking
    // the caller already has it in ownedCharacters / unlockedRooms.
    if ('activeCharacter' in patch) {
      const raw = patch.activeCharacter;
      if (raw === null) {
        patch.activeCharacter = null;
      } else {
        const slug = typeof raw === 'string' ? raw : (raw as any)?.slug;
        if (typeof slug !== 'string' || !slug) {
          return ctx.badRequest('activeCharacter must be a slug string or null');
        }
        const owned = ((inventory as any).ownedCharacters ?? []).map((c: any) => c.slug);
        if (!owned.includes(slug)) {
          return ctx.badRequest(`activeCharacter '${slug}' not in ownedCharacters`);
        }
        const docId = await findDocIdBySlug(strapi, CHARACTER_UID, slug);
        if (!docId) return ctx.badRequest(`unknown character: ${slug}`);
        patch.activeCharacter = docId;
      }
    }

    if ('activeRoom' in patch) {
      const raw = patch.activeRoom;
      if (raw === null) {
        patch.activeRoom = null;
      } else {
        const slug = typeof raw === 'string' ? raw : (raw as any)?.slug;
        if (typeof slug !== 'string' || !slug) {
          return ctx.badRequest('activeRoom must be a slug string or null');
        }
        const unlocked = ((inventory as any).unlockedRooms ?? []).map((r: any) => r.slug);
        if (!unlocked.includes(slug)) {
          return ctx.badRequest(`activeRoom '${slug}' not in unlockedRooms`);
        }
        const docId = await findDocIdBySlug(strapi, ROOM_UID, slug);
        if (!docId) return ctx.badRequest(`unknown room: ${slug}`);
        patch.activeRoom = docId;
      }
    }

    await strapi.documents(INVENTORY_UID).update({
      documentId: (inventory as any).documentId,
      data: patch,
    });

    const fresh = await strapi.documents(INVENTORY_UID).findOne({
      documentId: (inventory as any).documentId,
      populate: POPULATE,
    });
    return { data: fresh };
  },

  async purchaseCharacter(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    const kp = await callerKidsProfile(strapi, profileId);
    if (!kp) return ctx.forbidden('not a kid');

    const body = ctx.request.body ?? {};
    const data = body?.data ?? body;
    const slug = typeof data?.slug === 'string' ? data.slug : null;
    if (!slug) return ctx.badRequest('slug required');

    const [character] = await strapi.documents(CHARACTER_UID).findMany({
      filters: { slug: { $eq: slug } },
      limit: 1,
    });
    if (!character) return ctx.notFound(`character '${slug}' not found`);

    const inventory = await getOrCreateInventory(strapi, profileId);
    const owned = ((inventory as any).ownedCharacters ?? []).map((c: any) => c.slug);
    if (owned.includes(slug)) return ctx.conflict('already owned');

    const price = toInt((character as any).priceCoins) ?? 0;
    const balance = toInt((kp as any).totalCoins) ?? 0;
    if (balance < price) return ctx.badRequest('insufficient coins');

    // Order: append ownership first, then debit coins. If coin debit fails
    // after ownership append, we compensate by reverting ownership so the
    // user isn't left paying for nothing. The opposite order would risk
    // losing coins without granting the character.
    const nextOwnedDocIds = [
      ...((inventory as any).ownedCharacters ?? []).map((c: any) => c.documentId),
      (character as any).documentId,
    ];
    await strapi.documents(INVENTORY_UID).update({
      documentId: (inventory as any).documentId,
      data: { ownedCharacters: nextOwnedDocIds },
    });

    try {
      await strapi.documents(KIDS_PROFILE_UID).update({
        documentId: (kp as any).documentId,
        data: { totalCoins: balance - price },
      });
    } catch (err) {
      await strapi.documents(INVENTORY_UID).update({
        documentId: (inventory as any).documentId,
        data: {
          ownedCharacters: ((inventory as any).ownedCharacters ?? []).map((c: any) => c.documentId),
        },
      });
      throw err;
    }

    const fresh = await strapi.documents(INVENTORY_UID).findOne({
      documentId: (inventory as any).documentId,
      populate: POPULATE,
    });
    return { data: fresh };
  },

  async unlockRoom(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    const kp = await callerKidsProfile(strapi, profileId);
    if (!kp) return ctx.forbidden('not a kid');

    const body = ctx.request.body ?? {};
    const data = body?.data ?? body;
    const slug = typeof data?.slug === 'string' ? data.slug : null;
    if (!slug) return ctx.badRequest('slug required');

    const [room] = await strapi.documents(ROOM_UID).findMany({
      filters: { slug: { $eq: slug } },
      limit: 1,
    });
    if (!room) return ctx.notFound(`room '${slug}' not found`);

    const inventory = await getOrCreateInventory(strapi, profileId);
    const unlocked = ((inventory as any).unlockedRooms ?? []).map((r: any) => r.slug);
    if (unlocked.includes(slug)) return ctx.conflict('already unlocked');

    const price = toInt((room as any).coinsRequired) ?? 0;
    const balance = toInt((kp as any).totalCoins) ?? 0;
    if (balance < price) return ctx.badRequest('insufficient coins');

    const nextUnlockedDocIds = [
      ...((inventory as any).unlockedRooms ?? []).map((r: any) => r.documentId),
      (room as any).documentId,
    ];
    await strapi.documents(INVENTORY_UID).update({
      documentId: (inventory as any).documentId,
      data: { unlockedRooms: nextUnlockedDocIds },
    });

    try {
      if (price > 0) {
        await strapi.documents(KIDS_PROFILE_UID).update({
          documentId: (kp as any).documentId,
          data: { totalCoins: balance - price },
        });
      }
    } catch (err) {
      await strapi.documents(INVENTORY_UID).update({
        documentId: (inventory as any).documentId,
        data: {
          unlockedRooms: ((inventory as any).unlockedRooms ?? []).map((r: any) => r.documentId),
        },
      });
      throw err;
    }

    const fresh = await strapi.documents(INVENTORY_UID).findOne({
      documentId: (inventory as any).documentId,
      populate: POPULATE,
    });
    return { data: fresh };
  },

  /**
   * Purchase a shop-item for the caller. Validates level gate + coin
   * balance, then uses the same compensating-cleanup order as character
   * purchase: append ownership → debit coins → revert ownership on debit
   * failure. Idempotent at the boundary (already-owned → 409).
   */
  async purchaseShopItem(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const profile = await callerProfileWithLevel(strapi, user.id);
    if (!profile) return ctx.forbidden('no user-profile');

    const kp = await callerKidsProfile(strapi, profile.documentId);
    if (!kp) return ctx.forbidden('not a kid');

    const body = ctx.request.body ?? {};
    const data = body?.data ?? body;
    const slug = typeof data?.slug === 'string' ? data.slug : null;
    if (!slug) return ctx.badRequest('slug required');

    const [item] = await strapi.documents(SHOP_ITEM_UID).findMany({
      filters: { slug: { $eq: slug } },
      limit: 1,
    });
    if (!item) return ctx.notFound(`shop-item '${slug}' not found`);

    if (!levelMeets(profile.level, (item as any).levelRequired)) {
      return ctx.badRequest(`level ${profile.level ?? 'A1'} below required ${(item as any).levelRequired}`);
    }

    const inventory = await getOrCreateInventory(strapi, profile.documentId);
    const ownedSlugs = ((inventory as any).ownedShopItems ?? []).map((i: any) => i.slug);
    if (ownedSlugs.includes(slug)) return ctx.conflict('already owned');

    const price = toInt((item as any).price) ?? 0;
    const balance = toInt((kp as any).totalCoins) ?? 0;
    if (balance < price) return ctx.badRequest('insufficient coins');

    const prevOwnedDocIds = ((inventory as any).ownedShopItems ?? []).map((i: any) => i.documentId);
    const nextOwnedDocIds = [...prevOwnedDocIds, (item as any).documentId];

    await strapi.documents(INVENTORY_UID).update({
      documentId: (inventory as any).documentId,
      data: { ownedShopItems: nextOwnedDocIds },
    });

    try {
      if (price > 0) {
        await strapi.documents(KIDS_PROFILE_UID).update({
          documentId: (kp as any).documentId,
          data: { totalCoins: balance - price },
        });
      }
    } catch (err) {
      await strapi.documents(INVENTORY_UID).update({
        documentId: (inventory as any).documentId,
        data: { ownedShopItems: prevOwnedDocIds },
      });
      throw err;
    }

    const fresh = await strapi.documents(INVENTORY_UID).findOne({
      documentId: (inventory as any).documentId,
      populate: POPULATE,
    });
    return { data: fresh };
  },

  /**
   * Equip or unequip a single shop-item. Body: { slug, equip: boolean }.
   * Equip requires the item to be in `ownedShopItems`. Idempotent — no-op
   * if already in the requested state.
   */
  async equipShopItem(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const profileId = await callerProfileId(strapi, user.id);
    if (!profileId) return ctx.forbidden('no user-profile');

    const body = ctx.request.body ?? {};
    const data = body?.data ?? body;
    const slug = typeof data?.slug === 'string' ? data.slug : null;
    const equip = typeof data?.equip === 'boolean' ? data.equip : null;
    if (!slug) return ctx.badRequest('slug required');
    if (equip === null) return ctx.badRequest('equip (boolean) required');

    const inventory = await getOrCreateInventory(strapi, profileId);
    const ownedSlugs = ((inventory as any).ownedShopItems ?? []).map((i: any) => i.slug);
    const currentEquippedDocIds: string[] = ((inventory as any).equippedItems ?? []).map(
      (i: any) => i.documentId,
    );
    const currentEquippedSlugs: string[] = ((inventory as any).equippedItems ?? []).map(
      (i: any) => i.slug,
    );

    if (equip && !ownedSlugs.includes(slug)) {
      return ctx.badRequest(`'${slug}' not in ownedShopItems`);
    }

    const isCurrentlyEquipped = currentEquippedSlugs.includes(slug);
    if (equip === isCurrentlyEquipped) {
      return { data: inventory };
    }

    let nextEquippedDocIds: string[];
    if (equip) {
      const itemDocId = ((inventory as any).ownedShopItems ?? []).find(
        (i: any) => i.slug === slug,
      )?.documentId;
      if (!itemDocId) return ctx.badRequest(`'${slug}' documentId not resolvable`);
      nextEquippedDocIds = [...currentEquippedDocIds, itemDocId];
    } else {
      const targetDocId = ((inventory as any).equippedItems ?? []).find(
        (i: any) => i.slug === slug,
      )?.documentId;
      nextEquippedDocIds = currentEquippedDocIds.filter((id) => id !== targetDocId);
    }

    await strapi.documents(INVENTORY_UID).update({
      documentId: (inventory as any).documentId,
      data: { equippedItems: nextEquippedDocIds },
    });

    const fresh = await strapi.documents(INVENTORY_UID).findOne({
      documentId: (inventory as any).documentId,
      populate: POPULATE,
    });
    return { data: fresh };
  },
};
