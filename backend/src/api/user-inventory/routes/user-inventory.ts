/**
 * user-inventory routes.
 *
 * Only exposes `/me` endpoints — no public list/find by id. Callers always
 * operate on their own inventory; staff use the profile-scoped admin UI.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/user-inventory/me',
      handler: 'api::user-inventory.user-inventory.findMe',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'PATCH',
      path: '/user-inventory/me',
      handler: 'api::user-inventory.user-inventory.updateMe',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/user-inventory/me/purchase-character',
      handler: 'api::user-inventory.user-inventory.purchaseCharacter',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/user-inventory/me/unlock-room',
      handler: 'api::user-inventory.user-inventory.unlockRoom',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/user-inventory/me/purchase-shop-item',
      handler: 'api::user-inventory.user-inventory.purchaseShopItem',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/user-inventory/me/equip',
      handler: 'api::user-inventory.user-inventory.equipShopItem',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/user-inventory/me/open-loot-box',
      handler: 'api::user-inventory.user-inventory.openLootBox',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/user-inventory/me/select-room-background',
      handler: 'api::user-inventory.user-inventory.selectRoomBackground',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
