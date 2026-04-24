'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/molecules/Sidebar';
import { useSession } from '@/lib/session-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'anonymous' || !session) {
      router.replace('/login?next=/dashboard');
      return;
    }
    const role = session.profile.role;
    if (role === 'kids' || role === 'adult') {
      router.replace('/kids/dashboard');
    }
  }, [router, session, status]);

  if (status === 'loading' || status === 'anonymous' || !session) return null;
  const role = session.profile.role;
  if (role === 'kids' || role === 'adult') return null;

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
