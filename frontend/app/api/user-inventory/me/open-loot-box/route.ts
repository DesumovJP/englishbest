/**
 * POST /api/user-inventory/me/open-loot-box — open a loot box.
 *
 * Thin proxy to Strapi. Body: { boxType: 'common'|'silver'|'gold'|'legendary' }.
 * Server picks a random un-owned item of matching rarity, appends to
 * inventory, debits coins (compensating revert on debit failure).
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  const res = await fetch(`${BACKEND_URL}/api/user-inventory/me/open-loot-box`, {
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
