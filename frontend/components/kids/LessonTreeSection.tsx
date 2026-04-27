/**
 * LessonListSection — flat list of lessons of the active kid-facing course.
 *
 * Replaces the older "list of courses" view. The active course is picked the
 * same way the carousel picks one — first in-progress course, falling back
 * to the first available. When more than one kid-facing course exists at the
 * level, the ribbon turns into an inline accordion picker so the kid can
 * switch course without leaving the list.
 *
 * Visual treatment matches /kids/library/[id] lessons block: ios-list rows,
 * hairline separators, no decorative emoji, neutral chips. The dot on the
 * left carries the only state colour (success ✓ done, primary current,
 * neutral upcoming).
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
import type { Course, Lesson, Level } from '@/lib/types';
import { LoadingState } from '@/components/ui/LoadingState';
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

type Status = 'done' | 'current' | 'upcoming';

interface LessonRow {
  lesson: Lesson;
  status: Status;
}

interface SectionGroup {
  slug: string;
  title: string;
  rows: LessonRow[];
}

function pluralLessons(n: number): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return 'уроків';
  if (b > 1 && b < 5) return 'уроки';
  if (b === 1) return 'урок';
  return 'уроків';
}

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
      const completedSlugs =
        completedByCourse.get(course.slug) ?? new Set<string>();
      const current = sorted.find((l) => !completedSlugs.has(l.slug)) ?? null;
      return {
        course,
        lessons: sorted,
        completedSlugs,
        currentSlug: current?.slug ?? null,
      };
    })
    .filter((g) => g.lessons.length > 0);
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

function pickRows(cd: CourseData): LessonRow[] {
  let firstUnfinishedSeen = false;
  return cd.lessons.map((lesson) => {
    if (cd.completedSlugs.has(lesson.slug)) {
      return { lesson, status: 'done' as const };
    }
    if (!firstUnfinishedSeen) {
      firstUnfinishedSeen = true;
      return { lesson, status: 'current' as const };
    }
    return { lesson, status: 'upcoming' as const };
  });
}

function groupBySection(course: Course, rows: LessonRow[]): SectionGroup[] {
  const sections = (course.sections ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  if (sections.length === 0) {
    return [{ slug: 'all', title: '', rows }];
  }
  const byLessonSlug = new Map<string, LessonRow>();
  rows.forEach((r) => byLessonSlug.set(r.lesson.slug, r));
  const used = new Set<string>();
  const groups: SectionGroup[] = sections.map((s) => {
    const sectionRows: LessonRow[] = [];
    for (const slug of s.lessonSlugs ?? []) {
      const row = byLessonSlug.get(slug);
      if (row) {
        sectionRows.push(row);
        used.add(slug);
      }
    }
    return { slug: s.slug, title: s.title, rows: sectionRows };
  });
  const orphans = rows.filter((r) => !used.has(r.lesson.slug));
  if (orphans.length > 0) {
    groups.push({ slug: '__orphans', title: 'Інше', rows: orphans });
  }
  return groups.filter((g) => g.rows.length > 0);
}

function accentOf(course: Course): string {
  return (course as Course & { iconColor?: string }).iconColor ?? '#22C55E';
}

function emojiOf(course: Course): string {
  return (course as Course & { iconEmoji?: string }).iconEmoji ?? '🎓';
}

export function LessonListSection({ level }: Props) {
  const cached = hydrateFromCaches(level);
  const [data, setData] = useState<CourseData[] | null>(cached);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>(
    cached === null ? 'loading' : cached.length === 0 ? 'empty' : 'ready',
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function defaultCourseSlug(courses: CourseData[]): string | null {
    if (courses.length === 0) return null;
    const inProgress = courses.find(
      (c) => c.currentSlug !== null && c.completedSlugs.size < c.lessons.length,
    );
    return inProgress?.course.slug ?? courses[0].course.slug;
  }

  const [selectedSlug, setSelectedSlug] = useState<string | null>(() =>
    defaultCourseSlug(cached ?? []),
  );
  const [pickerOpen, setPickerOpen] = useState(false);

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

  // Reset selection when courses change.
  useEffect(() => {
    if (!data || data.length === 0) {
      setSelectedSlug(null);
      return;
    }
    setSelectedSlug((prev) => {
      if (prev && data.some((c) => c.course.slug === prev)) return prev;
      return defaultCourseSlug(data);
    });
  }, [data]);

  const courses = data ?? [];
  const selected =
    courses.find((c) => c.course.slug === selectedSlug) ?? courses[0] ?? null;

  const rows = useMemo(
    () => (selected ? pickRows(selected) : []),
    [selected],
  );
  const groups = useMemo(
    () => (selected ? groupBySection(selected.course, rows) : []),
    [selected, rows],
  );

  if (status === 'loading') {
    return <LoadingState shape="list" rows={5} />;
  }
  if (status === 'error') {
    return (
      <EmptyState
        title="Не вдалось завантажити уроки"
        description={errorMsg ?? 'Спробуй пізніше'}
      />
    );
  }
  if (status === 'empty' || !selected) {
    return (
      <EmptyState
        title="Немає уроків для твого рівня"
        description={`Уроки для рівня ${level} зʼявляться незабаром.`}
      />
    );
  }

  const otherCourses = courses
    .filter((c) => c.course.slug !== selected.course.slug)
    .map((c) => c.course);
  const hasMore = otherCourses.length > 0;
  const accent = accentOf(selected.course);
  const total = selected.lessons.length;
  const completed = selected.completedSlugs.size;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col">
      {/* Course ribbon — same pattern as carousel */}
      <div className="border-b border-border bg-surface-raised">
        {hasMore ? (
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={pickerOpen}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-muted transition-colors"
          >
            <div
              aria-hidden
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0"
              style={{ background: `${accent}1a` }}
            >
              {emojiOf(selected.course)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[13px] text-ink truncate leading-tight flex items-center gap-1">
                <span className="truncate">{selected.course.title}</span>
                <span
                  aria-hidden
                  className={[
                    'text-ink-faint flex-shrink-0 transition-transform',
                    pickerOpen ? 'rotate-180' : '',
                  ].join(' ')}
                >
                  ▾
                </span>
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
                    style={{ width: `${pct}%`, background: accent }}
                  />
                </div>
                <span className="font-black text-[11px] tabular-nums leading-none flex-shrink-0">
                  <span style={{ color: accent }}>{completed}</span>
                  <span className="font-bold text-ink-faint">/{total}</span>
                </span>
              </div>
            </div>
          </button>
        ) : (
          <Link
            href={`/kids/library/${selected.course.slug}`}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-muted transition-colors"
          >
            <div
              aria-hidden
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0"
              style={{ background: `${accent}1a` }}
            >
              {emojiOf(selected.course)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[13px] text-ink truncate leading-tight flex items-center gap-1">
                <span className="truncate">{selected.course.title}</span>
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
                    style={{ width: `${pct}%`, background: accent }}
                  />
                </div>
                <span className="font-black text-[11px] tabular-nums leading-none flex-shrink-0">
                  <span style={{ color: accent }}>{completed}</span>
                  <span className="font-bold text-ink-faint">/{total}</span>
                </span>
              </div>
            </div>
          </Link>
        )}

        {hasMore && pickerOpen && (
          <div
            role="menu"
            aria-label="Виберіть курс"
            className="border-t border-border overflow-hidden"
          >
            {otherCourses.map((c, i) => (
              <button
                key={c.slug}
                role="menuitemradio"
                aria-checked={false}
                onClick={() => {
                  setSelectedSlug(c.slug);
                  setPickerOpen(false);
                }}
                className={[
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-muted',
                  i > 0 && 'border-t border-border',
                ].filter(Boolean).join(' ')}
              >
                <div
                  aria-hidden
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[14px] flex-shrink-0"
                  style={{ background: `${accentOf(c)}1a` }}
                >
                  {emojiOf(c)}
                </div>
                <span className="flex-1 min-w-0 font-black text-[12.5px] text-ink truncate">
                  {(c as Course & { titleUa?: string }).titleUa ?? c.title}
                </span>
                <span aria-hidden className="text-ink-faint text-[15px] font-black flex-shrink-0">
                  ›
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lesson list — grouped by section, ios-list rows */}
      <div className="px-4 md:px-6 py-5">
        <div className="max-w-screen-md mx-auto w-full flex flex-col gap-5">
          <div className="flex items-baseline justify-between gap-2 px-1">
            <span className="font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted">
              Уроки
            </span>
            <span className="font-bold text-[11px] text-ink-faint tabular-nums">
              {total} {pluralLessons(total)}
            </span>
          </div>

          {groups.map((g) => (
            <div key={g.slug}>
              {g.title && (
                <p className="font-bold text-[12px] text-ink-muted mb-2 px-1">
                  {g.title}
                </p>
              )}
              <ol className="ios-list">
                {g.rows.map((row, idx) => (
                  <LessonRowItem
                    key={row.lesson.documentId}
                    row={row}
                    index={idx}
                    courseSlug={selected.course.slug}
                  />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Backwards-compat alias — older imports still call it `LessonTreeSection`. */
export { LessonListSection as LessonTreeSection };

function LessonRowItem({
  row,
  index,
  courseSlug,
}: {
  row: LessonRow;
  index: number;
  courseSlug: string;
}) {
  const { lesson, status } = row;
  const dotClass =
    status === 'done'
      ? 'bg-success text-white'
      : status === 'current'
        ? 'bg-primary text-white'
        : 'bg-surface-muted text-ink-faint';
  return (
    <li className="border-t border-border first:border-t-0">
      <Link
        href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
        className="flex items-center gap-3 min-h-11 px-4 py-3 transition-colors hover:bg-surface-hover"
      >
        <span
          aria-hidden
          className={[
            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-[11.5px]',
            dotClass,
          ].join(' ')}
        >
          {status === 'done' ? '✓' : index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={[
              'font-black text-[14px] leading-snug truncate',
              status === 'upcoming' ? 'text-ink-muted' : 'text-ink',
            ].join(' ')}
          >
            {lesson.title}
          </p>
          {(lesson.durationMin || status === 'current' || status === 'done') && (
            <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
              {[
                lesson.durationMin ? `${lesson.durationMin} хв` : null,
                status === 'current' ? 'Поточний' : status === 'done' ? 'Завершено' : null,
              ].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span aria-hidden className="text-ink-faint font-black text-base flex-shrink-0">
          ›
        </span>
      </Link>
    </li>
  );
}
