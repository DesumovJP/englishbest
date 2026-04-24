import { requireRole } from '@/lib/auth-server';

export default async function TeacherLibraryLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['teacher', 'admin'], '/dashboard/teacher-library');
  return <>{children}</>;
}
