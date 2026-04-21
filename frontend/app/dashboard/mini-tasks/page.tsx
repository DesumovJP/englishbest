'use client';
import { useMemo, useState } from 'react';
import {
  MINI_TASK_LABELS,
  MOCK_MINI_TASKS,
  type MiniTaskKind,
} from '@/lib/teacher-mocks';
import {
  CoinTag,
  EmptyState,
  FilterChips,
  LevelBadge,
  PageHeader,
  SearchInput,
  type FilterChipOption,
} from '@/components/teacher/ui';
import { MiniTaskBuilder } from '@/components/teacher/MiniTaskBuilder';

type KindFilter = MiniTaskKind | 'all';

const KIND_FILTERS: ReadonlyArray<FilterChipOption<KindFilter>> = [
  { value: 'all',              label: 'Усі' },
  { value: 'quiz',             label: 'Вікторина' },
  { value: 'level-quiz',       label: 'Рівень' },
  { value: 'daily-challenge',  label: 'Challenge' },
  { value: 'word-of-day',      label: 'Word' },
  { value: 'listening',        label: 'Listening' },
  { value: 'sentence-builder', label: 'Sentences' },
];

export default function MiniTasksPage() {
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_MINI_TASKS
      .filter(t => kindFilter === 'all' || t.kind === kindFilter)
      .filter(t => q === '' || t.title.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [query, kindFilter]);

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Міні-завдання"
        subtitle={`${MOCK_MINI_TASKS.length} шаблонів`}
        action={
          <button type="button" onClick={() => setBuilderOpen(true)} className="ios-btn ios-btn-primary">
            + Створити
          </button>
        }
      />

      <div className="flex flex-col gap-3">
        <FilterChips value={kindFilter} onChange={setKindFilter} options={KIND_FILTERS} />
        <SearchInput
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Пошук за назвою або темою…"
          containerClassName="w-full sm:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Нічого не знайдено" subtitle="Спробуй інший фільтр або запит" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(task => {
            const scoreTone =
              task.avgScore === undefined ? '' :
              task.avgScore >= 0.8 ? 'text-ink' :
              task.avgScore >= 0.6 ? 'text-ink-muted' : 'text-danger-dark';
            return (
              <article key={task.id} className="ios-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex flex-col gap-1">
                    <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">
                      {MINI_TASK_LABELS[task.kind]}
                    </p>
                    <p className="text-[14px] font-semibold text-ink leading-snug">{task.title}</p>
                  </div>
                  <LevelBadge level={task.level} />
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px] text-ink-muted tabular-nums">
                  <span className="ios-chip">{task.topic}</span>
                  <span className="ios-chip">{task.durationMin} хв</span>
                  <span className="ios-chip">{task.questionsCount} питань</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-3">
                    <CoinTag amount={task.coins} />
                    <span className="text-[11px] text-ink-muted tabular-nums">
                      Призначено: <span className="font-semibold text-ink">{task.assignedCount}</span>
                    </span>
                  </div>
                  {task.avgScore !== undefined && (
                    <span className={`text-[12px] font-semibold tabular-nums ${scoreTone}`}>
                      {Math.round(task.avgScore * 100)}%
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => flashToast(`Призначаю: ${task.title}`)}
                    className="ios-btn ios-btn-sm ios-btn-primary flex-1"
                  >
                    Призначити
                  </button>
                  <button
                    type="button"
                    onClick={() => flashToast(`Перегляд: ${task.title}`)}
                    className="ios-btn ios-btn-sm ios-btn-secondary"
                  >
                    Перегляд
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <MiniTaskBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
          {toast}
        </div>
      )}
    </div>
  );
}
