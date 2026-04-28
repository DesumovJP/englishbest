/**
 * One-shot backfill: grandfather every existing content row
 * (lesson / course / vocabulary-set) with a `reviewStatus='approved'`
 * marker so they keep flowing through public reads after the moderation
 * workflow lands. Also derives missing `owner` + `source` on course +
 * vocab from already-existing relations so day-1 ownership matches the
 * actual provenance of the data.
 *
 * Idempotent: rows that already have the field set are left alone.
 *
 * Heuristics
 * ----------
 *   reviewStatus → 'approved' for any row whose field is unset (NULL) or
 *                  empty. Anything live today is implicitly approved.
 *
 *   course.source     → 'platform' if `slug` looks like a seeded slug
 *                       (matches `seeds/lesson-content/cefr-v2/*`),
 *                       else 'own'. Falls back to 'platform' if the
 *                       course has no `teacher` relation either.
 *   course.owner      → derived from existing `course.teacher` relation.
 *
 *   vocab.source      → 'platform' if linked to a seeded course/lesson
 *                       (transitively), else 'own'. Falls back to
 *                       'platform' for orphan rows (no parent + no
 *                       owner heuristic match).
 *   vocab.owner       → derived from `vocab.lesson.owner` first
 *                       (lesson-scoped vocab inherits lesson owner),
 *                       then `vocab.course.teacher` (course-scoped),
 *                       else null.
 *
 * Usage:
 *   npm run backfill-content-lifecycle --workspace=backend
 *
 * Run on staging first, review the per-type counts in the log, then
 * run on prod (with a DB backup).
 */
import { compileStrapi, createStrapi } from '@strapi/strapi';

const LESSON_UID = 'api::lesson.lesson';
const COURSE_UID = 'api::course.course';
const VOCAB_UID = 'api::vocabulary-set.vocabulary-set';

const SEEDED_COURSE_SLUG_HINTS = [
  'a-foundation',
  'a-my-world',
  'a-people-places',
  'b-real-world',
  'b-stories',
  'b-thoughts-ideas',
];

function isSeededCourseSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return SEEDED_COURSE_SLUG_HINTS.some((hint) => slug === hint || slug.startsWith(`${hint}-`));
}

async function main() {
  const ctx = await compileStrapi();
  const app = await createStrapi(ctx).load();
  try {
    const log = app.log;
    log.info('[backfill-content-lifecycle] starting');

    let lessonsTouched = 0;
    let coursesTouched = 0;
    let vocabsTouched = 0;
    let lessonsSkipped = 0;
    let coursesSkipped = 0;
    let vocabsSkipped = 0;

    // ── Lessons ──────────────────────────────────────────────────────
    const lessons = await (app as any).documents(LESSON_UID).findMany({
      fields: ['documentId', 'reviewStatus'],
      pagination: { limit: -1 },
      status: 'draft',
    });
    log.info(`[backfill] lessons scanned=${lessons.length}`);
    for (const l of lessons) {
      const rec = l as { documentId: string; reviewStatus?: string | null };
      if (rec.reviewStatus && rec.reviewStatus.length > 0) {
        lessonsSkipped++;
        continue;
      }
      await (app as any).documents(LESSON_UID).update({
        documentId: rec.documentId,
        data: { reviewStatus: 'approved' },
      });
      lessonsTouched++;
    }

    // ── Courses ──────────────────────────────────────────────────────
    const courses = await (app as any).documents(COURSE_UID).findMany({
      fields: ['documentId', 'slug', 'source', 'reviewStatus'],
      populate: { teacher: { fields: ['documentId'] }, owner: { fields: ['documentId'] } },
      pagination: { limit: -1 },
      status: 'draft',
    });
    log.info(`[backfill] courses scanned=${courses.length}`);
    for (const c of courses) {
      const rec = c as {
        documentId: string;
        slug?: string;
        source?: string | null;
        reviewStatus?: string | null;
        teacher?: { documentId?: string } | null;
        owner?: { documentId?: string } | null;
      };
      const updates: Record<string, unknown> = {};
      if (!rec.reviewStatus) updates.reviewStatus = 'approved';
      if (!rec.source) updates.source = isSeededCourseSlug(rec.slug) ? 'platform' : (rec.teacher?.documentId ? 'own' : 'platform');
      if (!rec.owner?.documentId && rec.teacher?.documentId) updates.owner = rec.teacher.documentId;
      if (Object.keys(updates).length === 0) {
        coursesSkipped++;
        continue;
      }
      await (app as any).documents(COURSE_UID).update({ documentId: rec.documentId, data: updates });
      coursesTouched++;
    }

    // ── Vocabulary sets ──────────────────────────────────────────────
    const vocabs = await (app as any).documents(VOCAB_UID).findMany({
      fields: ['documentId', 'source', 'reviewStatus'],
      populate: {
        course: {
          fields: ['documentId', 'slug'],
          populate: { teacher: { fields: ['documentId'] } },
        },
        lesson: {
          fields: ['documentId'],
          populate: { owner: { fields: ['documentId'] } },
        },
        owner: { fields: ['documentId'] },
      },
      pagination: { limit: -1 },
      status: 'draft',
    });
    log.info(`[backfill] vocabs scanned=${vocabs.length}`);
    for (const v of vocabs) {
      const rec = v as {
        documentId: string;
        source?: string | null;
        reviewStatus?: string | null;
        course?: { documentId?: string; slug?: string; teacher?: { documentId?: string } | null } | null;
        lesson?: { documentId?: string; owner?: { documentId?: string } | null } | null;
        owner?: { documentId?: string } | null;
      };
      const updates: Record<string, unknown> = {};
      if (!rec.reviewStatus) updates.reviewStatus = 'approved';
      if (!rec.source) {
        const parentIsSeeded = isSeededCourseSlug(rec.course?.slug);
        updates.source = parentIsSeeded ? 'platform' : (rec.lesson?.owner?.documentId || rec.course?.teacher?.documentId ? 'own' : 'platform');
      }
      if (!rec.owner?.documentId) {
        const derived =
          rec.lesson?.owner?.documentId ?? rec.course?.teacher?.documentId ?? null;
        if (derived) updates.owner = derived;
      }
      if (Object.keys(updates).length === 0) {
        vocabsSkipped++;
        continue;
      }
      await (app as any).documents(VOCAB_UID).update({ documentId: rec.documentId, data: updates });
      vocabsTouched++;
    }

    log.info(
      `[backfill-content-lifecycle] done — ` +
        `lessons touched=${lessonsTouched} skipped=${lessonsSkipped} · ` +
        `courses touched=${coursesTouched} skipped=${coursesSkipped} · ` +
        `vocabs touched=${vocabsTouched} skipped=${vocabsSkipped}`,
    );
  } catch (err) {
    app.log.error('[backfill-content-lifecycle] failed');
    app.log.error(err as never);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
}

main();
