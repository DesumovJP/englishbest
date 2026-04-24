import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import KidsFooter from "@/components/kids/KidsFooter";
import RotateHint from "@/components/kids/RotateHint";
import { KidsProfileWidget } from "@/components/kids/KidsProfileWidget";
import { getSession } from "@/lib/auth-server";

export default async function KidsLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/kids/dashboard');

  const role = session.profile.role;
  if (role !== 'kids' && role !== 'adult') {
    redirect('/dashboard');
  }

  return (
    <div className="toca">
      {children}
      <KidsProfileWidget />
      <KidsFooter />
      <RotateHint />
    </div>
  );
}
