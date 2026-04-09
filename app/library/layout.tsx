import { Sidebar } from '@/components/molecules/Sidebar';

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-muted items-start">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 min-w-0 min-h-screen">{children}</main>
    </div>
  );
}
