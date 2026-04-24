import { requireRole } from '@/lib/auth-server';

export default async function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['teacher', 'admin'], '/dashboard/teacher');
  return <>{children}</>;
}
