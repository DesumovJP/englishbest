/**
 * Kids course detail.
 *
 * iOS-Notion layout: compact hero (thumbnail + title/chips), combined
 * progress + primary CTA, optional vocabulary cross-link, then a single
 * grouped lessons list. No banner, no shadow stack — surface is white,
 * separators are hairlines.
 *
 * Data is live (courses + lessons + own progress + vocabulary), all
 * SWR-cached. Archived items filtered server-side.
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
import type { Course, Lesson } from '@/lib/types';
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

// Ukrainian plural form picker — n=1 урок, n=2-4 уроки, else уроків.
function pluralUk(n: number, forms: readonly [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

const LESSON_FORMS = ['урок', 'уроки', 'уроків'] as const;

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
  const orphans = rows.filter((r) => !used.has(r.lesson.slug));
  if (orphans.length > 0) {
    groups.push({ slug: '__orphans', title: 'Інше', rows: orphans });
  }
  return groups.filter((g) => g.rows.length > 0);
}

const PAGE_BOTTOM_PAD = 'pb-[calc(env(safe-area-inset-bottom,0px)+96px)]';

const SECTION_LABEL_CLS =
  'font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted';

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
      <div className={`min-h-[100dvh] bg-surface-raised ${PAGE_BOTTOM_PAD}`}>
        <Header onBack={() => router.back()} title="Курс" />
        <div className="max-w-screen-md mx-auto w-full px-4 py-10">
          <LoadingState shape="card" rows={1} />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-[100dvh] bg-surface-raised ${PAGE_BOTTOM_PAD}`}>
        <Header onBack={() => router.back()} title="Курс" />
        <div className="max-w-screen-md mx-auto w-full px-4 py-10">
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
  const accent = (course as { iconColor?: string }).iconColor ?? '#22C55E';
  const titleUa = course.titleUa ?? course.title;
  const subtitle = course.subtitle ?? '';

  return (
    <div className={`flex flex-col min-h-[100dvh] bg-surface-raised ${PAGE_BOTTOM_PAD}`}>
      <Header onBack={() => router.push('/kids/school')} title={course.title} />

      {/* HERO — compact, mirrors Vocab-detail */}
      <section className="px-4 md:px-6 py-5">
        <div className="max-w-screen-md mx-auto w-full flex gap-4 md:gap-5 items-start">
          {course.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.coverImageUrl}
              alt=""
              aria-hidden
              className="flex-shrink-0 rounded-xl object-cover w-16 h-[88px] md:w-[88px] md:h-[120px] shadow-card"
            />
          ) : (
            <div
              aria-hidden
              className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center w-16 h-[88px] md:w-[88px] md:h-[120px] text-[36px] md:text-[44px] shadow-card"
              style={{
                background: `linear-gradient(160deg, ${accent} 0%, ${accent}99 100%)`,
              }}
            >
              {heroIcon}
            </div>
          )}

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="ios-chip">{courseLevel}</span>
              {course.audience && (
                <span className="ios-chip capitalize">
                  {course.audience === 'kids' ? 'Діти' : course.audience}
                </span>
              )}
              {totalLessons > 0 && (
                <span className="ios-chip tabular-nums">
                  {totalLessons} {pluralUk(totalLessons, LESSON_FORMS)}
                </span>
              )}
            </div>

            <div>
              <h1 className="font-black text-[20px] md:text-[24px] leading-tight tracking-tight text-ink">
                {titleUa}
              </h1>
              {subtitle && (
                <p className="font-medium text-[13px] md:text-sm text-ink-faint mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress + CTA — single composition */}
        {totalLessons > 0 && (
          <div className="max-w-screen-md mx-auto w-full mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className={SECTION_LABEL_CLS}>Прогрес</span>
              <span className="font-bold text-[12px] text-ink-muted tabular-nums">
                {completedCount}/{totalLessons} · {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-sunk overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="mt-4">
              {isLocked ? (
                <div className="inline-flex items-center gap-2 rounded-xl px-4 py-3 bg-surface-muted border border-border">
                  <span aria-hidden>🔒</span>
                  <span className="font-bold text-[13px] text-ink-faint">
                    Потрібен рівень {courseLevel}
                  </span>
                </div>
              ) : isComplete ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${lessonRows[0]?.lesson.slug ?? ''}`}
                  className="inline-flex items-center justify-center w-full rounded-xl bg-primary text-white font-black text-[15px] h-12 hover:bg-primary-dark active:scale-[0.99] transition-all"
                >
                  Повторити перший урок
                </Link>
              ) : nextRow ? (
                <Link
                  href={`/courses/${course.slug}/lessons/${nextRow.lesson.slug}`}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-white font-black text-[15px] h-12 hover:bg-primary-dark active:scale-[0.99] transition-all"
                >
                  {completedCount > 0 ? 'Продовжити' : 'Почати курс'}
                  <span aria-hidden>→</span>
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <div className="ios-divider" />

      {/* Description */}
      {longParas.length > 0 && (
        <>
          <section className="px-4 md:px-6 py-5">
            <div className="max-w-screen-md mx-auto w-full">
              <p className={`${SECTION_LABEL_CLS} mb-2 px-1`}>Про курс</p>
              <div className="flex flex-col gap-3">
                {longParas.map((p, i) => (
                  <p key={i} className="font-medium text-[14.5px] text-ink leading-[1.7]">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
          <div className="ios-divider" />
        </>
      )}

      {/* Vocabulary attached to this course */}
      {vocabSets ? (
        (() => {
          const courseSets = vocabSets.filter((s) => s.courseSlug === course.slug);
          if (courseSets.length === 0) return null;
          const anchor = courseSets.find((s) => !s.lessonSlug) ?? null;
          const lessonSets = courseSets.filter((s) => s.lessonSlug);
          return (
            <>
              <section className="px-4 md:px-6 py-5">
                <div className="max-w-screen-md mx-auto w-full">
                  <p className={`${SECTION_LABEL_CLS} mb-2 px-1`}>Словник курсу</p>
                  <div className="ios-list">
                    {anchor && (
                      <Link
                        href={`/kids/vocab/${anchor.slug}`}
                        className="flex items-center gap-3 min-h-11 px-4 py-3 transition-colors hover:bg-surface-hover"
                      >
                        <span aria-hidden className="text-[22px] flex-shrink-0">
                          {anchor.iconEmoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[14px] text-ink leading-tight truncate">
                            {anchor.titleUa}
                          </p>
                          <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                            Ключові слова курсу · {anchor.words.length} слів
                          </p>
                        </div>
                        <span aria-hidden className="text-ink-faint text-base font-black flex-shrink-0">
                          ›
                        </span>
                      </Link>
                    )}
                    {lessonSets.length > 0 && (
                      <details className="group border-t border-border first:border-t-0">
                        <summary className="flex items-center gap-2 min-h-11 px-4 py-3 cursor-pointer select-none list-none transition-colors hover:bg-surface-hover">
                          <span className="font-bold text-[13px] text-ink flex-1">
                            Слова за уроками ({lessonSets.length})
                          </span>
                          <span aria-hidden className="text-ink-faint text-base font-black transition-transform group-open:rotate-90">
                            ›
                          </span>
                        </summary>
                        <div className="border-t border-border">
                          {lessonSets.map((s, i) => (
                            <Link
                              key={s.slug}
                              href={`/kids/vocab/${s.slug}`}
                              className={[
                                'flex items-center gap-3 min-h-11 px-4 py-2.5 transition-colors hover:bg-surface-hover',
                                i > 0 && 'border-t border-border',
                              ].filter(Boolean).join(' ')}
                            >
                              <span aria-hidden className="text-[18px] flex-shrink-0">
                                {s.iconEmoji}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[13px] text-ink truncate">{s.titleUa}</p>
                                <p className="font-medium text-[11px] text-ink-faint tabular-nums">
                                  {s.words.length} слів
                                </p>
                              </div>
                              <span aria-hidden className="text-ink-faint text-base flex-shrink-0">
                                ›
                              </span>
                            </Link>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </section>
              <div className="ios-divider" />
            </>
          );
        })()
      ) : null}

      {/* Lessons list */}
      <section className="px-4 md:px-6 py-5 flex-1">
        <div className="max-w-screen-md mx-auto w-full">
          <p className={`${SECTION_LABEL_CLS} mb-2 px-1`}>Уроки</p>
          {totalLessons === 0 ? (
            <EmptyState
              title="Уроки скоро зʼявляться"
              description="Цей курс ще наповнюється — слідкуй за оновленнями."
            />
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map((g) => (
                <div key={g.slug}>
                  {g.title && (
                    <p className="font-bold text-[12px] text-ink-muted mb-2 px-1">
                      {g.title}
                    </p>
                  )}
                  <ol className="ios-list">
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
        </div>
      </section>
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-surface-raised/95 backdrop-blur-md pt-[max(8px,env(safe-area-inset-top))]">
      <div className="max-w-screen-md mx-auto w-full flex items-center gap-3 px-4 md:px-6 py-3">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 bg-surface-muted text-ink active:scale-90 transition-transform hover:bg-surface-hover"
        >
          ←
        </button>
        <p className="font-black text-[14.5px] text-ink truncate">{title}</p>
      </div>
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
  const disabled = isLocked;
  const href = disabled ? '#' : `/courses/${courseSlug}/lessons/${lesson.slug}`;

  const dotClass =
    status === 'done'
      ? 'bg-success text-white'
      : status === 'current'
        ? 'bg-primary text-white'
        : 'bg-surface-muted text-ink-faint';

  return (
    <li className="border-t border-border first:border-t-0">
      <Link
        href={href}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
        className={[
          'flex items-center gap-3 min-h-11 px-4 py-3 transition-colors',
          disabled
            ? 'opacity-55 cursor-not-allowed'
            : 'hover:bg-surface-hover',
        ].join(' ')}
      >
        <span
          aria-hidden
          className={[
            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-[11.5px] transition-colors',
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
        {!disabled && (
          <span aria-hidden className="text-ink-faint font-black text-base flex-shrink-0">
            ›
          </span>
        )}
      </Link>
    </li>
  );
}
