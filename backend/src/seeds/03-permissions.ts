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
  // Auth /me + logout-all (policy-gated; users-permissions plugin still
  // requires the role to hold the permission before policies run).
  { action: 'api::auth.auth.me', roles: AUTH_ALL },
  { action: 'api::auth.auth.logoutAll', roles: AUTH_ALL },

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

  // Homework-submission (scoped controller: student own, teacher assignees, parent kids, admin all)
  { action: 'api::homework-submission.homework-submission.find', roles: AUTH_ALL },
  { action: 'api::homework-submission.homework-submission.findOne', roles: AUTH_ALL },
  { action: 'api::homework-submission.homework-submission.update', roles: AUTH_ALL },
  { action: 'api::homework-submission.homework-submission.create', roles: ADMIN },
  { action: 'api::homework-submission.homework-submission.delete', roles: ADMIN },

  // Vocabulary sets — public read (matches course/lesson); writes only
  // via seed / admin panel. Was AUTH_ALL but the FE fetches without auth
  // headers (same pattern as the library catalog), so anonymous reads
  // were 401-ing → empty section.
  { action: 'api::vocabulary-set.vocabulary-set.find', roles: PUBLIC_ALL },
  { action: 'api::vocabulary-set.vocabulary-set.findOne', roles: PUBLIC_ALL },

  // Mini-task (auth read, teacher write)
  { action: 'api::mini-task.mini-task.find', roles: AUTH_ALL },
  { action: 'api::mini-task.mini-task.findOne', roles: AUTH_ALL },
  { action: 'api::mini-task.mini-task.create', roles: STAFF },
  { action: 'api::mini-task.mini-task.update', roles: STAFF },
  { action: 'api::mini-task.mini-task.delete', roles: STAFF },

  // Reward event (audit ledger)
  //   - find / findOne — scoped inside controller: admin all, parent own
  //     kids, everyone else own. Writes happen exclusively from
  //     `lib/rewards.ts` server-side; no public create/update/delete.
  //   - grant — teacher/admin only (controller enforces role); awards
  //     bonus coins+XP to a student through the central rewards service.
  { action: 'api::reward-event.reward-event.find', roles: AUTH_ALL },
  { action: 'api::reward-event.reward-event.findOne', roles: AUTH_ALL },
  { action: 'api::reward-event.reward-event.grant', roles: STAFF },
  { action: 'api::reward-event.reward-event.motivationSummary', roles: AUTH_ALL },
  { action: 'api::reward-event.reward-event.weeklySummary', roles: AUTH_ALL },

  // Mini-task attempt
  //   - find / findOne — scoping inside controller (admin all, teacher own
  //     authored tasks, parent own kids, student own).
  //   - submitMine / findMine — self-scoped /me endpoints; controller reads
  //     `user-profile` from auth and never trusts client `user`.
  //   - update — teacher review (sets score + feedback) on attempts of own
  //     authored tasks; controller enforces ownership.
  //   - delete — admin only (audit trail; learners can't redact own attempts).
  { action: 'api::mini-task-attempt.mini-task-attempt.find', roles: AUTH_ALL },
  { action: 'api::mini-task-attempt.mini-task-attempt.findOne', roles: AUTH_ALL },
  { action: 'api::mini-task-attempt.mini-task-attempt.submitMine', roles: AUTH_ALL },
  { action: 'api::mini-task-attempt.mini-task-attempt.findMine', roles: AUTH_ALL },
  { action: 'api::mini-task-attempt.mini-task-attempt.update', roles: STAFF },
  { action: 'api::mini-task-attempt.mini-task-attempt.delete', roles: ADMIN },

  // Thread + Message (scoped controllers: participants only)
  { action: 'api::thread.thread.find', roles: AUTH_ALL },
  { action: 'api::thread.thread.findOne', roles: AUTH_ALL },
  { action: 'api::thread.thread.create', roles: STAFF },
  { action: 'api::thread.thread.update', roles: AUTH_ALL },
  { action: 'api::thread.thread.delete', roles: ADMIN },

  { action: 'api::message.message.find', roles: AUTH_ALL },
  { action: 'api::message.message.findOne', roles: AUTH_ALL },
  { action: 'api::message.message.create', roles: AUTH_ALL },
  { action: 'api::message.message.update', roles: AUTH_ALL },
  { action: 'api::message.message.delete', roles: AUTH_ALL },
  { action: 'api::message.message.broadcast', roles: STAFF },

  // Lesson-payment (scoped controller: teacher reads own; admin writes)
  { action: 'api::lesson-payment.lesson-payment.find', roles: AUTH_ALL },
  { action: 'api::lesson-payment.lesson-payment.findOne', roles: AUTH_ALL },
  { action: 'api::lesson-payment.lesson-payment.create', roles: ADMIN },
  { action: 'api::lesson-payment.lesson-payment.update', roles: ADMIN },
  { action: 'api::lesson-payment.lesson-payment.delete', roles: ADMIN },

  // Teacher-payout (scoped controller: teacher reads own; admin writes)
  { action: 'api::teacher-payout.teacher-payout.find', roles: AUTH_ALL },
  { action: 'api::teacher-payout.teacher-payout.findOne', roles: AUTH_ALL },
  { action: 'api::teacher-payout.teacher-payout.create', roles: ADMIN },
  { action: 'api::teacher-payout.teacher-payout.update', roles: ADMIN },
  { action: 'api::teacher-payout.teacher-payout.delete', roles: ADMIN },

  // Attendance-record (scoped controller: teacher writes own sessions, parent reads kids, student reads own)
  { action: 'api::attendance-record.attendance-record.find', roles: AUTH_ALL },
  { action: 'api::attendance-record.attendance-record.findOne', roles: AUTH_ALL },
  { action: 'api::attendance-record.attendance-record.create', roles: STAFF },
  { action: 'api::attendance-record.attendance-record.update', roles: STAFF },
  { action: 'api::attendance-record.attendance-record.delete', roles: STAFF },

  // Group (scoped controller: teachers own, students members-only read)
  { action: 'api::group.group.find', roles: AUTH_ALL },
  { action: 'api::group.group.findOne', roles: AUTH_ALL },
  { action: 'api::group.group.create', roles: STAFF },
  { action: 'api::group.group.update', roles: STAFF },
  { action: 'api::group.group.delete', roles: STAFF },

  // Teacher-profile (public read, self-update via /me — stock update admin-only)
  { action: 'api::teacher-profile.teacher-profile.find', roles: PUBLIC_ALL },
  { action: 'api::teacher-profile.teacher-profile.findOne', roles: PUBLIC_ALL },
  { action: 'api::teacher-profile.teacher-profile.update', roles: ADMIN },
  { action: 'api::teacher-profile.teacher-profile.findMe', roles: AUTH_ALL },
  { action: 'api::teacher-profile.teacher-profile.updateMe', roles: AUTH_ALL },

  // Analytics (scoping inside controller — teacher sees own, admin sees platform)
  { action: 'api::analytics.analytics.teacher', roles: AUTH_ALL },
  { action: 'api::analytics.analytics.admin', roles: AUTH_ALL },

  // Parent /me aggregate (scoping inside controller — parent or admin only)
  { action: 'api::parent.parent.children', roles: AUTH_ALL },
  { action: 'api::parent.parent.child', roles: AUTH_ALL },

  // Teacher /me aggregate (scoping inside controller — teacher only)
  { action: 'api::teacher.teacher.students', roles: AUTH_ALL },

  // Admin platform aggregates (scoping inside controller — admin only)
  { action: 'api::admin.admin.students', roles: AUTH_ALL },

  // Lesson publish/unpublish (scoping inside controller — teacher owner or admin)
  { action: 'api::lesson.lesson.publish', roles: AUTH_ALL },
  { action: 'api::lesson.lesson.unpublish', roles: AUTH_ALL },

  // User-profile (self read/update via /me; admin full via stock)
  { action: 'api::user-profile.user-profile.findOne', roles: AUTH_ALL },
  { action: 'api::user-profile.user-profile.update', roles: AUTH_ALL },
  { action: 'api::user-profile.user-profile.findMe', roles: AUTH_ALL },
  { action: 'api::user-profile.user-profile.updateMe', roles: AUTH_ALL },

  // Kids-profile /me (custom scoped endpoints — controller 404s if caller isn't a kid)
  { action: 'api::kids-profile.kids-profile.findMe', roles: AUTH_ALL },
  { action: 'api::kids-profile.kids-profile.updateMe', roles: AUTH_ALL },

  // User-inventory /me (custom scoped endpoints — auto-create on first read)
  { action: 'api::user-inventory.user-inventory.findMe', roles: AUTH_ALL },
  { action: 'api::user-inventory.user-inventory.updateMe', roles: AUTH_ALL },
  { action: 'api::user-inventory.user-inventory.purchaseCharacter', roles: AUTH_ALL },
  { action: 'api::user-inventory.user-inventory.unlockRoom', roles: AUTH_ALL },
  { action: 'api::user-inventory.user-inventory.purchaseShopItem', roles: AUTH_ALL },
  { action: 'api::user-inventory.user-inventory.equipShopItem', roles: AUTH_ALL },
  { action: 'api::user-inventory.user-inventory.openLootBox', roles: AUTH_ALL },
  { action: 'api::user-inventory.user-inventory.selectRoomBackground', roles: AUTH_ALL },

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

  // Character catalog (public read, admin write)
  { action: 'api::character.character.find', roles: PUBLIC_ALL },
  { action: 'api::character.character.findOne', roles: PUBLIC_ALL },
  { action: 'api::character.character.create', roles: ADMIN },
  { action: 'api::character.character.update', roles: ADMIN },
  { action: 'api::character.character.delete', roles: ADMIN },

  // Room catalog (public read, admin write)
  { action: 'api::room.room.find', roles: PUBLIC_ALL },
  { action: 'api::room.room.findOne', roles: PUBLIC_ALL },
  { action: 'api::room.room.create', roles: ADMIN },
  { action: 'api::room.room.update', roles: ADMIN },
  { action: 'api::room.room.delete', roles: ADMIN },
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
