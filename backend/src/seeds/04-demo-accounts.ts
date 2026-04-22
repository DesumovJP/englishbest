/**
 * Seed: public demo accounts.
 *
 * Creates one user per app role (kids/adult/teacher/parent) with a
 * deterministic email + shared password so the login page can advertise
 * "try-it" credentials. Idempotent: skipped if the user already exists.
 *
 * Opt-in via `SEED_DEMO_ACCOUNTS=1` — never create these without an
 * explicit signal from the operator, since the password is published.
 */
const USER_UID = 'plugin::users-permissions.user';
const ROLE_UID = 'plugin::users-permissions.role';
const ORG_UID = 'api::organization.organization';
const PROFILE_UID = 'api::user-profile.user-profile';

type DemoAccount = {
  role: 'kids' | 'adult' | 'teacher' | 'parent';
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roleProfile: { uid: string; data: Record<string, unknown> };
};

const DEMO_PASSWORD = 'Demo2026!';

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'kids',
    email: 'demo-kids@englishbest.app',
    username: 'demo-kids',
    firstName: 'Dana',
    lastName: 'Demo',
    roleProfile: {
      uid: 'api::kids-profile.kids-profile',
      data: {
        companionAnimal: 'fox',
        companionName: 'Foxie',
        ageGroup: 'age7to11',
      },
    },
  },
  {
    role: 'adult',
    email: 'demo-adult@englishbest.app',
    username: 'demo-adult',
    firstName: 'Alex',
    lastName: 'Demo',
    roleProfile: {
      uid: 'api::adult-profile.adult-profile',
      data: {
        goal: 'travel',
        currentLevel: 'B1',
        targetLevel: 'B2',
      },
    },
  },
  {
    role: 'teacher',
    email: 'demo-teacher@englishbest.app',
    username: 'demo-teacher',
    firstName: 'Olena',
    lastName: 'Demo',
    roleProfile: {
      uid: 'api::teacher-profile.teacher-profile',
      data: {
        bio: 'Demo teacher account.',
        publicSlug: 'demo-teacher',
        yearsExperience: 5,
      },
    },
  },
  {
    role: 'parent',
    email: 'demo-parent@englishbest.app',
    username: 'demo-parent',
    firstName: 'Maria',
    lastName: 'Demo',
    roleProfile: {
      uid: 'api::parent-profile.parent-profile',
      data: {},
    },
  },
];

export async function up(strapi: any) {
  if (process.env.SEED_DEMO_ACCOUNTS !== '1') {
    strapi.log.info('[seed] demo accounts skipped (SEED_DEMO_ACCOUNTS !== "1")');
    return;
  }

  const [org] = await strapi.db.query(ORG_UID).findMany({ limit: 1 });
  if (!org) {
    strapi.log.error('[seed] demo accounts: no organization found — run 01-organizations first');
    return;
  }

  for (const acc of DEMO_ACCOUNTS) {
    const existing = await strapi.db.query(USER_UID).findOne({ where: { email: acc.email } });
    if (existing) {
      strapi.log.info(`[seed] demo account exists: ${acc.email}`);
      continue;
    }

    const upRole = await strapi.db.query(ROLE_UID).findOne({ where: { type: acc.role } });
    if (!upRole) {
      strapi.log.error(`[seed] demo accounts: role ${acc.role} missing — run 00-roles first`);
      continue;
    }

    const user = await strapi.plugin('users-permissions').service('user').add({
      email: acc.email,
      username: acc.username,
      password: DEMO_PASSWORD,
      confirmed: true,
      blocked: false,
      provider: 'local',
      role: upRole.id,
    });

    const profile = await strapi.documents(PROFILE_UID).create({
      data: {
        user: user.id,
        organization: org.id,
        role: acc.role,
        firstName: acc.firstName,
        lastName: acc.lastName,
        displayName: `${acc.firstName} ${acc.lastName}`,
        locale: 'uk',
        timezone: 'Europe/Kyiv',
        status: 'active',
        consentTermsAt: new Date().toISOString(),
        consentPrivacyAt: new Date().toISOString(),
      },
    });

    await strapi.documents(acc.roleProfile.uid).create({
      data: {
        user: profile.documentId,
        ...acc.roleProfile.data,
      },
    });

    strapi.log.info(`[seed] created demo ${acc.role} account: ${acc.email}`);
  }
}
