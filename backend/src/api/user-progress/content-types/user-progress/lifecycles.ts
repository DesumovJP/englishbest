/**
 * user-progress lifecycle — fires the lesson reward when a record transitions
 * to `status: 'completed'` (via create or update).
 *
 * All actual coin / XP / streak / achievement work lives in
 * `lib/rewards.ts:awardOnAction`. This file is just the thin trigger:
 * resolve the user-profile, derive the idempotency key from the progress
 * documentId, hand off to the service.
 *
 * Idempotency:
 *   - Status guard (we only call when prev status wasn't 'completed').
 *   - The service's reward-event ledger (sourceKey `lesson:<progressDocId>`).
 * Either layer alone is enough; together they're belt + braces.
 */
import { awardOnAction } from '../../../../lib/rewards';

const PROGRESS_UID = 'api::user-progress.user-progress';

async function handleCompletion(strapi: any, progressId: string | number): Promise<void> {
  const progress: any = await strapi.db.query(PROGRESS_UID).findOne({
    where: { id: progressId },
    populate: { user: true },
  });
  const userProfileId = progress?.user?.documentId;
  const progressDocId = progress?.documentId;
  if (!userProfileId || !progressDocId) return;

  await awardOnAction(strapi, {
    userProfileId,
    action: 'lesson',
    sourceKey: `lesson:${progressDocId}`,
    advanceStreak: true,
    setMood: 'happy',
  });
}

export default {
  async beforeUpdate(event: any) {
    const id = event.params?.where?.id;
    if (!id) return;
    const existing = await (global as any).strapi.db.query(PROGRESS_UID).findOne({
      where: { id },
      select: ['status'],
    });
    event.state = event.state || {};
    event.state.prevStatus = existing?.status ?? null;
  },

  async afterCreate(event: any) {
    const status = event.result?.status;
    if (status !== 'completed') return;
    await handleCompletion((global as any).strapi, event.result.id);
  },

  async afterUpdate(event: any) {
    const status = event.result?.status;
    if (status !== 'completed') return;
    if (event.state?.prevStatus === 'completed') return;
    await handleCompletion((global as any).strapi, event.result.id);
  },
};
