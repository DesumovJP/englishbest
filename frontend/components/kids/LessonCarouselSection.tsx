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
import {
  fetchCoursesCached,
  fetchLessonsByCourseCached,
  peekCourses,
  peekLessonsByCourse,
} from '@/lib/api';
import type { Course, Lesson, Level, LessonType } from '@/lib/types';
import {
  fetchMyProgressCached,
  peekMyProgress,
  type UserProgressRow,
} from '@/lib/user-progress';
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
  course,
  status,
  accent,
  groupLabel,
}: {
  lesson: Lesson;
  course: Course;
  status: NodeStatus;
  accent: string;
  groupLabel?: string;
}) {
  const emoji = TYPE_EMOJI[lesson.type] ?? '📘';
  const typeLabel = TYPE_LABEL[lesson.type] ?? 'Урок';
  const isCurrent = status === 'current';
  const isDone = status === 'done';
  const isLocked = status === 'upcoming' && !isCurrent;

  // Cover precedence: lesson-specific cover > course cover > pure gradient
  // fallback. Image gets a soft top→bottom darkening overlay so the white
  // title text stays readable without obscuring the photo.
  const bgImage = lesson.coverUrl || course.coverImageUrl || null;

  const ringStyle = isCurrent
    ? { boxShadow: `inset 0 0 0 4px white, inset 0 0 0 7px ${accent}` }
    : undefined;

  // Brighter, optimistic gradient — light-accent → accent → soft-deep-accent.
  // No black stop. Avoids the "funereal" feel of the previous palette.
  const gradient = `linear-gradient(155deg, color-mix(in srgb, ${accent} 65%, white) 0%, ${accent} 55%, color-mix(in srgb, ${accent} 80%, black) 100%)`;

  const surfaceStyle: React.CSSProperties = bgImage
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%), url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : isLocked
      ? { background: `linear-gradient(160deg, ${accent}55 0%, ${accent}33 100%)` }
      : { background: gradient };

  return (
    <div
      className="relative w-full h-full rounded-[28px] overflow-hidden select-none"
      style={{ ...surfaceStyle, ...ringStyle }}
    >
      {/* Decorative oversized type-emoji — only when no real cover image,
          and only if not locked. Soft accent backdrop. */}
      {!bgImage && !isLocked && (
        <span
          aria-hidden
          className="absolute -top-6 -right-4 text-[180px] leading-none opacity-15 select-none pointer-events-none"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
        >
          {emoji}
        </span>
      )}

      {isDone && <div aria-hidden className="absolute inset-0 bg-black/25" />}

      {isLocked ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span aria-hidden className="text-[56px] opacity-50">🔒</span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-3 pointer-events-none">
          <div
            aria-hidden
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[36px] bg-white/25 border border-white/40 backdrop-blur-md shadow-lg"
          >
            {emoji}
          </div>
          <p
            className="font-black text-white leading-tight"
            style={{
              fontSize: 'clamp(20px, 2.6vw, 26px)',
              letterSpacing: '-0.02em',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 2px 6px rgba(0,0,0,0.35)',
            }}
          >
            {lesson.title}
          </p>
          <p className="font-bold text-[12px] text-white/85 tracking-wide uppercase">
            {typeLabel}
          </p>
        </div>
      )}

      {groupLabel && (
        <div className="absolute top-3 left-3 rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-sm max-w-[75%]">
          <span className="font-black text-white text-[10px] tracking-widest truncate block">
            {groupLabel}
          </span>
        </div>
      )}

      {isDone && (
        <div
          aria-hidden
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/95 text-success-dark"
        >
          <span className="font-black text-base">✓</span>
        </div>
      )}
    </div>
  );
}

function accentOf(course: Course): string {
  return (course as Course & { iconColor?: string }).iconColor ?? '#22C55E';
}

function emojiOf(course: Course): string {
  return (course as Course & { iconEmoji?: string }).iconEmoji ?? '🎓';
}

interface UnifiedCarouselProps {
  nodes: FlatNode[];
  currentSlug: string | null;
  completedTotal: number;
  lessonsTotal: number;
  /** Courses NOT currently shown — populates the ribbon switcher dropdown. */
  otherCourses?: Course[];
  /** Called when the kid picks another course from the ribbon dropdown. */
  onSelectCourse?: (slug: string) => void;
}

function UnifiedCarousel({
  nodes,
  currentSlug,
  completedTotal,
  lessonsTotal,
  otherCourses = [],
  onSelectCourse,
}: UnifiedCarouselProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasMore = otherCourses.length > 0 && !!onSelectCourse;
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
    // Cooldown: smooth-scroll intro runs ONCE per `currentSlug` per session.
    // Re-centering must NOT depend on `activeCourse.slug` — that value is
    // mutated by the user's own scrolling, which would create a feedback
    // loop (user scrolls → activeCourse changes → effect fires → scrollTo
    // currentRef → calcScales → activeCourse changes again → …).
    const sessionKey = `kids:carousel-intro:${currentSlug}`;
    const alreadyAnimated =
      typeof window !== 'undefined' &&
      window.sessionStorage?.getItem(sessionKey) === '1';

    const delay = alreadyAnimated ? 0 : 350;
    const settle = alreadyAnimated ? 50 : 700;

    const t = setTimeout(() => {
      const cur = currentRef.current;
      const ctr = scrollRef.current;
      if (!cur || !ctr) return;
      const curRect = cur.getBoundingClientRect();
      const ctrRect = ctr.getBoundingClientRect();
      const target =
        ctr.scrollLeft + (curRect.left + curRect.width / 2) - (ctrRect.left + ctrRect.width / 2);
      ctr.scrollTo({ left: target, behavior: alreadyAnimated ? 'auto' : 'smooth' });
      setTimeout(calcScales, settle);
      if (!alreadyAnimated && typeof window !== 'undefined') {
        try { window.sessionStorage.setItem(sessionKey, '1'); } catch { /* private mode */ }
      }
    }, delay);
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
    <section className="flex flex-col h-full min-h-0">
      {/* Course ribbon — single line: identity + progress. When more than one
          course is available, becomes a dropdown trigger; otherwise a link
          to the course-detail page. */}
      <div className="relative flex-shrink-0 border-b border-border bg-surface-raised">
      {hasMore ? (
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-muted transition-colors"
        >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0"
          style={{ background: `${activeAccent}1a` }}
        >
          {activeCourse ? emojiOf(activeCourse) : '🎓'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[13px] text-ink truncate leading-tight flex items-center gap-1">
            <span className="truncate">{activeCourse?.title ?? 'Уроки'}</span>
            <span
              aria-hidden
              className={[
                'text-ink-faint flex-shrink-0 transition-transform',
                hasMore ? '' : 'rotate-90',
                pickerOpen ? 'rotate-180' : '',
              ].join(' ')}
            >
              {hasMore ? '▾' : '›'}
            </span>
          </p>
          {/*
            Progress meter — tokenised track with course-accent fill.
            Track:  bg-surface-sunk (design token, neutral grey).
            Fill:   per-course accent (kept inline, since brand colour
                    varies per course and isn't a design token).
            Soft inner ring on the track adds depth on white surfaces.
            Width transition: 500ms ease-out so the bar feels responsive
            after a lesson completes (formerly 700ms — felt sluggish).
          */}
          <div className="flex items-center gap-2.5 mt-1.5">
            <div
              className="relative flex-1 h-2 rounded-full bg-surface-sunk overflow-hidden ring-1 ring-inset ring-black/[0.04]"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Прогрес курсу"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%`, background: activeAccent }}
              />
            </div>
            <span className="font-black text-[11px] tabular-nums leading-none flex-shrink-0">
              <span style={{ color: activeAccent }}>{completedTotal}</span>
              <span className="font-bold text-ink-faint">/{lessonsTotal}</span>
            </span>
          </div>
        </div>
        </button>
      ) : (
        <Link
          href={activeCourse ? `/kids/library/${activeCourse.slug}` : '/kids/school'}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-muted transition-colors"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0"
            style={{ background: `${activeAccent}1a` }}
          >
            {activeCourse ? emojiOf(activeCourse) : '🎓'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-[13px] text-ink truncate leading-tight flex items-center gap-1">
              <span className="truncate">{activeCourse?.title ?? 'Уроки'}</span>
              <span aria-hidden className="text-ink-faint flex-shrink-0">›</span>
            </p>
            <div className="flex items-center gap-2.5 mt-1.5">
              <div
                className="relative flex-1 h-2 rounded-full bg-surface-sunk overflow-hidden ring-1 ring-inset ring-black/[0.04]"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Прогрес курсу"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${pct}%`, background: activeAccent }}
                />
              </div>
              <span className="font-black text-[11px] tabular-nums leading-none flex-shrink-0">
                <span style={{ color: activeAccent }}>{completedTotal}</span>
                <span className="font-bold text-ink-faint">/{lessonsTotal}</span>
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Course picker dropdown — opens beneath the ribbon when more than one
          course is available. Click outside or pick a course to dismiss. */}
      {hasMore && pickerOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setPickerOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            aria-label="Виберіть курс"
            className="absolute left-3 right-3 top-full mt-1 z-40 rounded-xl border border-border bg-surface-raised shadow-card-md overflow-hidden animate-fade-in-up"
          >
            {[activeCourse, ...otherCourses]
              .filter((c): c is Course => !!c)
              .map((c, i) => {
                const isActive = c.slug === activeCourse?.slug;
                return (
                  <button
                    key={c.slug}
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => {
                      if (!isActive && onSelectCourse) onSelectCourse(c.slug);
                      setPickerOpen(false);
                    }}
                    className={[
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover',
                      i > 0 && 'border-t border-border',
                      isActive && 'bg-surface-muted',
                    ].filter(Boolean).join(' ')}
                  >
                    <div
                      aria-hidden
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] flex-shrink-0"
                      style={{ background: `${accentOf(c)}1a` }}
                    >
                      {emojiOf(c)}
                    </div>
                    <span className="flex-1 min-w-0 font-black text-[13.5px] text-ink truncate">
                      {(c as Course & { titleUa?: string }).titleUa ?? c.title}
                    </span>
                    {isActive && (
                      <span aria-hidden className="text-primary font-black text-base flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </>
      )}
      </div>

      {/* Unified horizontal scroll-snap carousel — flex-1 so it vertically centers */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 flex items-center overflow-x-auto overflow-y-hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: 'calc(50% - clamp(120px, 28vw, 180px))',
          paddingRight: 'calc(50% - clamp(120px, 28vw, 180px))',
        }}
      >
        <div className="flex items-center gap-4">
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
                  width: 'clamp(240px, 56vw, 360px)',
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
                    course={course}
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

  // When the caller passes a single course (the new course-scoped view),
  // suppress the per-course name chip on the first card — it just
  // duplicates the course pill above the carousel. Section labels
  // (UNIT-1 etc.) still appear when sections change.
  const showCourseHeader = courses.length > 1;

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
      if (firstInCourse && showCourseHeader) {
        groupLabel = cd.course.title.toUpperCase();
      } else if (sectionChanged && !firstInCourse) {
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

/**
 * Loading skeleton that matches the carousel layout exactly: course ribbon
 * up top, then a horizontal row of 5 portrait cards with the centre one
 * scaled up — same `clamp(240px, 56vw, 360px)` width and 3:4 aspect as the
 * real cards. Avoids the layout shift / "wait, where's the carousel?" gap
 * that the previous generic list skeleton caused.
 */
function CarouselSkeleton() {
  // Five placeholders: outermost barely visible, mid-flank slightly bigger,
  // centre full-size — mirrors the scroll-snap focus state.
  const slots = [
    { scale: 0.72, opacity: 0.35 },
    { scale: 0.84, opacity: 0.55 },
    { scale: 1.00, opacity: 0.85 },
    { scale: 0.84, opacity: 0.55 },
    { scale: 0.72, opacity: 0.35 },
  ];

  return (
    <section
      className="flex flex-col h-full min-h-0"
      role="status"
      aria-label="Завантаження уроків"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-muted border-b border-border flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-surface-raised animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3 w-32 rounded-md bg-surface-raised animate-pulse" />
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-[4px] rounded-full bg-surface-raised animate-pulse" />
            <div className="h-3 w-9 rounded-md bg-surface-raised animate-pulse" />
          </div>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 flex items-center overflow-hidden"
        style={{
          paddingLeft: 'calc(50% - clamp(120px, 28vw, 180px))',
          paddingRight: 'calc(50% - clamp(120px, 28vw, 180px))',
        }}
      >
        <div className="flex items-center gap-4">
          {slots.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{
                width: 'clamp(240px, 56vw, 360px)',
                aspectRatio: '3/4',
                transform: `scale(${s.scale})`,
                opacity: s.opacity,
              }}
            >
              <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-surface-muted animate-pulse">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                  <div className="w-[72px] h-[72px] rounded-full bg-surface-raised/70" />
                  <div className="h-5 w-3/4 rounded-md bg-surface-raised/70" />
                  <div className="h-5 w-1/2 rounded-md bg-surface-raised/70" />
                  <div className="h-7 w-24 rounded-full bg-surface-raised/70 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function buildCourseData(
  allCourses: Course[],
  progressRows: UserProgressRow[],
  lessonsByCourse: Map<string, Lesson[]>,
  level: Level,
): CourseData[] {
  const myCourses = allCourses.filter(
    c =>
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
      const completedSlugs =
        completedByCourse.get(course.slug) ?? new Set<string>();
      const current = sorted.find(l => !completedSlugs.has(l.slug)) ?? null;
      return {
        course,
        lessons: sorted,
        completedSlugs,
        currentSlug: current?.slug ?? null,
      };
    })
    .filter(g => g.lessons.length > 0);
}

function hydrateCarouselFromCaches(level: Level): CourseData[] | null {
  const courses = peekCourses();
  const progress = peekMyProgress();
  if (!courses || !progress) return null;
  const myCourses = courses.filter(
    c =>
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
  const cached = hydrateCarouselFromCaches(level);
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
          c =>
            c.level === level &&
            (!c.audience || c.audience === 'kids' || c.audience === 'any'),
        );

        if (myCourses.length === 0) {
          setData([]);
          setStatus('empty');
          return;
        }

        const lessonsArr = await Promise.all(
          myCourses.map(c => fetchLessonsByCourseCached(c.slug)),
        );
        if (!alive) return;
        const lessonsByCourse = new Map<string, Lesson[]>();
        myCourses.forEach((c, i) =>
          lessonsByCourse.set(c.slug, lessonsArr[i]),
        );

        const populated = buildCourseData(
          allCourses,
          progressRows,
          lessonsByCourse,
          level,
        );

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

  return (
    <CourseScopedCarousel
      data={data}
      status={status}
      level={level}
      errorMsg={errorMsg}
    />
  );
}

/**
 * Wraps the underlying carousel with a course-scoped view: at any time the
 * kid sees lessons of ONE course, not a flattened mix. When there are
 * multiple kid-facing courses at the level, a small pill bar above the
 * carousel lets them switch. Default selection = course where the kid is
 * currently progressing (first non-finished course); falls back to the
 * first course when everything is fresh or everything is done.
 */
function CourseScopedCarousel({
  data,
  status,
  level,
  errorMsg,
}: {
  data: CourseData[] | null;
  status: 'loading' | 'ready' | 'empty' | 'error';
  level: Level;
  errorMsg: string | null;
}) {
  const courses = data ?? [];

  function defaultCourseSlug(): string | null {
    if (courses.length === 0) return null;
    // Prefer the first course that has an unfinished lesson — the kid's
    // active learning track. Skip courses that are 100% done so we don't
    // park the kid on a finished course when another one is in flight.
    const inProgress = courses.find(
      (c) => c.currentSlug !== null && c.completedSlugs.size < c.lessons.length,
    );
    if (inProgress) return inProgress.course.slug;
    return courses[0].course.slug;
  }

  const [selectedSlug, setSelectedSlug] = useState<string | null>(() =>
    defaultCourseSlug(),
  );

  // When data first arrives (or level changes) initialise the selection.
  // Keep the kid's choice if it still maps to a visible course.
  useEffect(() => {
    if (courses.length === 0) {
      setSelectedSlug(null);
      return;
    }
    setSelectedSlug((prev) => {
      if (prev && courses.some((c) => c.course.slug === prev)) return prev;
      return defaultCourseSlug();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses.length, level]);

  if (status === 'loading') return <CarouselSkeleton />;
  if (status === 'error') {
    return (
      <EmptyState
        title="Не вдалось завантажити уроки"
        description={errorMsg ?? 'Спробуй пізніше'}
      />
    );
  }
  if (status === 'empty' || courses.length === 0) {
    return (
      <EmptyState
        title="Немає уроків для твого рівня"
        description={`Уроки для рівня ${level} зʼявляться незабаром.`}
      />
    );
  }

  const selected =
    courses.find((c) => c.course.slug === selectedSlug) ?? courses[0];
  const flat = flatten([selected]);
  const otherCourses = courses
    .filter((c) => c.course.slug !== selected.course.slug)
    .map((c) => c.course);
  return (
    <section className="flex flex-col h-full min-h-0">
      <UnifiedCarousel
        key={selected.course.slug}
        nodes={flat.nodes}
        currentSlug={flat.currentSlug}
        completedTotal={flat.completedTotal}
        lessonsTotal={flat.lessonsTotal}
        otherCourses={otherCourses}
        onSelectCourse={setSelectedSlug}
      />
    </section>
  );
}
