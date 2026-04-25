/**
 * Seed: production-grade demo cohort.
 *
 * Creates a realistic showcase cohort so the dashboards (kids, teacher,
 * parent, admin) render real data on first boot for a customer demo.
 *
 *   - 3 teachers (kids-only, adult-only, mixed-level)
 *   - 12 students:
 *       - 8 kids (role=kids), each linked 1:1 to a parent account
 *       - 4 adults (role=adult)
 *   - 8 parents (role=parent), each owning exactly one kid via
 *     `user-profile.parentalConsentBy`
 *
 * Wiring (groups, sessions, homework, attendance, progress, chat) lives
 * in the follow-up seeds 16-cohort-classroom and 17-cohort-chat. This
 * seed only creates the Strapi `users-permissions` users + per-role
 * profile rows. All accounts share the public demo password so the
 * customer can sign in as any persona straight from the login page.
 *
 * Idempotent: skipped per-account if the email already exists.
 *
 * Opt-in via `SEED_DEMO_ACCOUNTS=1` — never create these without an
 * explicit signal from the operator, since the password is published.
 */
const USER_UID = 'plugin::users-permissions.user';
const ROLE_UID = 'plugin::users-permissions.role';
const ORG_UID = 'api::organization.organization';
const PROFILE_UID = 'api::user-profile.user-profile';

export const COHORT_PASSWORD = 'Demo2026!';

type AppRole = 'kids' | 'adult' | 'teacher' | 'parent';

interface BaseAccount {
  role: AppRole;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  level?: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  /** UI tag used by 16-cohort-classroom + 17-cohort-chat to find this user. */
  cohortTag: string;
}

interface TeacherAccount extends BaseAccount {
  role: 'teacher';
  bio: string;
  publicSlug: string;
  yearsExperience: number;
  hourlyRate: number;
  rating: number;
  ratingCount: number;
  specializations: string[];
  languagesSpoken: string[];
  acceptsTrial: boolean;
  videoMeetUrl: string;
}

interface KidAccount extends BaseAccount {
  role: 'kids';
  companionAnimal: 'fox' | 'cat' | 'dragon' | 'rabbit' | 'raccoon' | 'frog';
  companionName: string;
  ageGroup: 'age2to4' | 'age4to7' | 'age7to11' | 'age11plus';
  totalCoins: number;
  totalXp: number;
  streakDays: number;
  characterMood:
    | 'happy'
    | 'excited'
    | 'neutral'
    | 'thinking'
    | 'surprised'
    | 'sleepy'
    | 'proud'
    | 'sad'
    | 'confused'
    | 'celebrating';
}

interface AdultAccount extends BaseAccount {
  role: 'adult';
  goal: 'exam' | 'travel' | 'career' | 'hobby' | 'school' | 'other';
  currentLevel: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  targetLevel: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  weeklyGoalMin: number;
  totalCoins: number;
  totalXp: number;
  streakDays: number;
}

interface ParentAccount extends BaseAccount {
  role: 'parent';
  preferredContact: 'email' | 'phone' | 'both';
  emergencyPhone?: string;
  /** cohortTag of the kid this parent is linked to. */
  childTag: string;
}

export type CohortAccount =
  | TeacherAccount
  | KidAccount
  | AdultAccount
  | ParentAccount;

export const TEACHERS: TeacherAccount[] = [
  {
    role: 'teacher',
    cohortTag: 'teacher-olena',
    email: 'teacher-olena@englishbest.app',
    username: 'teacher-olena',
    firstName: 'Олена',
    lastName: 'Коваленко',
    phone: '+380501112233',
    bio: 'Викладаю англійську дітям 6–12 років. Граємо в ігри, співаємо пісні, готуємо до Cambridge YLE Starters/Movers. Сертифікати: TKT Modules 1–3, IH Young Learners.',
    publicSlug: 'teacher-olena',
    yearsExperience: 7,
    hourlyRate: 600,
    rating: 4.9,
    ratingCount: 48,
    specializations: ['kids', 'YLE', 'phonics'],
    languagesSpoken: ['Українська', 'English'],
    acceptsTrial: true,
    videoMeetUrl: 'https://meet.englishbest.app/teacher-olena',
  },
  {
    role: 'teacher',
    cohortTag: 'teacher-andriy',
    email: 'teacher-andriy@englishbest.app',
    username: 'teacher-andriy',
    firstName: 'Андрій',
    lastName: 'Петренко',
    phone: '+380502223344',
    bio: 'Готую до IELTS і Business English. 8 років практики, з них 4 — у міжнародних компаніях (Big4, IT). DELTA Module 2.',
    publicSlug: 'teacher-andriy',
    yearsExperience: 8,
    hourlyRate: 850,
    rating: 4.8,
    ratingCount: 62,
    specializations: ['adult', 'business', 'IELTS'],
    languagesSpoken: ['Українська', 'English', 'Polski'],
    acceptsTrial: true,
    videoMeetUrl: 'https://meet.englishbest.app/teacher-andriy',
  },
  {
    role: 'teacher',
    cohortTag: 'teacher-iryna',
    email: 'teacher-iryna@englishbest.app',
    username: 'teacher-iryna',
    firstName: 'Ірина',
    lastName: 'Шевченко',
    phone: '+380503334455',
    bio: 'Веду підлітків і початковий рівень у дорослих. Робимо багато діалогів, ситуативної граматики та подорожньої лексики. CELTA, 4 роки досвіду.',
    publicSlug: 'teacher-iryna',
    yearsExperience: 4,
    hourlyRate: 550,
    rating: 4.7,
    ratingCount: 31,
    specializations: ['teen', 'travel', 'general'],
    languagesSpoken: ['Українська', 'English'],
    acceptsTrial: true,
    videoMeetUrl: 'https://meet.englishbest.app/teacher-iryna',
  },
];

export const KIDS: KidAccount[] = [
  {
    role: 'kids',
    cohortTag: 'kid-sofia',
    email: 'kid-sofia@englishbest.app',
    username: 'kid-sofia',
    firstName: 'Софія',
    lastName: 'Бондар',
    dateOfBirth: '2017-05-14',
    level: 'A1',
    companionAnimal: 'fox',
    companionName: 'Foxie',
    ageGroup: 'age7to11',
    totalCoins: 540,
    totalXp: 320,
    streakDays: 5,
    characterMood: 'happy',
  },
  {
    role: 'kids',
    cohortTag: 'kid-maksym',
    email: 'kid-maksym@englishbest.app',
    username: 'kid-maksym',
    firstName: 'Максим',
    lastName: 'Лисенко',
    dateOfBirth: '2016-09-02',
    level: 'A1',
    companionAnimal: 'raccoon',
    companionName: 'Rocky',
    ageGroup: 'age7to11',
    totalCoins: 420,
    totalXp: 270,
    streakDays: 3,
    characterMood: 'excited',
  },
  {
    role: 'kids',
    cohortTag: 'kid-kateryna',
    email: 'kid-kateryna@englishbest.app',
    username: 'kid-kateryna',
    firstName: 'Катерина',
    lastName: 'Ткаченко',
    dateOfBirth: '2015-11-21',
    level: 'A2',
    companionAnimal: 'cat',
    companionName: 'Whiskers',
    ageGroup: 'age7to11',
    totalCoins: 780,
    totalXp: 540,
    streakDays: 11,
    characterMood: 'proud',
  },
  {
    role: 'kids',
    cohortTag: 'kid-bohdan',
    email: 'kid-bohdan@englishbest.app',
    username: 'kid-bohdan',
    firstName: 'Богдан',
    lastName: 'Гриценко',
    dateOfBirth: '2018-03-08',
    level: 'A0',
    companionAnimal: 'dragon',
    companionName: 'Sparky',
    ageGroup: 'age4to7',
    totalCoins: 180,
    totalXp: 90,
    streakDays: 1,
    characterMood: 'thinking',
  },
  {
    role: 'kids',
    cohortTag: 'kid-yelyzaveta',
    email: 'kid-yelyzaveta@englishbest.app',
    username: 'kid-yelyzaveta',
    firstName: 'Єлизавета',
    lastName: 'Шумило',
    dateOfBirth: '2014-06-19',
    level: 'A2',
    companionAnimal: 'rabbit',
    companionName: 'Bunny',
    ageGroup: 'age11plus',
    totalCoins: 920,
    totalXp: 680,
    streakDays: 14,
    characterMood: 'celebrating',
  },
  {
    role: 'kids',
    cohortTag: 'kid-artem',
    email: 'kid-artem@englishbest.app',
    username: 'kid-artem',
    firstName: 'Артем',
    lastName: 'Демченко',
    dateOfBirth: '2013-12-01',
    level: 'A2',
    companionAnimal: 'frog',
    companionName: 'Hoppy',
    ageGroup: 'age11plus',
    totalCoins: 350,
    totalXp: 240,
    streakDays: 0,
    characterMood: 'sleepy',
  },
  {
    role: 'kids',
    cohortTag: 'kid-dariia',
    email: 'kid-dariia@englishbest.app',
    username: 'kid-dariia',
    firstName: 'Дарія',
    lastName: 'Марченко',
    dateOfBirth: '2016-02-27',
    level: 'A1',
    companionAnimal: 'fox',
    companionName: 'Maple',
    ageGroup: 'age7to11',
    totalCoins: 610,
    totalXp: 410,
    streakDays: 6,
    characterMood: 'happy',
  },
  {
    role: 'kids',
    cohortTag: 'kid-ihor',
    email: 'kid-ihor@englishbest.app',
    username: 'kid-ihor',
    firstName: 'Ігор',
    lastName: 'Романенко',
    dateOfBirth: '2014-04-11',
    level: 'B1',
    companionAnimal: 'raccoon',
    companionName: 'Bandit',
    ageGroup: 'age11plus',
    totalCoins: 1180,
    totalXp: 870,
    streakDays: 22,
    characterMood: 'proud',
  },
];

export const ADULTS: AdultAccount[] = [
  {
    role: 'adult',
    cohortTag: 'adult-yulia',
    email: 'adult-yulia@englishbest.app',
    username: 'adult-yulia',
    firstName: 'Юлія',
    lastName: 'Павленко',
    phone: '+380671110011',
    level: 'A2',
    goal: 'exam',
    currentLevel: 'A2',
    targetLevel: 'B2',
    weeklyGoalMin: 180,
    totalCoins: 240,
    totalXp: 350,
    streakDays: 4,
  },
  {
    role: 'adult',
    cohortTag: 'adult-oleg',
    email: 'adult-oleg@englishbest.app',
    username: 'adult-oleg',
    firstName: 'Олег',
    lastName: 'Сидоренко',
    phone: '+380672220022',
    level: 'B1',
    goal: 'career',
    currentLevel: 'B1',
    targetLevel: 'C1',
    weeklyGoalMin: 240,
    totalCoins: 380,
    totalXp: 520,
    streakDays: 9,
  },
  {
    role: 'adult',
    cohortTag: 'adult-nataliia',
    email: 'adult-nataliia@englishbest.app',
    username: 'adult-nataliia',
    firstName: 'Наталія',
    lastName: 'Бабенко',
    phone: '+380673330033',
    level: 'A1',
    goal: 'travel',
    currentLevel: 'A1',
    targetLevel: 'A2',
    weeklyGoalMin: 120,
    totalCoins: 90,
    totalXp: 140,
    streakDays: 2,
  },
  {
    role: 'adult',
    cohortTag: 'adult-volodymyr',
    email: 'adult-volodymyr@englishbest.app',
    username: 'adult-volodymyr',
    firstName: 'Володимир',
    lastName: 'Сосницький',
    phone: '+380674440044',
    level: 'B2',
    goal: 'hobby',
    currentLevel: 'B2',
    targetLevel: 'C1',
    weeklyGoalMin: 90,
    totalCoins: 510,
    totalXp: 730,
    streakDays: 17,
  },
];

export const PARENTS: ParentAccount[] = [
  {
    role: 'parent',
    cohortTag: 'parent-olha',
    email: 'parent-olha@englishbest.app',
    username: 'parent-olha',
    firstName: 'Ольга',
    lastName: 'Бондар',
    phone: '+380681010001',
    preferredContact: 'phone',
    emergencyPhone: '+380681010001',
    childTag: 'kid-sofia',
  },
  {
    role: 'parent',
    cohortTag: 'parent-iryna-l',
    email: 'parent-iryna-l@englishbest.app',
    username: 'parent-iryna-l',
    firstName: 'Ірина',
    lastName: 'Лисенко',
    phone: '+380682020002',
    preferredContact: 'email',
    childTag: 'kid-maksym',
  },
  {
    role: 'parent',
    cohortTag: 'parent-vira',
    email: 'parent-vira@englishbest.app',
    username: 'parent-vira',
    firstName: 'Віра',
    lastName: 'Ткаченко',
    phone: '+380683030003',
    preferredContact: 'both',
    childTag: 'kid-kateryna',
  },
  {
    role: 'parent',
    cohortTag: 'parent-roman',
    email: 'parent-roman@englishbest.app',
    username: 'parent-roman',
    firstName: 'Роман',
    lastName: 'Гриценко',
    phone: '+380684040004',
    preferredContact: 'phone',
    childTag: 'kid-bohdan',
  },
  {
    role: 'parent',
    cohortTag: 'parent-mykhailo',
    email: 'parent-mykhailo@englishbest.app',
    username: 'parent-mykhailo',
    firstName: 'Михайло',
    lastName: 'Шумило',
    phone: '+380685050005',
    preferredContact: 'email',
    childTag: 'kid-yelyzaveta',
  },
  {
    role: 'parent',
    cohortTag: 'parent-halyna',
    email: 'parent-halyna@englishbest.app',
    username: 'parent-halyna',
    firstName: 'Галина',
    lastName: 'Демченко',
    phone: '+380686060006',
    preferredContact: 'email',
    childTag: 'kid-artem',
  },
  {
    role: 'parent',
    cohortTag: 'parent-tetiana',
    email: 'parent-tetiana@englishbest.app',
    username: 'parent-tetiana',
    firstName: 'Тетяна',
    lastName: 'Марченко',
    phone: '+380687070007',
    preferredContact: 'both',
    childTag: 'kid-dariia',
  },
  {
    role: 'parent',
    cohortTag: 'parent-larysa',
    email: 'parent-larysa@englishbest.app',
    username: 'parent-larysa',
    firstName: 'Лариса',
    lastName: 'Романенко',
    phone: '+380688080008',
    preferredContact: 'phone',
    childTag: 'kid-ihor',
  },
];

export const COHORT_ACCOUNTS: CohortAccount[] = [
  ...TEACHERS,
  ...KIDS,
  ...ADULTS,
  ...PARENTS,
];

interface ProfileLookup {
  /** user-profile documentId */
  profileDocId: string;
  /** users-permissions user numeric id */
  userId: number;
  /** role-specific profile documentId */
  roleProfileDocId: string;
  /** Display label for logs. */
  email: string;
}

/**
 * Resolves all cohort accounts (whether already-existing or freshly created)
 * to their user-profile + role-profile documentIds, keyed by cohortTag.
 *
 * Used by the follow-up seeds; exported so we don't re-do the e-mail-fan-out
 * filter dance in every wiring file.
 */
export async function resolveCohort(
  strapi: any,
): Promise<Map<string, ProfileLookup>> {
  const result = new Map<string, ProfileLookup>();
  for (const acc of COHORT_ACCOUNTS) {
    const user = await strapi.db
      .query(USER_UID)
      .findOne({ where: { email: acc.email } });
    if (!user) continue;
    const profile = await strapi.db
      .query(PROFILE_UID)
      .findOne({ where: { user: { id: user.id } } });
    if (!profile) continue;

    const roleProfileUid = profileUidForRole(acc.role);
    const roleProfile = roleProfileUid
      ? await strapi.db
          .query(roleProfileUid)
          .findOne({ where: { user: { id: profile.id } } })
      : null;

    result.set(acc.cohortTag, {
      profileDocId: profile.documentId,
      userId: user.id,
      roleProfileDocId: roleProfile?.documentId ?? '',
      email: acc.email,
    });
  }
  return result;
}

function profileUidForRole(role: AppRole): string | null {
  switch (role) {
    case 'kids':
      return 'api::kids-profile.kids-profile';
    case 'adult':
      return 'api::adult-profile.adult-profile';
    case 'teacher':
      return 'api::teacher-profile.teacher-profile';
    case 'parent':
      return 'api::parent-profile.parent-profile';
    default:
      return null;
  }
}

function roleProfileData(acc: CohortAccount): Record<string, unknown> {
  switch (acc.role) {
    case 'teacher':
      return {
        bio: acc.bio,
        publicSlug: acc.publicSlug,
        yearsExperience: acc.yearsExperience,
        hourlyRate: acc.hourlyRate,
        rating: acc.rating,
        ratingCount: acc.ratingCount,
        specializations: acc.specializations,
        languagesSpoken: acc.languagesSpoken,
        acceptsTrial: acc.acceptsTrial,
        videoMeetUrl: acc.videoMeetUrl,
        verified: true,
      };
    case 'kids':
      return {
        companionAnimal: acc.companionAnimal,
        companionName: acc.companionName,
        ageGroup: acc.ageGroup,
        totalCoins: acc.totalCoins,
        totalXp: acc.totalXp,
        streakDays: acc.streakDays,
        streakLastAt: acc.streakDays > 0 ? new Date().toISOString() : null,
        characterMood: acc.characterMood,
      };
    case 'adult':
      return {
        goal: acc.goal,
        currentLevel: acc.currentLevel,
        targetLevel: acc.targetLevel,
        weeklyGoalMin: acc.weeklyGoalMin,
        totalCoins: acc.totalCoins,
        totalXp: acc.totalXp,
        streakDays: acc.streakDays,
        streakLastAt: acc.streakDays > 0 ? new Date().toISOString() : null,
      };
    case 'parent':
      return {
        displayName: `${acc.firstName} ${acc.lastName}`,
        preferredContact: acc.preferredContact,
        emergencyPhone: acc.emergencyPhone,
      };
  }
}

function userProfileExtras(acc: CohortAccount): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  if (acc.phone) extras.phone = acc.phone;
  if (acc.dateOfBirth) extras.dateOfBirth = acc.dateOfBirth;
  if (acc.level) extras.level = acc.level;
  return extras;
}

export async function up(strapi: any): Promise<void> {
  const createEnabled = process.env.SEED_DEMO_ACCOUNTS === '1';

  const [org] = await strapi.db.query(ORG_UID).findMany({ limit: 1 });
  if (!org) {
    strapi.log.error(
      '[seed] cohort-accounts: no organization found — run 01-organizations first',
    );
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const acc of COHORT_ACCOUNTS) {
    const existing = await strapi.db
      .query(USER_UID)
      .findOne({ where: { email: acc.email } });

    if (existing) {
      skipped += 1;
      continue;
    }

    if (!createEnabled) {
      strapi.log.info(
        `[seed] cohort ${acc.email} not present; creation skipped (SEED_DEMO_ACCOUNTS !== "1")`,
      );
      continue;
    }

    const upRole = await strapi.db
      .query(ROLE_UID)
      .findOne({ where: { type: acc.role } });
    if (!upRole) {
      strapi.log.error(
        `[seed] cohort: role ${acc.role} missing — run 00-roles first`,
      );
      continue;
    }

    const user = await strapi
      .plugin('users-permissions')
      .service('user')
      .add({
        email: acc.email,
        username: acc.username,
        password: COHORT_PASSWORD,
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
        timezone: 'Europe/Kyiv',
        status: 'active',
        consentTermsAt: new Date().toISOString(),
        consentPrivacyAt: new Date().toISOString(),
        ...userProfileExtras(acc),
      },
    });

    const roleUid = profileUidForRole(acc.role);
    if (roleUid) {
      await strapi.documents(roleUid).create({
        data: {
          user: profile.documentId,
          ...roleProfileData(acc),
        },
      });
    }

    created += 1;
    strapi.log.info(`[seed] cohort created: ${acc.role} · ${acc.email}`);
  }

  strapi.log.info(
    `[seed] cohort-accounts: created=${created}, skipped=${skipped}, total=${COHORT_ACCOUNTS.length}`,
  );
}
