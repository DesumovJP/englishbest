/**
 * Custom `/teacher-profile/me` routes.
 *
 * Kept separate from the factory router so the core CRUD endpoints stay
 * intact (admin UI relies on them). `/me` is self-scoped and used by the
 * teacher dashboard profile page to read / self-update editable fields.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/teacher-profile/me',
      handler: 'api::teacher-profile.teacher-profile.findMe',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'PATCH',
      path: '/teacher-profile/me',
      handler: 'api::teacher-profile.teacher-profile.updateMe',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
