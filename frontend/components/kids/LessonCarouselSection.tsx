/**
 * LessonCarouselSection — horizontal, center-focus lesson carousel.
 *
 * One carousel per course in the current level. Lessons scroll horizontally
 * with CSS scroll-snap locking each card to the viewport center; a scroll
 * listener updates per-card scale/opacity so the focused card pops. On
 * mount we auto-scroll to the learner's current lesson.
 *
 * Data contract identical to `LessonTreeSection`:
 * `fetchCourses` (filtered by level + kids/any audience) + `fetchLessonsByCourse`
 * per course + `fetchMyProgress` for completion state.
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

interface CourseGroup {
  course: Course;
  lessons: Lesson[];
  completedSlugs: Set<string>;
  currentSlug: string | null;
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
  unitLabel,
}: {
  lesson: Lesson;
  status: NodeStatus;
  accent: string;
  unitLabel?: string;
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

      {unitLabel && (
        <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 bg-black/45 backdrop-blur border border-white/25">
          <span className="font-black text-white text-[10px] tracking-widest">
            {unitLabel}
          </span>
        </div>
      )}

      {isDone && !unitLabel && (
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

function CourseCarousel({ group }: { group: CourseGroup }) {
  const { course, lessons, completedSlugs, currentSlug } = group;
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const rafRef = useRef<number | null>(null);
  const [scales, setScales] = useState<Map<string, number>>(new Map());

  const accent = (course as any).iconColor ?? '#22C55E';
  const pct = lessons.length === 0 ? 0 : Math.round((completedSlugs.size / lessons.length) * 100);

  // Section-label-on-first-card-of-section helpers.
  const sectionFirsts = useMemo(() => {
    const seen = new Set<string>();
    const firstSlugs = new Set<string>();
    for (const l of lessons) {
      const key = l.sectionSlug ?? 'default';
      if (!seen.has(key)) {
        seen.add(key);
        firstSlugs.add(l.slug);
      }
    }
    return firstSlugs;
  }, [lessons]);

  function statusOf(slug: string): NodeStatus {
    if (completedSlugs.has(slug)) return 'done';
    if (currentSlug === slug) return 'current';
    return 'upcoming';
  }

  function calcScales() {
    const ctr = scrollRef.current;
    if (!ctr) return;
    const { left: cl, width: cw } = ctr.getBoundingClientRect();
    const cx = cl + cw / 2;
    const threshold = cw * 0.5;
    const next = new Map<string, number>();
    cardRefs.current.forEach((el, slug) => {
      const { left, width } = el.getBoundingClientRect();
      const dist = Math.abs(left + width / 2 - cx);
      next.set(slug, Math.max(0, Math.min(1, 1 - dist / threshold)));
    });
    setScales(next);
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

  return (
    <section className="flex flex-col">
      {/* Compact course header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-muted border-b border-border">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0"
          style={{ background: `${accent}20`, border: `1.5px solid ${accent}40` }}
        >
          {(course as any).iconEmoji ?? '🎓'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[14px] text-ink truncate leading-tight">
            {course.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="flex-1 h-[5px] rounded-full overflow-hidden"
              style={{ background: `${accent}20` }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: accent }}
              />
            </div>
            <span className="font-black text-[11px] flex-shrink-0" style={{ color: accent }}>
              {completedSlugs.size}
              <span className="font-medium text-ink-faint">/{lessons.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal scroll-snap carousel */}
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto"
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
          {lessons.map(lesson => {
            const status = statusOf(lesson.slug);
            const isCurr = status === 'current';
            const unitLabel = sectionFirsts.has(lesson.slug)
              ? (lesson.sectionSlug ?? 'UNIT').toUpperCase()
              : undefined;
            const card = (
              <LessonCard
                lesson={lesson}
                status={status}
                accent={accent}
                unitLabel={unitLabel}
              />
            );

            return (
              <div
                key={lesson.slug}
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
                  {card}
                </Link>
              </div>
            );
          })}
        </div>
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
    <div className="flex flex-col gap-6">
      {groups.map(group => (
        <CourseCarousel key={group.course.documentId} group={group} />
      ))}
    </div>
  );
}
