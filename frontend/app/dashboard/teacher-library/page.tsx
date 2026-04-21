'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  MOCK_LIBRARY,
  LESSON_SOURCE_LABELS,
  type LibraryLesson,
  type LessonSource,
  type Level,
} from '@/lib/teacher-mocks';
import {
  EmptyState,
  FilterChips,
  LevelBadge,
  PageHeader,
  SearchInput,
  SegmentedControl,
  type FilterChipOption,
  type SegmentedControlOption,
} from '@/components/teacher/ui';
import { AssignLessonModal } from '@/components/teacher/AssignLessonModal';

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
];

const VIEW_OPTIONS: ReadonlyArray<SegmentedControlOption<'grid' | 'list'>> = [
  { value: 'grid', label: 'Картки', icon: <GridIcon /> },
  { value: 'list', label: 'Список', icon: <ListIcon /> },
];

export default function TeacherLibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [source, setSource] = useState<LessonSource | 'all'>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [query, setQuery] = useState('');
  const [assignFor, setAssignFor] = useState<LibraryLesson | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_LIBRARY.filter(l => {
      if (source !== 'all' && l.source !== source) return false;
      if (level !== 'all' && l.level !== level) return false;
      if (q === '') return true;
      const haystack = [l.title, l.topic, ...(l.tags ?? [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [source, level, query]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Бібліотека уроків"
        subtitle={`${MOCK_LIBRARY.length} уроків · ${filtered.length} після фільтрів`}
        action={
          <Link href="/dashboard/teacher-library/new/edit" className="ios-btn ios-btn-primary">
            + Урок
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Пошук за назвою, темою, тегом…"
            containerClassName="w-full sm:w-80"
          />
          <SegmentedControl value={view} onChange={setView} options={VIEW_OPTIONS} label="Режим перегляду" />
        </div>
        <FilterChips value={source} onChange={setSource} options={SOURCE_OPTIONS} />
        <FilterChips value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Нічого не знайдено" subtitle="Спробуй інший фільтр або запит" />
      ) : view === 'grid' ? (
        <GridView lessons={filtered} onAssign={setAssignFor} />
      ) : (
        <ListView lessons={filtered} onAssign={setAssignFor} />
      )}

      <AssignLessonModal
        open={assignFor !== null}
        onClose={() => setAssignFor(null)}
        lesson={assignFor}
      />
    </div>
  );
}

function GridView({ lessons, onAssign }: { lessons: LibraryLesson[]; onAssign: (l: LibraryLesson) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {lessons.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} onAssign={onAssign} />
      ))}
    </div>
  );
}

function ListView({ lessons, onAssign }: { lessons: LibraryLesson[]; onAssign: (l: LibraryLesson) => void }) {
  return (
    <div className="ios-card overflow-hidden">
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
            {lessons.map(lesson => (
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
                  <span className="ios-chip">{LESSON_SOURCE_LABELS[lesson.source]}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-ink-muted whitespace-nowrap tabular-nums">{lesson.updatedAt}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <LessonRowActions lesson={lesson} onAssign={onAssign} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LessonCard({ lesson, onAssign }: { lesson: LibraryLesson; onAssign: (l: LibraryLesson) => void }) {
  return (
    <article className="ios-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <LevelBadge level={lesson.level} />
        <span className="ios-chip">{LESSON_SOURCE_LABELS[lesson.source]}</span>
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
    </article>
  );
}

function LessonRowActions({ lesson, onAssign }: { lesson: LibraryLesson; onAssign: (l: LibraryLesson) => void }) {
  const isPlatform = lesson.source === 'platform';
  return (
    <div className="inline-flex items-center gap-1.5">
      {isPlatform && (
        <button type="button" className="ios-btn ios-btn-sm ios-btn-secondary" title="Копіювати в мою бібліотеку">
          Копія
        </button>
      )}
      <button type="button" onClick={() => onAssign(lesson)} className="ios-btn ios-btn-sm ios-btn-primary">
        Призначити
      </button>
    </div>
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
