/**
 * PUT /api/mini-task-attempts/:id — teacher review (set score + feedback) on
 * an attempt against the teacher's own authored mini-task. BE enforces
 * ownership and ignores any other field on the body.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.data) {
    return Response.json(
      { error: { message: 'data required' } },
      { status: 400 },
    );
  }
  const res = await fetch(`${BACKEND_URL}/api/mini-task-attempts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
