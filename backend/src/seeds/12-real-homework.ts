/**
 * Seed: real homework for the demo-kids account.
 *
 * Publishes 3 homeworks tied to actual seeded lessons (different due dates
 * so the "Треба зробити" / "Готово" tabs on /kids/homework both show rows).
 * The `afterUpdate` lifecycle on `homework` creates per-student submission
 * rows when we flip status → 'published'.
 *
 * Idempotent: matches homeworks by (teacher + title). Skips when the demo
 * student or the lesson/course slugs aren't present yet.
 */

const HOMEWORK_UID = 'api::homework.homework';
const LESSON_UID = 'api::lesson.lesson';
const COURSE_UID = 'api::course.course';
const USER_PROFILE_UID = 'api::user-profile.user-profile';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
// Prefer the demo-teacher account as the visible owner so the teacher
// dashboard has real data; fall back to the hidden seed author when the
// demo account hasn't been created (SEED_DEMO_ACCOUNTS !== '1').
const DEMO_TEACHER_SLUG = 'demo-teacher';
const SEED_TEACHER_SLUG = 'seed-kids-teacher';

type HomeworkExerciseSeed = {
  slug: string;
  type: 'mcq' | 'fill-blank' | 'translate';
  question: string;
  options?: string[];
  answer?: unknown;
  explanation?: string;
  points?: number;
};

interface HomeworkSeed {
  title: string;
  description: string;
  /** Days from "now" until the due date. Negative = already overdue (not used). */
  dueInDays: number;
  courseSlug: string;
  lessonSlug: string;
  exercises: HomeworkExerciseSeed[];
}

const HOMEWORKS: HomeworkSeed[] = [
  {
    title: 'Повторення: Hello & Goodbye',
    description:
      'Пройди урок Hello & Goodbye і виконай три завдання нижче. Мета — закріпити вітання перед першим онлайн-заняттям.',
    dueInDays: 3,
    courseSlug: 'english-kids-starter',
    lessonSlug: 'hello-goodbye',
    exercises: [
      {
        slug: 'hw1-q1',
        type: 'mcq',
        question: 'Як правильно привітатись зранку?',
        options: ['Good night', 'Good morning', 'Goodbye', 'See you'],
        answer: 1,
        explanation: '"Good morning" — вітання зранку.',
        points: 10,
      },
      {
        slug: 'hw1-q2',
        type: 'fill-blank',
        question: 'A: Hello! B: ___! Nice to meet you.',
        answer: 'Hi',
        points: 10,
      },
      {
        slug: 'hw1-q3',
        type: 'translate',
        question: 'Перекладіть: "Доброго ранку! Як справи?"',
        answer: 'Good morning! How are you?',
        points: 15,
      },
    ],
  },
  {
    title: 'Читання: My Family',
    description:
      'Прочитай текст "My family" в уроці, випиши 5 нових слів у зошит і дай відповіді на запитання нижче.',
    dueInDays: 5,
    courseSlug: 'english-kids-starter',
    lessonSlug: 'my-family',
    exercises: [
      {
        slug: 'hw2-q1',
        type: 'mcq',
        question: 'Скільки років Лені?',
        options: ['шість', 'вісім', 'десять', 'дванадцять'],
        answer: 2,
        points: 10,
      },
      {
        slug: 'hw2-q2',
        type: 'mcq',
        question: 'Ким працює тато Лени?',
        options: ['вчителем', 'лікарем', 'водієм', 'інженером'],
        answer: 1,
        points: 10,
      },
      {
        slug: 'hw2-q3',
        type: 'translate',
        question: 'Перекладіть: "У мене є брат і сестра."',
        answer: 'I have a brother and a sister.',
        points: 15,
      },
    ],
  },
  {
    title: 'Відео: Peppa Pig — Muddy Puddles',
    description:
      'Подивись серію "Muddy Puddles" і дай відповіді на запитання. Можна вмикати субтитри.',
    dueInDays: 7,
    courseSlug: 'peppa',
    lessonSlug: 'peppa-muddy-puddles',
    exercises: [
      {
        slug: 'hw3-q1',
        type: 'mcq',
        question: 'Що Пеппа любить робити у дощ?',
        options: ['спати', 'дивитись телевізор', 'стрибати у калюжах', 'малювати'],
        answer: 2,
        points: 10,
      },
      {
        slug: 'hw3-q2',
        type: 'fill-blank',
        question: 'Mummy says: "Put on your ___."',
        answer: 'boots',
        points: 10,
      },
      {
        slug: 'hw3-q3',
        type: 'translate',
        question: 'Перекладіть: "Пеппа любить стрибати у калюжах."',
        answer: 'Peppa loves jumping in puddles.',
        points: 15,
      },
    ],
  },
];

function wrapAnswer(ex: HomeworkExerciseSeed): Record<string, unknown> {
  if (ex.type === 'mcq') {
    const idx = typeof ex.answer === 'number' ? ex.answer : 0;
    const correct = ex.options?.[idx] ?? '';
    return { correctIndex: idx, correct };
  }
  return { value: ex.answer ?? '' };
}

async function findDemoKidsProfile(strapi: any): Promise<string | null> {
  const [profile] = await strapi.documents(USER_PROFILE_UID).findMany({
    filters: { role: { $eq: 'kids' } },
    sort: ['createdAt:asc'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

async function findSeedTeacher(strapi: any): Promise<string | null> {
  const demo = await strapi.db
    .query(TEACHER_UID)
    .findOne({ where: { publicSlug: DEMO_TEACHER_SLUG } });
  if (demo?.documentId) return demo.documentId;
  const fallback = await strapi.db
    .query(TEACHER_UID)
    .findOne({ where: { publicSlug: SEED_TEACHER_SLUG } });
  return fallback?.documentId ?? null;
}

async function findLesson(strapi: any, slug: string): Promise<string | null> {
  const [lesson] = await strapi.documents(LESSON_UID).findMany({
    filters: { slug },
    limit: 1,
    status: 'published',
  });
  return lesson?.documentId ?? null;
}

async function findCourse(strapi: any, slug: string): Promise<string | null> {
  const [course] = await strapi.documents(COURSE_UID).findMany({
    filters: { slug },
    limit: 1,
    status: 'published',
  });
  return course?.documentId ?? null;
}

export async function up(strapi: any): Promise<void> {
  const studentId = await findDemoKidsProfile(strapi);
  if (!studentId) {
    strapi.log.info('[seed] real-homework: no kids user-profile yet, skipping');
    return;
  }
  const teacherId = await findSeedTeacher(strapi);
  if (!teacherId) {
    strapi.log.warn('[seed] real-homework: seed teacher missing, skipping');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const hw of HOMEWORKS) {
    // Match by title only — owner-agnostic so earlier runs owned by the
    // legacy seed-kids-teacher get reassigned to the demo teacher when the
    // demo account is later created.
    const [existing] = await strapi.documents(HOMEWORK_UID).findMany({
      filters: { title: hw.title },
      populate: { teacher: { fields: ['documentId'] } },
      limit: 1,
    });
    if (existing) {
      if ((existing as any).teacher?.documentId !== teacherId) {
        await strapi.documents(HOMEWORK_UID).update({
          documentId: (existing as any).documentId,
          data: { teacher: teacherId },
        });
      }
      skipped += 1;
      continue;
    }

    const lessonId = await findLesson(strapi, hw.lessonSlug);
    const courseId = await findCourse(strapi, hw.courseSlug);
    if (!lessonId || !courseId) {
      strapi.log.warn(
        `[seed] real-homework: skip '${hw.title}' — lesson/course not yet seeded (${hw.lessonSlug} / ${hw.courseSlug})`,
      );
      continue;
    }

    const dueAt = new Date(Date.now() + hw.dueInDays * 24 * 60 * 60 * 1000).toISOString();

    // Create as draft first so the publish flip triggers the
    // afterUpdate lifecycle that creates homework-submission rows.
    const draft = await strapi.documents(HOMEWORK_UID).create({
      data: {
        title: hw.title,
        description: hw.description,
        teacher: teacherId,
        assignees: [studentId],
        lesson: lessonId,
        course: courseId,
        dueAt,
        status: 'draft',
        exercises: hw.exercises.map((ex) => ({
          slug: ex.slug,
          type: ex.type,
          question: ex.question,
          options: ex.options,
          // postgres `json` column rejects bare primitives — wrap so every
          // answer serializes as an object. Matches MiniTaskBuilder's
          // on-the-fly convention: mcq → {correctIndex, correct}, text → {value}.
          answer: wrapAnswer(ex),
          explanation: ex.explanation,
          points: ex.points ?? 10,
        })),
      },
    });

    await strapi.documents(HOMEWORK_UID).update({
      documentId: draft.documentId,
      data: { status: 'published' },
    });
    created += 1;
  }

  strapi.log.info(`[seed] real-homework: created=${created}, skipped=${skipped}`);
}
