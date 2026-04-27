/**
 * "Journey" view for /kids/school → Уроки tab.
 *
 * Replaces the old carousel + tree-list combo. One screen, top-down:
 *   1. Course switcher pills (only shown when 2+ courses at level)
 *   2. HERO continue card — gradient, focal emoji, reward chips, big CTA
 *   3. Roadmap — every lesson of the selected course as a tile, with
 *      progress bar above
 *   4. "Деталі курсу →" link to /kids/library/[slug]
 *
 * The old export name is preserved so /kids/school keeps importing
 * `LessonCarouselSection` — it's just a different presentation now.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  fetchCoursesCached,
  fetchLessonsByCourseCached,
  peekCourses,
  peekLessonsByCourse,
} from '@/lib/api';
import {
  fetchMyProgressCached,
  peekMyProgress,
  type UserProgressRow,
} from '@/lib/user-progress';
import type { Course, Lesson, Level, LessonType } from '@/lib/types';
import { themeForCourse } from '@/lib/course-theme';
import { CourseHero } from '@/components/kids/CourseHero';
import { LessonTileCard, type LessonStatus } from '@/components/kids/LessonTileCard';
import { RewardChip } from '@/components/kids/ui';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  level: Level;
}

interface CourseData {
  course: Course;
  lessons: Lesson[];
  completedSlugs: Set<string>;
  currentSlug: string | null;
}

const TYPE_EMOJI: Record<LessonType, string> = {
  video: '🎬',
  reading: '📖',
  quiz: '🎯',
  interactive: '✏️',
};

const TYPE_LABEL: Record<LessonType, string> = {
  video: 'Відео',
  reading: 'Читання',
  quiz: 'Тест',
  interactive: 'Урок',
};

function buildCourseData(
  allCourses: Course[],
  progressRows: UserProgressRow[],
  lessonsByCourse: Map<string, Lesson[]>,
  level: Level,
): CourseData[] {
  const myCourses = allCourses.filter(
    (c) =>
      c.level === level &&
      (!c.audience || c.audience === 'kids' || c.audience === 'any'),
  );
  const completedByCourse = new Map<string, Set<string>>();
  for (const row of progressRows) {
    const courseSlug = row.lesson?.courseSlug;
    const lessonSlug = row.lesson?.slug;
    if (!courseSlug || !lessonSlug) continue;
    if (row.status !== 'completed') continue;
    const set = completedByCourse.get(courseSlug) ?? new Set<string>();
    set.add(lessonSlug);
    completedByCourse.set(courseSlug, set);
  }
  return myCourses
    .map((course): CourseData => {
      const sorted = [...(lessonsByCourse.get(course.slug) ?? [])].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
      );
      const completedSlugs = completedByCourse.get(course.slug) ?? new Set<string>();
      const current = sorted.find((l) => !completedSlugs.has(l.slug)) ?? null;
      return { course, lessons: sorted, completedSlugs, currentSlug: current?.slug ?? null };
    })
    .filter((c) => c.lessons.length > 0);
}

function hydrateFromCaches(level: Level): CourseData[] | null {
  const courses = peekCourses();
  const progress = peekMyProgress();
  if (!courses || !progress) return null;
  const myCourses = courses.filter(
    (c) =>
      c.level === level &&
      (!c.audience || c.audience === 'kids' || c.audience === 'any'),
  );
  const lessonsByCourse = new Map<string, Lesson[]>();
  for (const c of myCourses) {
    const lessons = peekLessonsByCourse(c.slug);
    if (!lessons) return null;
    lessonsByCourse.set(c.slug, lessons);
  }
  return buildCourseData(courses, progress, lessonsByCourse, level);
}

export function LessonCarouselSection({ level }: Props) {
  const cached = hydrateFromCaches(level);
  const [data, setData] = useState<CourseData[] | null>(cached);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>(
    cached === null ? 'loading' : cached.length === 0 ? 'empty' : 'ready',
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [allCourses, progressRows] = await Promise.all([
          fetchCoursesCached(),
          fetchMyProgressCached(),
        ]);
        if (!alive) return;
        setErrorMsg(null);
        const myCourses = allCourses.filter(
          (c) =>
            c.level === level &&
            (!c.audience || c.audience === 'kids' || c.audience === 'any'),
        );
        if (myCourses.length === 0) {
          setData([]);
          setStatus('empty');
          return;
        }
        const lessonsArr = await Promise.all(
          myCourses.map((c) => fetchLessonsByCourseCached(c.slug)),
        );
        if (!alive) return;
        const lessonsByCourse = new Map<string, Lesson[]>();
        myCourses.forEach((c, i) => lessonsByCourse.set(c.slug, lessonsArr[i]));
        const populated = buildCourseData(allCourses, progressRows, lessonsByCourse, level);
        if (!alive) return;
        setData(populated);
        setStatus(populated.length === 0 ? 'empty' : 'ready');
      } catch (e) {
        if (!alive) return;
        setErrorMsg(e instanceof Error ? e.message : 'Помилка завантаження');
        setStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [level]);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      setSelectedSlug(null);
      return;
    }
    setSelectedSlug((prev) => {
      if (prev && data.some((c) => c.course.slug === prev)) return prev;
      // Default to first course with unfinished lessons.
      const inProgress = data.find(
        (c) => c.currentSlug !== null && c.completedSlugs.size < c.lessons.length,
      );
      return (inProgress ?? data[0]).course.slug;
    });
  }, [data]);

  if (status === 'loading') return <JourneySkeleton />;
  if (status === 'error') {
    return (
      <div className="px-4 py-10">
        <EmptyState title="Не вдалось завантажити уроки" description={errorMsg ?? 'Спробуй пізніше'} />
      </div>
    );
  }
  if (status === 'empty' || !data || data.length === 0) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          title="Немає уроків для твого рівня"
          description={`Уроки для рівня ${level} зʼявляться незабаром.`}
        />
      </div>
    );
  }

  const selected = data.find((c) => c.course.slug === selectedSlug) ?? data[0];
  const theme = themeForCourse(selected.course);
  const completedTotal = selected.completedSlugs.size;
  const totalLessons = selected.lessons.length;
  const isComplete = completedTotal === totalLessons && totalLessons > 0;
  const currentLesson = selected.lessons.find((l) => l.slug === selected.currentSlug) ?? null;
  const continueLesson = currentLesson ?? selected.lessons[0];
  const continueIndex = selected.lessons.findIndex((l) => l.slug === continueLesson?.slug);
  const pct = totalLessons === 0 ? 0 : Math.round((completedTotal / totalLessons) * 100);

  const heroEyebrow = isComplete
    ? 'КУРС ЗАВЕРШЕНО'
    : continueLesson
      ? `УРОК ${continueIndex + 1} · ${totalLessons}`
      : '';
  const heroTitle = isComplete
    ? 'Молодець! Ти пройшов увесь курс 🎉'
    : continueLesson?.title ?? selected.course.title;
  const heroSubtitle = isComplete
    ? 'Можеш пройти улюблені уроки ще раз або обрати новий курс.'
    : continueLesson
      ? `${TYPE_LABEL[continueLesson.type] ?? 'Урок'}${continueLesson.durationMin ? ` · ${continueLesson.durationMin} хв` : ''}`
      : '';
  const heroEmoji = isComplete
    ? '🏆'
    : continueLesson
      ? TYPE_EMOJI[continueLesson.type] ?? '✏️'
      : '✏️';
  const continueHref = continueLesson
    ? `/courses/${selected.course.slug}/lessons/${continueLesson.slug}`
    : `/kids/library/${selected.course.slug}`;

  return (
    <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+96px)]">
      {data.length > 1 && (
        <CourseSwitcher
          courses={data}
          selectedSlug={selected.course.slug}
          onSelect={setSelectedSlug}
        />
      )}

      <div className="max-w-screen-md mx-auto w-full px-4 py-4 space-y-5">
        <CourseHero
          theme={theme}
          eyebrow={heroEyebrow}
          focalEmoji={heroEmoji}
          title={heroTitle}
          subtitle={heroSubtitle}
        >
          {!isComplete && continueLesson && (
            <div className="flex items-center gap-2 flex-wrap">
              {typeof continueLesson.xp === 'number' && continueLesson.xp > 0 && (
                <RewardChip kind="xp" amount={continueLesson.xp} size="sm" tone="onDark" />
              )}
              <RewardChip kind="coin" amount={10} size="sm" tone="onDark" />
            </div>
          )}
          <Link
            href={continueHref}
            className="inline-flex items-center justify-center gap-2 mt-4 px-5 h-12 rounded-2xl bg-white text-ink font-black text-[15px] shadow-card-md active:translate-y-0.5 active:shadow-card-sm transition-all"
            style={{ color: theme.accentDark }}
          >
            {isComplete ? 'Повторити перший урок' : completedTotal > 0 ? 'Продовжити' : 'Почати курс'}
            <span aria-hidden>→</span>
          </Link>
        </CourseHero>

        <Roadmap
          courseSlug={selected.course.slug}
          lessons={selected.lessons}
          completedSlugs={selected.completedSlugs}
          currentSlug={selected.currentSlug}
          accent={theme.accent}
          completedTotal={completedTotal}
          totalLessons={totalLessons}
          pct={pct}
        />
      </div>
    </div>
  );
}

function CourseSwitcher({
  courses,
  selectedSlug,
  onSelect,
}: {
  courses: CourseData[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Курс"
      className="flex flex-shrink-0 gap-2 px-3 py-2.5 overflow-x-auto bg-surface-raised border-b border-border"
      style={{ scrollbarWidth: 'none' }}
    >
      {courses.map((cd) => {
        const c = cd.course;
        const theme = themeForCourse(c);
        const isActive = c.slug === selectedSlug;
        const total = cd.lessons.length;
        const done = cd.completedSlugs.size;
        return (
          <button
            key={c.slug}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(c.slug)}
            className={[
              'flex items-center gap-2 flex-shrink-0 rounded-full px-3.5 py-2 transition-all border-2',
              isActive
                ? 'text-white shadow-card-sm'
                : 'bg-surface-raised text-ink border-border hover:bg-surface-muted',
            ].join(' ')}
            style={
              isActive
                ? { background: theme.gradient, borderColor: theme.accent }
                : undefined
            }
          >
            <span aria-hidden className="text-[16px] leading-none">{c.iconEmoji ?? '🎓'}</span>
            <span className="font-black text-[12.5px] leading-none truncate max-w-[140px]">
              {c.titleUa ?? c.title}
            </span>
            <span
              className={[
                'font-bold text-[10.5px] tabular-nums leading-none',
                isActive ? 'text-white/80' : 'text-ink-faint',
              ].join(' ')}
            >
              {done}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Roadmap({
  courseSlug,
  lessons,
  completedSlugs,
  currentSlug,
  accent,
  completedTotal,
  totalLessons,
  pct,
}: {
  courseSlug: string;
  lessons: Lesson[];
  completedSlugs: Set<string>;
  currentSlug: string | null;
  accent: string;
  completedTotal: number;
  totalLessons: number;
  pct: number;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2 px-1">
        <p className="font-black uppercase tracking-widest text-[10.5px] text-ink-faint">
          Усі уроки курсу
        </p>
        <p className="font-black tabular-nums text-[11.5px] text-ink-muted">
          {completedTotal} / {totalLessons} · {pct}%
        </p>
      </div>
      <div className="h-2 rounded-full bg-surface-muted overflow-hidden mb-4">
        <div
          className="h-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {lessons.map((lesson, idx) => {
          const isDone = completedSlugs.has(lesson.slug);
          const isCurrent = !isDone && lesson.slug === currentSlug;
          const lessonStatus: LessonStatus = isDone ? 'done' : isCurrent ? 'current' : 'upcoming';
          return (
            <LessonTileCard
              key={lesson.documentId}
              lesson={lesson}
              index={idx}
              status={lessonStatus}
              href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
              courseAccent={accent}
            />
          );
        })}
      </div>

      <Link
        href={`/kids/library/${courseSlug}`}
        className="mt-4 inline-flex items-center gap-1 font-black text-[12.5px] text-ink-muted hover:text-ink"
      >
        Деталі курсу <span aria-hidden>→</span>
      </Link>
    </section>
  );
}

function JourneySkeleton() {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="max-w-screen-md mx-auto w-full px-4 py-4 space-y-5">
        <div className="h-[260px] rounded-3xl bg-surface-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-surface-muted animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[68px] rounded-2xl bg-surface-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
