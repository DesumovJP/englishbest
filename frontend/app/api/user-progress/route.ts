/**
 * POST /api/user-progress  — create a user-progress record.
 * GET  /api/user-progress  — list current user's progress.
 *
 * Thin proxy: forwards the caller's access JWT (from the httpOnly cookie) to
 * the Strapi user-progress endpoint. Strapi's scoped controller enforces
 * ownership — the browser cannot see or spoof the `user` relation.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.data) {
    return Response.json({ error: { message: 'data required' } }, { status: 400 });
  }

  const res = await fetch(`${BACKEND_URL}/api/user-progresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search; // preserve pagination/populate from caller
  const res = await fetch(`${BACKEND_URL}/api/user-progresses${search}`, {
    method: 'GET',
    headers: { ...(await authHeader()) },
    cache: 'no-store',
  });

  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
