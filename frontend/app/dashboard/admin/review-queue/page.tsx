/**
 * Admin · Черга затверджень.
 *
 * One screen, three tabs (Lessons / Courses / Vocabulary), each listing
 * the rows currently in `reviewStatus='submitted'` across the platform.
 * Click a row → opens its editor (admin sees Approve / Reject controls
 * inside the editor — the moderation hook from CONTENT_LIFECYCLE_PLAN
 * §6.2 lives there).
 *
 * Layout / components: `DashboardPageShell` for the page chrome,
 * inline tab nav (same pattern as `/dashboard/library`),
 * `Card` + `LoadingState` / `ErrorState` / `EmptyState` for rows.
 * No bespoke styles.
 */
'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { LevelBadge } from '@/components/teacher/ui';
import { fetchSubmittedLessons } from '@/lib/teacher-library';
import {
  fetchSubmittedCourses,
  type CourseSummary,
} from '@/lib/teacher-courses';
import {
  fetchSubmittedVocabSets,
  type VocabSetSummary,
} from '@/lib/teacher-vocabulary';
import type { LibraryLesson } from '@/lib/types/teacher';

type Tab = 'lessons' | 'courses' | 'vocabulary';

const TABS: ReadonlyArray<{ id: Tab; label: string; noun: string }> = [
  { id: 'lessons',    label: 'Уроки',    noun: 'уроків' },
  { id: 'courses',    label: 'Курси',    noun: 'курсів' },
  { id: 'vocabulary', label: 'Словник',  noun: 'словників' },
];

function isTab(v: string | null): v is Tab {
  return v === 'lessons' || v === 'courses' || v === 'vocabulary';
}

export default function AdminReviewQueuePage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const tab: Tab = isTab(sp.get('tab')) ? (sp.get('tab') as Tab) : 'lessons';

  const [counts, setCounts] = useState<Record<Tab, number | null>>({
    lessons: null,
    courses: null,
    vocabulary: null,
  });

  const setCountFor = useCallback(
    (id: Tab) => (n: number) =>
      setCounts((c) => (c[id] === n ? c : { ...c, [id]: n })),
    [],
  );

  function selectTab(t: Tab) {
    const next = new URLSearchParams(sp.toString());
    if (t === 'lessons') next.delete('tab');
    else next.set('tab', t);
    const qs = next.toString();
    router.replace(`/dashboard/admin/review-queue${qs ? `?${qs}` : ''}`);
  }

  const total =
    (counts.lessons ?? 0) + (counts.courses ?? 0) + (counts.vocabulary ?? 0);
  const subtitle =
    counts.lessons !== null && counts.courses !== null && counts.vocabulary !== null
      ? total === 0
        ? 'Все затверджено · черга порожня'
        : `${total} на розгляді`
      : 'Завантаження…';

  return (
    <DashboardPageShell
      title="Черга затверджень"
      subtitle={subtitle}
      toolbar={
        <nav role="tablist" className="flex items-center gap-0.5 border-b border-border -mx-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(t.id)}
                className={`flex items-baseline gap-1.5 px-3 py-2 text-[13px] font-semibold transition-colors -mb-px border-b-2 whitespace-nowrap ${
                  active
                    ? 'text-ink border-ink'
                    : 'text-ink-muted border-transparent hover:text-ink'
                }`}
              >
                <span>{t.label}</span>
                {counts[t.id] !== null && (
                  <span className="text-[11px] font-semibold text-ink-faint tabular-nums">
                    {counts[t.id]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      }
    >
      {tab === 'lessons'    && <LessonsQueue    onCount={setCountFor('lessons')}    />}
      {tab === 'courses'    && <CoursesQueue    onCount={setCountFor('courses')}    />}
      {tab === 'vocabulary' && <VocabularyQueue onCount={setCountFor('vocabulary')} />}
    </DashboardPageShell>
  );
}

// ─── Lessons queue ─────────────────────────────────────────────────────

function LessonsQueue({ onCount }: { onCount: (n: number) => void }) {
  const [rows, setRows] = useState<LibraryLesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSubmittedLessons()
      .then((r) => {
        if (!alive) return;
        setRows(r);
        onCount(r.length);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, [onCount]);

  if (error) return <ErrorState description={error} onRetry={() => location.reload()} />;
  if (!rows) return <LoadingState shape="list" rows={4} />;
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Уроків на розгляді немає"
        description="Як тільки вчитель подасть урок на затвердження — він з'явиться тут."
      />
    );
  }

  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <ul className="ios-list">
        {rows.map((l, i) => (
          <li key={l.id} className={i > 0 ? 'border-t border-border' : ''}>
            <Link
              href={`/dashboard/teacher-library/${l.id}/edit`}
              className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-hover"
            >
              <LevelBadge level={l.level} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-[14px] text-ink leading-tight truncate">
                  {l.title}
                </p>
                <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                  {l.topic || '—'} · {l.durationMin} хв · {l.blocksCount} блоків · оновлено {l.updatedAt}
                </p>
              </div>
              <span className="ios-chip bg-warning/15 text-warning-dark">На розгляді</span>
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

// ─── Courses queue ─────────────────────────────────────────────────────

function CoursesQueue({ onCount }: { onCount: (n: number) => void }) {
  const [rows, setRows] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSubmittedCourses()
      .then((r) => {
        if (!alive) return;
        setRows(r);
        onCount(r.length);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, [onCount]);

  if (error) return <ErrorState description={error} onRetry={() => location.reload()} />;
  if (!rows) return <LoadingState shape="list" rows={4} />;
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Курсів на розгляді немає"
        description="Подані курси з'являться тут."
      />
    );
  }

  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <ul className="ios-list">
        {rows.map((c, i) => (
          <li key={c.documentId} className={i > 0 ? 'border-t border-border' : ''}>
            <Link
              href={`/dashboard/courses/${c.documentId}/edit`}
              className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-hover"
            >
              <span aria-hidden className="text-[22px] flex-shrink-0">{c.iconEmoji ?? '🎓'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[14px] text-ink leading-tight truncate">
                  {c.titleUa || c.title}
                </p>
                <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                  {c.level ?? '—'} · {c.lessonCount} уроків · {c.vocabSetCount} словників
                </p>
              </div>
              <span className="ios-chip bg-warning/15 text-warning-dark">На розгляді</span>
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

// ─── Vocabulary queue ─────────────────────────────────────────────────

function VocabularyQueue({ onCount }: { onCount: (n: number) => void }) {
  const [rows, setRows] = useState<VocabSetSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSubmittedVocabSets()
      .then((r) => {
        if (!alive) return;
        setRows(r);
        onCount(r.length);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, [onCount]);

  if (error) return <ErrorState description={error} onRetry={() => location.reload()} />;
  if (!rows) return <LoadingState shape="list" rows={4} />;
  if (rows.length === 0) {
    return (
      <EmptyState
        title="Словників на розгляді немає"
        description="Подані словники з'являться тут."
      />
    );
  }

  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <ul className="ios-list">
        {rows.map((v, i) => (
          <li key={v.documentId} className={i > 0 ? 'border-t border-border' : ''}>
            <Link
              href={`/dashboard/vocabulary/${v.documentId}/edit`}
              className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-hover"
            >
              <span aria-hidden className="text-[22px] flex-shrink-0">{v.iconEmoji ?? '📚'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[14px] text-ink leading-tight truncate">
                  {v.titleUa || v.title}
                </p>
                <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                  {v.level ?? '—'} · {v.wordCount} слів
                </p>
              </div>
              <span className="ios-chip bg-warning/15 text-warning-dark">На розгляді</span>
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
