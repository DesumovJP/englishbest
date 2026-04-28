'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChips, type FilterChipOption } from '@/components/teacher/ui';
import {
  fetchTeacherCourses,
  type CourseSummary,
} from '@/lib/teacher-courses';

type ReviewStatusFilter = 'all' | 'draft' | 'submitted' | 'approved' | 'rejected';

const STATUS_OPTIONS: ReadonlyArray<FilterChipOption<ReviewStatusFilter>> = [
  { value: 'all',       label: 'Усі' },
  { value: 'draft',     label: 'Чернетки' },
  { value: 'submitted', label: 'На розгляді' },
  { value: 'approved',  label: 'Затверджено' },
  { value: 'rejected',  label: 'Відхилено' },
];

interface CoursesTabProps {
  query: string;
  onCount?: (n: number) => void;
}

export function CoursesTab({ query, onCount }: CoursesTabProps) {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ReviewStatusFilter>('all');

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

  const filtered = useMemo(() => {
    if (!courses) return [];
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (status !== 'all' && c.reviewStatus !== status) return false;
      if (q === '') return true;
      return [c.title, c.titleUa ?? '', c.level ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [courses, status, query]);

  if (error) return <ErrorState description={error} onRetry={() => location.reload()} />;
  if (!courses) return <LoadingState shape="list" rows={4} />;

  return (
    <div className="flex flex-col gap-3">
      <FilterChips value={status} onChange={setStatus} options={STATUS_OPTIONS} />

      {filtered.length === 0 ? (
        <EmptyState
          title={courses.length === 0 ? 'Курсів поки немає' : 'Нічого не знайдено'}
          description={
            courses.length === 0
              ? 'Натисни «+ Курс» зверху, щоб створити перший — далі юніти та прив’язки уроків редагуватимуться у редакторі курсу.'
              : 'Спробуй інший фільтр або запит'
          }
        />
      ) : (
        <CourseList rows={filtered} />
      )}
    </div>
  );
}

function CourseList({ rows }: { rows: CourseSummary[] }) {
  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <ul className="ios-list">
        {rows.map((c, i) => (
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
              <ReviewStatusChip status={c.reviewStatus} />
              {!c.published && (
                <span className="ios-chip bg-surface-muted text-ink-muted">Не опубл.</span>
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
  );
}

function ReviewStatusChip({ status }: { status: CourseSummary['reviewStatus'] }) {
  if (!status || status === 'approved') return null;
  const tone =
    status === 'submitted' ? 'bg-warning/15 text-warning-dark'
    : status === 'rejected' ? 'bg-danger/10 text-danger-dark'
    : 'bg-surface-muted text-ink-muted';
  const label =
    status === 'submitted' ? 'На розгляді'
    : status === 'rejected' ? 'Відхилено'
    : 'Чернетка';
  return <span className={`ios-chip ${tone}`}>{label}</span>;
}
