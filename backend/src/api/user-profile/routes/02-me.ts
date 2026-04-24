/**
 * Custom `/user-profile/me` routes.
 *
 * Kept separate from the factory router so the core CRUD endpoints stay
 * intact (admin UI relies on them). `/me` is self-scoped and used by the
 * dashboard profile page to read / self-update editable fields for any
 * authenticated role.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/user-profile/me',
      handler: 'api::user-profile.user-profile.findMe',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'PATCH',
      path: '/user-profile/me',
      handler: 'api::user-profile.user-profile.updateMe',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
