/**
 * Seed: users-permissions permissions per role.
 *
 * Declarative matrix: each route action (e.g. `api::course.course.find`) is
 * granted to one or more role types. Idempotent — existing permission rows
 * are skipped.
 *
 * Role types referenced:
 *   - public         (anonymous requests, stock Strapi role)
 *   - authenticated  (stock Strapi role — unused here; we route everyone
 *                     to one of the five app roles below)
 *   - kids | adult | teacher | parent | admin  (seeded by 00-roles)
 *
 * Per-user / tenant / owner scoping is NOT done here — that lives in the
 * policies attached to custom routes and in controller overrides. This seed
 * only governs which role may hit which endpoint *at all*.
 */
type RoleType = 'public' | 'kids' | 'adult' | 'teacher' | 'parent' | 'admin';

interface Grant {
  action: string;
  roles: RoleType[];
}

const PUBLIC_ALL: RoleType[] = ['public', 'kids', 'adult', 'teacher', 'parent', 'admin'];
const AUTH_ALL: RoleType[] = ['kids', 'adult', 'teacher', 'parent', 'admin'];
const STAFF: RoleType[] = ['teacher', 'admin'];
const ADMIN: RoleType[] = ['admin'];
const LEARNERS: RoleType[] = ['kids', 'adult', 'admin'];

const GRANTS: Grant[] = [
  // Course (public catalog, staff write)
  { action: 'api::course.course.find', roles: PUBLIC_ALL },
  { action: 'api::course.course.findOne', roles: PUBLIC_ALL },
  { action: 'api::course.course.create', roles: STAFF },
  { action: 'api::course.course.update', roles: STAFF },
  { action: 'api::course.course.delete', roles: ADMIN },

  // Lesson (public catalog, staff write)
  { action: 'api::lesson.lesson.find', roles: PUBLIC_ALL },
  { action: 'api::lesson.lesson.findOne', roles: PUBLIC_ALL },
  { action: 'api::lesson.lesson.create', roles: STAFF },
  { action: 'api::lesson.lesson.update', roles: STAFF },
  { action: 'api::lesson.lesson.delete', roles: STAFF },

  // Session (auth'd read, staff write)
  { action: 'api::session.session.find', roles: AUTH_ALL },
  { action: 'api::session.session.findOne', roles: AUTH_ALL },
  { action: 'api::session.session.create', roles: STAFF },
  { action: 'api::session.session.update', roles: STAFF },
  { action: 'api::session.session.delete', roles: STAFF },

  // User-progress (learners R/W own, staff read)
  { action: 'api::user-progress.user-progress.find', roles: AUTH_ALL },
  { action: 'api::user-progress.user-progress.findOne', roles: AUTH_ALL },
  { action: 'api::user-progress.user-progress.create', roles: LEARNERS },
  { action: 'api::user-progress.user-progress.update', roles: LEARNERS },

  // Achievement catalog (public read, admin write)
  { action: 'api::achievement.achievement.find', roles: PUBLIC_ALL },
  { action: 'api::achievement.achievement.findOne', roles: PUBLIC_ALL },
  { action: 'api::achievement.achievement.create', roles: ADMIN },
  { action: 'api::achievement.achievement.update', roles: ADMIN },
  { action: 'api::achievement.achievement.delete', roles: ADMIN },

  // User-achievement (auth read, admin/system write)
  { action: 'api::user-achievement.user-achievement.find', roles: AUTH_ALL },
  { action: 'api::user-achievement.user-achievement.findOne', roles: AUTH_ALL },
  { action: 'api::user-achievement.user-achievement.create', roles: ADMIN },

  // Review (public read, learner write, owner-scoped update)
  { action: 'api::review.review.find', roles: PUBLIC_ALL },
  { action: 'api::review.review.findOne', roles: PUBLIC_ALL },
  { action: 'api::review.review.create', roles: ['adult', 'parent', 'teacher', 'admin'] },
  { action: 'api::review.review.update', roles: ['adult', 'parent', 'teacher', 'admin'] },
  { action: 'api::review.review.delete', roles: ADMIN },

  // Shop-item (public read, admin write)
  { action: 'api::shop-item.shop-item.find', roles: PUBLIC_ALL },
  { action: 'api::shop-item.shop-item.findOne', roles: PUBLIC_ALL },
  { action: 'api::shop-item.shop-item.create', roles: ADMIN },
  { action: 'api::shop-item.shop-item.update', roles: ADMIN },
  { action: 'api::shop-item.shop-item.delete', roles: ADMIN },

  // Homework (auth read, teacher write)
  { action: 'api::homework.homework.find', roles: AUTH_ALL },
  { action: 'api::homework.homework.findOne', roles: AUTH_ALL },
  { action: 'api::homework.homework.create', roles: STAFF },
  { action: 'api::homework.homework.update', roles: STAFF },
  { action: 'api::homework.homework.delete', roles: STAFF },

  // Mini-task (auth read, teacher write)
  { action: 'api::mini-task.mini-task.find', roles: AUTH_ALL },
  { action: 'api::mini-task.mini-task.findOne', roles: AUTH_ALL },
  { action: 'api::mini-task.mini-task.create', roles: STAFF },
  { action: 'api::mini-task.mini-task.update', roles: STAFF },
  { action: 'api::mini-task.mini-task.delete', roles: STAFF },

  // Teacher-profile (public read, self-update via Phase 4 auth flow)
  { action: 'api::teacher-profile.teacher-profile.find', roles: PUBLIC_ALL },
  { action: 'api::teacher-profile.teacher-profile.findOne', roles: PUBLIC_ALL },
  { action: 'api::teacher-profile.teacher-profile.update', roles: STAFF },

  // User-profile (self read/update; admin full)
  { action: 'api::user-profile.user-profile.findOne', roles: AUTH_ALL },
  { action: 'api::user-profile.user-profile.update', roles: AUTH_ALL },

  // Organization (auth read, admin write)
  { action: 'api::organization.organization.findOne', roles: AUTH_ALL },
  { action: 'api::organization.organization.update', roles: ADMIN },

  // Consent-log (learner write — append-only; admin read)
  { action: 'api::consent-log.consent-log.create', roles: AUTH_ALL },
  { action: 'api::consent-log.consent-log.find', roles: ADMIN },
  { action: 'api::consent-log.consent-log.findOne', roles: ADMIN },

  // Audit-log (admin-only)
  { action: 'api::audit-log.audit-log.find', roles: ADMIN },
  { action: 'api::audit-log.audit-log.findOne', roles: ADMIN },
];

const ROLE_UID = 'plugin::users-permissions.role';
const PERMISSION_UID = 'plugin::users-permissions.permission';

export async function up(strapi: any) {
  const roleByType = new Map<string, number>();
  for (const type of ['public', 'authenticated', 'kids', 'adult', 'teacher', 'parent', 'admin']) {
    const role = await strapi.db.query(ROLE_UID).findOne({ where: { type } });
    if (role) roleByType.set(type, role.id);
  }

  let created = 0;
  let skipped = 0;
  for (const { action, roles } of GRANTS) {
    for (const roleType of roles) {
      const roleId = roleByType.get(roleType);
      if (!roleId) {
        strapi.log.warn(`[seed] permissions: role '${roleType}' missing — skipping ${action}`);
        continue;
      }
      const existing = await strapi.db
        .query(PERMISSION_UID)
        .findOne({ where: { action, role: roleId } });
      if (existing) {
        skipped++;
        continue;
      }
      await strapi.db.query(PERMISSION_UID).create({
        data: { action, role: roleId },
      });
      created++;
    }
  }
  strapi.log.info(`[seed] permissions: ${created} created, ${skipped} already present`);
}
