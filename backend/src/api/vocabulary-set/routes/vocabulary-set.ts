import { factories } from '@strapi/strapi';

// Public read-only API for vocabulary sets. Mutations happen exclusively
// from seeds + admin panel; no public create/update/delete.
export default factories.createCoreRouter('api::vocabulary-set.vocabulary-set' as any, {
  only: ['find', 'findOne'],
});
