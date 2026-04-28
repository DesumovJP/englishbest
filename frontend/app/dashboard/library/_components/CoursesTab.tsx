'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
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

  if (error) return <ErrorState description={error} onRetry={() => location.reload()} />;
  if (!courses) return <LoadingState shape="list" rows={4} />;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? courses.filter((c) =>
        [c.title, c.titleUa ?? '', c.level ?? '', c.audience ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    : courses;

  if (filtered.length === 0) {
    return (
      <EmptyState
        title={courses.length === 0 ? 'Курсів поки немає' : 'Нічого не знайдено'}
        description={
          courses.length === 0
            ? 'Створи перший у Strapi admin — далі юніти і словник редагуватимуться тут.'
            : 'Спробуй інший пошуковий запит'
        }
      />
    );
  }

  return (
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
                  {c.level ?? '—'} · {c.audience ?? 'будь-яка аудиторія'} ·{' '}
                  {c.lessonCount} уроків · {c.vocabSetCount} словників
                </p>
              </div>
              {c.status !== 'available' && <span className="ios-chip">{c.status}</span>}
              <span aria-hidden className="text-ink-faint font-black text-base flex-shrink-0">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
