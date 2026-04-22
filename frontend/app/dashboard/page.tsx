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

  return null;
}
