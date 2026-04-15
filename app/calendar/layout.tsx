import { Sidebar } from '@/components/molecules/Sidebar';

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-surface-muted items-start">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 min-w-0 min-h-svh">{children}</main>
    </div>
  );
}
