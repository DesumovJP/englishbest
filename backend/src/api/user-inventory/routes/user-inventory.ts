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
  ],
};
