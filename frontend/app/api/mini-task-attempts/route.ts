/**
 * GET /api/mini-task-attempts — list (scoped server-side: admin all; teacher
 * sees attempts on their authored tasks; parent sees own kids; student sees
 * own).
 *
 * Submissions are not POSTed here — kids/students go through
 * /api/mini-task-attempts/me so the BE can inject the caller's profileId
 * (never trusts a client-supplied `user` relation).
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
  const res = await fetch(`${BACKEND_URL}/api/mini-task-attempts${search}`, {
    method: 'GET',
    headers: { ...(await authHeader()) },
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
