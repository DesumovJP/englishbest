import { requireRole } from '@/lib/auth-server';

export default async function ParentDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['parent', 'admin'], '/dashboard/parent');
  return <>{children}</>;
}
