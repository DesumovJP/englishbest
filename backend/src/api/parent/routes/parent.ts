export default {
  routes: [
    {
      method: 'GET',
      path: '/parent/me/children',
      handler: 'api::parent.parent.children',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/parent/me/children/:kidDocId',
      handler: 'api::parent.parent.child',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
