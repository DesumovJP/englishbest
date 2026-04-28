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
  ],
};
