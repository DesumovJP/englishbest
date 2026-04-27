import { notFound } from 'next/navigation';
import { LessonEngine } from '@/components/lesson/LessonEngine';
import type { LessonData, LessonStep } from '@/mocks/lessons/types';
import { fetchLesson, fetchLessonsByCourse } from '@/lib/api';
import type { Lesson } from '@/lib/types';

function toLessonData(lesson: Lesson): LessonData | null {
  const steps = lesson.steps as LessonStep[] | undefined;
  if (!steps || steps.length === 0) return null;
  return {
    slug: lesson.slug,
    courseSlug: lesson.courseSlug ?? '',
    title: lesson.title,
    xp: lesson.xp ?? 10,
    steps,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const lesson = await fetchLesson(courseSlug, lessonSlug);
  if (!lesson) notFound();

  const lessonData = toLessonData(lesson);
  if (!lessonData) notFound();

  // Compute next lesson slug from the course's lesson list (sorted by orderIndex).
  const siblings = await fetchLessonsByCourse(courseSlug);
  const idx = siblings.findIndex((l) => l.slug === lessonSlug);
  const nextLessonSlug =
    idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1].slug : undefined;

  return (
    <LessonEngine
      lesson={lessonData}
      lessonDocumentId={lesson.documentId}
      courseDocumentId={lesson.courseDocumentId}
      nextLessonSlug={nextLessonSlug}
      backUrl="/kids/school"
    />
  );
}
