/**
 * Seed: default organization.
 *
 * Creates the tenant row every other entity links to. Idempotent via unique slug.
 */
const ORG_UID = 'api::organization.organization';

export async function up(strapi: any) {
  const slug = process.env.SEED_DEFAULT_ORG_SLUG || 'englishbest';
  const name = process.env.SEED_DEFAULT_ORG_NAME || 'English Best';

  const existing = await strapi.documents(ORG_UID).findMany({
    filters: { slug },
    limit: 1,
  });
  if (existing.length > 0) return;

  await strapi.documents(ORG_UID).create({
    data: {
      name,
      slug,
      locale: 'uk',
      timezone: 'Europe/Kyiv',
      status: 'active',
    },
  });
  strapi.log.info(`[seed] created organization: ${slug}`);
}
