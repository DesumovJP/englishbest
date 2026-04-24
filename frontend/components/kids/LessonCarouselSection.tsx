/**
 * LessonCarouselSection — single horizontal, center-focus lesson carousel.
 *
 * All lessons across all kids-level courses are flattened into ONE carousel.
 * The first card of each new course/section carries a chip label so the
 * learner still perceives boundaries — but there is no vertical stack of
 * per-course carousels. Scroll-snap centers each card, and on mount the
 * viewport lands on the learner's current lesson.
 *
 * Data:
 *   - `fetchCourses` (filtered by level + kids/any audience)
 *   - `fetchLessonsByCourse` per course
 *   - `fetchMyProgress` for completion state
 *
 * "Status" is a soft signal — `upcoming` cards still navigate; real access
 * control lives in the course/lesson pages.
 */
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { fetchCourses, fetchLessonsByCourse } from '@/lib/api';
import type { Course, Lesson, Level, LessonType } from '@/lib/types';
import { fetchMyProgress, type UserProgressRow } from '@/lib/user-progress';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  level: Level;
}

interface FlatNode {
  lesson: Lesson;
  course: Course;
  status: NodeStatus;
  /** When true, render a leading label chip (start of a course or section). */
  groupLabel?: string;
  /** First lesson of each course — used for the course-header ribbon. */
  isCourseStart: boolean;
}

type NodeStatus = 'done' | 'current' | 'upcoming';

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

function LessonCard({
  lesson,
  status,
  accent,
  groupLabel,
}: {
  lesson: Lesson;
  status: NodeStatus;
  accent: string;
  groupLabel?: string;
}) {
  const emoji = TYPE_EMOJI[lesson.type] ?? '📘';
  const typeLabel = TYPE_LABEL[lesson.type] ?? 'Урок';
  const isCurrent = status === 'current';
  const isDone = status === 'done';
  const isLocked = status === 'upcoming' && !isCurrent;

  return (
    <div
      className="relative w-full h-full rounded-[28px] overflow-hidden select-none bg-ink"
      style={{
        boxShadow: isCurrent
          ? `0 0 0 4px ${accent}, 0 12px 40px ${accent}55`
          : isDone
            ? '0 4px 16px rgba(0,0,0,0.12)'
            : '0 10px 28px rgba(0,0,0,0.22)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${lesson.slug}/400/540`}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(5px) saturate(1.2)', transform: 'scale(1.1)' }}
      />

      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(165deg, ${accent}70 0%, rgba(0,0,0,0.58) 100%)` }}
      />

      {isDone && <div className="absolute inset-0 bg-black/20" />}

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-6xl drop-shadow-lg">🔒</span>
        </div>
      )}

      {!isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-4 pointer-events-none">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[38px] backdrop-blur-md bg-white/20 border border-white/30 shadow-lg">
            {emoji}
          </div>
          <p
            className="font-black text-white leading-tight drop-shadow-xl"
            style={{
              fontSize: 'clamp(22px, 3vw, 30px)',
              letterSpacing: '-0.02em',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {lesson.title}
          </p>
          <p className="font-bold text-[15px] text-white/75 tracking-wide">
            {typeLabel}
          </p>
          {typeof lesson.xp === 'number' && lesson.xp > 0 && (
            <div className="flex items-center gap-2 mt-1 rounded-full px-3.5 py-1.5 bg-white/20 backdrop-blur border border-white/25">
              <span className="font-black text-white text-[15px]">+{lesson.xp} XP</span>
            </div>
          )}
        </div>
      )}

      {groupLabel && (
        <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 bg-black/45 backdrop-blur border border-white/25 max-w-[75%]">
          <span className="font-black text-white text-[10px] tracking-widest truncate block">
            {groupLabel}
          </span>
        </div>
      )}

      {isDone && !groupLabel && (
        <div
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: '#16a34a', boxShadow: '0 3px 10px rgba(22,163,74,0.5)' }}
        >
          <span className="font-black text-white text-[14px]">✓</span>
        </div>
      )}

      {isCurrent && (
        <div
          className="absolute top-3 right-3 rounded-full px-3 py-1.5 flex items-center gap-1"
          style={{ background: '#22C55E', boxShadow: '0 3px 12px rgba(34,197,94,0.55)' }}
        >
          <span className="text-[10px]">▶</span>
          <span className="font-black text-white text-[11px] tracking-widest">NOW</span>
        </div>
      )}
    </div>
  );
}

function accentOf(course: Course): string {
  return (course as any).iconColor ?? '#22C55E';
}

function emojiOf(course: Course): string {
  return (course as any).iconEmoji ?? '🎓';
}

interface UnifiedCarouselProps {
  nodes: FlatNode[];
  currentSlug: string | null;
  completedTotal: number;
  lessonsTotal: number;
}

function UnifiedCarousel({
  nodes,
  currentSlug,
  completedTotal,
  lessonsTotal,
}: UnifiedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const rafRef = useRef<number | null>(null);
  const [scales, setScales] = useState<Map<string, number>>(new Map());
  const [activeCourseSlug, setActiveCourseSlug] = useState<string | null>(
    nodes[0]?.course.slug ?? null,
  );

  const pct = lessonsTotal === 0 ? 0 : Math.round((completedTotal / lessonsTotal) * 100);

  // Sticky course ribbon — reflect which course the currently-centered card belongs to.
  const activeCourse = useMemo(() => {
    const n = nodes.find(node => node.course.slug === activeCourseSlug);
    return n?.course ?? nodes[0]?.course ?? null;
  }, [activeCourseSlug, nodes]);

  function calcScales() {
    const ctr = scrollRef.current;
    if (!ctr) return;
    const { left: cl, width: cw } = ctr.getBoundingClientRect();
    const cx = cl + cw / 2;
    const threshold = cw * 0.5;
    const next = new Map<string, number>();
    let bestSlug: string | null = null;
    let bestDist = Infinity;
    let bestCourseSlug: string | null = null;
    cardRefs.current.forEach((el, slug) => {
      const { left, width } = el.getBoundingClientRect();
      const dist = Math.abs(left + width / 2 - cx);
      next.set(slug, Math.max(0, Math.min(1, 1 - dist / threshold)));
      if (dist < bestDist) {
        bestDist = dist;
        bestSlug = slug;
        const node = nodes.find(n => n.lesson.slug === slug);
        bestCourseSlug = node?.course.slug ?? null;
      }
    });
    setScales(next);
    if (bestCourseSlug && bestCourseSlug !== activeCourseSlug) {
      setActiveCourseSlug(bestCourseSlug);
    }
    // Silence unused-var lint — kept for potential future focus state.
    void bestSlug;
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(calcScales);
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', calcScales, { passive: true });
    requestAnimationFrame(calcScales);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', calcScales);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const cur = currentRef.current;
      const ctr = scrollRef.current;
      if (!cur || !ctr) return;
      const curRect = cur.getBoundingClientRect();
      const ctrRect = ctr.getBoundingClientRect();
      const target =
        ctr.scrollLeft + (curRect.left + curRect.width / 2) - (ctrRect.left + ctrRect.width / 2);
      ctr.scrollTo({ left: target, behavior: 'smooth' });
      setTimeout(calcScales, 700);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug]);

  function scaleFor(slug: string): number {
    const t = scales.get(slug) ?? 0;
    return 0.8 + 0.25 * t;
  }
  function opacityFor(slug: string): number {
    const t = scales.get(slug) ?? 0;
    return 0.52 + 0.48 * t;
  }

  const activeAccent = activeCourse ? accentOf(activeCourse) : '#22C55E';

  return (
    <section className="flex flex-col">
      {/* Sticky course ribbon — title + overall progress bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-muted border-b border-border">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0 transition-colors"
          style={{ background: `${activeAccent}20`, border: `1.5px solid ${activeAccent}40` }}
        >
          {activeCourse ? emojiOf(activeCourse) : '🎓'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[14px] text-ink truncate leading-tight">
            {activeCourse?.title ?? 'Уроки'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="flex-1 h-[5px] rounded-full overflow-hidden"
              style={{ background: `${activeAccent}20` }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: activeAccent }}
              />
            </div>
            <span className="font-black text-[11px] flex-shrink-0" style={{ color: activeAccent }}>
              {completedTotal}
              <span className="font-medium text-ink-faint">/{lessonsTotal}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Unified horizontal scroll-snap carousel */}
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto overflow-y-hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: 'calc(50% - clamp(160px, 38vw, 220px))',
          paddingRight: 'calc(50% - clamp(160px, 38vw, 220px))',
        }}
      >
        <div className="flex items-center gap-5 py-6">
          {nodes.map(node => {
            const { lesson, course, status, groupLabel } = node;
            const isCurr = status === 'current';
            const accent = accentOf(course);

            return (
              <div
                key={`${course.slug}__${lesson.slug}`}
                ref={el => {
                  if (el) {
                    cardRefs.current.set(lesson.slug, el);
                    if (isCurr) currentRef.current = el;
                  }
                }}
                className="flex-shrink-0"
                style={{
                  width: 'clamp(320px, 76vw, 440px)',
                  aspectRatio: '3/4',
                  scrollSnapAlign: 'center',
                  transform: `scale(${scaleFor(lesson.slug)})`,
                  opacity: opacityFor(lesson.slug),
                  transition: 'transform 0.12s ease-out, opacity 0.12s ease-out',
                  willChange: 'transform, opacity',
                }}
              >
                <Link
                  href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                  className="block w-full h-full active:scale-[0.97] transition-transform"
                  aria-label={lesson.title}
                >
                  <LessonCard
                    lesson={lesson}
                    status={status}
                    accent={accent}
                    groupLabel={groupLabel}
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface CourseData {
  course: Course;
  lessons: Lesson[];
  completedSlugs: Set<string>;
  currentSlug: string | null;
}

function flatten(courses: CourseData[]): {
  nodes: FlatNode[];
  currentSlug: string | null;
  completedTotal: number;
  lessonsTotal: number;
} {
  // The overall "current" is the first non-completed lesson of the first
  // course with any unfinished lessons. If everything is done, last lesson.
  const nodes: FlatNode[] = [];
  let overallCurrent: string | null = null;
  let completedTotal = 0;
  let lessonsTotal = 0;

  for (const cd of courses) {
    lessonsTotal += cd.lessons.length;
    completedTotal += cd.completedSlugs.size;
    if (!overallCurrent && cd.currentSlug) overallCurrent = cd.currentSlug;

    let firstInCourse = true;
    let prevSectionKey: string | null = null;

    for (const lesson of cd.lessons) {
      const sectionKey = lesson.sectionSlug ?? 'default';
      const sectionChanged = sectionKey !== prevSectionKey;

      let groupLabel: string | undefined;
      if (firstInCourse) {
        groupLabel = cd.course.title.toUpperCase();
      } else if (sectionChanged) {
        groupLabel = (lesson.sectionSlug ?? 'UNIT').toUpperCase();
      }

      const status: NodeStatus = cd.completedSlugs.has(lesson.slug)
        ? 'done'
        : cd.currentSlug === lesson.slug
          ? 'current'
          : 'upcoming';

      nodes.push({
        lesson,
        course: cd.course,
        status,
        groupLabel,
        isCourseStart: firstInCourse,
      });

      firstInCourse = false;
      prevSectionKey = sectionKey;
    }
  }

  return { nodes, currentSlug: overallCurrent, completedTotal, lessonsTotal };
}

export function LessonCarouselSection({ level }: Props) {
  const [data, setData] = useState<CourseData[] | null>(null);
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
          setData([]);
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

        const populated: CourseData[] = await Promise.all(
          myCourses.map(async (course): Promise<CourseData> => {
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
        setData(nonEmpty);
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
  if (status === 'empty' || !data || data.length === 0) {
    return (
      <EmptyState
        title="Немає уроків для твого рівня"
        description={`Уроки для рівня ${level} зʼявляться незабаром.`}
      />
    );
  }

  const flat = flatten(data);
  return (
    <UnifiedCarousel
      nodes={flat.nodes}
      currentSlug={flat.currentSlug}
      completedTotal={flat.completedTotal}
      lessonsTotal={flat.lessonsTotal}
    />
  );
}
