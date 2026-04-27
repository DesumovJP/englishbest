import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::mini-task-attempt.mini-task-attempt', {
  // Disable factory `create` route — students go through POST /mini-task-attempts/me
  // (custom route, scoped to caller) so the BE can auto-grade and award coins.
  config: {
    create: { policies: ['admin::is-authenticated'] },
  },
});
