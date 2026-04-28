'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LESSON_SOURCE_LABELS } from '@/lib/ui/teacher-labels';
import type { LibraryLesson, LessonSource, Level } from '@/lib/types/teacher';
import { fetchLessonsCached, peekLessons } from '@/lib/teacher-library';
import {
  FilterChips,
  LevelBadge,
  SegmentedControl,
  type FilterChipOption,
  type SegmentedControlOption,
} from '@/components/teacher/ui';
import { CreateHomeworkModal } from '@/components/teacher/CreateHomeworkModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

const SOURCE_OPTIONS: ReadonlyArray<FilterChipOption<LessonSource | 'all'>> = [
  { value: 'all',      label: 'Усе' },
  { value: 'platform', label: 'Платформа' },
  { value: 'copy',     label: 'Мої копії' },
  { value: 'own',      label: 'Власні' },
  { value: 'template', label: 'Шаблони' },
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

const VIEW_OPTIONS: ReadonlyArray<SegmentedControlOption<'grid' | 'list'>> = [
  { value: 'grid', label: 'Картки', icon: <GridIcon /> },
  { value: 'list', label: 'Список', icon: <ListIcon /> },
];

interface LessonsTabProps {
  query: string;
  onCount?: (n: number) => void;
}

export function LessonsTab({ query, onCount }: LessonsTabProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [source, setSource] = useState<LessonSource | 'all'>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [assignFor, setAssignFor] = useState<LibraryLesson | null>(null);

  const cachedLessons = peekLessons();
  const [lessons, setLessons] = useState<LibraryLesson[]>(cachedLessons ?? []);
  const [loading, setLoading] = useState(cachedLessons === null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await fetchLessonsCached();
        if (!alive) return;
        setLessons(rows);
        onCount?.(rows.length);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [onCount]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((l) => {
      if (source !== 'all' && l.source !== source) return false;
      if (level !== 'all' && l.level !== level) return false;
      if (q === '') return true;
      const haystack = [l.title, l.topic, ...(l.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [lessons, source, level, query]);

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <FilterChips value={source} onChange={setSource} options={SOURCE_OPTIONS} />
          <FilterChips value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
        </div>
        <SegmentedControl
          value={view}
          onChange={setView}
          options={VIEW_OPTIONS}
          label="Режим перегляду"
        />
      </div>

      {loading ? (
        <LoadingState shape={view === 'list' ? 'table' : 'card'} rows={4} />
      ) : error ? (
        <ErrorState description={error} onRetry={() => location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={lessons.length === 0 ? 'Бібліотека порожня' : 'Нічого не знайдено'}
          description={
            lessons.length === 0 ? 'Створіть перший урок' : 'Спробуй інший фільтр або запит'
          }
        />
      ) : view === 'grid' ? (
        <GridView lessons={filtered} onAssign={setAssignFor} />
      ) : (
        <ListView lessons={filtered} onAssign={setAssignFor} />
      )}

      <CreateHomeworkModal
        open={assignFor !== null}
        onClose={() => setAssignFor(null)}
        defaultLessonId={assignFor?.id}
        defaultTitle={assignFor ? `${assignFor.title} — ДЗ` : undefined}
        onCreated={(hw) => flashToast(`ДЗ опубліковано: ${hw.title}`)}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
          {toast}
        </div>
      )}
    </div>
  );
}

interface RowProps {
  lessons: LibraryLesson[];
  onAssign: (l: LibraryLesson) => void;
}

function GridView({ lessons, onAssign }: RowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} onAssign={onAssign} />
      ))}
    </div>
  );
}

function ListView({ lessons, onAssign }: RowProps) {
  return (
    <Card variant="surface" padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Урок</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Рівень</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Тип</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Оновлено</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="border-t border-border hover:bg-surface-muted/40 transition-colors">
                <td className="px-5 py-3 min-w-0">
                  <Link
                    href={`/dashboard/teacher-library/${lesson.id}/edit`}
                    className="text-[13px] font-semibold text-ink hover:underline underline-offset-2"
                  >
                    {lesson.title}
                  </Link>
                  <p className="text-[11px] text-ink-muted tabular-nums">
                    {lesson.topic} · {lesson.durationMin} хв · {lesson.blocksCount} блоків
                  </p>
                </td>
                <td className="px-4 py-3">
                  <LevelBadge level={lesson.level} />
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="ios-chip">{LESSON_SOURCE_LABELS[lesson.source]}</span>
                    {isOwnedLesson(lesson) && !lesson.published && (
                      <span className="ios-chip bg-surface-muted text-ink-muted">Чернетка</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-ink-muted whitespace-nowrap tabular-nums">
                  {lesson.updatedAt}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <LessonRowActions lesson={lesson} onAssign={onAssign} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function LessonCard({
  lesson,
  onAssign,
}: {
  lesson: LibraryLesson;
  onAssign: (l: LibraryLesson) => void;
}) {
  return (
    <Card variant="surface" padding="sm" className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        <LevelBadge level={lesson.level} />
        <span className="ios-chip">{LESSON_SOURCE_LABELS[lesson.source]}</span>
        {isOwnedLesson(lesson) && !lesson.published && (
          <span className="ios-chip bg-surface-muted text-ink-muted">Чернетка</span>
        )}
      </div>

      <div className="min-w-0">
        <Link
          href={`/dashboard/teacher-library/${lesson.id}/edit`}
          className="text-[14px] font-semibold text-ink leading-snug hover:underline underline-offset-2 line-clamp-2"
        >
          {lesson.title}
        </Link>
        <p className="text-[12px] text-ink-muted mt-1 truncate">{lesson.topic}</p>
      </div>

      {lesson.hasUpdateFromOriginal && (
        <p className="text-[11px] font-semibold text-ink bg-surface-muted rounded-md px-2 py-1 border border-border">
          Оригінальний урок оновлено
        </p>
      )}

      <div className="flex items-center gap-3 text-[11px] text-ink-muted tabular-nums">
        <span>{lesson.durationMin} хв</span>
        <span className="w-px h-3 bg-border" />
        <span>{lesson.blocksCount} блоків</span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
        <span className="text-[11px] text-ink-faint tabular-nums">{lesson.updatedAt}</span>
        <LessonRowActions lesson={lesson} onAssign={onAssign} />
      </div>
    </Card>
  );
}

function isOwnedLesson(lesson: LibraryLesson): boolean {
  return lesson.source === 'own' || lesson.source === 'copy';
}

function LessonRowActions({
  lesson,
  onAssign,
}: {
  lesson: LibraryLesson;
  onAssign: (l: LibraryLesson) => void;
}) {
  return (
    <Button size="sm" onClick={() => onAssign(lesson)}>
      Призначити
    </Button>
  );
}

function GridIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
