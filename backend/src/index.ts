import type { Core } from '@strapi/strapi';
import { runSeeds } from './seeds';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    const dbConfig = strapi.config.get('database') as any;
    const client = dbConfig?.connection?.client ?? 'UNKNOWN';
    strapi.log.info(`[boot] database client = ${client}`);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await runSeeds(strapi);
  },
};
