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
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

  const myAuthorId = session?.profile?.teacherProfile?.documentId as string | undefined;

  useEffect(() => {
    if (!canAuthor) return;
    let alive = true;
    setLoading(true);
    setError(null);
    fetchMiniTasks()
      .then(rows => { if (alive) setTasks(rows); })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'failed'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [canAuthor, reloadKey]);

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

                {isMine && (
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="secondary"
                      fullWidth
                      disabled={deleting}
                      onClick={() => handleEdit(task)}
                    >
                      Редагувати
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      fullWidth
                      loading={deleting}
                      onClick={() => handleDelete(task.documentId)}
                    >
                      {deleting ? 'Видалення…' : 'Видалити'}
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
    </>
  );
}
