/**
 * GET   /api/user-inventory/me  — caller's inventory (auto-created on first hit).
 * PATCH /api/user-inventory/me  — partial update (outfit/placedItems/equippedItems/ownedShopItems/seedVersion).
 *
 * Thin proxy to Strapi `/api/user-inventory/me`. Access JWT is read from the
 * httpOnly cookie so the browser never holds the token.
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
  const res = await fetch(`${BACKEND_URL}/api/user-inventory/me`, {
    method: 'GET',
    headers: { ...(await authHeader()) },
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const res = await fetch(`${BACKEND_URL}/api/user-inventory/me`, {
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
