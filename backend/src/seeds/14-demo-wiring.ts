/**
 * Seed: cross-role connective demo data.
 *
 * Wires the demo accounts (kids / teacher / parent) together so each
 * dashboard shows "real" state on boot instead of empty rails:
 *
 *   - demo-kids.parentalConsentBy → demo-parent (so the parent dashboard
 *     finds their linked child via the existing /api/parent/me/children
 *     controller, which keys off `parentalConsentBy`).
 *   - A Group owned by demo-teacher containing demo-kids (so
 *     /api/groups returns a row for both the teacher and — via members —
 *     the student).
 *   - A couple of mini-tasks authored by demo-teacher (so the teacher's
 *     Mini-task library is non-empty).
 *
 * Sessions and homework are owned by demo-teacher already — seeds 12/13
 * reassign them when the demo account exists. This seed only fills the
 * gaps those two don't cover.
 *
 * Idempotent: skips when a row matching (owner + title) already exists.
 */

const USER_PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const GROUP_UID = 'api::group.group';
const MINI_TASK_UID = 'api::mini-task.mini-task';

const DEMO_KIDS_EMAIL = 'demo-kids@englishbest.app';
const DEMO_PARENT_EMAIL = 'demo-parent@englishbest.app';
const DEMO_TEACHER_SLUG = 'demo-teacher';

async function findProfileByEmail(strapi: any, email: string): Promise<any | null> {
  const [profile] = await strapi.documents(USER_PROFILE_UID).findMany({
    filters: { user: { email: { $eq: email } } },
    fields: ['documentId', 'firstName', 'lastName'],
    limit: 1,
  });
  return profile ?? null;
}

async function findDemoTeacherProfileId(strapi: any): Promise<string | null> {
  const tp = await strapi.db
    .query(TEACHER_UID)
    .findOne({ where: { publicSlug: DEMO_TEACHER_SLUG } });
  return tp?.documentId ?? null;
}

async function linkParent(
  strapi: any,
  kid: { documentId: string; parentalConsentBy?: any },
  parentDocId: string,
): Promise<'linked' | 'already'> {
  // documents().findOne doesn't always return relations on a basic fetch;
  // re-read with populate to inspect the current link.
  const current = await strapi.documents(USER_PROFILE_UID).findOne({
    documentId: kid.documentId,
    populate: { parentalConsentBy: { fields: ['documentId'] } },
  });
  const currentParentId = (current as any)?.parentalConsentBy?.documentId ?? null;
  if (currentParentId === parentDocId) return 'already';

  await strapi.documents(USER_PROFILE_UID).update({
    documentId: kid.documentId,
    data: { parentalConsentBy: parentDocId },
  });
  return 'linked';
}

async function upsertGroup(
  strapi: any,
  teacherProfileId: string,
  studentProfileId: string,
): Promise<'created' | 'updated' | 'skipped'> {
  const title = 'Demo-клас · Дана';
  const [existing] = await strapi.documents(GROUP_UID).findMany({
    filters: { name: title },
    populate: {
      teacher: { fields: ['documentId'] },
      members: { fields: ['documentId'] },
    },
    limit: 1,
  });

  if (existing) {
    const members: string[] = ((existing as any).members ?? [])
      .map((m: any) => m?.documentId)
      .filter(Boolean);
    const memberMissing = !members.includes(studentProfileId);
    const teacherMismatch =
      (existing as any).teacher?.documentId !== teacherProfileId;
    if (!memberMissing && !teacherMismatch) return 'skipped';

    await strapi.documents(GROUP_UID).update({
      documentId: (existing as any).documentId,
      data: {
        teacher: teacherProfileId,
        members: Array.from(new Set([...members, studentProfileId])),
      },
    });
    return 'updated';
  }

  await strapi.documents(GROUP_UID).create({
    data: {
      name: title,
      level: 'A1',
      teacher: teacherProfileId,
      members: [studentProfileId],
      activeFrom: new Date().toISOString().slice(0, 10),
    },
  });
  return 'created';
}

type MiniTaskSeed = {
  slug: string;
  title: string;
  topic: string;
  kind: 'quiz' | 'daily-challenge' | 'word-of-day';
  level: 'A1';
  durationMin: number;
  coinReward: number;
  isPublic: boolean;
  exercise: {
    type: 'mcq' | 'fill-blank' | 'translate';
    question: string;
    options?: string[];
    answer: Record<string, unknown>;
    explanation?: string;
    points: number;
  };
};

const MINI_TASKS: MiniTaskSeed[] = [
  {
    slug: 'daily-greeting',
    title: 'Щоденне вітання',
    topic: 'greetings',
    kind: 'daily-challenge',
    level: 'A1',
    durationMin: 2,
    coinReward: 10,
    isPublic: true,
    exercise: {
      type: 'mcq',
      question: 'Обери правильне вітання для вечора.',
      options: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
      answer: { correctIndex: 2, correct: 'Good evening' },
      explanation: '"Good evening" — вітання ввечері.',
      points: 10,
    },
  },
  {
    slug: 'word-of-day-family',
    title: 'Слово дня: family',
    topic: 'family',
    kind: 'word-of-day',
    level: 'A1',
    durationMin: 1,
    coinReward: 5,
    isPublic: true,
    exercise: {
      type: 'translate',
      question: 'Переклади слово "сім\u2019я" англійською',
      answer: { value: 'family' },
      points: 5,
    },
  },
  {
    slug: 'quiz-colors',
    title: 'Кольори (quick-quiz)',
    topic: 'colors',
    kind: 'quiz',
    level: 'A1',
    durationMin: 3,
    coinReward: 10,
    isPublic: false,
    exercise: {
      type: 'fill-blank',
      question: 'The sun is ___. (complete with a color)',
      answer: { value: 'yellow' },
      explanation: 'Сонце — жовте: yellow.',
      points: 10,
    },
  },
];

async function upsertMiniTask(
  strapi: any,
  teacherProfileId: string,
  task: MiniTaskSeed,
): Promise<'created' | 'skipped'> {
  const [existing] = await strapi.documents(MINI_TASK_UID).findMany({
    filters: { slug: task.slug },
    limit: 1,
  });
  if (existing) return 'skipped';

  await strapi.documents(MINI_TASK_UID).create({
    data: {
      slug: task.slug,
      title: task.title,
      topic: task.topic,
      kind: task.kind,
      level: task.level,
      durationMin: task.durationMin,
      coinReward: task.coinReward,
      isPublic: task.isPublic,
      author: teacherProfileId,
      exercise: task.exercise,
      publishedAt: new Date().toISOString(),
    },
    status: 'published',
  });
  return 'created';
}

export async function up(strapi: any): Promise<void> {
  const kid = await findProfileByEmail(strapi, DEMO_KIDS_EMAIL);
  const parent = await findProfileByEmail(strapi, DEMO_PARENT_EMAIL);
  const teacherProfileId = await findDemoTeacherProfileId(strapi);

  if (!kid || !parent) {
    strapi.log.info(
      '[seed] demo-wiring: demo kids/parent not present — skipping (set SEED_DEMO_ACCOUNTS=1 to create them)',
    );
    return;
  }
  if (!teacherProfileId) {
    strapi.log.info('[seed] demo-wiring: demo-teacher profile missing — skipping');
    return;
  }

  const linked = await linkParent(strapi, kid, parent.documentId);
  strapi.log.info(
    `[seed] demo-wiring: parent-link ${linked} (${DEMO_KIDS_EMAIL} → ${DEMO_PARENT_EMAIL})`,
  );

  const groupResult = await upsertGroup(strapi, teacherProfileId, kid.documentId);
  strapi.log.info(`[seed] demo-wiring: group ${groupResult}`);

  let taskCreated = 0;
  let taskSkipped = 0;
  for (const task of MINI_TASKS) {
    const r = await upsertMiniTask(strapi, teacherProfileId, task);
    if (r === 'created') taskCreated += 1;
    else taskSkipped += 1;
  }
  strapi.log.info(
    `[seed] demo-wiring: mini-tasks created=${taskCreated}, skipped=${taskSkipped}`,
  );
}
