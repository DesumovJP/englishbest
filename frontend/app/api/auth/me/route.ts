/**
 * GET /api/auth/me
 *
 * Returns the current session (user + profile) or `null` if no valid access
 * token. This is the endpoint the client-side `useSession` hook hits.
 */
import { getSession } from '@/lib/auth-server';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json(null, { status: 200 });
  return Response.json(session);
}
