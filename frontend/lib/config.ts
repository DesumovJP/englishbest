/**
 * Client-side API config.
 *
 * `API_BASE_URL` points at the real Strapi backend. Both server (RSC + route
 * handlers) and client code read this; media URLs and public-catalog fetches
 * use it directly.
 *
 * Server-only internal URL (if different from the public one, e.g. Railway
 * private networking) lives in `lib/auth-config.ts::BACKEND_URL` and must not
 * leak into the client bundle.
 */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:1337';
