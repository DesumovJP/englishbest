/**
 * Custom `/kids-profile/me` routes.
 *
 * Kept separate from the factory router so the core CRUD endpoints stay
 * intact (admin UI relies on them). `/me` is self-scoped and used by the
 * Kids Zone client to read/update coins/xp/streak/mood without needing a
 * documentId round-trip.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/kids-profile/me',
      handler: 'api::kids-profile.kids-profile.findMe',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'PATCH',
      path: '/kids-profile/me',
      handler: 'api::kids-profile.kids-profile.updateMe',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
