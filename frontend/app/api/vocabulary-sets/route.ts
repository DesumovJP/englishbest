/**
 * GET /api/vocabulary-sets — public vocabulary catalog.
 *
 * Thin proxy to Strapi `/api/vocabulary-sets`. Mirrors the courses proxy
 * pattern: the browser never talks to Strapi directly, so we don't need
 * NEXT_PUBLIC_API_BASE_URL + CORS configured per deployment. Vocabulary
 * is public-read (see backend seed 03-permissions), so no auth header is
 * forwarded. Arbitrary query strings (filters, populate, sort,
 * pagination) are passed through verbatim.
 */
import { NextRequest } from 'next/server';
import { BACKEND_URL } from '@/lib/auth-config';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const res = await fetch(`${BACKEND_URL}/api/vocabulary-sets${search}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
