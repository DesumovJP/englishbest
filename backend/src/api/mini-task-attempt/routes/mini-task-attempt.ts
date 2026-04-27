import { factories } from '@strapi/strapi';

// Block the factory `create` route entirely — students must POST through
// /mini-task-attempts/me (custom route in 02-me.ts) so the BE derives the
// caller's userId from the auth session and never trusts a client-supplied
// `user` relation. Same pattern as `reward-event`.
export default factories.createCoreRouter('api::mini-task-attempt.mini-task-attempt', {
  only: ['find', 'findOne', 'update', 'delete'],
});
