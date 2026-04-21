'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('demo_role');
    if (role === 'teacher')      router.replace('/dashboard/teacher');
    else if (role === 'admin')   router.replace('/dashboard/admin');
    else if (role === 'parent')  router.replace('/dashboard/parent');
    else                         router.replace('/kids/dashboard');
  }, [router]);

  return null;
}
