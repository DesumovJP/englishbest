'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/molecules/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('demo_role');
    if (role === 'student') {
      router.replace('/kids/dashboard');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-surface-muted items-start">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 min-w-0 min-h-screen">{children}</main>
    </div>
  );
}
