import { requireRole } from '@/lib/auth-server';

export default async function TeacherCalendarLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['teacher', 'admin'], '/dashboard/teacher-calendar');
  return <>{children}</>;
}
