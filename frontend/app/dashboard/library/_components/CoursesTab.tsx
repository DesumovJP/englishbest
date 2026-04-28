'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateCourseModal } from '@/components/teacher/CreateCourseModal';
import {
  fetchTeacherCourses,
  type CourseSummary,
} from '@/lib/teacher-courses';

interface CoursesTabProps {
  query: string;
  onCount?: (n: number) => void;
}

export function CoursesTab({ query, onCount }: CoursesTabProps) {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchTeacherCourses()
      .then((rows) => {
        if (!alive) return;
        setCourses(rows);
        onCount?.(rows.length);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, [onCount]);

  const q = query.trim().toLowerCase();
  const filtered = courses
    ? q
      ? courses.filter((c) =>
          [c.title, c.titleUa ?? '', c.level ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q),
        )
      : courses
    : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)}>+ Курс</Button>
      </div>

      {error ? (
        <ErrorState description={error} onRetry={() => location.reload()} />
      ) : !courses ? (
        <LoadingState shape="list" rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={courses.length === 0 ? 'Курсів поки немає' : 'Нічого не знайдено'}
          description={
            courses.length === 0
              ? 'Створи перший курс — далі юніти та прив’язки уроків редагуватимуться тут.'
              : 'Спробуй інший пошуковий запит'
          }
          action={
            courses.length === 0 ? (
              <Button onClick={() => setCreateOpen(true)}>+ Курс</Button>
            ) : undefined
          }
        />
      ) : (
        <Card variant="surface" padding="none" className="overflow-hidden">
          <ul className="ios-list">
            {filtered.map((c, i) => (
              <li key={c.documentId} className={i > 0 ? 'border-t border-border' : ''}>
                <Link
                  href={`/dashboard/courses/${c.documentId}/edit`}
                  className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-hover"
                >
                  <span aria-hidden className="text-[22px] flex-shrink-0">
                    {c.iconEmoji ?? '🎓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[14px] text-ink leading-tight truncate">
                      {c.titleUa || c.title}
                    </p>
                    <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                      {c.level ?? '—'} · {c.lessonCount} уроків · {c.vocabSetCount} словників
                    </p>
                  </div>
                  {!c.published && (
                    <span className="ios-chip bg-surface-muted text-ink-muted">
                      Чернетка
                    </span>
                  )}
                  {c.status !== 'available' && <span className="ios-chip">{c.status}</span>}
                  <span aria-hidden className="text-ink-faint font-black text-base flex-shrink-0">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <CreateCourseModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
