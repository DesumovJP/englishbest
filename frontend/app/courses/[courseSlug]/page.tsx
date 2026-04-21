import { notFound } from 'next/navigation';
import { mockCourses } from '@/lib/mockClient';
import { CoursePage } from '@/components/organisms/CoursePage';

export default async function CourseSlugPage(props: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await props.params;
  // TODO: replace with Strapi endpoint: GET /api/courses?filters[slug][$eq]=${courseSlug}&populate=*
  const course = mockCourses.find(c => c.slug === courseSlug);
  if (!course) notFound();
  return <CoursePage course={course} />;
}

export async function generateStaticParams() {
  return mockCourses.map(c => ({ courseSlug: c.slug }));
}
