/**
 * Next.js proxy (formerly `middleware`).
 *
 * Redirects unauthenticated users off protected routes and authenticated users
 * off the auth routes. Auth is detected by presence of the access-cookie — a
 * cheap short-circuit; proper JWT validation happens server-side when the
 * request reaches a protected server component or route handler.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth-config';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/library',
  '/calendar',
  '/kids',
  '/auth/profile',
];

const AUTH_PREFIXES = [
  '/login',
  '/register',
  '/welcome',
  '/auth/login',
  '/auth/register',
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
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (matchesAny(pathname, AUTH_PREFIXES) && hasSession(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.delete('next');
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
