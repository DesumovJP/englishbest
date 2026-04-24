/**
 * GET /api/parent/me/children/:kidDocId — deep child view.
 *
 * Thin proxy — forwards httpOnly access JWT as Bearer.
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
  _req: NextRequest,
  ctx: { params: Promise<{ kidDocId: string }> },
) {
  const { kidDocId } = await ctx.params;
  const res = await fetch(
    `${BACKEND_URL}/api/parent/me/children/${encodeURIComponent(kidDocId)}`,
    {
      method: 'GET',
      headers: { ...(await authHeader()) },
      cache: 'no-store',
    },
  );
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
