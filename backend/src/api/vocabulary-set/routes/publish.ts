/**
 * Custom publish/unpublish routes for vocabulary-set (owner-scoped via
 * controller). Strapi v5 auto-loads all .ts files in routes/; coexists
 * with createCoreRouter.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/vocabulary-sets/:id/publish',
      handler: 'api::vocabulary-set.vocabulary-set.publish',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/vocabulary-sets/:id/unpublish',
      handler: 'api::vocabulary-set.vocabulary-set.unpublish',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/vocabulary-sets/:id/submit',
      handler: 'api::vocabulary-set.vocabulary-set.submit',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/vocabulary-sets/:id/approve',
      handler: 'api::vocabulary-set.vocabulary-set.approve',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/vocabulary-sets/:id/reject',
      handler: 'api::vocabulary-set.vocabulary-set.reject',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
