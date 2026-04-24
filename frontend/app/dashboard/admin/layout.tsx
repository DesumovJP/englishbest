import { requireRole } from '@/lib/auth-server';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['admin'], '/dashboard/admin');
  return <>{children}</>;
}
