/**
 * POST /api/user-inventory/me/purchase-character — buy a character.
 *
 * Thin proxy to Strapi. Body: { slug: string }. Server deducts coins from
 * kids-profile and appends the character to inventory.ownedCharacters in
 * a compensating-cleanup flow (see backend controller).
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const res = await fetch(`${BACKEND_URL}/api/user-inventory/me/purchase-character`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
