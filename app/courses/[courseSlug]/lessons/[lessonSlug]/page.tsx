import { LessonEngine } from '@/components/lesson/LessonEngine';
import helloGoodbyeLesson  from '@/mocks/lessons/hello-goodbye';
import myNameIsLesson      from '@/mocks/lessons/my-name-is';
import numbersColorsLesson from '@/mocks/lessons/numbers-colors';
import dailyRoutinesLesson from '@/mocks/lessons/daily-routines';
import foodDrinksLesson    from '@/mocks/lessons/food-drinks';
import myHouseLesson       from '@/mocks/lessons/my-house';
import readingAnimalsLesson from '@/mocks/lessons/reading-animals';

/* ─── Реєстр уроків (замінити на Strapi) ────── */
const LESSON_REGISTRY = {
  'hello-goodbye':   helloGoodbyeLesson,
  'my-name-is':      myNameIsLesson,
  'numbers-colors':  numbersColorsLesson,
  'daily-routines':  dailyRoutinesLesson,
  'food-drinks':     foodDrinksLesson,
  'my-house':           myHouseLesson,
  'reading-animals':    readingAnimalsLesson,
} as const;

/* ─── Метадані вчителя (мок) ─────────────────── */
const TEACHER = {
  name: 'Maria S.',
  photo: 'https://randomuser.me/api/portraits/women/65.jpg',
  callUrl: 'https://calendly.com/maria-s/trial', // TODO: замінити на реальний
};

/* ─── Наступний урок (мок) ──────────────────── */
const NEXT_LESSON: Record<string, string> = {
  'hello-goodbye':  'my-name-is',
  'my-name-is':     'numbers-colors',
  'numbers-colors': 'daily-routines',
  'daily-routines': 'food-drinks',
  'food-drinks':    'my-house',
  'my-house':       'family-friends',
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  const lesson = LESSON_REGISTRY[lessonSlug as keyof typeof LESSON_REGISTRY]
    ?? LESSON_REGISTRY['hello-goodbye'];

  return (
    <LessonEngine
      lesson={lesson}
      nextLessonSlug={NEXT_LESSON[lessonSlug]}
      backUrl="/kids/school"
      teacherName={TEACHER.name}
      teacherPhoto={TEACHER.photo}
      callUrl={TEACHER.callUrl}
    />
  );
}
