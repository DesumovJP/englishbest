/**
 * LessonTreeSection — list of courses at the learner's current level, each
 * with a compact progress bar and a deep-link into the next unfinished lesson.
 *
 * Data sources (all live):
 *   - `fetchCourses()` — filters to `kind=course` + audience for kids, then
 *     to the caller's current level.
 *   - `fetchLessonsByCourse()` — sorted by orderIndex; used to locate the
 *     "next" lesson per course.
 *   - `fetchMyProgress()` — server-scoped to caller; used to mark
 *     completed / in-progress lessons.
 *
 * Deliberately small scope: one row per course. A "tree with boss stages"
 * UI is not implemented because the data model does not (yet) carry the
 * metadata that would make it meaningful.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchCourses, fetchLessonsByCourse } from '@/lib/api';
import type { Course, Lesson, Level } from '@/lib/types';
import { fetchMyProgress, type UserProgressRow } from '@/lib/user-progress';
import { ProgressBar } from '@/components/kids/ui';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  level: Level;
}

interface CourseSummary {
  course: Course;
  totalLessons: number;
  completedLessons: number;
  nextLesson: Lesson | null;
}

export function LessonTreeSection({ level }: Props) {
  const [summaries, setSummaries] = useState<CourseSummary[] | null>(null);
  const [progress, setProgress] = useState<UserProgressRow[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
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
          c => c.level === level && (!c.audience || c.audience === 'kids' || c.audience === 'any'),
        );

        if (myCourses.length === 0) {
          setSummaries([]);
          setProgress(progressRows);
          setStatus('empty');
          return;
        }

        const completedSet = new Set(
          progressRows
            .filter(r => r.status === 'completed' && r.lesson?.documentId)
            .map(r => r.lesson!.documentId),
        );

        const summaryList = await Promise.all(
          myCourses.map(async (course): Promise<CourseSummary> => {
            const lessons = await fetchLessonsByCourse(course.slug);
            const sorted = [...lessons].sort(
              (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
            );
            const completedLessons = sorted.filter(l =>
              completedSet.has(l.documentId),
            ).length;
            const nextLesson =
              sorted.find(l => !completedSet.has(l.documentId)) ?? null;
            return {
              course,
              totalLessons: sorted.length,
              completedLessons,
              nextLesson,
            };
          }),
        );

        if (!alive) return;
        setSummaries(summaryList);
        setProgress(progressRows);
        setStatus('ready');
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

  const recentInProgress = useMemo(
    () =>
      progress
        .filter(r => r.status === 'inProgress' && r.lesson?.courseSlug)
        .slice(0, 4),
    [progress],
  );

  if (status === 'loading') {
    return <LoadingState shape="list" rows={4} />;
  }

  if (status === 'error') {
    return (
      <EmptyState
        title="Не вдалось завантажити уроки"
        description={errorMsg ?? 'Спробуй пізніше'}
      />
    );
  }

  if (status === 'empty' || !summaries || summaries.length === 0) {
    return (
      <EmptyState
        title="Немає курсів для твого рівня"
        description={`Курси для рівня ${level} зʼявляться незабаром. Поки можна перейти до «Бібліотеки» — там уже є матеріали.`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {recentInProgress.length > 0 && (
        <section>
          <p className="font-black uppercase tracking-widest text-[10px] text-ink-faint mb-2 px-1">
            Продовжити
          </p>
          <div className="flex flex-col gap-2">
            {recentInProgress.map(row => (
              <Link
                key={row.documentId}
                href={
                  row.lesson?.courseSlug && row.lesson?.slug
                    ? `/courses/${row.lesson.courseSlug}/lessons/${row.lesson.slug}`
                    : '/kids/school'
                }
                className="block rounded-xl border border-border bg-surface-raised p-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-[18px] flex-shrink-0"
                    aria-hidden
                  >
                    {row.course?.iconEmoji ?? '📘'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[13px] text-ink truncate">
                      {row.lesson?.title ?? 'Урок'}
                    </p>
                    <p className="font-medium text-[11px] text-ink-muted truncate">
                      {row.course?.title ?? 'Курс'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="font-black uppercase tracking-widest text-[10px] text-ink-faint mb-2 px-1">
          Мої курси — рівень {level}
        </p>
        <div className="flex flex-col gap-2">
          {summaries.map(s => {
            const pct = s.totalLessons > 0 ? s.completedLessons / s.totalLessons : 0;
            const isDone = s.totalLessons > 0 && s.completedLessons === s.totalLessons;
            const targetHref =
              s.nextLesson && s.course.slug
                ? `/courses/${s.course.slug}/lessons/${s.nextLesson.slug}`
                : `/kids/library/${s.course.slug}`;
            return (
              <Link
                key={s.course.documentId}
                href={targetHref}
                className="block rounded-2xl border-2 border-border bg-surface-raised p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-[24px] flex-shrink-0"
                    aria-hidden
                  >
                    {(s.course as any).iconEmoji ?? '🎓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-[14px] text-ink truncate flex-1 min-w-0">
                        {s.course.title}
                      </p>
                      {isDone && (
                        <span className="font-black text-[10px] px-1.5 py-0.5 rounded-md bg-success/15 text-success-dark flex-shrink-0">
                          ЗАВЕРШЕНО
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-[11.5px] text-ink-muted mb-2">
                      {s.totalLessons > 0
                        ? `${s.completedLessons} з ${s.totalLessons} уроків`
                        : 'Уроки ще не додані'}
                    </p>
                    {s.totalLessons > 0 && (
                      <ProgressBar
                        current={s.completedLessons}
                        total={s.totalLessons}
                        tone={isDone ? 'success' : 'primary'}
                        size="sm"
                        showCount={false}
                        label={`Прогрес курсу ${Math.round(pct * 100)}%`}
                      />
                    )}
                    {s.nextLesson && !isDone && (
                      <p className="font-black text-[11px] text-primary mt-2 truncate">
                        Далі: {s.nextLesson.title} →
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
