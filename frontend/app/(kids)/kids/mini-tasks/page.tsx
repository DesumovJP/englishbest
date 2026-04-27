/**
 * Kids mini-tasks list — every public mini-task in one tappable feed.
 *
 * Shows kind chip (quiz / word-of-day / listening / sentence-builder /
 * daily-challenge / level-quiz), level, duration, coin reward; flips a
 * "Зроблено" tick on cards the kid has already submitted (so coin farming
 * via repeat clicks is visually flagged — the BE itself is idempotent on
 * first-attempt rewards).
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { KidsPageShell } from '@/components/ui/shells';
import {
  KidsButton,
  KidsCard,
  KidsCoinBadge,
  KidsPageHeader,
} from '@/components/kids/ui';
import { fetchMiniTasks, type MiniTask, type MiniTaskKind } from '@/lib/mini-tasks';
import {
  fetchMyAttempts,
  type MiniTaskAttempt,
} from '@/lib/mini-task-attempts';
import { MiniTaskPlayer } from '@/components/kids/MiniTaskPlayer';

const KIND_LABEL: Record<MiniTaskKind, string> = {
  quiz:               'Квіз',
  'level-quiz':       'Тест рівня',
  'daily-challenge':  'Виклик дня',
  'word-of-day':      'Слово дня',
  listening:          'Аудіювання',
  'sentence-builder': 'Збери речення',
};

const KIND_ICON: Record<MiniTaskKind, string> = {
  quiz:               '❓',
  'level-quiz':       '🎯',
  'daily-challenge':  '🔥',
  'word-of-day':      '🆎',
  listening:          '🎧',
  'sentence-builder': '🧩',
};

const FILTER_ORDER: ReadonlyArray<{ key: MiniTaskKind | 'all'; label: string }> = [
  { key: 'all',              label: 'Усі'     },
  { key: 'daily-challenge',  label: '🔥 День' },
  { key: 'quiz',             label: 'Квізи'   },
  { key: 'word-of-day',      label: 'Слово'   },
  { key: 'listening',        label: 'Аудіо'   },
  { key: 'sentence-builder', label: 'Речення' },
  { key: 'level-quiz',       label: 'Рівень'  },
];

export default function KidsMiniTasksPage() {
  const [tasks, setTasks] = useState<MiniTask[] | null>(null);
  const [attempts, setAttempts] = useState<MiniTaskAttempt[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<MiniTask | null>(null);
  const [filter, setFilter] = useState<MiniTaskKind | 'all'>('all');

  // Initial load: tasks + my attempts. Only public tasks reach kids; the BE
  // already filters this for the kids role on the find endpoint.
  useEffect(() => {
    let alive = true;
    Promise.all([fetchMiniTasks(), fetchMyAttempts().catch(() => [])])
      .then(([t, a]) => {
        if (!alive) return;
        setTasks(t.filter(x => x.isPublic));
        setAttempts(a);
      })
      .catch(e => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
      });
    return () => {
      alive = false;
    };
  }, []);

  const doneByTask = useMemo(() => {
    const m = new Set<string>();
    for (const a of attempts ?? []) m.add(a.taskId);
    return m;
  }, [attempts]);

  const visible = useMemo(() => {
    if (!tasks) return [];
    if (filter === 'all') return tasks;
    return tasks.filter(t => t.kind === filter);
  }, [tasks, filter]);

  function handleCompleted() {
    // Refresh attempts so the "Зроблено" mark flips. Cheap call (caller's
    // own attempts only), no need to refetch the task catalog.
    fetchMyAttempts()
      .then(a => setAttempts(a))
      .catch(() => { /* silent */ });
  }

  return (
    <KidsPageShell
      header={<KidsPageHeader title="Завдання 🎯" backHref="/kids/dashboard" />}
    >
      <div className="max-w-screen-sm mx-auto flex flex-col gap-4 py-4">
        {/* Filter chips */}
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex gap-1.5 w-max">
            {FILTER_ORDER.map(f => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={on}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-black whitespace-nowrap transition-colors ${
                    on ? 'bg-ink text-white' : 'bg-surface-muted text-ink-muted'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {tasks === null && (
          <div className="flex justify-center py-16 text-ink-muted text-sm">Завантаження…</div>
        )}

        {error && (
          <KidsCard variant="default" className="p-6 text-center">
            <p className="font-black text-ink text-base">Не вдалось завантажити</p>
            <p className="text-ink-muted text-[13px] mt-1">{error}</p>
          </KidsCard>
        )}

        {tasks !== null && visible.length === 0 && !error && (
          <KidsCard variant="hero" className="p-8 text-center">
            <span className="text-5xl" aria-hidden>🌱</span>
            <p className="font-black text-ink text-lg mt-3">
              {tasks.length === 0 ? 'Завдань ще немає' : 'У цій категорії порожньо'}
            </p>
            <p className="text-ink-muted text-[13px] mt-1">
              {tasks.length === 0
                ? 'Скоро твій вчитель додасть нові'
                : 'Спробуй інший фільтр'}
            </p>
          </KidsCard>
        )}

        {tasks !== null && visible.length > 0 && (
          <ul className="flex flex-col gap-3">
            {visible.map(t => {
              const done = doneByTask.has(t.documentId);
              const icon = KIND_ICON[t.kind];
              return (
                <li key={t.documentId}>
                  <button
                    type="button"
                    onClick={() => setActive(t)}
                    className="block w-full text-left active:scale-[0.99] transition-transform"
                  >
                    <KidsCard variant="default" className="p-4">
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                            done ? 'bg-primary/15' : 'bg-surface-muted'
                          }`}
                          aria-hidden
                        >
                          {done ? '✅' : icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider text-ink-faint">
                            {KIND_LABEL[t.kind]}
                            {t.level ? ` · ${t.level}` : ''}
                            {t.durationMin ? ` · ${t.durationMin} хв` : ''}
                          </p>
                          <p className={`font-black text-[15px] mt-0.5 truncate ${done ? 'text-ink-muted line-through' : 'text-ink'}`}>
                            {t.title}
                          </p>
                          {t.topic && (
                            <p className="text-[12px] text-ink-muted mt-0.5 truncate">{t.topic}</p>
                          )}
                        </div>
                        {t.coinReward > 0 && !done && <KidsCoinBadge amount={t.coinReward} size="sm" />}
                      </div>
                    </KidsCard>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {tasks !== null && visible.length > 0 && (
          <p className="text-center text-[11px] text-ink-faint mt-2">
            Монети нараховуються лише за перше виконання — старайся з першого разу!
          </p>
        )}
      </div>

      {active && (
        <MiniTaskPlayer
          task={active}
          onClose={() => setActive(null)}
          onCompleted={handleCompleted}
        />
      )}
    </KidsPageShell>
  );
}
