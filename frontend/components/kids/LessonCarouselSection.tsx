/**
 * LessonCarouselSection — zigzag "map" view for the current level's courses.
 *
 * Sister component to `LessonTreeSection`; both render the same data
 * (`fetchCourses` filtered to level/audience + `fetchLessonsByCourse`
 * per course + `fetchMyProgress` for completion state), but the carousel
 * variant shows each course as a node map: lessons zig-zag down the
 * screen with a curved connector line, unlocking left-to-right as the
 * learner finishes earlier nodes.
 *
 * "Locked" in this view is a soft signal — the next not-completed lesson
 * in orderIndex gets the "current" pulse; everything after it is marked
 * with a lock icon but still navigable (access control still lives in the
 * course/lesson pages).
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchCourses, fetchLessonsByCourse } from '@/lib/api';
import type { Course, Lesson, Level, LessonType } from '@/lib/types';
import { fetchMyProgress, type UserProgressRow } from '@/lib/user-progress';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  level: Level;
}

interface CourseGroup {
  course: Course;
  lessons: Lesson[];
  completedSlugs: Set<string>;
  currentSlug: string | null;
}

type NodePos = 'left' | 'center' | 'right';
type NodeStatus = 'done' | 'current' | 'upcoming';

const POSITIONS: NodePos[] = [
  'left',
  'center',
  'right',
  'center',
  'left',
  'right',
  'center',
  'left',
];

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

function Connector({
  from,
  to,
  done,
}: {
  from: NodePos;
  to: NodePos;
  done: boolean;
}) {
  const xs: Record<NodePos, number> = { left: 14, center: 50, right: 86 };
  const x1 = xs[from];
  const x2 = xs[to];
  const d =
    x1 === x2
      ? `M ${x1} 0 L ${x2} 100`
      : `M ${x1} 0 C ${x1} 55, ${x2} 45, ${x2} 100`;
  return (
    <div className="w-full h-11" aria-hidden>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d={d}
          className={done ? 'stroke-primary' : 'stroke-border'}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={done ? undefined : '8 6'}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function LessonNode({
  lesson,
  status,
  position,
  courseSlug,
  globalIndex,
}: {
  lesson: Lesson;
  status: NodeStatus;
  position: NodePos;
  courseSlug: string;
  globalIndex: number;
}) {
  const emoji = TYPE_EMOJI[lesson.type] ?? '📘';
  const typeLabel = TYPE_LABEL[lesson.type] ?? 'Урок';
  const justify: Record<NodePos, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const node = (
    <div className={`flex w-full ${justify[position]}`}>
      <div className="flex flex-col items-center gap-2">
        <div
          className={[
            'relative flex items-center justify-center rounded-full select-none transition-all duration-200 w-[88px] h-[88px]',
            status === 'done'
              ? 'bg-primary shadow-card-md'
              : status === 'current'
                ? 'bg-surface-raised ring-[6px] ring-primary/60 shadow-overlay scale-110'
                : 'bg-surface-raised border-2 border-border shadow-card-sm',
          ].join(' ')}
        >
          {status === 'current' && (
            <div
              className="absolute inset-0 rounded-full ring-[6px] ring-primary/60 animate-ping opacity-20"
              aria-hidden
            />
          )}
          <span
            className={`text-[38px] ${status === 'upcoming' ? 'grayscale opacity-30' : ''}`}
          >
            {status === 'upcoming' ? '🔒' : emoji}
          </span>
        </div>

        <div className="text-center max-w-[120px]">
          <p
            className={`font-black text-[11px] leading-tight ${
              status === 'upcoming' ? 'text-ink-muted' : 'text-ink'
            }`}
          >
            {lesson.title}
          </p>
          {status === 'current' && (
            <span className="inline-block font-black text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 bg-primary/10 text-primary-dark">
              {typeLabel}
            </span>
          )}
        </div>

        {status === 'current' && (
          <span className="bg-ink text-surface-raised font-black text-[10px] px-3 py-1 rounded-full shadow-card-sm animate-bounce whitespace-nowrap">
            Починай! ↑
          </span>
        )}
      </div>
    </div>
  );

  const href = `/courses/${courseSlug}/lessons/${lesson.slug}`;

  return (
    <div key={`${lesson.slug}-${globalIndex}`} className="w-full max-w-[320px] mx-auto">
      <Link href={href} className="block" aria-label={lesson.title}>
        {node}
      </Link>
    </div>
  );
}

function CourseMap({ group }: { group: CourseGroup }) {
  const { course, lessons, completedSlugs, currentSlug } = group;
  const bySection = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const l of lessons) {
      const key = l.sectionSlug ?? 'default';
      const bucket = map.get(key) ?? [];
      bucket.push(l);
      map.set(key, bucket);
    }
    return map;
  }, [lessons]);

  const sectionOrder = Array.from(bySection.keys());
  let posCursor = 0;

  function statusOf(slug: string): NodeStatus {
    if (completedSlugs.has(slug)) return 'done';
    if (currentSlug === slug) return 'current';
    return 'upcoming';
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center gap-3 px-2">
        <div
          className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-[24px] flex-shrink-0"
          aria-hidden
        >
          {(course as any).iconEmoji ?? '🎓'}
        </div>
        <div className="min-w-0">
          <p className="font-black text-[15px] text-ink truncate">
            {course.title}
          </p>
          <p className="font-medium text-[11.5px] text-ink-muted">
            {completedSlugs.size} / {lessons.length} уроків
          </p>
        </div>
      </header>

      <div className="relative rounded-3xl bg-surface-raised border border-border px-4 py-6">
        {sectionOrder.map((sectionSlug, sIdx) => {
          const sectionLessons = bySection.get(sectionSlug) ?? [];
          if (sectionLessons.length === 0) return null;
          const firstInSection = sectionLessons[0];
          const hasProgress = sectionLessons.some(l =>
            completedSlugs.has(l.slug) || currentSlug === l.slug,
          );

          return (
            <div
              key={sectionSlug}
              className={hasProgress ? '' : 'opacity-80'}
            >
              <div className="flex justify-center mb-5 mt-1">
                <div className="rounded-xl border-2 border-border bg-surface-muted px-5 py-2 text-center min-w-[180px]">
                  <p className="font-black uppercase tracking-widest text-[9px] text-ink-faint">
                    Юніт {sIdx + 1}
                  </p>
                  <p className="font-black text-[13px] text-ink">
                    {firstInSection.sectionSlug ?? sectionSlug}
                  </p>
                </div>
              </div>

              {sectionLessons.map((lesson, lIdx) => {
                const pos = POSITIONS[posCursor % POSITIONS.length];
                const nextLesson = sectionLessons[lIdx + 1];
                const nextPos = nextLesson
                  ? POSITIONS[(posCursor + 1) % POSITIONS.length]
                  : undefined;
                const status = statusOf(lesson.slug);
                const connectorDone =
                  status === 'done' &&
                  !!nextLesson &&
                  statusOf(nextLesson.slug) !== 'upcoming';
                posCursor += 1;

                return (
                  <div key={lesson.slug}>
                    <LessonNode
                      lesson={lesson}
                      status={status}
                      position={pos}
                      courseSlug={course.slug}
                      globalIndex={posCursor}
                    />
                    {nextLesson && nextPos && (
                      <div className="w-full max-w-[320px] mx-auto">
                        <Connector
                          from={pos}
                          to={nextPos}
                          done={connectorDone}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function LessonCarouselSection({ level }: Props) {
  const [groups, setGroups] = useState<CourseGroup[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>(
    'loading',
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setErrorMsg(null);

    (async () => {
      try {
        const [allCourses, progressRows] = await Promise.all([
          fetchCourses(),
          fetchMyProgress({ pageSize: 200 }),
        ]);
        if (!alive) return;

        const myCourses = allCourses.filter(
          c =>
            c.level === level &&
            (!c.audience || c.audience === 'kids' || c.audience === 'any'),
        );

        if (myCourses.length === 0) {
          setGroups([]);
          setStatus('empty');
          return;
        }

        const completedByCourse = new Map<string, Set<string>>();
        for (const row of progressRows as UserProgressRow[]) {
          const courseSlug = row.lesson?.courseSlug;
          const lessonSlug = row.lesson?.slug;
          if (!courseSlug || !lessonSlug) continue;
          if (row.status !== 'completed') continue;
          const set = completedByCourse.get(courseSlug) ?? new Set<string>();
          set.add(lessonSlug);
          completedByCourse.set(courseSlug, set);
        }

        const populated: CourseGroup[] = await Promise.all(
          myCourses.map(async (course): Promise<CourseGroup> => {
            const lessons = await fetchLessonsByCourse(course.slug);
            const sorted = [...lessons].sort(
              (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
            );
            const completedSlugs =
              completedByCourse.get(course.slug) ?? new Set<string>();
            const current =
              sorted.find(l => !completedSlugs.has(l.slug)) ?? null;
            return {
              course,
              lessons: sorted,
              completedSlugs,
              currentSlug: current?.slug ?? null,
            };
          }),
        );

        if (!alive) return;
        const nonEmpty = populated.filter(g => g.lessons.length > 0);
        setGroups(nonEmpty);
        setStatus(nonEmpty.length === 0 ? 'empty' : 'ready');
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

  if (status === 'loading') return <LoadingState shape="list" rows={4} />;
  if (status === 'error') {
    return (
      <EmptyState
        title="Не вдалось завантажити уроки"
        description={errorMsg ?? 'Спробуй пізніше'}
      />
    );
  }
  if (status === 'empty' || !groups || groups.length === 0) {
    return (
      <EmptyState
        title="Немає уроків для твого рівня"
        description={`Уроки для рівня ${level} зʼявляться незабаром.`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map(group => (
        <CourseMap key={group.course.documentId} group={group} />
      ))}
    </div>
  );
}
