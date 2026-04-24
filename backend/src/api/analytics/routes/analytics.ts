export default {
  routes: [
    {
      method: 'GET',
      path: '/analytics/teacher',
      handler: 'api::analytics.analytics.teacher',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/analytics/admin',
      handler: 'api::analytics.analytics.admin',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
