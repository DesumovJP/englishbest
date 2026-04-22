/**
 * GET   /api/kids-profile/me  — caller's kids-profile (404 if not a kid).
 * PATCH /api/kids-profile/me  — self-update for totalCoinsDelta / totalXpDelta /
 *                                streakDays / streakLastAt / characterMood.
 *
 * Thin proxy to Strapi `/api/kids-profile/me`.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(_req: NextRequest) {
  const res = await fetch(`${BACKEND_URL}/api/kids-profile/me`, {
    method: 'GET',
    headers: { ...(await authHeader()) },
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const res = await fetch(`${BACKEND_URL}/api/kids-profile/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
    },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
