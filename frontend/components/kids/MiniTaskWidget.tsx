/**
 * MiniTaskWidget — kids dashboard HUD card that surfaces today's mini-task.
 *
 * Picks the first public `daily-challenge` (then `word-of-day`, then any
 * other) the kid hasn't yet attempted. Tap → opens MiniTaskPlayer inline,
 * so the kid never has to leave the dashboard to earn the daily coins.
 *
 * Falls through to a simple "Усі завдання" link when nothing is left to do
 * today (so we never show a zombie HUD card).
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { HudCard } from '@/components/kids/ui';
import { fetchMiniTasks, type MiniTask } from '@/lib/mini-tasks';
import { fetchMyAttempts, type MiniTaskAttempt } from '@/lib/mini-task-attempts';
import { MiniTaskPlayer } from './MiniTaskPlayer';

const KIND_PRIORITY: Record<string, number> = {
  'daily-challenge':  0,
  'word-of-day':      1,
  quiz:               2,
  listening:          3,
  'sentence-builder': 4,
  'level-quiz':       5,
};

function pickFeatured(tasks: MiniTask[], doneIds: Set<string>): MiniTask | null {
  const candidates = tasks.filter(t => t.isPublic && !doneIds.has(t.documentId));
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const pa = KIND_PRIORITY[a.kind] ?? 99;
    const pb = KIND_PRIORITY[b.kind] ?? 99;
    if (pa !== pb) return pa - pb;
    // Stable secondary sort: shortest first (good first taste).
    return a.durationMin - b.durationMin;
  });
  return candidates[0] ?? null;
}

export function MiniTaskWidget() {
  const [tasks, setTasks] = useState<MiniTask[] | null>(null);
  const [attempts, setAttempts] = useState<MiniTaskAttempt[] | null>(null);
  const [active, setActive] = useState<MiniTask | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchMiniTasks(), fetchMyAttempts().catch(() => [])])
      .then(([t, a]) => {
        if (!alive) return;
        setTasks(t);
        setAttempts(a);
      })
      .catch(() => { /* dashboard widget is non-critical — fail silent */ });
    return () => { alive = false; };
  }, []);

  const doneIds = useMemo(() => {
    const s = new Set<string>();
    for (const a of attempts ?? []) s.add(a.taskId);
    return s;
  }, [attempts]);

  const featured = useMemo(() => pickFeatured(tasks ?? [], doneIds), [tasks, doneIds]);
  const remaining = useMemo(
    () => (tasks ?? []).filter(t => t.isPublic && !doneIds.has(t.documentId)).length,
    [tasks, doneIds],
  );

  function handleCompleted() {
    fetchMyAttempts().then(a => setAttempts(a)).catch(() => { /* silent */ });
  }

  // Loading skeleton — match HudCard padding so the dashboard layout doesn't
  // shift on first paint.
  if (tasks === null) {
    return (
      <HudCard className="p-2.5 sm:p-3.5">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-ink-faint/15 animate-pulse" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-3/4 rounded bg-ink-faint/15 animate-pulse" />
            <div className="h-2.5 w-1/2 rounded bg-ink-faint/15 animate-pulse" />
          </div>
        </div>
      </HudCard>
    );
  }

  // Empty state — kid is fully caught up. Link to the catalog so they can
  // re-do tasks (no coins on retry, but still useful practice).
  if (!featured) {
    return (
      <Link href="/kids/mini-tasks" className="block active:scale-[0.97] transition-transform">
        <HudCard className="p-2.5 sm:p-3.5">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-success/15 flex items-center justify-center text-lg sm:text-2xl flex-shrink-0">
              ✅
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[12px] sm:text-sm text-ink leading-none">Усе зроблено!</p>
              <p className="text-[9.5px] sm:text-[11px] text-ink-muted mt-0.5">
                Повтори улюблені завдання
              </p>
            </div>
            <span className="text-ink-muted text-sm">›</span>
          </div>
        </HudCard>
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setActive(featured)}
        className="block w-full text-left active:scale-[0.97] transition-transform"
      >
        <HudCard className="p-2.5 sm:p-3 overflow-hidden">
          <div className="flex items-start gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent/15 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
              🎯
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[12.5px] sm:text-[13.5px] text-ink leading-tight line-clamp-2">
                {featured.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {featured.coinReward > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/coin.png" alt="" aria-hidden width={11} height={11} className="object-contain" />
                    <span className="font-black text-[10.5px] sm:text-[11px] text-coin leading-none">+{featured.coinReward}</span>
                  </span>
                )}
                <span aria-hidden className="text-ink-faint/60 text-[9px] leading-none">·</span>
                <span className="font-medium text-[10px] sm:text-[10.5px] text-ink-muted truncate leading-none">
                  {remaining > 1 ? `${remaining} нових` : 'Виклик дня'}
                </span>
              </div>
            </div>
            <span aria-hidden className="text-ink-muted text-sm mt-0.5 flex-shrink-0">›</span>
          </div>
        </HudCard>
      </button>

      {active && (
        <MiniTaskPlayer
          task={active}
          onClose={() => setActive(null)}
          onCompleted={handleCompleted}
        />
      )}
    </>
  );
}
