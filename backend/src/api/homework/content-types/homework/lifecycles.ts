/**
 * Homework lifecycle — auto-create `homework-submission` rows on publish.
 *
 * Fires when homework transitions to `status = 'published'`. For each
 * assignee (user-profile m2m), ensure a submission row exists (status
 * `notStarted`). Idempotent — duplicates are skipped via pre-lookup.
 */

const SUB_UID = 'api::homework-submission.homework-submission';
const HOMEWORK_UID = 'api::homework.homework';

async function ensureSubmissions(event: any): Promise<void> {
  const strapi = (global as any).strapi;
  if (!strapi) return;

  const result = event.result;
  const docId = result?.documentId;
  const newStatus = result?.status;
  if (!docId || newStatus !== 'published') return;

  const hw = await strapi.documents(HOMEWORK_UID).findOne({
    documentId: docId,
    populate: { assignees: { fields: ['documentId'] } },
  });
  if (!hw) return;

  const assignees: any[] = Array.isArray((hw as any).assignees) ? (hw as any).assignees : [];
  if (assignees.length === 0) return;

  let created = 0;
  for (const assignee of assignees) {
    const studentDocId = assignee?.documentId;
    if (!studentDocId) continue;
    const [existing] = await strapi.documents(SUB_UID).findMany({
      filters: {
        homework: { documentId: { $eq: docId } },
        student: { documentId: { $eq: studentDocId } },
      },
      fields: ['documentId'],
      limit: 1,
    });
    if (existing) continue;
    await strapi.documents(SUB_UID).create({
      data: {
        homework: docId,
        student: studentDocId,
        status: 'notStarted',
      },
    });
    created++;
  }
  if (created > 0) {
    strapi.log.info(`[homework] published ${docId} → created ${created} submission(s)`);
  }
}

export default {
  async afterCreate(event: any) {
    await ensureSubmissions(event);
  },
  async afterUpdate(event: any) {
    await ensureSubmissions(event);
  },
};
