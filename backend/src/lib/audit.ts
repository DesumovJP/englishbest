/**
 * Audit-log helper.
 *
 * Writes a row to `api::audit-log.audit-log` capturing who did what, on
 * which entity, and (optionally) the before/after state. Designed to be
 * called from controller mutation paths — not as a Strapi lifecycle hook
 * (those run too late to know the actor's IP / user-agent without ctx).
 *
 * Failure mode: this helper SWALLOWS its own errors and only logs to
 * `strapi.log.warn`. Audit logging must never block the user-visible
 * mutation it's auditing — a write that succeeded shouldn't 500 because
 * the audit-log row failed to insert. Storage-level failures are
 * surfaced through monitoring on the audit-log table itself.
 *
 * Wiring (lands progressively, see ADMIN_PRODUCTION_PLAN.md → Phase 2):
 *   - course / lesson / vocab `delete` (destructive ops first)
 *   - user-profile role + status changes
 *   - lesson-payment / teacher-payout mutations
 *   - approval workflow transitions (submit / approve / reject — see
 *     CONTENT_LIFECYCLE_PLAN.md → Phase L5)
 */

const AUDIT_LOG_UID = 'api::audit-log.audit-log';
const PROFILE_UID = 'api::user-profile.user-profile';

interface KoaCtx {
  state?: { user?: { id?: number | string }; requestId?: string };
  request?: {
    ip?: string;
    headers?: Record<string, string | string[] | undefined>;
  };
  status?: number;
}

export interface AuditPayload {
  /** Action verb — `'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'submit' | 'approve' | 'reject' | …`. Free-form string so callers can express domain verbs precisely. */
  action: string;
  /** Strapi UID of the affected content-type, e.g. `'api::course.course'`. */
  entityType: string;
  /** documentId (Strapi v5) of the affected row. Pass empty string if the
   *  action targets a collection (rare). */
  entityId: string;
  /** Snapshot of the row BEFORE the mutation (omit for `create`). Caller
   *  should populate via the Documents API before mutating. */
  before?: unknown;
  /** Snapshot AFTER (omit for `delete`). */
  after?: unknown;
  /** Free-form context — reason text, request body subset, etc. */
  metadata?: Record<string, unknown>;
}

async function callerProfileId(strapi: any, userId: number | string | undefined): Promise<string | null> {
  if (!userId) return null;
  const [profile] = await strapi.documents(PROFILE_UID).findMany({
    filters: { user: { id: userId } },
    fields: ['documentId'],
    limit: 1,
  });
  return profile?.documentId ?? null;
}

function userAgent(headers: KoaCtx['request']['headers'] | undefined): string | null {
  if (!headers) return null;
  const v = headers['user-agent'];
  if (typeof v === 'string') return v.slice(0, 1024);
  if (Array.isArray(v)) return v.join(', ').slice(0, 1024);
  return null;
}

/**
 * Write a single audit-log row. Best-effort: any error is logged to
 * strapi.log.warn and swallowed.
 */
export async function writeAudit(
  strapi: any,
  ctx: KoaCtx | null | undefined,
  payload: AuditPayload,
): Promise<void> {
  try {
    const userId = ctx?.state?.user?.id;
    const actorDocumentId = await callerProfileId(strapi, userId);

    await strapi.documents(AUDIT_LOG_UID).create({
      data: {
        actor: actorDocumentId ?? null,
        actorIp: ctx?.request?.ip ?? null,
        actorUserAgent: userAgent(ctx?.request?.headers),
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        before: payload.before ?? null,
        after: payload.after ?? null,
        requestId: ctx?.state?.requestId ?? null,
        statusCode: typeof ctx?.status === 'number' ? ctx.status : null,
        metadata: payload.metadata ?? null,
        publishedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    strapi.log.warn(
      `[audit] failed to record ${payload.action} on ${payload.entityType}#${payload.entityId}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}
