/**
 * Vocabulary catalog — kids "Слова" tab redesign.
 *
 * Three sections, each visually distinct:
 *   1. Featured Hero — anchor set tied to the kid's current course
 *      (course-themed gradient, recommended for them).
 *   2. Загальні теми — 2-column GRID of colourful tiles (TopicTile).
 *   3. За курсами — horizontal scroll of per-course anchor cards.
 *   4. За уроками — collapsible groups, default-open for current course.
 *
 * Word counts are first-class citizens (used as the secondary badge on
 * every card) so kids can pick a "small" or "big" set at a glance.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  fetchVocabularySets,
  peekVocabularySets,
  type VocabularySet,
  type Level,
} from '@/lib/vocabulary';
import { fetchCoursesCached, peekCourses } from '@/lib/api';
import {
  fetchMyProgressCached,
  peekMyProgress,
  type UserProgressRow,
} from '@/lib/user-progress';
import type { Course } from '@/lib/types';
import { themeForCourse } from '@/lib/course-theme';
import { TopicTile } from '@/components/kids/TopicTile';
import { CourseHero } from '@/components/kids/CourseHero';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  level: Level;
}

const LEVEL_ORDER: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function canAccessLevel(userLevel: Level, req: Level): boolean {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(req);
}

export function VocabularySection({ level }: Props) {
  const [sets, setSets] = useState<VocabularySet[] | null>(() => peekVocabularySets());
  const [courses, setCourses] = useState<Course[] | null>(() => peekCourses());
  const [progress, setProgress] = useState<UserProgressRow[] | null>(() => peekMyProgress());
  const [loading, setLoading] = useState(sets === null || courses === null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchVocabularySets(),
      fetchCoursesCached(),
      fetchMyProgressCached().catch(() => [] as UserProgressRow[]),
    ])
      .then(([s, c, p]) => {
        if (!alive) return;
        setSets(s);
        setCourses(c);
        setProgress(p);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setSets([]);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Identify the kid's "current" course at this level — first course with
  // unfinished lessons. Used to spotlight the matching vocab anchor at top.
  const currentCourse = useCurrentCourse(courses, progress, level);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <LoadingState shape="list" rows={4} />
      </div>
    );
  }

  if (!sets || sets.length === 0) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          title="Словничок наповнюється"
          description="Скоро тут зʼявляться добірки слів за темами та курсами."
        />
      </div>
    );
  }

  const standalone = sets.filter((s) => !s.courseSlug && !s.lessonSlug);
  const perCourse = sets.filter((s) => s.courseSlug && !s.lessonSlug);
  const perLessonByCourse = new Map<string, VocabularySet[]>();
  for (const s of sets) {
    if (!s.lessonSlug || !s.courseSlug) continue;
    const arr = perLessonByCourse.get(s.courseSlug) ?? [];
    arr.push(s);
    perLessonByCourse.set(s.courseSlug, arr);
  }

  const featured =
    currentCourse
      ? perCourse.find((s) => s.courseSlug === currentCourse.slug) ?? null
      : null;

  return (
    <div className="max-w-screen-md mx-auto w-full px-4 py-4 space-y-6">
      {featured && currentCourse && (
        <FeaturedSet set={featured} course={currentCourse} />
      )}

      {standalone.length > 0 && (
        <section>
          <SectionHeader title="Загальні теми" subtitle={`${standalone.length} добірок`} />
          <div className="grid grid-cols-2 gap-3">
            {standalone.map((s) => (
              <TopicTile key={s.slug} set={s} isLocked={!canAccessLevel(level, s.level)} />
            ))}
          </div>
        </section>
      )}

      {perCourse.length > 0 && (
        <section>
          <SectionHeader title="За курсами" subtitle={`${perCourse.length} ключових`} />
          <div
            className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {perCourse.map((s) => (
              <CourseAnchorCard
                key={s.slug}
                set={s}
                course={(courses ?? []).find((c) => c.slug === s.courseSlug) ?? null}
                isLocked={!canAccessLevel(level, s.level)}
              />
            ))}
          </div>
        </section>
      )}

      {Array.from(perLessonByCourse.entries()).map(([courseSlug, lessonSets]) => {
        const courseTitle = lessonSets[0]?.courseTitle ?? courseSlug.replace(/-/g, ' ');
        const isCurrent = currentCourse?.slug === courseSlug;
        return (
          <details
            key={courseSlug}
            open={isCurrent}
            className="group rounded-2xl border border-border bg-surface-raised overflow-hidden"
          >
            <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none list-none">
              <span aria-hidden className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[16px]">
                {lessonSets[0]?.iconEmoji ?? '🔤'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[12.5px] uppercase tracking-widest text-ink-faint leading-tight">
                  За уроками
                </p>
                <p className="font-black text-[14px] text-ink truncate leading-tight mt-0.5">
                  {courseTitle}
                </p>
              </div>
              <span className="font-bold text-[11.5px] text-ink-faint tabular-nums">
                {lessonSets.length}
              </span>
              <span aria-hidden className="text-ink-faint font-black text-base transition-transform group-open:rotate-90">›</span>
            </summary>
            <div className="px-2 pb-3 flex flex-col gap-1.5">
              {lessonSets.map((s) => (
                <LessonSetRow
                  key={s.slug}
                  set={s}
                  isLocked={!canAccessLevel(level, s.level)}
                />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function useCurrentCourse(
  courses: Course[] | null,
  progress: UserProgressRow[] | null,
  level: Level,
): Course | null {
  // Recompute synchronously when inputs change — using a memo keeps the
  // "Featured" tile stable across renders.
  return useMemo(() => {
    if (!courses) return null;
    const my = courses.filter(
      (c) =>
        c.level === level &&
        (!c.audience || c.audience === 'kids' || c.audience === 'any'),
    );
    if (my.length === 0) return null;
    const completedByCourse = new Map<string, number>();
    if (progress) {
      for (const r of progress) {
        if (r.status !== 'completed') continue;
        const slug = r.lesson?.courseSlug;
        if (!slug) continue;
        completedByCourse.set(slug, (completedByCourse.get(slug) ?? 0) + 1);
      }
    }
    // Most active = most lessons completed AND has more lessons remaining.
    // Falls back to first course at level.
    const ranked = [...my].sort(
      (a, b) => (completedByCourse.get(b.slug) ?? 0) - (completedByCourse.get(a.slug) ?? 0),
    );
    return ranked[0];
  }, [courses, progress, level]);
}

function FeaturedSet({ set, course }: { set: VocabularySet; course: Course }) {
  const theme = themeForCourse(course);
  return (
    <Link href={`/kids/vocab/${set.slug}`} className="block active:scale-[0.99] transition-transform">
      <CourseHero
        theme={theme}
        eyebrow="Рекомендуємо · твій курс"
        focalEmoji={set.iconEmoji}
        title={set.titleUa}
        subtitle={`${set.words.length} слів · рівень ${set.level}`}
        showFox={false}
      >
        <span
          className="inline-flex items-center justify-center mt-3 px-4 h-10 rounded-2xl bg-white font-black text-[13px] shadow-card-sm"
          style={{ color: theme.accentDark }}
        >
          Вивчити <span aria-hidden className="ml-1">→</span>
        </span>
      </CourseHero>
    </Link>
  );
}

function CourseAnchorCard({
  set,
  course,
  isLocked,
}: {
  set: VocabularySet;
  course: Course | null;
  isLocked: boolean;
}) {
  const theme = course ? themeForCourse(course) : null;
  const inner = (
    <div
      className="relative w-[220px] flex-shrink-0 rounded-2xl overflow-hidden text-white shadow-card-sm aspect-[4/3] flex flex-col p-4"
      style={theme ? { background: theme.gradient } : { background: '#16a34a' }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />
      <div className="relative flex items-start justify-between mb-2">
        <span aria-hidden className="text-[28px] leading-none">{set.iconEmoji}</span>
        <span className="font-black text-[10px] tracking-[0.1em] uppercase rounded-full px-2 py-0.5 bg-white/20 border border-white/25">
          {set.level}
        </span>
      </div>
      <p className="relative font-black text-[14.5px] leading-tight tracking-tight mt-auto">
        {set.titleUa}
      </p>
      <p className="relative font-bold text-[11px] text-white/80 mt-0.5 tabular-nums">
        {set.words.length} слів
      </p>
      {isLocked && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span aria-hidden className="text-2xl">🔒</span>
        </div>
      )}
    </div>
  );
  if (isLocked) return inner;
  return (
    <Link href={`/kids/vocab/${set.slug}`} className="active:scale-[0.99] transition-transform">
      {inner}
    </Link>
  );
}

function LessonSetRow({ set, isLocked }: { set: VocabularySet; isLocked: boolean }) {
  return (
    <Link
      href={isLocked ? '#' : `/kids/vocab/${set.slug}`}
      onClick={(e) => isLocked && e.preventDefault()}
      aria-disabled={isLocked}
      className={[
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
        isLocked ? 'opacity-55 cursor-not-allowed' : 'hover:bg-surface-muted',
      ].join(' ')}
    >
      <span aria-hidden className="text-[18px] flex-shrink-0">{set.iconEmoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-black text-[13px] text-ink truncate leading-tight">{set.titleUa}</p>
        <p className="font-medium text-[11px] text-ink-faint tabular-nums mt-0.5">
          {set.words.length} слів
        </p>
      </div>
      {!isLocked && <span aria-hidden className="text-ink-faint font-black">›</span>}
      {isLocked && <span aria-hidden>🔒</span>}
    </Link>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3 px-1">
      <p className="font-black uppercase tracking-widest text-[10.5px] text-ink-faint">
        {title}
      </p>
      {subtitle && (
        <p className="font-bold text-[11px] text-ink-faint tabular-nums">{subtitle}</p>
      )}
    </div>
  );
}
