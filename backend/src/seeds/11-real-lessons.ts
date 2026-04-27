/**
 * Seed: real lessons for kids courses.
 *
 * Turns the 8 kids-audience courses (english-kids-starter + library items
 * caterpillar, oxford-1, natgeo, peppa, bluey, simple-songs, word-puzzle)
 * from empty "Уроки ще не додані" cards into real learning paths with
 * theory, reading comprehension, interactive exercises and video/song lessons.
 *
 * Idempotent:
 *   - Course: created only when missing + the definition has `createIfMissing`.
 *   - Lessons: inserted/updated by slug; existing lessons are updated so
 *     content edits in this seed propagate on next boot.
 *   - Sections (on the course): merged by section slug.
 *
 * Ownership: lessons are attached to the course's existing teacher if one is
 * set, otherwise to a dedicated `seed-kids-teacher` profile we create here.
 */
import { COURSE_SEEDS, LEGACY_COURSE_SLUGS } from './lesson-content';
import type { CourseSeed, LessonSeed } from './lesson-content';

const COURSE_UID = 'api::course.course';
const LESSON_UID = 'api::lesson.lesson';
const TEACHER_UID = 'api::teacher-profile.teacher-profile';
const USER_PROFILE_UID = 'api::user-profile.user-profile';
const USER_UID = 'plugin::users-permissions.user';
const ROLE_UID = 'plugin::users-permissions.role';

const SEED_TEACHER_SLUG = 'seed-kids-teacher';
const SEED_TEACHER_EMAIL = 'seed-kids-teacher@placeholder.englishbest.app';
const SEED_TEACHER_NAME = 'EnglishBest Team';

async function ensureSeedTeacher(strapi: any): Promise<string | null> {
  const existing = await strapi.db.query(TEACHER_UID).findOne({
    where: { publicSlug: SEED_TEACHER_SLUG },
  });
  if (existing?.documentId) return existing.documentId;

  const teacherRole = await strapi.db
    .query(ROLE_UID)
    .findOne({ where: { type: 'teacher' } });
  if (!teacherRole) {
    strapi.log.warn('[seed] real-lessons: teacher role missing, skipping teacher ownership');
    return null;
  }

  let user = await strapi.db
    .query(USER_UID)
    .findOne({ where: { email: SEED_TEACHER_EMAIL } });
  if (!user) {
    user = await strapi.plugin('users-permissions').service('user').add({
      email: SEED_TEACHER_EMAIL,
      username: SEED_TEACHER_SLUG,
      password: `Seed-${SEED_TEACHER_SLUG}-${Math.random().toString(36).slice(2, 10)}!`,
      confirmed: true,
      blocked: false,
      provider: 'local',
      role: teacherRole.id,
    });
  }

  const [profile] = await strapi.documents(USER_PROFILE_UID).findMany({
    filters: { user: { id: user.id } },
    limit: 1,
  });
  let userProfile = profile;
  if (!userProfile) {
    userProfile = await strapi.documents(USER_PROFILE_UID).create({
      data: {
        user: user.id,
        role: 'teacher',
        firstName: 'EnglishBest',
        lastName: 'Team',
        displayName: SEED_TEACHER_NAME,
      },
    });
  }

  const teacherProfile = await strapi.documents(TEACHER_UID).create({
    data: {
      user: userProfile.documentId,
      publicSlug: SEED_TEACHER_SLUG,
      bio: 'Офіційна добірка уроків EnglishBest.',
      yearsExperience: 5,
      verified: true,
    },
  });
  return teacherProfile.documentId;
}

type ExistingCourse = {
  documentId: string;
  slug: string;
  kind?: 'course' | 'book' | 'video' | 'game' | null;
  teacher?: { documentId?: string } | null;
  sections?: Array<{ id?: number; slug?: string; title?: string; order?: number; lessonSlugs?: string[] }>;
};

async function findCourse(strapi: any, slug: string): Promise<ExistingCourse | null> {
  const [existing] = await strapi.documents(COURSE_UID).findMany({
    filters: { slug },
    populate: { teacher: { fields: ['documentId'] }, sections: true },
    limit: 1,
    status: 'published',
  });
  if (existing) return existing as ExistingCourse;
  // Fall back to draft if no published version exists yet.
  const [draft] = await strapi.documents(COURSE_UID).findMany({
    filters: { slug },
    populate: { teacher: { fields: ['documentId'] }, sections: true },
    limit: 1,
  });
  return (draft as ExistingCourse) ?? null;
}

function buildSections(
  lessons: LessonSeed[],
  existingSections: ExistingCourse['sections'],
): Array<{ slug: string; title: string; order: number; lessonSlugs: string[] }> {
  const bySlug = new Map<string, { slug: string; title: string; order: number; lessonSlugs: string[] }>();

  for (const section of existingSections ?? []) {
    if (!section.slug) continue;
    bySlug.set(section.slug, {
      slug: section.slug,
      title: section.title ?? section.slug,
      order: section.order ?? 0,
      lessonSlugs: Array.isArray(section.lessonSlugs) ? [...section.lessonSlugs] : [],
    });
  }

  for (const lesson of lessons) {
    const slug = lesson.sectionSlug;
    const section =
      bySlug.get(slug) ??
      {
        slug,
        title: lesson.sectionTitle,
        order: lesson.sectionOrder,
        lessonSlugs: [],
      };
    // Prefer the seed-declared title/order if the section is fresh; keep
    // existing values when it was already curated by staff.
    if (!bySlug.has(slug)) {
      section.title = lesson.sectionTitle;
      section.order = lesson.sectionOrder;
    }
    if (!section.lessonSlugs.includes(lesson.slug)) {
      section.lessonSlugs.push(lesson.slug);
    }
    bySlug.set(slug, section);
  }

  return Array.from(bySlug.values()).sort((a, b) => a.order - b.order);
}

async function ensureCourse(
  strapi: any,
  seed: CourseSeed,
  teacherDocumentId: string | null,
): Promise<ExistingCourse | null> {
  const existing = await findCourse(strapi, seed.slug);
  if (existing) return existing;

  const create = seed.createIfMissing;
  if (!create) {
    strapi.log.warn(
      `[seed] real-lessons: course '${seed.slug}' missing and no createIfMissing — skipping`,
    );
    return null;
  }

  const sections = buildSections(seed.lessons, []);
  const created = await strapi.documents(COURSE_UID).create({
    data: {
      slug: seed.slug,
      title: create.title,
      titleUa: create.titleUa,
      subtitle: create.subtitle,
      description: create.description,
      descriptionShort: create.descriptionShort,
      level: create.level,
      audience: create.audience ?? 'kids',
      kind: create.kind ?? 'course',
      iconEmoji: create.iconEmoji,
      tags: create.tags,
      status: 'available',
      price: 0,
      currency: 'UAH',
      teacher: teacherDocumentId,
      sections,
      publishedAt: new Date().toISOString(),
    },
    status: 'published',
  });
  return {
    documentId: created.documentId,
    slug: seed.slug,
    teacher: teacherDocumentId ? { documentId: teacherDocumentId } : null,
    sections,
  };
}

async function upsertSections(
  strapi: any,
  course: ExistingCourse,
  lessons: LessonSeed[],
): Promise<void> {
  const merged = buildSections(lessons, course.sections);
  // Strapi v5 validates the full doc on partial update; if an older row has
  // `kind: null`, omitting it here fails the enum/required check. Backfill
  // with the seed's default ('course') whenever the existing row is null.
  await strapi.documents(COURSE_UID).update({
    documentId: course.documentId,
    data: { sections: merged, kind: course.kind ?? 'course' },
    status: 'published',
  });
}

async function upsertLesson(
  strapi: any,
  lesson: LessonSeed,
  courseDocumentId: string,
  teacherDocumentId: string | null,
): Promise<'created' | 'updated'> {
  const data: Record<string, unknown> = {
    slug: lesson.slug,
    title: lesson.title,
    course: courseDocumentId,
    orderIndex: lesson.orderIndex,
    sectionSlug: lesson.sectionSlug,
    type: lesson.type,
    durationMin: lesson.durationMin,
    xp: lesson.xp,
    steps: lesson.steps,
    isFree: lesson.isFree ?? false,
    topic: lesson.topic,
    source: 'platform',
    videoUrl: lesson.videoUrl,
    transcript: lesson.transcript,
  };
  if (teacherDocumentId) data.owner = teacherDocumentId;

  const [existing] = await strapi.documents(LESSON_UID).findMany({
    filters: { slug: lesson.slug },
    limit: 1,
    status: 'published',
  });
  const [draft] = existing
    ? [existing]
    : await strapi.documents(LESSON_UID).findMany({
        filters: { slug: lesson.slug },
        limit: 1,
      });

  if (draft) {
    await strapi.documents(LESSON_UID).update({
      documentId: draft.documentId,
      data,
      status: 'published',
    });
    return 'updated';
  }

  await strapi.documents(LESSON_UID).create({
    data: { ...data, publishedAt: new Date().toISOString() },
    status: 'published',
  });
  return 'created';
}

/**
 * DELETE legacy themed courses + placeholder library items (caterpillar /
 * peppa / charlotte / harry / …) so the kids school catalog only shows real,
 * completable content. Cascades through lessons attached to those courses.
 * Idempotent — if the slug doesn't exist we skip.
 *
 * NOTE: this is a hard delete, not an archive. Any user-progress rows that
 * pointed at deleted lessons become orphaned (relation populates as null).
 * That's acceptable: those rows referenced placeholder content that was
 * never real, and the kids' completion totals don't include them.
 */
async function deleteLegacyCourses(strapi: any): Promise<number> {
  let deleted = 0;
  for (const slug of LEGACY_COURSE_SLUGS) {
    const course = await findCourse(strapi, slug);
    if (!course) continue;

    // First delete attached lessons — Strapi v5 doesn't cascade through
    // relations on the `course.lessons` side automatically.
    const lessons = await strapi.documents(LESSON_UID).findMany({
      filters: { course: { documentId: { $eq: course.documentId } } },
      fields: ['documentId'],
      limit: 200,
    });
    for (const l of lessons) {
      try {
        await strapi.documents(LESSON_UID).delete({ documentId: l.documentId });
      } catch (err) {
        strapi.log.warn(
          `[seed] real-lessons: failed to delete lesson ${l.documentId} of legacy course ${slug}: ${(err as Error).message}`,
        );
      }
    }

    try {
      await strapi.documents(COURSE_UID).delete({ documentId: course.documentId });
      deleted += 1;
    } catch (err) {
      strapi.log.warn(
        `[seed] real-lessons: failed to delete legacy course ${slug}: ${(err as Error).message}`,
      );
    }
  }
  return deleted;
}

export async function up(strapi: any): Promise<void> {
  const teacherId = await ensureSeedTeacher(strapi);

  let created = 0;
  let updated = 0;
  let skippedCourses = 0;

  for (const seed of COURSE_SEEDS) {
    const course = await ensureCourse(strapi, seed, teacherId);
    if (!course) {
      skippedCourses += 1;
      continue;
    }

    const owner = course.teacher?.documentId ?? teacherId ?? null;
    for (const lesson of seed.lessons) {
      const result = await upsertLesson(strapi, lesson, course.documentId, owner);
      if (result === 'created') created += 1;
      else updated += 1;
    }

    await upsertSections(strapi, course, seed.lessons);
  }

  const deleted = await deleteLegacyCourses(strapi);

  strapi.log.info(
    `[seed] real-lessons: courses=${COURSE_SEEDS.length - skippedCourses}/${COURSE_SEEDS.length}, lessons created=${created}, updated=${updated}, legacy deleted=${deleted}`,
  );
}
