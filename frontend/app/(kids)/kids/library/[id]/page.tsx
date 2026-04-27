/**
 * Kids course detail.
 *
 * Renders a real course-detail experience for the v2 catalog:
 *   - hero (icon, title, level, audience badge, subtitle)
 *   - long description paragraphs
 *   - progress bar (completed / total lessons)
 *   - lessons list grouped by `course.sections` (falls back to flat list),
 *     each row showing type emoji, title, durationMin, and a per-lesson
 *     status pill (✓ done / current / upcoming)
 *   - sticky bottom CTA → first incomplete lesson ("Продовжити" / "Почати")
 *
 * Data is live: courses + lessons + own progress, all SWR-cached. Anything
 * archived is filtered server-side, so deep-links to deleted v0/v1 courses
 * land on the empty state.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
import {
  fetchVocabularySets,
  peekVocabularySets,
  type VocabularySet,
} from '@/lib/vocabulary';
import type { Course, Lesson, LessonType } from '@/lib/types';
import { useKidsIdentity } from '@/lib/use-kids-identity';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

type LessonStatus = 'done' | 'current' | 'upcoming';

const LEVEL_ORDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = (typeof LEVEL_ORDER)[number];

function canAccessLevel(userLevel: Level, req: Level): boolean {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(req);
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

interface LessonRow {
  lesson: Lesson;
  status: LessonStatus;
}

function pickStatuses(
  lessons: Lesson[],
  progress: UserProgressRow[],
): LessonRow[] {
  const completed = new Set(
    progress
      .filter((r) => r.status === 'completed' && r.lesson?.documentId)
      .map((r) => r.lesson!.documentId),
  );
  const inProgress = new Set(
    progress
      .filter((r) => r.status === 'inProgress' && r.lesson?.documentId)
      .map((r) => r.lesson!.documentId),
  );

  const sorted = [...lessons].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
  );
  let firstUnfinishedSeen = false;
  return sorted.map((lesson) => {
    if (completed.has(lesson.documentId)) {
      return { lesson, status: 'done' as const };
    }
    if (!firstUnfinishedSeen) {
      firstUnfinishedSeen = true;
      // First not-completed lesson is "current" whether the kid started it
      // or not. Subsequent lessons are "upcoming".
      void inProgress;
      return { lesson, status: 'current' as const };
    }
    return { lesson, status: 'upcoming' as const };
  });
}

interface SectionGroup {
  slug: string;
  title: string;
  rows: LessonRow[];
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
  // Lessons not in any section land in a trailing "Інше" group.
  const orphans = rows.filter((r) => !used.has(r.lesson.slug));
  if (orphans.length > 0) {
    groups.push({ slug: '__orphans', title: 'Інше', rows: orphans });
  }
  return groups.filter((g) => g.rows.length > 0);
}

export default function KidsCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { level: kidsLevel } = useKidsIdentity();

  const [courses, setCourses] = useState<Course[] | null>(() => peekCourses());
  const [lessons, setLessons] = useState<Lesson[] | null>(() =>
    peekLessonsByCourse(id),
  );
  const [progress, setProgress] = useState<UserProgressRow[] | null>(() =>
    peekMyProgress(),
  );
  const [vocabSets, setVocabSets] = useState<VocabularySet[] | null>(() =>
    peekVocabularySets(),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchCoursesCached(),
      fetchLessonsByCourseCached(id),
      fetchMyProgressCached().catch(() => [] as UserProgressRow[]),
      fetchVocabularySets().catch(() => [] as VocabularySet[]),
    ])
      .then(([c, l, p, v]) => {
        if (!alive) return;
        setCourses(c);
        setLessons(l);
        setProgress(p);
        setVocabSets(v);
      })
      .catch((e) => {
        if (!alive) return;
        setError(String((e as Error).message ?? e));
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const course = useMemo(
    () => (courses ?? []).find((c) => c.slug === id) ?? null,
    [courses, id],
  );

  const lessonRows = useMemo(
    () => (lessons && progress ? pickStatuses(lessons, progress) : []),
    [lessons, progress],
  );

  const groups = useMemo(
    () => (course && lessonRows.length > 0 ? groupBySection(course, lessonRows) : []),
    [course, lessonRows],
  );

  const totalLessons = lessons?.length ?? 0;
  const completedCount = lessonRows.filter((r) => r.status === 'done').length;
  const pct = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  const nextRow = lessonRows.find((r) => r.status === 'current') ?? null;
  const isComplete = totalLessons > 0 && completedCount === totalLessons;
  const courseLevel = (course?.level ?? 'A1') as Level;
  const isLocked = course ? !canAccessLevel(kidsLevel, courseLevel) : false;

  const loading = courses === null || lessons === null || progress === null;

  if (loading && !course) {
    return (
      <div className="min-h-[100dvh] bg-surface-raised">
        <Header onBack={() => router.back()} title="Курс" />
        <div className="px-4 py-10">
          <LoadingState shape="card" rows={1} />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[100dvh] bg-surface-raised">
        <Header onBack={() => router.back()} title="Курс" />
        <div className="px-4 py-10">
          <EmptyState
            title="Курс не знайдено"
            description={
              error
                ? 'Не вдалось завантажити курс. Перевір зʼєднання та спробуй ще раз.'
                : 'Можливо, курс було перейменовано чи знято з публікації.'
            }
            icon={<span aria-hidden>😕</span>}
            action={
              <Button onClick={() => router.push('/kids/school')}>
                ← До Школи
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const longParas: string[] =
    course.descriptionLong && course.descriptionLong.length > 0
      ? course.descriptionLong
      : course.description
        ? [course.description]
        : course.descriptionShort
          ? [course.descriptionShort]
          : [];

  const heroIcon = course.iconEmoji ?? '🎓';
  const titleUa = course.titleUa ?? course.title;
  const subtitle = course.subtitle ?? '';

  return (
    <div className="flex flex-col min-h-[100dvh] bg-surface-raised">
      <Header
        onBack={() => router.push('/kids/school')}
        title={course.title}
      />

      {/* Hero */}
      <section className="px-5 md:px-10 pt-6 pb-5 border-b border-border">
        <div className="flex items-start gap-4 max-w-screen-md">
          <div
            aria-hidden
            className="flex-shrink-0 w-[88px] h-[88px] rounded-2xl bg-primary/10 flex items-center justify-center text-[44px] shadow-card-sm"
          >
            {heroIcon}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="rounded-md px-2 py-0.5 font-bold text-[11px] bg-primary/12 text-primary-dark border border-primary/20">
                {courseLevel}
              </span>
              {course.audience && (
                <span className="rounded-md px-2 py-0.5 font-bold text-[11px] bg-surface-muted text-ink-muted border border-border capitalize">
                  {course.audience === 'kids' ? 'Діти' : course.audience}
                </span>
              )}
              {totalLessons > 0 && (
                <span className="rounded-md px-2 py-0.5 font-bold text-[11px] bg-surface-muted text-ink-muted border border-border">
                  {totalLessons} уроків
                </span>
              )}
            </div>
            <h1 className="font-black text-[22px] md:text-[26px] text-ink leading-tight tracking-tight">
              {titleUa}
            </h1>
            {subtitle && (
              <p className="font-medium text-[13px] text-ink-faint mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        {totalLessons > 0 && (
          <div className="mt-5 max-w-screen-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-black text-[11px] text-ink-faint uppercase tracking-[0.08em]">
                Прогрес
              </span>
              <span className="font-black text-[12px] text-ink-muted">
                {completedCount} / {totalLessons} · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Description */}
      {longParas.length > 0 && (
        <section className="px-5 md:px-10 py-6 border-b border-border">
          <p className="font-black mb-3 text-[11px] text-ink-faint uppercase tracking-[0.09em]">
            Про курс
          </p>
          <div className="flex flex-col gap-3 max-w-[680px]">
            {longParas.map((p, i) => (
              <p key={i} className="font-medium text-[14.5px] text-ink leading-[1.7]">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Vocabulary attached to this course */}
      {vocabSets && course ? (
        (() => {
          const courseSets = vocabSets.filter((s) => s.courseSlug === course.slug);
          if (courseSets.length === 0) return null;
          const anchor = courseSets.find((s) => !s.lessonSlug) ?? null;
          const lessonSets = courseSets.filter((s) => s.lessonSlug);
          return (
            <section className="px-5 md:px-10 py-6 border-b border-border">
              <p className="font-black mb-3 text-[11px] text-ink-faint uppercase tracking-[0.09em]">
                Словник курсу
              </p>
              <div className="flex flex-col gap-2 max-w-screen-md">
                {anchor && (
                  <Link
                    href={`/kids/vocab/${anchor.slug}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <span aria-hidden className="text-[24px]">{anchor.iconEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[14px] text-ink leading-snug truncate">
                        {anchor.titleUa}
                      </p>
                      <p className="font-medium text-[11.5px] text-ink-muted mt-0.5">
                        Ключові слова курсу · {anchor.words.length} слів
                      </p>
                    </div>
                    <span aria-hidden className="text-ink-faint font-black">›</span>
                  </Link>
                )}
                {lessonSets.length > 0 && (
                  <details className="group rounded-2xl border border-border bg-surface-raised">
                    <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none">
                      <span className="font-black text-[12.5px] text-ink flex-1">
                        Слова за уроками ({lessonSets.length})
                      </span>
                      <span aria-hidden className="text-ink-faint font-black transition-transform group-open:rotate-90">›</span>
                    </summary>
                    <div className="px-2 pb-2 flex flex-col gap-1.5">
                      {lessonSets.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/kids/vocab/${s.slug}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-muted transition-colors"
                        >
                          <span aria-hidden className="text-[18px]">{s.iconEmoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[13px] text-ink truncate">{s.titleUa}</p>
                            <p className="font-medium text-[11px] text-ink-faint">{s.words.length} слів</p>
                          </div>
                          <span aria-hidden className="text-ink-faint">›</span>
                        </Link>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </section>
          );
        })()
      ) : null}

      {/* Lessons list */}
      <section className="px-5 md:px-10 py-6 flex-1">
        <p className="font-black mb-3 text-[11px] text-ink-faint uppercase tracking-[0.09em]">
          Уроки
        </p>
        {totalLessons === 0 ? (
          <EmptyState
            title="Уроки скоро зʼявляться"
            description="Цей курс ще наповнюється — слідкуй за оновленнями."
          />
        ) : (
          <div className="flex flex-col gap-5 max-w-screen-md">
            {groups.map((g) => (
              <div key={g.slug}>
                {g.title && (
                  <p className="font-bold text-[12px] text-ink-muted mb-2 px-1">
                    {g.title}
                  </p>
                )}
                <ol className="rounded-2xl border border-border bg-surface-raised overflow-hidden divide-y divide-border">
                  {g.rows.map((row, idx) => (
                    <LessonListItem
                      key={row.lesson.documentId}
                      row={row}
                      index={idx}
                      courseSlug={course.slug}
                      isLocked={isLocked}
                    />
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sticky CTA */}
      {totalLessons > 0 && (
        <div className="sticky bottom-0 inset-x-0 px-5 md:px-10 py-3 border-t border-border bg-surface-raised pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
          {isLocked ? (
            <div className="inline-flex items-center gap-2 rounded-xl px-4 py-3 bg-surface-muted border border-border">
              <span aria-hidden>🔒</span>
              <span className="font-black text-[13px] text-ink-faint">
                Потрібен рівень {courseLevel}
              </span>
            </div>
          ) : isComplete ? (
            <Link
              href={`/courses/${course.slug}/lessons/${lessonRows[0]?.lesson.slug ?? ''}`}
              className="inline-flex items-center justify-center w-full max-w-screen-md rounded-2xl bg-primary text-white font-black text-[15px] h-12 shadow-card-sm active:scale-[0.99] transition-transform"
            >
              Повторити перший урок
            </Link>
          ) : nextRow ? (
            <Link
              href={`/courses/${course.slug}/lessons/${nextRow.lesson.slug}`}
              className="inline-flex items-center justify-center gap-2 w-full max-w-screen-md rounded-2xl bg-primary text-white font-black text-[15px] h-12 shadow-card-sm active:scale-[0.99] transition-transform"
            >
              {completedCount > 0 ? 'Продовжити' : 'Почати курс'}
              <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border bg-surface-raised pt-[max(12px,env(safe-area-inset-top))]">
      <button
        onClick={onBack}
        aria-label="Назад"
        className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 bg-surface-muted text-ink active:scale-90 transition-transform"
      >
        ←
      </button>
      <p className="font-black text-[14.5px] text-ink truncate">{title}</p>
    </div>
  );
}

function LessonListItem({
  row,
  index,
  courseSlug,
  isLocked,
}: {
  row: LessonRow;
  index: number;
  courseSlug: string;
  isLocked: boolean;
}) {
  const { lesson, status } = row;
  const emoji = TYPE_EMOJI[lesson.type] ?? '📘';
  const typeLabel = TYPE_LABEL[lesson.type] ?? 'Урок';
  const disabled = isLocked;
  const href = disabled ? '#' : `/courses/${courseSlug}/lessons/${lesson.slug}`;

  const dotClass =
    status === 'done'
      ? 'bg-success text-white'
      : status === 'current'
        ? 'bg-primary text-white ring-4 ring-primary/15'
        : 'bg-surface-muted text-ink-faint';

  return (
    <li>
      <Link
        href={href}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
        className={[
          'flex items-center gap-3 px-4 py-3.5 transition-colors',
          disabled ? 'opacity-55 cursor-not-allowed' : 'hover:bg-surface-muted active:bg-surface-muted',
        ].join(' ')}
      >
        <span
          aria-hidden
          className={[
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] transition-colors',
            dotClass,
          ].join(' ')}
        >
          {status === 'done' ? '✓' : index + 1}
        </span>
        <span aria-hidden className="flex-shrink-0 text-[20px]">
          {emoji}
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
          <p className="font-medium text-[11.5px] text-ink-faint mt-0.5">
            {typeLabel}
            {lesson.durationMin ? ` · ${lesson.durationMin} хв` : ''}
            {status === 'current' ? ' · Поточний' : ''}
          </p>
        </div>
        {!disabled && (
          <span aria-hidden className="text-ink-faint font-black text-[16px]">
            ›
          </span>
        )}
      </Link>
    </li>
  );
}
