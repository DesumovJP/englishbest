/**
 * GET  /api/mini-task-attempts/me — caller's own attempts (kids/student).
 * POST /api/mini-task-attempts/me — submit answer. BE auto-grades closed-form
 *                                   exercises and awards coins on the FIRST
 *                                   attempt only.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/api/mini-task-attempts/me`, {
    method: 'GET',
    headers: { ...(await authHeader()) },
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.data) {
    return Response.json(
      { error: { message: 'data required' } },
      { status: 400 },
    );
  }
  const res = await fetch(`${BACKEND_URL}/api/mini-task-attempts/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
