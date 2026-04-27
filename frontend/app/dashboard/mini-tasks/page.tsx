/**
 * /dashboard/mini-tasks — teacher/admin template library.
 *
 * Live composition:
 *   fetchMiniTasks()  — backend scopes: teacher sees own + public, admin all
 *   createMiniTask()  — forced-author on BE for teachers
 *   deleteMiniTask()  — author-only on BE (admin bypass)
 *
 * Non-teacher/admin roles: empty state (authoring is teacher+admin only).
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/session-context';
import {
  deleteMiniTask,
  fetchMiniTasks,
  KIND_LABEL,
  type MiniTask,
  type MiniTaskKind,
} from '@/lib/mini-tasks';
import {
  CoinTag,
  FilterChips,
  LevelBadge,
  SearchInput,
  type FilterChipOption,
} from '@/components/teacher/ui';
import { MiniTaskBuilder } from '@/components/teacher/MiniTaskBuilder';
import { MiniTaskResultsModal } from '@/components/teacher/MiniTaskResultsModal';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  fetchAllAttempts,
  type MiniTaskAttempt,
} from '@/lib/mini-task-attempts';

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
  const { session, status: sessionStatus } = useSession();
  const role = session?.profile?.role ?? null;
  const canAuthor = role === 'teacher' || role === 'admin';

  const [tasks, setTasks]       = useState<MiniTask[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery]             = useState('');
  const [kindFilter, setKindFilter]   = useState<KindFilter>('all');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MiniTask | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [resultsTask, setResultsTask] = useState<MiniTask | null>(null);
  const [attempts, setAttempts]       = useState<MiniTaskAttempt[]>([]);

  const myAuthorId = session?.profile?.teacherProfile?.documentId as string | undefined;

  useEffect(() => {
    if (!canAuthor) return;
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.all([fetchMiniTasks(), fetchAllAttempts().catch(() => [])])
      .then(([rows, atts]) => {
        if (!alive) return;
        setTasks(rows);
        setAttempts(atts);
      })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'failed'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [canAuthor, reloadKey]);

  // Per-task aggregate stats — computed in memory from a single attempts
  // payload so cards don't fan out N parallel requests.
  const statsByTask = useMemo(() => {
    const map = new Map<string, { total: number; pending: number; avg: number | null }>();
    const buckets = new Map<string, { sum: number; n: number; pending: number; total: number }>();
    for (const a of attempts) {
      const b = buckets.get(a.taskId) ?? { sum: 0, n: 0, pending: 0, total: 0 };
      b.total += 1;
      if (a.score === null) b.pending += 1;
      else { b.sum += a.score; b.n += 1; }
      buckets.set(a.taskId, b);
    }
    for (const [k, b] of buckets.entries()) {
      map.set(k, {
        total: b.total,
        pending: b.pending,
        avg: b.n > 0 ? Math.round(b.sum / b.n) : null,
      });
    }
    return map;
  }, [attempts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter(t => kindFilter === 'all' || t.kind === kindFilter)
      .filter(t =>
        q === '' ||
        t.title.toLowerCase().includes(q) ||
        t.topic.toLowerCase().includes(q),
      );
  }, [tasks, query, kindFilter]);

  async function handleDelete(id: string) {
    if (!confirm('Видалити міні-завдання назавжди?')) return;
    setDeletingId(id);
    try {
      await deleteMiniTask(id);
      setTasks(ts => ts.filter(t => t.documentId !== id));
    } catch (e: any) {
      alert(e?.message ?? 'Не вдалось видалити');
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved(task: MiniTask) {
    setTasks((ts) => {
      const idx = ts.findIndex((t) => t.documentId === task.documentId);
      if (idx === -1) return [task, ...ts];
      const next = ts.slice();
      next[idx] = task;
      return next;
    });
  }

  function handleEdit(task: MiniTask) {
    setEditingTask(task);
    setBuilderOpen(true);
  }

  function handleCreateNew() {
    setEditingTask(null);
    setBuilderOpen(true);
  }

  function handleBuilderClose() {
    setBuilderOpen(false);
    setEditingTask(null);
  }

  if (sessionStatus === 'loading') {
    return <DashboardPageShell title="Міні-завдання" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }

  if (!canAuthor) {
    return (
      <DashboardPageShell
        title="Міні-завдання"
        status="empty"
        empty={{
          title: 'Розділ для авторів',
          description: 'Створення та керування шаблонами міні-завдань доступне лише вчителям і адміністраторам.',
        }}
      />
    );
  }

  const shellStatus: 'loading' | 'error' | 'empty' | 'ready' =
    error ? 'error'
    : loading && tasks.length === 0 ? 'loading'
    : filtered.length === 0 ? 'empty'
    : 'ready';

  return (
    <>
      <DashboardPageShell
        title="Міні-завдання"
        subtitle={loading ? 'Завантаження…' : `${tasks.length} шаблонів`}
        actions={<Button onClick={handleCreateNew}>+ Створити</Button>}
        toolbar={
          <div className="flex flex-col gap-3 w-full">
            <FilterChips value={kindFilter} onChange={setKindFilter} options={KIND_FILTERS} />
            <SearchInput
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Пошук за назвою або темою…"
              containerClassName="w-full sm:w-72"
            />
          </div>
        }
        status={shellStatus}
        error={error ?? undefined}
        onRetry={() => setReloadKey(k => k + 1)}
        loadingShape="card"
        empty={{
          title: tasks.length === 0 ? 'Ще немає шаблонів' : 'Нічого не знайдено',
          description:
            tasks.length === 0
              ? 'Створіть перший шаблон міні-завдання'
              : 'Спробуй інший фільтр або запит',
          action:
            tasks.length === 0
              ? <Button onClick={handleCreateNew}>+ Створити шаблон</Button>
              : undefined,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(task => {
            const isMine = role === 'admin' || (myAuthorId ? task.authorId === myAuthorId : false);
            const deleting = deletingId === task.documentId;
            const stats = statsByTask.get(task.documentId);
            return (
              <Card key={task.documentId} variant="surface" padding="sm" className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex flex-col gap-1">
                    <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">
                      {KIND_LABEL[task.kind]}
                    </p>
                    <p className="text-[14px] font-semibold text-ink leading-snug">
                      {task.title}
                    </p>
                  </div>
                  {task.level && <LevelBadge level={task.level} />}
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px] text-ink-muted tabular-nums">
                  {task.topic && <span className="ios-chip">{task.topic}</span>}
                  <span className="ios-chip">{task.durationMin} хв</span>
                  {task.isPublic && <span className="ios-chip">Публічне</span>}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <CoinTag amount={task.coinReward} />
                  {task.exercise && (
                    <span className="text-[10px] text-ink-faint uppercase tracking-wider">
                      {task.exercise.type}
                    </span>
                  )}
                </div>

                {/* Live attempts summary — hidden when there are no attempts so the
                   freshly-created cards stay visually clean. */}
                {stats && stats.total > 0 && (
                  <button
                    type="button"
                    onClick={() => setResultsTask(task)}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-surface-muted hover:bg-border/40 text-left transition-colors"
                  >
                    <span className="flex items-center gap-2 text-[11px] tabular-nums">
                      <span className="font-semibold text-ink">{stats.total} спроб</span>
                      {stats.avg !== null && (
                        <span className="text-ink-muted">сер. {stats.avg}%</span>
                      )}
                      {stats.pending > 0 && (
                        <span className="text-accent-dark font-semibold">
                          {stats.pending} на перевірці
                        </span>
                      )}
                    </span>
                    <span className="text-ink-muted text-[12px]">→</span>
                  </button>
                )}

                {isMine && (
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setResultsTask(task)}
                    >
                      Виконання
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={deleting}
                      onClick={() => handleEdit(task)}
                    >
                      Ред.
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={deleting}
                      onClick={() => handleDelete(task.documentId)}
                    >
                      ×
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </DashboardPageShell>

      <MiniTaskBuilder
        open={builderOpen}
        onClose={handleBuilderClose}
        onSaved={handleSaved}
        initialTask={editingTask}
      />

      {resultsTask && (
        <MiniTaskResultsModal
          task={resultsTask}
          onClose={() => setResultsTask(null)}
        />
      )}
    </>
  );
}
