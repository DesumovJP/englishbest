/**
 * GET  /api/vocabulary-sets — public vocabulary catalog.
 * POST /api/vocabulary-sets — create a vocab set (staff-only via Strapi RBAC).
 *
 * Thin proxy to Strapi `/api/vocabulary-sets`. GET is anonymous; POST
 * forwards the httpOnly access JWT so Strapi RBAC can check the role
 * (only teacher / admin pass — learners get 403).
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const res = await fetch(`${BACKEND_URL}/api/vocabulary-sets${search}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.data) {
    return Response.json({ error: { message: 'data required' } }, { status: 400 });
  }
  const res = await fetch(`${BACKEND_URL}/api/vocabulary-sets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
