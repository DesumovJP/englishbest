'use client';
import { useMemo, useState } from 'react';
import {
  MINI_TASK_ICONS,
  MINI_TASK_LABELS,
  MOCK_MINI_TASKS,
  type MiniTaskKind,
} from '@/lib/teacher-mocks';
import {
  CoinTag,
  FilterChips,
  LevelBadge,
  PageHeader,
  SearchInput,
  type FilterChipOption,
} from '@/components/teacher/ui';
import { MiniTaskBuilder } from '@/components/teacher/MiniTaskBuilder';

type KindFilter = MiniTaskKind | 'all';

const KIND_FILTERS: ReadonlyArray<FilterChipOption<KindFilter>> = [
  { value: 'all',               label: 'Усі' },
  { value: 'quiz',              label: `${MINI_TASK_ICONS['quiz']} Вікторина` },
  { value: 'level-quiz',        label: `${MINI_TASK_ICONS['level-quiz']} Рівень` },
  { value: 'daily-challenge',   label: `${MINI_TASK_ICONS['daily-challenge']} Challenge` },
  { value: 'word-of-day',       label: `${MINI_TASK_ICONS['word-of-day']} Word` },
  { value: 'listening',         label: `${MINI_TASK_ICONS['listening']} Listening` },
  { value: 'sentence-builder',  label: `${MINI_TASK_ICONS['sentence-builder']} Sentences` },
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
        title="Міні-завдання й тести"
        subtitle={`${MOCK_MINI_TASKS.length} завдань`}
        action={
          <button
            type="button"
            onClick={() => setBuilderOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity"
          >
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
        <div className="py-16 text-center text-ink-muted">
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-semibold">Немає міні-завдань за цим фільтром</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(task => (
            <article
              key={task.id}
              className="bg-white rounded-2xl border border-border p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-card-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex items-start gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0" aria-hidden>
                    {MINI_TASK_ICONS[task.kind]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-ink truncate">{task.title}</p>
                    <p className="text-[11px] text-ink-muted">{MINI_TASK_LABELS[task.kind]}</p>
                  </div>
                </div>
                <LevelBadge level={task.level} />
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-surface-muted text-ink-muted font-bold">{task.topic}</span>
                <span className="px-2 py-0.5 rounded-md bg-surface-muted text-ink-muted font-bold">{task.durationMin} хв</span>
                <span className="px-2 py-0.5 rounded-md bg-surface-muted text-ink-muted font-bold">{task.questionsCount} питань</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <CoinTag amount={task.coins} />
                  <span className="text-[11px] text-ink-muted">
                    Призначено: <span className="font-bold text-ink">{task.assignedCount}</span>
                  </span>
                </div>
                {task.avgScore !== undefined && (
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                    task.avgScore >= 0.8 ? 'bg-primary/10 text-primary-dark' :
                    task.avgScore >= 0.6 ? 'bg-accent/15 text-accent-dark' :
                                           'bg-danger/10 text-danger-dark'
                  }`}>
                    {Math.round(task.avgScore * 100)}%
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => flashToast(`⚡ Призначаю "${task.title}"`)}
                  className="flex-1 h-9 rounded-xl bg-primary/10 text-primary-dark text-xs font-black hover:bg-primary/20 transition-colors"
                >
                  Призначити
                </button>
                <button
                  type="button"
                  onClick={() => flashToast(`👁️ Перегляд: ${task.title}`)}
                  className="px-3 h-9 rounded-xl border border-border text-xs font-bold text-ink-muted hover:border-primary/40 hover:text-ink transition-colors"
                >
                  Перегляд
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <MiniTaskBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-bold shadow-card-md">
          {toast}
        </div>
      )}
    </div>
  );
}
