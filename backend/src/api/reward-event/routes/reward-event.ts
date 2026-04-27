import { factories } from '@strapi/strapi';

// Read-only API for reward-event. Writes happen exclusively through
// `lib/rewards.ts` (server-internal); no public create/update/delete.
export default factories.createCoreRouter('api::reward-event.reward-event', {
  only: ['find', 'findOne'],
});
