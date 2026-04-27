/**
 * POST /api/user-inventory/me/select-room-background — proxy.
 *
 * Server validates the slug against the BE catalog, debits coins on first
 * paid purchase, persists `activeRoomBackground` + `ownedRoomBackgrounds`
 * atomically. Replaces the legacy `kids-profile.updateMe` negative-coin
 * delta path for cosmetic purchases.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return Response.json({ error: { message: 'body required' } }, { status: 400 });
  }
  const res = await fetch(
    `${BACKEND_URL}/api/user-inventory/me/select-room-background`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  );
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
