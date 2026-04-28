'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FilterChips,
  LevelBadge,
  type FilterChipOption,
} from '@/components/teacher/ui';
import { CoverThumbnail } from '@/components/teacher/CoverThumbnail';
import {
  fetchAllVocabSets,
  type VocabSetSummary,
} from '@/lib/teacher-vocabulary';
import type { Level } from '@/lib/types/teacher';

type Scope = 'all' | 'course' | 'lesson' | 'standalone';
type ReviewStatusFilter = 'all' | 'draft' | 'submitted' | 'approved' | 'rejected';

const STATUS_OPTIONS: ReadonlyArray<FilterChipOption<ReviewStatusFilter>> = [
  { value: 'all',       label: 'Усі' },
  { value: 'draft',     label: 'Чернетки' },
  { value: 'submitted', label: 'На розгляді' },
  { value: 'approved',  label: 'Затверджено' },
  { value: 'rejected',  label: 'Відхилено' },
];

const SCOPE_OPTIONS: ReadonlyArray<FilterChipOption<Scope>> = [
  { value: 'all',        label: 'Усе' },
  { value: 'course',     label: 'У курсі' },
  { value: 'lesson',     label: 'В уроці' },
  { value: 'standalone', label: 'Без прив’язки' },
];

const LEVEL_OPTIONS: ReadonlyArray<FilterChipOption<Level | 'all'>> = [
  { value: 'all', label: 'Всі рівні' },
  { value: 'A0',  label: 'A0' },
  { value: 'A1',  label: 'A1' },
  { value: 'A2',  label: 'A2' },
  { value: 'B1',  label: 'B1' },
  { value: 'B2',  label: 'B2' },
  { value: 'C1',  label: 'C1' },
  { value: 'C2',  label: 'C2' },
];

interface VocabularyTabProps {
  query: string;
  onCount?: (n: number) => void;
}

export function VocabularyTab({ query, onCount }: VocabularyTabProps) {
  const [status, setStatus] = useState<ReviewStatusFilter>('all');
  const [scope, setScope] = useState<Scope>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [sets, setSets] = useState<VocabSetSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAllVocabSets()
      .then((rows) => {
        if (!alive) return;
        setSets(rows);
        onCount?.(rows.length);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, [onCount]);

  function handleAssign(s: VocabSetSummary) {
    setToast(`Призначення словника «${s.titleUa || s.title}» — у розробці`);
    window.setTimeout(() => setToast(null), 2200);
  }

  const filtered = useMemo(() => {
    if (!sets) return [];
    const q = query.trim().toLowerCase();
    return sets.filter((s) => {
      if (status !== 'all' && s.reviewStatus !== status) return false;
      if (level !== 'all' && s.level !== level) return false;
      if (scope === 'course'     && !(s.courseDocumentId && !s.lessonDocumentId)) return false;
      if (scope === 'lesson'     && !s.lessonDocumentId) return false;
      if (scope === 'standalone' && (s.courseDocumentId || s.lessonDocumentId)) return false;
      if (q && !`${s.title} ${s.titleUa ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sets, query, status, scope, level]);

  if (error) return <ErrorState description={error} onRetry={() => location.reload()} />;
  if (!sets)  return <LoadingState shape="card" rows={4} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <FilterChips value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <FilterChips value={scope} onChange={setScope} options={SCOPE_OPTIONS} />
        <FilterChips value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={sets.length === 0 ? 'Словників поки немає' : 'Нічого не знайдено'}
          description={
            sets.length === 0
              ? 'Створи перший словник з редактора уроку — він прикріпиться автоматично.'
              : 'Спробуй інший фільтр або запит'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <VocabSetCard key={s.documentId} set={s} onAssign={handleAssign} />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
          {toast}
        </div>
      )}
    </div>
  );
}

function VocabSetCard({ set, onAssign }: { set: VocabSetSummary; onAssign: (s: VocabSetSummary) => void }) {
  return (
    <Card variant="surface" padding="none" className="flex flex-col overflow-hidden">
      <Link
        href={`/dashboard/vocabulary/${set.documentId}/edit`}
        aria-label={set.titleUa || set.title}
        className="block"
      >
        <CoverThumbnail
          url={set.coverImageUrl}
          emoji={set.iconEmoji ?? '📚'}
          alt={set.titleUa || set.title}
          aspect="video"
          size="md"
          className="rounded-none"
        />
      </Link>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {set.level && <LevelBadge level={set.level} />}
          <ScopeBadge set={set} />
        </div>

        <Link
          href={`/dashboard/vocabulary/${set.documentId}/edit`}
          className="min-w-0 group"
        >
          <p className="text-[14px] font-semibold text-ink leading-snug line-clamp-2 group-hover:underline underline-offset-2">
            {set.titleUa || set.title}
          </p>
          {set.titleUa && set.titleUa !== set.title && (
            <p className="text-[12px] text-ink-muted mt-0.5 truncate">{set.title}</p>
          )}
        </Link>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <span className="text-[11px] text-ink-faint tabular-nums">{set.wordCount} слів</span>
          <Button size="sm" onClick={() => onAssign(set)}>
            Призначити
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ScopeBadge({ set }: { set: VocabSetSummary }) {
  if (set.lessonDocumentId) {
    return (
      <Link
        href={`/dashboard/teacher-library/${set.lessonDocumentId}/edit`}
        className="ios-chip hover:bg-surface-hover"
        title="До уроку"
      >
        В уроці
      </Link>
    );
  }
  if (set.courseDocumentId) {
    return (
      <Link
        href={`/dashboard/courses/${set.courseDocumentId}/edit`}
        className="ios-chip hover:bg-surface-hover"
        title="До курсу"
      >
        У курсі
      </Link>
    );
  }
  return <span className="ios-chip bg-surface-muted text-ink-muted">Без прив’язки</span>;
}
