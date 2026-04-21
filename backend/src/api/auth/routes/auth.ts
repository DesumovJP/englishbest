export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/register',
      handler: 'api::auth.auth.register',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'api::auth.auth.login',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/refresh',
      handler: 'api::auth.auth.refresh',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/logout',
      handler: 'api::auth.auth.logout',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/logout-all',
      handler: 'api::auth.auth.logoutAll',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: 'api::auth.auth.me',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
