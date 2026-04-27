/**
 * POST /api/rewards/grant — proxy. Teacher / admin awards bonus coins
 * (and optional XP) to a single student. BE enforces role + caps.
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
  if (!body) {
    return Response.json({ error: { message: 'body required' } }, { status: 400 });
  }
  const res = await fetch(`${BACKEND_URL}/api/rewards/grant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
