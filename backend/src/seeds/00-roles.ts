/**
 * Seed: users-permissions roles.
 *
 * Ensures the 5 app-level roles referenced throughout the platform exist:
 * Kids, Adult, Teacher, Parent, Admin. The stock `Public` + `Authenticated`
 * roles are left untouched. Idempotent: re-runs are a no-op.
 */
const APP_ROLES = [
  { name: 'Kids', type: 'kids', description: 'Learner, age 2–12' },
  { name: 'Adult', type: 'adult', description: 'Adult learner' },
  {
    name: 'Teacher',
    type: 'teacher',
    description: 'Teaches groups, reviews submissions',
  },
  { name: 'Parent', type: 'parent', description: 'Parental oversight of a kid' },
  { name: 'Admin', type: 'admin', description: 'Platform administrator' },
];

export async function up(strapi: any) {
  for (const role of APP_ROLES) {
    const existing = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: role.type } });
    if (existing) continue;

    await strapi.query('plugin::users-permissions.role').create({ data: role });
    strapi.log.info(`[seed] created role: ${role.type}`);
  }
}
