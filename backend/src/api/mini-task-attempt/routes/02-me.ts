/**
 * Custom `/mini-task-attempts/me` routes.
 *
 * Students submit + read their own attempts via these self-scoped endpoints
 * so the BE can auto-grade, deduplicate first-attempt coin awards, and never
 * trust a client-supplied `user` relation.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/mini-task-attempts/me',
      handler: 'api::mini-task-attempt.mini-task-attempt.submitMine',
      config: { policies: ['global::is-authenticated'] },
    },
    {
      method: 'GET',
      path: '/mini-task-attempts/me',
      handler: 'api::mini-task-attempt.mini-task-attempt.findMine',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
