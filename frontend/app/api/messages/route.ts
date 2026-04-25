/**
 * GET  /api/messages — list messages for a thread (requires
 *   filters[thread][documentId][$eq]=<id> on backend; participant-only).
 * POST /api/messages — post a message (author forced server-side to caller).
 *
 * Both paths catch upstream connection failures explicitly so the FE sees a
 * structured `{ error }` body with a 502 instead of a generic Next.js 500
 * with no payload. This made the original "sendMessage 502" untraceable —
 * we couldn't tell whether Strapi crashed or the proxy itself fell over.
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, BACKEND_URL } from '@/lib/auth-config';

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  try {
    const res = await fetch(`${BACKEND_URL}/api/messages${search}`, {
      method: 'GET',
      headers: { ...(await authHeader()) },
      cache: 'no-store',
    });
    const payload = await res.json().catch(() => ({}));
    return Response.json(payload, { status: res.status });
  } catch (err) {
    console.error('[api/messages GET] upstream fetch failed:', err);
    return Response.json(
      { error: { message: 'upstream unreachable', detail: (err as Error).message } },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.data) {
    return Response.json({ error: { message: 'data required' } }, { status: 400 });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(
        `[api/messages POST] upstream ${res.status}:`,
        JSON.stringify(payload).slice(0, 500),
      );
    }
    return Response.json(payload, { status: res.status });
  } catch (err) {
    console.error('[api/messages POST] upstream fetch failed:', err);
    return Response.json(
      { error: { message: 'upstream unreachable', detail: (err as Error).message } },
      { status: 502 },
    );
  }
}
