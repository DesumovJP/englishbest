/**
 * GET /api/shop-items — public shop catalog, populated with image media.
 *
 * Thin proxy to Strapi `/api/shop-items`. Catalog is public (see backend
 * seed 03-permissions), so no auth header is forwarded.
 */
import { NextRequest } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-config';

export async function GET(_req: NextRequest) {
  const res = await fetch(
    `${BACKEND_URL}/api/shop-items?populate=*&pagination[pageSize]=200&sort=price:asc`,
    { method: 'GET', cache: 'no-store' },
  );
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
