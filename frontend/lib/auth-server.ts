/**
 * Server-side auth helpers.
 *
 * All session reads in server components and route handlers funnel through
 * here. The access-token JWT lives in an httpOnly cookie; we hand it to the
 * Strapi backend via Authorization header when hitting protected endpoints.
 *
 * NEVER import this from a "use client" module.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
} from './auth-config';

export type SessionUser = {
  id: number;
  email: string;
  username: string;
  role?: { id: number; name: string; type: string };
};

export type RoleProfile = Record<string, unknown> & { documentId: string };

export type SessionProfile = {
  documentId: string;
  role: 'kids' | 'adult' | 'teacher' | 'parent' | 'admin';
  firstName: string;
  lastName?: string;
  displayName?: string;
  organization?: { documentId: string; name?: string } | null;
  user?: SessionUser;
  kidsProfile?: RoleProfile | null;
  adultProfile?: RoleProfile | null;
  teacherProfile?: RoleProfile | null;
  parentProfile?: RoleProfile | null;
  adminProfile?: RoleProfile | null;
};

export type Session = {
  user: SessionUser;
  profile: SessionProfile;
};

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<Session | null> {
  const token = await getAccessToken();
  if (!token) {
    console.log('[auth] getSession: no access cookie');
    return null;
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.log(
      `[auth] getSession: backend ${res.status} ${res.statusText} — ${body.slice(0, 200)}`,
    );
    return null;
  }
  return (await res.json()) as Session;
}

/**
 * Require a session with one of the given roles; redirect otherwise.
 * Use from RSC pages/layouts to enforce role-based access.
 */
export async function requireRole(
  allowed: Array<Session['profile']['role']>,
  nextPath: string,
): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  const role = session.profile.role;
  if (!allowed.includes(role)) {
    if (role === 'kids' || role === 'adult') redirect('/kids/dashboard');
    redirect('/dashboard');
  }
  return session;
}
