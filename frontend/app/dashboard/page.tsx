/**
 * /dashboard root — server-side role dispatcher.
 *
 * The parent layout already handled anonymous + kids/adult. Here we only
 * route the remaining staff roles (teacher / parent / admin) to their
 * role-specific landing pages, server-side.
 */
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';

export default async function DashboardRootPage() {
  const session = await getSession();

  // Layout already redirects when unauthenticated, but defend in depth.
  if (!session) redirect('/login');

  const role = session.profile.role;
  if (role === 'teacher') redirect('/dashboard/teacher');
  if (role === 'admin')   redirect('/dashboard/admin');
  if (role === 'parent')  redirect('/dashboard/parent');

  // Fallback — shouldn't be reachable (kids/adult handled by the layout).
  redirect('/dashboard/student');
}
