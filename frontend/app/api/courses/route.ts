/**
 * GET /api/courses — public course catalog.
 *
 * Thin proxy to Strapi `/api/courses`. Catalog is public (see backend seed
 * 03-permissions), so no auth header is forwarded. Forwards arbitrary query
 * string so callers can supply `filters`, `populate`, `sort`, etc.
 *
 * Exists so the browser never talks to Strapi directly — avoids needing
 * `NEXT_PUBLIC_API_BASE_URL` + CORS configured for every deployment.
 */
import { NextRequest } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-config';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const res = await fetch(`${BACKEND_URL}/api/courses${search}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
