/**
 * Custom publish/unpublish routes for course (admin/teacher-scoped via controller).
 * Strapi v5 auto-loads all .ts files in routes/; coexists with createCoreRouter.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/courses/:id/publish',
      handler: 'api::course.course.publish',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/courses/:id/unpublish',
      handler: 'api::course.course.unpublish',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/courses/:id/submit',
      handler: 'api::course.course.submit',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/courses/:id/approve',
      handler: 'api::course.course.approve',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'POST',
      path: '/courses/:id/reject',
      handler: 'api::course.course.reject',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
