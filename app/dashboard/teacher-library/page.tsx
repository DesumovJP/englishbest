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

const SOURCE_BADGE: Record<LessonSource, string> = {
  platform: 'bg-secondary/10 text-secondary-dark',
  copy:     'bg-primary/10 text-primary-dark',
  own:      'bg-accent/15 text-accent-dark',
  template: 'bg-purple/10 text-purple-dark',
};

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
          <Link
            href="/dashboard/teacher-library/new/edit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity"
          >
            + Створити урок
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Пошук за назвою, темою, тегом..."
            containerClassName="w-full sm:w-80"
          />
          <SegmentedControl value={view} onChange={setView} options={VIEW_OPTIONS} label="Режим перегляду" />
        </div>
        <FilterChips value={source} onChange={setSource} options={SOURCE_OPTIONS} />
        <FilterChips value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="Нічого не знайдено" subtitle="Спробуй інший фільтр або пошуковий запит." />
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

function GridView({
  lessons,
  onAssign,
}: {
  lessons: LibraryLesson[];
  onAssign: (l: LibraryLesson) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {lessons.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} onAssign={onAssign} />
      ))}
    </div>
  );
}

function ListView({
  lessons,
  onAssign,
}: {
  lessons: LibraryLesson[];
  onAssign: (l: LibraryLesson) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="text-left px-5 py-3 type-label text-ink-muted">Урок</th>
              <th className="text-left px-4 py-3 type-label text-ink-muted">Рівень</th>
              <th className="text-left px-4 py-3 type-label text-ink-muted">Тип</th>
              <th className="text-left px-4 py-3 type-label text-ink-muted">Оновлено</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lessons.map(lesson => (
              <tr key={lesson.id} className="hover:bg-surface-muted/40 transition-colors">
                <td className="px-5 py-3.5 min-w-0">
                  <Link
                    href={`/dashboard/teacher-library/${lesson.id}/edit`}
                    className="text-sm font-bold text-ink hover:text-primary-dark"
                  >
                    {lesson.title}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {lesson.topic} · {lesson.durationMin} хв · {lesson.blocksCount} блоків
                  </p>
                </td>
                <td className="px-4 py-3.5">
                  <LevelBadge level={lesson.level} />
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${SOURCE_BADGE[lesson.source]}`}>
                    {LESSON_SOURCE_LABELS[lesson.source]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">{lesson.updatedAt}</td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
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

function LessonCard({
  lesson,
  onAssign,
}: {
  lesson: LibraryLesson;
  onAssign: (l: LibraryLesson) => void;
}) {
  return (
    <article className="bg-white rounded-2xl border border-border p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-card-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <LevelBadge level={lesson.level} />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${SOURCE_BADGE[lesson.source]}`}>
              {LESSON_SOURCE_LABELS[lesson.source]}
            </span>
          </div>
          <Link
            href={`/dashboard/teacher-library/${lesson.id}/edit`}
            className="text-sm font-black text-ink leading-snug hover:text-primary-dark line-clamp-2"
          >
            {lesson.title}
          </Link>
          <p className="text-xs text-ink-muted mt-1">{lesson.topic}</p>
        </div>
      </div>

      {lesson.hasUpdateFromOriginal && (
        <p className="text-[11px] font-bold text-accent-dark bg-accent/10 rounded-lg px-2 py-1">
          🔔 Оригінальний урок оновлено
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-ink-muted">
        <span>⏱️ {lesson.durationMin} хв</span>
        <span>📚 {lesson.blocksCount} блоків</span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <span className="text-[11px] text-ink-faint">Оновлено {lesson.updatedAt}</span>
        <LessonRowActions lesson={lesson} onAssign={onAssign} />
      </div>
    </article>
  );
}

function LessonRowActions({
  lesson,
  onAssign,
}: {
  lesson: LibraryLesson;
  onAssign: (l: LibraryLesson) => void;
}) {
  const isPlatform = lesson.source === 'platform';
  return (
    <div className="inline-flex items-center gap-1">
      {isPlatform && (
        <button
          type="button"
          className="px-2.5 py-1 rounded-lg border border-border text-[11px] font-bold text-ink-muted hover:border-primary/40 hover:text-primary-dark transition-colors"
          title="Копіювати в мою бібліотеку"
        >
          📥 Копія
        </button>
      )}
      <button
        type="button"
        onClick={() => onAssign(lesson)}
        className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary-dark text-[11px] font-black hover:bg-primary hover:text-white transition-colors"
      >
        Призначити
      </button>
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
