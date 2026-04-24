/**
 * Next.js proxy (formerly `middleware`).
 *
 * Kicks anonymous callers off protected routes — cheap cookie-presence check,
 * proper JWT validation still runs server-side in each protected layout/page.
 *
 * We deliberately do NOT redirect authenticated-cookie visitors away from
 * /login or /register: that pattern produced a loop whenever the access JWT
 * had expired but the cookie was still present. In that case the proxy would
 * bounce /login → /dashboard, dashboard's `getSession()` would fail validation
 * and bounce back /dashboard → /login, repeat. Auto-redirecting already-logged-
 * in users off /login is handled client-side in the login page via useSession()
 * against the real session, not the cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth-config';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/library',
  '/calendar',
  '/kids',
];

function hasSession(req: NextRequest) {
  return Boolean(
    req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get(REFRESH_COOKIE)?.value
  );
}

function matchesAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (matchesAny(pathname, PROTECTED_PREFIXES) && !hasSession(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static assets, images, videos, sounds, and API routes.
    '/((?!_next/|favicon|images/|videos/|sounds/|api/).*)',
  ],
};
