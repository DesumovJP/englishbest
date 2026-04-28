import { redirect } from 'next/navigation';

export default function LegacyCoursesRedirect(): never {
  redirect('/dashboard/library');
}
