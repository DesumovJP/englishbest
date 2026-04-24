/**
 * GET /api/characters — public character catalog, sorted by orderIndex asc.
 *
 * Thin proxy to Strapi `/api/characters`. Catalog is public (see backend
 * seed 03-permissions), so no auth header is forwarded.
 */
import { NextRequest } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-config';

export async function GET(_req: NextRequest) {
  const res = await fetch(
    `${BACKEND_URL}/api/characters?sort=orderIndex:asc&pagination[pageSize]=100`,
    { method: 'GET', cache: 'no-store' },
  );
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
