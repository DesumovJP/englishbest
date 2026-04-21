/**
 * Review lifecycle: re-aggregate `course.ratingAvg` + `reviewCount` whenever
 * a review is created, updated, or deleted. Cheap enough to run in-process.
 *
 * Lifecycle events don't carry a strapi reference — we use the global, which
 * Strapi registers at boot.
 */
import type { Event } from '@strapi/database/dist/lifecycles/types';

declare const strapi: any;

const REVIEW_UID = 'api::review.review';
const COURSE_UID = 'api::course.course';

async function recomputeForCourse(courseDocumentId: string) {
  if (!courseDocumentId) return;

  const reviews = await strapi.documents(REVIEW_UID).findMany({
    filters: { course: { documentId: courseDocumentId } },
    fields: ['rating'],
    limit: -1,
  });

  const count = reviews.length;
  const avg =
    count === 0
      ? 0
      : Math.round(
          (reviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) / count) * 100
        ) / 100;

  await strapi.documents(COURSE_UID).update({
    documentId: courseDocumentId,
    data: { ratingAvg: avg, reviewCount: count },
  });
}

async function resolveCourseDocumentId(params: any): Promise<string | null> {
  if (!params) return null;

  const data = params.data;
  if (data?.course) {
    if (typeof data.course === 'string') return data.course;
    if (data.course.connect?.[0]?.documentId) return data.course.connect[0].documentId;
    if (data.course.documentId) return data.course.documentId;
  }

  const where = params.where ?? data;
  if (!where) return null;

  const review = await strapi.db.query(REVIEW_UID).findOne({
    where,
    populate: { course: true },
  });
  return review?.course?.documentId ?? null;
}

export default {
  async afterCreate(event: Event) {
    const courseId = await resolveCourseDocumentId(event.params);
    if (courseId) await recomputeForCourse(courseId);
  },

  async afterUpdate(event: Event) {
    const courseId = await resolveCourseDocumentId(event.params);
    if (courseId) await recomputeForCourse(courseId);
  },

  async beforeDelete(event: Event) {
    const courseId = await resolveCourseDocumentId(event.params);
    event.state.courseDocumentId = courseId;
  },

  async afterDelete(event: Event) {
    const courseId = event.state.courseDocumentId as string | undefined;
    if (courseId) await recomputeForCourse(courseId);
  },
};
