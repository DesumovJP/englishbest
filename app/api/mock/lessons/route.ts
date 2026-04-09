import { NextRequest } from 'next/server';
import { mockLessons } from '@/lib/mockClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseSlug = searchParams.get('courseSlug');
  const lessonSlug = searchParams.get('lessonSlug');

  let results = mockLessons;
  if (courseSlug) results = results.filter(l => l.courseSlug === courseSlug);
  if (lessonSlug) {
    const lesson = results.find(l => l.lessonSlug === lessonSlug);
    if (!lesson) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(lesson);
  }
  return Response.json(results);
}
