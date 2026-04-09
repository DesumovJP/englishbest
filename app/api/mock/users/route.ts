import { NextRequest } from 'next/server';
import { mockUsers } from '@/lib/mockClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userSlug = searchParams.get('userSlug');
  if (userSlug) {
    const user = mockUsers.find(u => u.userSlug === userSlug);
    if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(user);
  }
  return Response.json(mockUsers);
}
