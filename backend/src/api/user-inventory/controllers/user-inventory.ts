/**
 * user-inventory controller.
 *
 * Two endpoints only:
 *   GET  /api/user-inventory/me    → own inventory (auto-creates on first read)
 *   PATCH /api/user-inventory/me   → partial update of own inventory
 *
 * Client-writable fields:
 *   outfit, placedItems, equippedItems, ownedShopItems, seedVersion
 * `equippedItems` must be a subset of `ownedShopItems`; enforced below.
 * `ownedShopItems` is accepted as an interim write channel for Phase B —
 * Phase D will replace it with `POST /user-inventory/purchase` (server-side
 * coin deduction + level check). Until then the shop page writes the owned
 * set directly, same trust model as the old IndexedDB path.
 *
 * Relation fields (ownedShopItems, equippedItems) accept an array of slugs
 * on the wire and are translated to document ids before write.
 */
const INVENTORY_UID = 'api::user-inventory.user-inventory';
const PROFILE_UID = 'api::user-profile.user-profile';

const POPULATE: any = {
  user: { fields: ['documentId'] },
  ownedShopItems: { fields: ['slug'] },
  equippedItems: { fields: ['slug'] },
};

async function callerProfileId(strapi: any, userId: number | string): Promise<string | null> {
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

async function getOrCreateInventory(strapi: any, profileDocId: string) {
  const [existing] = await strapi.documents(INVENTORY_UID).findMany({
    filters: { user: { documentId: { $eq: profileDocId } } },
    populate: POPULATE,
    limit: 1,
  });
  if (existing) return existing;

  const created = await strapi.documents(INVENTORY_UID).create({
    data: {
      user: profileDocId,
      ownedShopItems: [],
      equippedItems: [],
      outfit: {},
      placedItems: [],
      seedVersion: 0,
    },
  });

  return strapi.documents(INVENTORY_UID).findOne({
    documentId: created.documentId,
    populate: POPULATE,
  });
}

function pickPatchableFields(body: any) {
  const data = body?.data ?? body ?? {};
  const patch: Record<string, unknown> = {};
  if ('outfit' in data) patch.outfit = data.outfit;
  if ('placedItems' in data) patch.placedItems = data.placedItems;
  if ('equippedItems' in data) patch.equippedItems = data.equippedItems;
  if ('ownedShopItems' in data) patch.ownedShopItems = data.ownedShopItems;
  if ('seedVersion' in data) patch.seedVersion = data.seedVersion;
  return patch;
}

async function slugsToDocIds(strapi: any, slugs: unknown): Promise<string[]> {
  if (!Array.isArray(slugs)) return [];
  const clean = slugs
    .map((s: any) => (typeof s === 'string' ? s : s?.slug))
    .filter((s): s is string => typeof s === 'string' && s.length > 0);
  if (clean.length === 0) return [];
  const items = await strapi.documents('api::shop-item.shop-item').findMany({
    filters: { slug: { $in: clean } },
    fields: ['documentId'],
  });
  return items.map((i: any) => i.documentId);
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

    // The equipped-subset-of-owned check uses the *post-patch* owned set: a
    // client may legitimately purchase + equip in the same call.
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
      patch.equippedItems = await slugsToDocIds(strapi, incomingSlugs);
    }

    if (Array.isArray(patch.ownedShopItems)) {
      patch.ownedShopItems = await slugsToDocIds(strapi, patch.ownedShopItems);
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
};
