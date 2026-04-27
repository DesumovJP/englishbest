/**
 * GET /api/rewards/student/:studentId/motivation — proxy. Aggregate
 * motivation snapshot (level, streak, coins, XP, recent achievements,
 * recent reward-events) for one student. BE scopes by role.
 */
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ studentId: string }> },
) {
  const { studentId } = await ctx.params;
  const res = await fetch(
    `${BACKEND_URL}/api/rewards/student/${encodeURIComponent(studentId)}/motivation`,
    {
      method: 'GET',
      headers: { ...(await authHeader()) },
      cache: 'no-store',
    },
  );
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
