/**
 * One-shot backfill: align `lesson.{course, sectionSlug, orderIndex}` to the
 * authoritative `course.sections[].lessonSlugs[]` arrays.
 *
 * Why: the dashboard course editor historically wrote only the slug-array
 * inside `course.sections[]` (a component on Course). The lesson schema has
 * had `course` (relation), `sectionSlug` (string), and `orderIndex` (int)
 * since seeds, but old / hand-edited courses can leave them stale or null.
 *
 * This script walks every course, builds a slug → {courseId, sectionSlug,
 * orderIndex} map, then updates each referenced lesson so its relation
 * mirrors the slug-array. Idempotent — already-aligned lessons are skipped.
 *
 * Scope: LINKING ONLY. Lessons whose `course` points at a course that no
 * longer references them via slug are NOT cleared here — they're still safe
 * to read from `lessonSlugs[]` and a later cleanup chunk handles them when
 * we drop the slug-array. Duplicate slugs across different courses keep the
 * first occurrence and log a warning (lesson.course is many-to-one).
 *
 * Usage (local/dev):
 *   npm run backfill-lesson-courses --workspace=backend
 *
 * Run against staging FIRST; review the log; then run against prod.
 */
import { compileStrapi, createStrapi } from '@strapi/strapi';

const COURSE_UID = 'api::course.course';
const LESSON_UID = 'api::lesson.lesson';

interface AssignmentTarget {
  courseId: string;
  courseSlug: string;
  sectionSlug: string;
  orderIndex: number;
}

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  try {
    const log = app.log;
    log.info('[backfill] aligning lesson↔course relations to slug-arrays');

    const courses = await app.documents(COURSE_UID).findMany({
      fields: ['documentId', 'slug'],
      populate: { sections: true },
      pagination: { limit: -1 },
      status: 'draft',
    });
    log.info(`[backfill] scanned ${courses.length} course(s)`);

    const target = new Map<string, AssignmentTarget>();
    for (const course of courses) {
      const courseId = (course as any).documentId as string;
      const courseSlug = (course as any).slug as string;
      const sections = ((course as any).sections ?? []) as Array<{
        slug?: string;
        lessonSlugs?: string[];
      }>;
      for (const sec of sections) {
        if (!sec?.slug) continue;
        const slugs = Array.isArray(sec.lessonSlugs) ? sec.lessonSlugs : [];
        slugs.forEach((slug, idx) => {
          if (!slug) return;
          const prior = target.get(slug);
          if (prior) {
            log.warn(
              `[backfill] duplicate ref: lesson "${slug}" already in ${prior.courseSlug}/${prior.sectionSlug} — skipping ref in ${courseSlug}/${sec.slug}`,
            );
            return;
          }
          target.set(slug, {
            courseId,
            courseSlug,
            sectionSlug: sec.slug!,
            orderIndex: idx,
          });
        });
      }
    }
    log.info(`[backfill] ${target.size} unique lesson slug(s) to align`);

    let linked = 0;
    let aligned = 0;
    let missing = 0;

    for (const [slug, t] of target) {
      const [lesson] = await app.documents(LESSON_UID).findMany({
        filters: { slug: { $eq: slug } },
        fields: ['documentId', 'sectionSlug', 'orderIndex'],
        populate: { course: { fields: ['documentId'] } },
        limit: 1,
        status: 'draft',
      });
      if (!lesson) {
        log.warn(`[backfill] orphan slug "${slug}" — no matching lesson`);
        missing++;
        continue;
      }
      const lessonId = (lesson as any).documentId as string;
      const currentCourseId = (lesson as any).course?.documentId ?? null;
      const currentSection = (lesson as any).sectionSlug ?? null;
      const currentOrder =
        typeof (lesson as any).orderIndex === 'number' ? (lesson as any).orderIndex : null;
      if (
        currentCourseId === t.courseId &&
        currentSection === t.sectionSlug &&
        currentOrder === t.orderIndex
      ) {
        aligned++;
        continue;
      }
      await app.documents(LESSON_UID).update({
        documentId: lessonId,
        data: {
          course: t.courseId,
          sectionSlug: t.sectionSlug,
          orderIndex: t.orderIndex,
        },
      });
      log.info(
        `[backfill] linked "${slug}" → ${t.courseSlug}/${t.sectionSlug}#${t.orderIndex}`,
      );
      linked++;
    }

    log.info(
      `[backfill] done — linked=${linked} already-aligned=${aligned} missing=${missing} duplicates-warned=${
        Array.from(target.values()).length - target.size
      }`,
    );
  } catch (err) {
    app.log.error('[backfill] failed');
    app.log.error(err as any);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
}

main();
