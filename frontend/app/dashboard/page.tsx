'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';

export default function DashboardRootPage() {
  const router = useRouter();
  const { session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'anonymous' || !session) {
      router.replace('/login');
      return;
    }
    const role = session.profile.role;
    if (role === 'teacher')      router.replace('/dashboard/teacher');
    else if (role === 'admin')   router.replace('/dashboard/admin');
    else if (role === 'parent')  router.replace('/dashboard/parent');
    else if (role === 'kids')    router.replace('/kids/dashboard');
    else                         router.replace('/dashboard/student');
  }, [router, session, status]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-ink-muted">
      <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" aria-hidden />
      <p className="text-sm font-semibold">Відкриваємо дашборд…</p>
    </div>
  );
}
