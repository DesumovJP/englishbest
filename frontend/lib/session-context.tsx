/**
 * Session context — real-auth session state.
 *
 * Wraps the client tree to expose the current `{ user, profile }` fetched
 * from `/api/auth/me`. Provides `login`, `logout`, and `refresh` helpers
 * that go through our Next route handlers (which manage cookies). Self-
 * registration is intentionally absent — accounts are issued, not signed up.
 *
 * Kept separate from the legacy mock `RoleContext` (lib/roleContext.tsx) to
 * avoid a big-bang swap. Phase 5 will migrate every `useRole()` consumer to
 * `useSession()` and delete the mock context.
 */
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError } from './fetcher';

type Role = 'kids' | 'adult' | 'teacher' | 'parent' | 'admin';

type SessionUser = {
  id: number;
  email: string;
  username: string;
  role?: { id: number; name: string; type: string };
};

type SessionProfile = {
  documentId: string;
  role: Role;
  firstName: string;
  lastName?: string;
  displayName?: string;
  level?: string;
  user?: SessionUser;
  kidsProfile?: Record<string, unknown> | null;
  adultProfile?: Record<string, unknown> | null;
  teacherProfile?: Record<string, unknown> | null;
  parentProfile?: Record<string, unknown> | null;
  adminProfile?: Record<string, unknown> | null;
};

type Session = { user: SessionUser; profile: SessionProfile };

type LoginInput = { identifier: string; password: string };

type Value = {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (input: LoginInput) => Promise<Session>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<Value | null>(null);

async function jsonPost(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const message =
      (errBody && typeof errBody === 'object' && 'error' in errBody
        ? (errBody as { error?: { message?: string } }).error?.message
        : undefined) ??
      (errBody && typeof errBody === 'object' && 'message' in errBody
        ? (errBody as { message?: string }).message
        : undefined) ??
      `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, url, errBody);
  }
  return res.status === 204 ? null : res.json();
}

export function SessionProvider({
  children,
  initialSession = null,
}: {
  children: ReactNode;
  initialSession?: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [status, setStatus] = useState<Value['status']>(
    initialSession ? 'authenticated' : 'loading'
  );

  const refresh = useCallback(async () => {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) {
      setSession(null);
      setStatus('anonymous');
      return;
    }
    const data = (await res.json()) as Session | null;
    setSession(data);
    setStatus(data ? 'authenticated' : 'anonymous');
  }, []);

  useEffect(() => {
    if (initialSession) return;
    void refresh();
  }, [initialSession, refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const s = (await jsonPost('/api/auth/login', input)) as Session;
    setSession(s);
    setStatus('authenticated');
    return s;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Drop cached Kids Zone state so the next login doesn't see the
    // previous user's coins/inventory.
    const { kidsStateStore } = await import('./kids-store');
    kidsStateStore.reset();
    setSession(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo<Value>(
    () => ({ session, status, login, logout, refresh }),
    [session, status, login, logout, refresh]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
