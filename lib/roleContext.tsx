"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Role, AnyUser } from "@/mocks/user";
import {
  mockKidsUser,
  mockAdultUser,
  mockTeacherUser,
  mockParentUser,
  mockAdminUser,
} from "@/mocks/user";

interface RoleContextValue {
  role: Role;
  user: AnyUser;
  setRole: (role: Role) => void;
}

const userByRole: Record<Role, AnyUser> = {
  kids: mockKidsUser,
  adult: mockAdultUser,
  teacher: mockTeacherUser,
  parent: mockParentUser,
  admin: mockAdminUser,
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({
  children,
  defaultRole = "kids",
}: {
  children: ReactNode;
  defaultRole?: Role;
}) {
  const [role, setRoleState] = useState<Role>(defaultRole);

  function setRole(next: Role) {
    setRoleState(next);
  }

  return (
    <RoleContext.Provider value={{ role, user: userByRole[role], setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside <RoleProvider>");
  return ctx;
}
