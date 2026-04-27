/**
 * GET /api/rewards/student/:studentId/weekly — proxy. Rolling-7-day
 * activity digest (XP, coins, lessons, mini-tasks, homeworks, achievements,
 * active days + daily sparkline). Powers the parent dashboard weekly card
 * and the StudentDetail Motivation tab "Тиждень" footer.
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
    `${BACKEND_URL}/api/rewards/student/${encodeURIComponent(studentId)}/weekly`,
    {
      method: 'GET',
      headers: { ...(await authHeader()) },
      cache: 'no-store',
    },
  );
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
