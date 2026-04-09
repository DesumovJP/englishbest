import { NextRequest } from 'next/server';
import { mockCalendar } from '@/lib/mockClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userSlug = searchParams.get('userSlug');
  // TODO: filter by user when connected to Strapi
  void userSlug;
  return Response.json(mockCalendar);
}
