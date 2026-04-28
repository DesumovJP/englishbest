import { redirect } from 'next/navigation';

export default function LegacyTeacherLibraryRedirect(): never {
  redirect('/dashboard/library?tab=lessons');
}
