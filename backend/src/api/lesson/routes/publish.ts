/**
 * Custom publish/unpublish routes for lesson (owner-scoped via controller).
 * Strapi v5 auto-loads all .ts files in routes/; coexists with createCoreRouter.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/lessons/:id/publish',
      handler: 'api::lesson.lesson.publish',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/lessons/:id/unpublish',
      handler: 'api::lesson.lesson.unpublish',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/lessons/:id/submit',
      handler: 'api::lesson.lesson.submit',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/lessons/:id/approve',
      handler: 'api::lesson.lesson.approve',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/lessons/:id/reject',
      handler: 'api::lesson.lesson.reject',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
