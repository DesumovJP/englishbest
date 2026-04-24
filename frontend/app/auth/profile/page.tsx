import { redirect } from 'next/navigation';

export default function LegacyAuthProfilePage() {
  redirect('/dashboard/profile');
}
