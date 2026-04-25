/**
 * scopedFind — helper for role-scoped `find` controllers.
 *
 * Strapi v5's `validateQuery` rejects filters on relation keys the caller
 * doesn't have permission to read ("Invalid key <relation>" → 400), and
 * `sanitizeQuery` strips populate entries for those same relations. We
 * can't inject scope filters into ctx.query.filters before calling super.find.
 *
 * This helper:
 *   1. Lets the caller's own query pass validateQuery + sanitizeQuery first.
 *   2. Merges the server-side scope filter at the document-service layer
 *      (bypasses the client-permission check).
 *   3. Optionally replaces the populate spec with a server-trusted one —
 *      needed when the caller has read on the parent entity but not on a
 *      populated relation's content-type (e.g. teacher reading `groups` can
 *      see own group, but has no `find` on `user-profile`, so sanitizeQuery
 *      drops `populate[members]`). Providing `populate` here restores it.
 *      When `options.populate` is set, output sanitization runs without auth
 *      so the trusted relations aren't stripped on the way back out
 *      (`sanitizeOutput` would otherwise call `removeRestrictedRelations`).
 *   4. Returns a Strapi-shaped `{ data, meta.pagination }` response.
 */
type AnyCtx = any;
type AnyController = any;

export async function scopedFind(
  ctx: AnyCtx,
  controller: AnyController,
  uid: string,
  scopeFilter: Record<string, unknown>,
  options: { populate?: unknown } = {},
) {
  const strapi = (global as any).strapi;
  await controller.validateQuery(ctx);
  const sanitized: any = await controller.sanitizeQuery(ctx);
  const filters = { ...(sanitized.filters ?? {}), ...scopeFilter };
  const useTrustedPopulate = options.populate !== undefined;
  const populate = useTrustedPopulate ? options.populate : sanitized.populate;

  const entries = await strapi.documents(uid).findMany({ ...sanitized, filters, populate });
  const total = await strapi.documents(uid).count({ filters });

  const page = Number(sanitized?.pagination?.page ?? 1);
  const pageSize = Number(sanitized?.pagination?.pageSize ?? 25);
  const sanitizedResults = useTrustedPopulate
    ? await strapi.contentAPI.sanitize.output(entries, strapi.contentType(uid))
    : await controller.sanitizeOutput(entries, ctx);
  return controller.transformResponse(sanitizedResults, {
    pagination: { page, pageSize, pageCount: Math.ceil(total / Math.max(pageSize, 1)), total },
  });
}

/**
 * Schema-only output sanitize — strips `private: true` fields but DOES NOT
 * strip relations based on the caller's read permission. Use when you have
 * already validated the caller's authorization and want the trusted populate
 * to flow back to the client unchanged.
 */
export async function sanitizeOutputTrusted(uid: string, data: unknown) {
  const strapi = (global as any).strapi;
  return strapi.contentAPI.sanitize.output(data, strapi.contentType(uid));
}
