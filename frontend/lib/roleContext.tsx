/**
 * Role context — thin derivation layer over `useSession()`.
 *
 * Production source of truth is the authenticated session
 * (`profile.role` from `/api/auth/me`). Anonymous visitors resolve to
 * `'kids'` so marketing pages render a sensible default.
 *
 * Demo-mode override (`setRole`) only activates when
 * `NEXT_PUBLIC_ROLE_SWITCHER=1`. Otherwise `setRole` is a no-op — the
 * session is authoritative and cannot be bypassed in prod builds.
 *
 * `<RoleProvider>` is optional: `useRole()` works without it. Wrap only
 * the subtree that needs the demo override (usually where
 * `<RoleSwitcher/>` is rendered).
 */
'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Role } from '@/lib/types';
import { useSession } from '@/lib/session-context';

const DEMO_ENABLED = process.env.NEXT_PUBLIC_ROLE_SWITCHER === '1';

type OverrideValue = {
  override: Role | null;
  setOverride: (r: Role | null) => void;
};

const RoleOverrideContext = createContext<OverrideValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<Role | null>(null);
  const value = useMemo(() => ({ override, setOverride }), [override]);
  return (
    <RoleOverrideContext.Provider value={value}>
      {children}
    </RoleOverrideContext.Provider>
  );
}

type UseRoleValue = {
  role: Role;
  setRole: (r: Role) => void;
  isDemo: boolean;
  isAuthenticated: boolean;
};

export function useRole(): UseRoleValue {
  const override = useContext(RoleOverrideContext);
  const { session, status } = useSession();
  const sessionRole: Role = session?.profile?.role ?? 'kids';
  const resolvedRole: Role =
    DEMO_ENABLED && override?.override ? override.override : sessionRole;

  const setRole = (next: Role) => {
    if (!DEMO_ENABLED) return;
    override?.setOverride(next);
  };

  return {
    role: resolvedRole,
    setRole,
    isDemo: DEMO_ENABLED,
    isAuthenticated: status === 'authenticated',
  };
}
