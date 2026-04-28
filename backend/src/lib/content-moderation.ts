/**
 * Content moderation helpers — shared submit / approve / reject
 * transitions for lesson, course, vocabulary-set.
 *
 * Encodes the state machine from CONTENT_LIFECYCLE_PLAN.md §6:
 *   draft       → submitted   (owner)
 *   rejected    → submitted   (owner re-submits)
 *   submitted   → approved    (admin)
 *   submitted   → rejected    (admin, with reason)
 *
 * Each transition writes an `api::audit-log` row via `writeAudit`.
 *
 * Caller is responsible for:
 *   - looking up `existing` row with at least { documentId, owner,
 *     reviewStatus } populated;
 *   - resolving the caller's user-profile + teacher-profile docIds.
 */
import { writeAudit } from './audit';

const PROFILE_UID = 'api::user-profile.user-profile';

type Status = 'draft' | 'submitted' | 'approved' | 'rejected';

interface ExistingRow {
  documentId: string;
  reviewStatus?: Status | null;
  owner?: { documentId?: string } | null;
}

async function callerProfileDocId(
  strapi: any,
  userId: number | string | undefined,
): Promise<string | null> {
  if (!userId) return null;
  const [p] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return p?.documentId ?? null;
}

/**
 * Owner-or-admin transition: draft|rejected → submitted.
 * Returns { ok: true, fresh } on success; throws (ctx-aware) on guard fail.
 */
export async function submitContent(opts: {
  strapi: any;
  ctx: any;
  uid: string;
  existing: ExistingRow;
  callerTeacherProfileId: string | null;
  isAdmin: boolean;
}): Promise<{ data: unknown }> {
  const { strapi, ctx, uid, existing, callerTeacherProfileId, isAdmin } = opts;

  const ownerId = existing.owner?.documentId ?? null;
  if (!isAdmin) {
    if (!callerTeacherProfileId || ownerId !== callerTeacherProfileId) {
      return ctx.forbidden('not the owner');
    }
  }
  const current = existing.reviewStatus ?? 'draft';
  if (current !== 'draft' && current !== 'rejected') {
    return ctx.badRequest(`cannot submit from state '${current}'`);
  }

  await strapi.documents(uid).update({
    documentId: existing.documentId,
    data: { reviewStatus: 'submitted', rejectionReason: null },
  });
  const fresh = await strapi.documents(uid).findOne({
    documentId: existing.documentId,
    populate: { owner: true, reviewedBy: true },
  });
  await writeAudit(strapi, ctx, {
    action: 'submit',
    entityType: uid,
    entityId: existing.documentId,
    before: existing,
    after: fresh,
  });
  return { data: fresh };
}

/**
 * Admin-only transition: submitted → approved.
 * Sets `reviewedBy` + `reviewedAt`.
 */
export async function approveContent(opts: {
  strapi: any;
  ctx: any;
  uid: string;
  existing: ExistingRow;
  isAdmin: boolean;
}): Promise<{ data: unknown }> {
  const { strapi, ctx, uid, existing, isAdmin } = opts;

  if (!isAdmin) return ctx.forbidden('admin only');
  const current = existing.reviewStatus ?? 'draft';
  if (current !== 'submitted') {
    return ctx.badRequest(`cannot approve from state '${current}'`);
  }

  const adminProfileId = await callerProfileDocId(strapi, ctx.state.user?.id);
  await strapi.documents(uid).update({
    documentId: existing.documentId,
    data: {
      reviewStatus: 'approved',
      rejectionReason: null,
      reviewedBy: adminProfileId,
      reviewedAt: new Date().toISOString(),
    },
  });
  const fresh = await strapi.documents(uid).findOne({
    documentId: existing.documentId,
    populate: { owner: true, reviewedBy: true },
  });
  await writeAudit(strapi, ctx, {
    action: 'approve',
    entityType: uid,
    entityId: existing.documentId,
    before: existing,
    after: fresh,
  });
  return { data: fresh };
}

/**
 * Admin-only transition: submitted → rejected. Requires non-empty reason.
 */
export async function rejectContent(opts: {
  strapi: any;
  ctx: any;
  uid: string;
  existing: ExistingRow;
  isAdmin: boolean;
  reason: string;
}): Promise<{ data: unknown }> {
  const { strapi, ctx, uid, existing, isAdmin, reason } = opts;

  if (!isAdmin) return ctx.forbidden('admin only');
  const current = existing.reviewStatus ?? 'draft';
  if (current !== 'submitted') {
    return ctx.badRequest(`cannot reject from state '${current}'`);
  }
  const cleanReason = (reason ?? '').trim();
  if (cleanReason.length === 0) {
    return ctx.badRequest('rejection reason required');
  }

  const adminProfileId = await callerProfileDocId(strapi, ctx.state.user?.id);
  await strapi.documents(uid).update({
    documentId: existing.documentId,
    data: {
      reviewStatus: 'rejected',
      rejectionReason: cleanReason,
      reviewedBy: adminProfileId,
      reviewedAt: new Date().toISOString(),
    },
  });
  const fresh = await strapi.documents(uid).findOne({
    documentId: existing.documentId,
    populate: { owner: true, reviewedBy: true },
  });
  await writeAudit(strapi, ctx, {
    action: 'reject',
    entityType: uid,
    entityId: existing.documentId,
    before: existing,
    after: fresh,
    metadata: { reason: cleanReason },
  });
  return { data: fresh };
}
