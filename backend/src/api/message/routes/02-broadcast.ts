/**
 * POST /messages/broadcast — teacher-only mass message.
 *
 * Separate from the factory router so core CRUD stays intact.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/messages/broadcast',
      handler: 'api::message.message.broadcast',
      config: { policies: ['global::is-authenticated'] },
    },
  ],
};
