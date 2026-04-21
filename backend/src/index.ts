import type { Core } from '@strapi/strapi';
import { runSeeds } from './seeds';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    const dbConfig = strapi.config.get('database') as any;
    const client = dbConfig?.connection?.client ?? 'UNKNOWN';
    strapi.log.info(`[boot] database client = ${client}`);

    const required = [
      'APP_KEYS',
      'API_TOKEN_SALT',
      'ADMIN_JWT_SECRET',
      'TRANSFER_TOKEN_SALT',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'DATABASE_URL',
    ];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      strapi.log.error(`[boot] missing required env vars: ${missing.join(', ')}`);
    } else {
      strapi.log.info('[boot] all required env vars present');
    }
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await runSeeds(strapi);
  },
};
