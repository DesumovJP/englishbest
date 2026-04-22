/**
 * POST /api/user-inventory/me/unlock-room — unlock a room for coins.
 *
 * Thin proxy to Strapi. Body: { slug: string }. Server deducts coinsRequired
 * from kids-profile.totalCoins and appends the room to inventory.unlockedRooms.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const res = await fetch(`${BACKEND_URL}/api/user-inventory/me/unlock-room`, {
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
