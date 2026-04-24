/**
 * /dashboard layout — server-side auth gate.
 *
 * Anonymous callers are 302'd to /login before any HTML is rendered, so the
 * browser never lands on a blank /dashboard. kids/adult are bounced to
 * /kids/dashboard (the sidebar dashboard is for staff only: teacher / parent
 * / admin).
 *
 * Kept as an RSC on purpose — the previous client-guarded version caused a
 * visible "Перенаправлення на вхід…" flicker on prod because the redirect
 * waited for `/api/auth/me` to resolve before firing.
 */
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/molecules/Sidebar';
import { getSession } from '@/lib/auth-server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) redirect('/login?next=/dashboard');

  const role = session.profile.role;
  if (role === 'kids' || role === 'adult') redirect('/kids/dashboard');

  return (
    <div className="flex min-h-svh bg-surface items-start">
      <Sidebar />
      <main className="flex-1 min-w-0 min-h-svh pt-14 md:pt-0">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
