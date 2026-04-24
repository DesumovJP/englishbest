export default {
  routes: [
    {
      method: 'GET',
      path: '/admin/students',
      handler: 'api::admin.admin.students',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
