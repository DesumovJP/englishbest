"use client";

import { ReactNode } from "react";
import { useRole } from "@/lib/roleContext";
import type { Role } from "@/lib/types";

interface Props {
  role: Role | Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only when the current resolved role matches.
 * Role comes from `useRole()` — session-derived in prod, demo-override
 * capable when `NEXT_PUBLIC_ROLE_SWITCHER=1`.
 *
 * <RoleGuard role="kids">...</RoleGuard>
 * <RoleGuard role={["teacher", "admin"]}>...</RoleGuard>
 */
export default function RoleGuard({ role, children, fallback = null }: Props) {
  const { role: currentRole } = useRole();
  const allowed = Array.isArray(role) ? role.includes(currentRole) : role === currentRole;
  return allowed ? <>{children}</> : <>{fallback}</>;
}
