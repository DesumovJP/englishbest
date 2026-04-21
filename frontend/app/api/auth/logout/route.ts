/**
 * POST /api/auth/logout
 *
 * Revokes the refresh token server-side and clears both auth cookies. Safe to
 * call unauthenticated — just clears cookies.
 */
import { cookies } from 'next/headers';
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
  clearCookieOptions,
} from '@/lib/auth-config';

export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    }).catch(() => {});
  }

  store.set(ACCESS_COOKIE, '', clearCookieOptions());
  store.set(REFRESH_COOKIE, '', clearCookieOptions());

  return new Response(null, { status: 204 });
}
