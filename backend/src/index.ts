import type { Core } from '@strapi/strapi';
import { runSeeds } from './seeds';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await runSeeds(strapi);
  },
};
