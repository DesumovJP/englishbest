/**
 * POST /api/auth/login
 *
 * Forwards credentials to Strapi `/api/auth/login`, stashes the returned
 * access + refresh tokens in httpOnly cookies, and returns the session
 * payload (user + profile) to the client.
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
  if (!body?.identifier || !body?.password) {
    return Response.json({ error: 'identifier and password required' }, { status: 400 });
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-agent': req.headers.get('user-agent') ?? '',
    },
    body: JSON.stringify({
      identifier: body.identifier,
      password: body.password,
    }),
    cache: 'no-store',
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    return Response.json(payload, { status: res.status });
  }

  const store = await cookies();
  store.set(ACCESS_COOKIE, payload.accessToken, accessCookieOptions());
  store.set(REFRESH_COOKIE, payload.refreshToken, refreshCookieOptions());

  return Response.json({ user: payload.user, profile: payload.profile });
}
