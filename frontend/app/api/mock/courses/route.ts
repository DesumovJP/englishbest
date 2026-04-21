import { NextRequest } from 'next/server';
import { mockCourses } from '@/lib/mockClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (slug) {
    const course = mockCourses.find(c => c.slug === slug);
    if (!course) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(course);
  }
  return Response.json(mockCourses);
}
