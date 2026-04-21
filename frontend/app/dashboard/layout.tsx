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
