import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/molecules/Sidebar';
import { getSession } from '@/lib/auth-server';

export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/library');

  return (
    <div className="flex min-h-svh bg-surface-muted items-start">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 min-w-0 min-h-svh">{children}</main>
    </div>
  );
}
