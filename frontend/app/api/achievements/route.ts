/**
 * GET /api/achievements — public achievement catalog.
 *
 * Thin proxy to Strapi. Catalog is public (see backend seed 03-permissions).
 */
import { NextRequest } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-config';

export async function GET(_req: NextRequest) {
  const res = await fetch(
    `${BACKEND_URL}/api/achievements?populate=*&pagination[pageSize]=200`,
    { method: 'GET', cache: 'no-store' },
  );
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
