/**
 * Seed: real scheduled sessions for the demo-kids account.
 *
 * The kids dashboard's CalendarWidget pulls from `/api/sessions` filtered to
 * scheduled|live status with the caller as attendee. Without real rows the
 * widget shows an empty state — this seed populates ~4 upcoming lessons
 * across the next two weeks so the calendar/widget has content to render
 * out-of-the-box.
 *
 * Idempotent: matches sessions by (teacher + title + startAt day). Re-running
 * the seed after the dates have drifted (e.g. a boot two weeks later) will
 * create a fresh forward-looking set, leaving stale rows in place so
 * historical attendance still makes sense.
 */
const SESSION_UID = 'api::session.session';
const USER_PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const COURSE_UID = 'api::course.course';
const SEED_TEACHER_SLUG = 'seed-kids-teacher';
const DEFAULT_COURSE_SLUG = 'english-kids-starter';

type SessionSeed = {
  title: string;
  daysFromNow: number;
  /** 24h local hour for start (Europe/Kyiv assumed — demo data, no TZ math). */
  hour: number;
  minute?: number;
  durationMin: number;
  type: 'group' | 'one-to-one' | 'trial' | 'consultation';
  notes?: string;
  courseSlug?: string;
};

const SESSIONS: SessionSeed[] = [
  {
    title: 'Онлайн-урок: Hello & Goodbye',
    daysFromNow: 1,
    hour: 17,
    minute: 0,
    durationMin: 40,
    type: 'one-to-one',
    notes: 'Повторимо вітання та відпрацюємо діалоги.',
    courseSlug: 'english-kids-starter',
  },
  {
    title: 'Пробне заняття з вчителем',
    daysFromNow: 3,
    hour: 18,
    minute: 30,
    durationMin: 30,
    type: 'trial',
    notes: 'Знайомство, визначення рівня, план подальших уроків.',
  },
  {
    title: 'Мовний клуб: My Family',
    daysFromNow: 6,
    hour: 17,
    minute: 0,
    durationMin: 45,
    type: 'group',
    notes: 'Говоримо про сім\u2019ю, показуємо фото улюблених персонажів.',
    courseSlug: 'english-kids-starter',
  },
  {
    title: 'Відео-розбір: Peppa Pig',
    daysFromNow: 10,
    hour: 16,
    minute: 30,
    durationMin: 40,
    type: 'group',
    notes: 'Дивимося серію разом і обговорюємо нові слова.',
    courseSlug: 'peppa',
  },
];

async function findDemoKidsProfileId(strapi: any): Promise<string | null> {
  const [profile] = await strapi.documents(USER_PROFILE_UID).findMany({
    filters: { role: { $eq: 'kids' } },
    sort: ['createdAt:asc'],
    fields: ['documentId'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

async function findSeedTeacherId(strapi: any): Promise<string | null> {
  const teacher = await strapi.db
    .query(TEACHER_UID)
    .findOne({ where: { publicSlug: SEED_TEACHER_SLUG } });
  return teacher?.documentId ?? null;
}

async function findCourseId(strapi: any, slug: string): Promise<string | null> {
  const [course] = await strapi.documents(COURSE_UID).findMany({
    filters: { slug: { $eq: slug } },
    fields: ['documentId'],
    limit: 1,
  });
  return course?.documentId ?? null;
}

function startAtISO(daysFromNow: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export async function up(strapi: any): Promise<void> {
  const studentId = await findDemoKidsProfileId(strapi);
  if (!studentId) {
    strapi.log.info('[seed] kids-sessions: no kids user-profile yet, skipping');
    return;
  }
  const teacherId = await findSeedTeacherId(strapi);
  if (!teacherId) {
    strapi.log.warn('[seed] kids-sessions: seed teacher missing, skipping');
    return;
  }

  const defaultCourseId = await findCourseId(strapi, DEFAULT_COURSE_SLUG);

  let created = 0;
  let skipped = 0;

  for (const s of SESSIONS) {
    const startAt = startAtISO(s.daysFromNow, s.hour, s.minute ?? 0);
    const dayStart = startAt.slice(0, 10);
    const dayEnd = new Date(new Date(startAt).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    // Match by (teacher + title) falling on the same calendar day — runs on
    // subsequent days never duplicate the same named lesson for a given day.
    const [existing] = await strapi.documents(SESSION_UID).findMany({
      filters: {
        title: s.title,
        teacher: { documentId: { $eq: teacherId } },
        startAt: { $gte: `${dayStart}T00:00:00.000Z`, $lt: `${dayEnd}T00:00:00.000Z` },
      },
      limit: 1,
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    const courseId = s.courseSlug
      ? (await findCourseId(strapi, s.courseSlug)) ?? defaultCourseId
      : defaultCourseId;

    await strapi.documents(SESSION_UID).create({
      data: {
        title: s.title,
        startAt,
        durationMin: s.durationMin,
        type: s.type,
        status: 'scheduled',
        teacher: teacherId,
        attendees: [studentId],
        course: courseId ?? undefined,
        notes: s.notes,
      },
    });
    created += 1;
  }

  strapi.log.info(`[seed] kids-sessions: created=${created}, skipped=${skipped}`);
}
