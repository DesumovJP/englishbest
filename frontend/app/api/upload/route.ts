/**
 * POST /api/upload — multipart proxy to Strapi's upload plugin.
 *
 * Forwards the request body verbatim (preserves the multipart boundary
 * via Content-Type header) and attaches the caller's access token from
 * the httpOnly cookie. The Strapi upload provider (`local` in dev,
 * `@strapi/provider-upload-aws-s3` → DigitalOcean Spaces in prod —
 * see `backend/config/plugins.ts`) decides where the bytes land.
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
  // Re-parse + re-pack as FormData so undici (Node fetch) builds a clean
  // multipart body with a fresh boundary. Streaming the raw body via
  // `duplex: 'half'` works for plain bytes but fights with Strapi's
  // strict body-parser when the boundary is mid-buffer.
  const incoming = await req.formData();
  const outgoing = new FormData();
  for (const [key, value] of incoming.entries()) {
    outgoing.append(key, value);
  }

  const res = await fetch(`${BACKEND_URL}/api/upload`, {
    method: 'POST',
    headers: { ...(await authHeader()) },
    body: outgoing,
    cache: 'no-store',
  });
  const payload = await res.json().catch(() => ({}));
  return Response.json(payload, { status: res.status });
}
