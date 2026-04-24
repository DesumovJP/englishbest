/**
 * scopedFind — helper for role-scoped `find` controllers.
 *
 * Strapi v5's `validateQuery` rejects filters on relation keys the caller
 * doesn't have permission to read ("Invalid key <relation>" → 400), so we
 * can't inject scope filters into ctx.query.filters before calling super.find.
 *
 * This helper:
 *   1. Lets the caller's own query pass validateQuery + sanitizeQuery first.
 *   2. Merges the server-side scope filter at the document-service layer
 *      (bypasses the client-permission check).
 *   3. Returns a Strapi-shaped `{ data, meta.pagination }` response.
 */
type AnyCtx = any;
type AnyController = any;

export async function scopedFind(
  ctx: AnyCtx,
  controller: AnyController,
  uid: string,
  scopeFilter: Record<string, unknown>,
) {
  const strapi = (global as any).strapi;
  await controller.validateQuery(ctx);
  const sanitized: any = await controller.sanitizeQuery(ctx);
  const filters = { ...(sanitized.filters ?? {}), ...scopeFilter };

  const entries = await strapi.documents(uid).findMany({ ...sanitized, filters });
  const total = await strapi.documents(uid).count({ filters });

  const page = Number(sanitized?.pagination?.page ?? 1);
  const pageSize = Number(sanitized?.pagination?.pageSize ?? 25);
  const sanitizedResults = await controller.sanitizeOutput(entries, ctx);
  return controller.transformResponse(sanitizedResults, {
    pagination: { page, pageSize, pageCount: Math.ceil(total / Math.max(pageSize, 1)), total },
  });
}
