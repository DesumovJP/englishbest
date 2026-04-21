/**
 * Auth cookie + backend-URL constants. Server-only — never imported from a
 * "use client" file, since these values include the server-side backend URL.
 */
export const BACKEND_URL =
  process.env.STRAPI_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:1337';

export const ACCESS_COOKIE = 'eb_access';
export const REFRESH_COOKIE = 'eb_refresh';

// Access JWT is minted with 15m expiry by the backend; cookie lifetime matches.
export const ACCESS_COOKIE_MAX_AGE_SEC = 15 * 60;
// Refresh token service issues tokens with 30d TTL; cookie matches.
export const REFRESH_COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60;

export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE_SEC,
  };
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: REFRESH_COOKIE_MAX_AGE_SEC,
  };
}

export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}
