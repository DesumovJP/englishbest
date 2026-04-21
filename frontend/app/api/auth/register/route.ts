/**
 * POST /api/auth/register
 *
 * Forwards the registration payload to Strapi `/api/auth/register` (which
 * creates user + user-profile + role-profile in one call). Stashes tokens in
 * httpOnly cookies and returns the session payload.
 */
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from '@/lib/auth-config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: 'body required' }, { status: 400 });

  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-agent': req.headers.get('user-agent') ?? '',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    return Response.json(payload, { status: res.status });
  }

  const store = await cookies();
  store.set(ACCESS_COOKIE, payload.accessToken, accessCookieOptions());
  store.set(REFRESH_COOKIE, payload.refreshToken, refreshCookieOptions());

  return Response.json(
    { user: payload.user, profile: payload.profile },
    { status: 201 }
  );
}
