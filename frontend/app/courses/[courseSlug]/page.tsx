import { notFound } from 'next/navigation';
import { fetchCourseBySlug, fetchCourses } from '@/lib/api';
import { CoursePage } from '@/components/organisms/CoursePage';

export default async function CourseSlugPage(props: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await props.params;
  const course = await fetchCourseBySlug(courseSlug);
  if (!course) notFound();
  return <CoursePage course={course} />;
}

export async function generateStaticParams() {
  const courses = await fetchCourses().catch(() => []);
  return courses.map((c) => ({ courseSlug: c.slug }));
}
