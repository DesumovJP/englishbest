/**
 * Seed: bootstrap admin.
 *
 * Creates a users-permissions User with role=Admin, its User-profile (role=admin),
 * and an Admin-profile. Skipped if `SEED_BOOTSTRAP_ADMIN_EMAIL` / `_PASSWORD`
 * are not provided. Idempotent by email lookup.
 *
 * Uses `strapi.db.query()` rather than `strapi.documents()` because the target
 * content-types are non-D&P / non-localized and the Documents API tries to
 * round-trip lookups by documentId+locale after create, which fails on
 * freshly-inserted rows with locale columns set to user-defined values.
 */
const USER_UID = 'plugin::users-permissions.user';
const ROLE_UID = 'plugin::users-permissions.role';
const ORG_UID = 'api::organization.organization';
const PROFILE_UID = 'api::user-profile.user-profile';
const ADMIN_PROFILE_UID = 'api::admin-profile.admin-profile';

export async function up(strapi: any) {
  const email = process.env.SEED_BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.SEED_BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !password) {
    strapi.log.info(
      '[seed] bootstrap admin skipped (SEED_BOOTSTRAP_ADMIN_EMAIL/PASSWORD not set)'
    );
    return;
  }

  const existingUser = await strapi.db.query(USER_UID).findOne({ where: { email } });
  if (existingUser) {
    strapi.log.info(`[seed] bootstrap admin already exists: ${email}`);
    return;
  }

  const adminRole = await strapi.db
    .query(ROLE_UID)
    .findOne({ where: { type: 'admin' } });
  if (!adminRole) {
    strapi.log.error(
      '[seed] cannot bootstrap admin — role `admin` missing (run 00-roles first)'
    );
    return;
  }

  const [org] = await strapi.db.query(ORG_UID).findMany({ limit: 1 });
  if (!org) {
    strapi.log.error(
      '[seed] cannot bootstrap admin — no organization found (run 01-organizations first)'
    );
    return;
  }

  const user = await strapi
    .plugin('users-permissions')
    .service('user')
    .add({
      email,
      username: email,
      password,
      confirmed: true,
      blocked: false,
      role: adminRole.id,
      provider: 'local',
    });

  const profile = await strapi.db.query(PROFILE_UID).create({
    data: {
      user: user.id,
      organization: org.id,
      role: 'admin',
      firstName: process.env.SEED_BOOTSTRAP_ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.SEED_BOOTSTRAP_ADMIN_LAST_NAME || 'User',
      locale: 'uk',
      timezone: 'Europe/Kyiv',
      status: 'active',
    },
  });

  await strapi.db.query(ADMIN_PROFILE_UID).create({
    data: {
      user: profile.id,
      permissions: { 'admin.god': true },
      twoFactorEnabled: false,
    },
  });

  strapi.log.info(`[seed] bootstrapped admin: ${email}`);
}
