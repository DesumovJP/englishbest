/**
 * Mock → Strapi importer (core).
 *
 * Idempotent: re-runs skip records that already exist (matched by
 * slug / publicSlug / email / composite key for sessions). Safe to call
 * more than once.
 *
 * Path resolution uses `strapi.dirs.app.root` (= backend dir on Railway),
 * so this works both in the one-shot `tsx scripts/import-mocks.ts` script
 * and when the bootstrap hook loads it from `dist/lib/mock-importer.js`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type CourseMock = {
  documentId: string;
  slug: string;
  title: string;
  level: string;
  price: number;
  teacherSlug: string;
  teacherName: string;
  thumbnail?: string;
  description?: string;
  sections?: { slug: string; title: string; lessons: string[] }[];
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  status?: string;
};

type LessonMock = {
  documentId: string;
  lessonSlug: string;
  courseSlug: string;
  title: string;
  type: string;
  durationMin: number;
  content: {
    videoUrl?: string;
    transcript?: string;
    exercises?: {
      documentId: string;
      type: string;
      question: string;
      options: string[];
      answer: number;
    }[];
  };
};

type LessonSteps = {
  slug: string;
  courseSlug: string;
  title: string;
  xp: number;
  steps: unknown[];
};

type SessionMock = {
  documentId: string;
  title: string;
  courseSlug: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  teacherSlug: string;
  status: string;
  joinUrl?: string;
  grade?: number;
};

function mocksDir(strapi: any): string {
  // strapi.dirs.app.root points to the Strapi project root (backend/).
  // frontend/mocks lives one level up in the monorepo.
  return join(strapi.dirs.app.root, '..', 'frontend', 'mocks');
}

function readJson<T>(strapi: any, name: string): T {
  return JSON.parse(readFileSync(join(mocksDir(strapi), name), 'utf8')) as T;
}

function readJsonOptional<T>(strapi: any, name: string): T | null {
  try {
    return JSON.parse(readFileSync(join(mocksDir(strapi), name), 'utf8')) as T;
  } catch (err: any) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
}

function toIsoStartAt(date: string, time: string): string {
  // Mocks have no tz — treat as Europe/Kyiv (roughly +03:00; DST not worth it for seed).
  return new Date(`${date}T${time}:00+03:00`).toISOString();
}

const SESSION_STATUS_MAP: Record<string, string> = {
  upcoming: 'scheduled',
  completed: 'completed',
  cancelled: 'cancelled',
  live: 'live',
};

async function ensureTeacher(strapi: any, slug: string, fullName: string): Promise<string> {
  const existing = await strapi.db.query('api::teacher-profile.teacher-profile').findOne({
    where: { publicSlug: slug },
    populate: { user: true },
  });
  if (existing) return existing.documentId;

  const [firstName, ...rest] = fullName.split(' ');
  const lastName = rest.join(' ') || '';
  const email = `${slug}@placeholder.englishbest.app`;

  const teacherRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'teacher' } });
  if (!teacherRole) throw new Error('teacher role missing — run 00-roles seed first');

  let user = await strapi.db
    .query('plugin::users-permissions.user')
    .findOne({ where: { email } });
  if (!user) {
    user = await strapi.plugin('users-permissions').service('user').add({
      email,
      username: slug,
      password: `Seed-${slug}-${Math.random().toString(36).slice(2, 10)}!`,
      confirmed: true,
      blocked: false,
      provider: 'local',
      role: teacherRole.id,
    });
  }

  const profiles = await strapi.documents('api::user-profile.user-profile').findMany({
    filters: { user: { id: user.id } },
    limit: 1,
  });
  let userProfile = profiles[0];
  if (!userProfile) {
    userProfile = await strapi.documents('api::user-profile.user-profile').create({
      data: {
        user: user.id,
        role: 'teacher',
        firstName: firstName ?? fullName,
        lastName,
        displayName: fullName,
      },
    });
  }

  const teacherProfile = await strapi
    .documents('api::teacher-profile.teacher-profile')
    .create({
      data: {
        user: userProfile.documentId,
        publicSlug: slug,
        bio: `Teacher ${fullName}`,
        yearsExperience: 3,
        verified: true,
      },
    });
  return teacherProfile.documentId;
}

async function ensureCourse(
  strapi: any,
  course: CourseMock,
  teacherDocumentId: string
): Promise<string> {
  const existing = await strapi.documents('api::course.course').findMany({
    filters: { slug: course.slug },
    limit: 1,
  });
  if (existing[0]) return existing[0].documentId;

  const created = await strapi.documents('api::course.course').create({
    data: {
      slug: course.slug,
      title: course.title,
      description: course.description,
      level: course.level,
      price: course.price,
      currency: 'UAH',
      teacher: teacherDocumentId,
      sections: (course.sections ?? []).map((s, i) => ({
        slug: s.slug,
        title: s.title,
        order: i,
        lessonSlugs: s.lessons,
      })),
      tags: course.tags,
      ratingAvg: course.rating,
      reviewCount: course.reviewCount ?? 0,
      status: course.status ?? 'available',
      audience: course.slug.includes('kids')
        ? 'kids'
        : course.slug.includes('teens')
          ? 'teens'
          : 'adults',
    },
    status: 'published',
  });
  return created.documentId;
}

async function ensureLesson(
  strapi: any,
  lesson: LessonMock,
  courseDocumentId: string,
  richBySlug: Map<string, LessonSteps>
): Promise<string> {
  const rich = richBySlug.get(lesson.lessonSlug);
  const exercises = (lesson.content.exercises ?? []).map((ex) => ({
    slug: ex.documentId,
    type: ex.type,
    question: ex.question,
    options: ex.options,
    answer: ex.answer,
    points: 10,
  }));

  const existing = await strapi.documents('api::lesson.lesson').findMany({
    filters: { slug: lesson.lessonSlug },
    limit: 1,
  });
  if (existing[0]) {
    const needsSteps = rich && (!existing[0].steps || !existing[0].xp);
    if (needsSteps) {
      await strapi.documents('api::lesson.lesson').update({
        documentId: existing[0].documentId,
        data: { steps: rich.steps, xp: rich.xp },
      });
      strapi.log.info(`[import] lesson ${lesson.lessonSlug}: backfilled steps/xp`);
    }
    return existing[0].documentId;
  }

  const created = await strapi.documents('api::lesson.lesson').create({
    data: {
      slug: lesson.lessonSlug,
      title: lesson.title,
      course: courseDocumentId,
      orderIndex: 0,
      type: lesson.type,
      durationMin: lesson.durationMin,
      videoUrl: lesson.content.videoUrl,
      transcript: lesson.content.transcript,
      exercises,
      steps: rich?.steps,
      xp: rich?.xp,
      isFree: false,
    },
    status: 'published',
  });
  return created.documentId;
}

async function ensureSession(
  strapi: any,
  session: SessionMock,
  courseDocumentId: string,
  teacherDocumentId: string
): Promise<string> {
  const startAt = toIsoStartAt(session.date, session.time);
  const existing = await strapi.documents('api::session.session').findMany({
    filters: { title: session.title, startAt },
    limit: 1,
  });
  if (existing[0]) return existing[0].documentId;

  const created = await strapi.documents('api::session.session').create({
    data: {
      title: session.title,
      course: courseDocumentId,
      teacher: teacherDocumentId,
      startAt,
      durationMin: session.duration,
      type: session.type,
      status: SESSION_STATUS_MAP[session.status] ?? 'scheduled',
      joinUrl: session.joinUrl,
      grade: session.grade,
    },
  });
  return created.documentId;
}

export async function runImport(strapi: any): Promise<void> {
  strapi.log.info('[import] starting mock import');

  const courses = readJson<CourseMock[]>(strapi, 'courses.json');
  const lessons = readJson<LessonMock[]>(strapi, 'lessons.json');
  const sessions = readJson<SessionMock[]>(strapi, 'calendar.json');
  const lessonSteps = readJsonOptional<LessonSteps[]>(strapi, 'lesson-steps.json') ?? [];
  const richBySlug = new Map<string, LessonSteps>();
  for (const s of lessonSteps) richBySlug.set(s.slug, s);

  const teacherMap = new Map<string, string>();
  const uniqueTeachers = new Map<string, string>();
  for (const c of courses) uniqueTeachers.set(c.teacherSlug, c.teacherName);
  for (const s of sessions) {
    if (!uniqueTeachers.has(s.teacherSlug)) uniqueTeachers.set(s.teacherSlug, s.teacherSlug);
  }
  for (const [slug, name] of uniqueTeachers) {
    const docId = await ensureTeacher(strapi, slug, name);
    teacherMap.set(slug, docId);
    strapi.log.info(`[import] teacher ${slug} → ${docId}`);
  }

  const courseMap = new Map<string, string>();
  for (const c of courses) {
    const teacherId = teacherMap.get(c.teacherSlug);
    if (!teacherId) {
      strapi.log.warn(`[import] course ${c.slug}: teacher ${c.teacherSlug} missing`);
      continue;
    }
    const docId = await ensureCourse(strapi, c, teacherId);
    courseMap.set(c.slug, docId);
    strapi.log.info(`[import] course ${c.slug} → ${docId}`);
  }

  let lessonCount = 0;
  for (const l of lessons) {
    const courseId = courseMap.get(l.courseSlug);
    if (!courseId) {
      strapi.log.warn(`[import] lesson ${l.lessonSlug}: course ${l.courseSlug} missing`);
      continue;
    }
    await ensureLesson(strapi, l, courseId, richBySlug);
    lessonCount++;
  }
  strapi.log.info(`[import] ${lessonCount} lessons imported / verified`);

  // Rich-only lessons (block-based content, no entry in lessons.json).
  let richOnlyCount = 0;
  for (const rich of lessonSteps) {
    if (lessons.some((l) => l.lessonSlug === rich.slug)) continue;
    const courseId = courseMap.get(rich.courseSlug);
    if (!courseId) {
      strapi.log.warn(`[import] rich-lesson ${rich.slug}: course ${rich.courseSlug} missing`);
      continue;
    }
    await ensureLesson(
      strapi,
      {
        documentId: rich.slug,
        lessonSlug: rich.slug,
        courseSlug: rich.courseSlug,
        title: rich.title,
        type: 'interactive',
        durationMin: 15,
        content: {},
      },
      courseId,
      richBySlug
    );
    richOnlyCount++;
  }
  if (richOnlyCount) strapi.log.info(`[import] ${richOnlyCount} rich-only lessons imported`);

  let sessionCount = 0;
  for (const s of sessions) {
    const courseId = courseMap.get(s.courseSlug);
    const teacherId = teacherMap.get(s.teacherSlug);
    if (!courseId || !teacherId) {
      strapi.log.warn(`[import] session ${s.title}: missing course or teacher`);
      continue;
    }
    await ensureSession(strapi, s, courseId, teacherId);
    sessionCount++;
  }
  strapi.log.info(`[import] ${sessionCount} sessions imported / verified`);

  strapi.log.info('[import] done');
}
