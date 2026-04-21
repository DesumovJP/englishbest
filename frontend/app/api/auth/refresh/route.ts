/**
 * POST /api/auth/refresh
 *
 * Rotates the refresh cookie → new access + refresh pair. Returns 204. The
 * client typically hits this automatically when it receives a 401 from a
 * protected resource; it's idempotent and safe to retry.
 */
import { cookies } from 'next/headers';
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
  accessCookieOptions,
  clearCookieOptions,
  refreshCookieOptions,
} from '@/lib/auth-config';

export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return new Response(null, { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!res.ok) {
    store.set(ACCESS_COOKIE, '', clearCookieOptions());
    store.set(REFRESH_COOKIE, '', clearCookieOptions());
    return new Response(null, { status: 401 });
  }

  const payload = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
  };

  store.set(ACCESS_COOKIE, payload.accessToken, accessCookieOptions());
  store.set(REFRESH_COOKIE, payload.refreshToken, refreshCookieOptions());

  return new Response(null, { status: 204 });
}
