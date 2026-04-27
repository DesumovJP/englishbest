/**
 * GET / PUT / DELETE /api/vocabulary-sets/:id — staff-write proxy.
 *
 * Forwards the httpOnly access JWT so Strapi RBAC enforces role checks
 * (teacher / admin can write; learners get 403). GET is anonymous —
 * vocabulary catalog is public-read.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const search = req.nextUrl.search;
  const res = await fetch(`${BACKEND_URL}/api/vocabulary-sets/${id}${search}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.data) {
    return Response.json({ error: { message: 'data required' } }, { status: 400 });
  }
  const res = await fetch(`${BACKEND_URL}/api/vocabulary-sets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const res = await fetch(`${BACKEND_URL}/api/vocabulary-sets/${id}`, {
    method: 'DELETE',
    headers: { ...(await authHeader()) },
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
