/**
 * POST /api/user-inventory/me/equip — toggle equip state for an owned item.
 *
 * Body: { slug: string, equip: boolean }. Equip requires the item to be in
 * ownedShopItems. Idempotent — returns current state if already matching.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const res = await fetch(`${BACKEND_URL}/api/user-inventory/me/equip`, {
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
