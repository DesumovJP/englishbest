"use client";

import { ReactNode } from "react";
import { useRole } from "@/lib/roleContext";
import type { Role } from "@/mocks/user";

interface Props {
  role: Role | Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only when the current mock role matches.
 * Used for demo/preview — no real auth involved.
 *
 * <RoleGuard role="kids">...</RoleGuard>
 * <RoleGuard role={["teacher", "admin"]}>...</RoleGuard>
 */
export default function RoleGuard({ role, children, fallback = null }: Props) {
  const { role: currentRole } = useRole();
  const allowed = Array.isArray(role) ? role.includes(currentRole) : role === currentRole;
  return allowed ? <>{children}</> : <>{fallback}</>;
}
