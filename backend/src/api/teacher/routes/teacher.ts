export default {
  routes: [
    {
      method: 'GET',
      path: '/teacher/me/students',
      handler: 'api::teacher.teacher.students',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
