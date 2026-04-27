/**
 * MiniTaskResultsModal — teacher-only view of attempts against a single
 * mini-task. Shows summary stats (total attempts, unique kids, average
 * score, pending review count) plus a flat list of every attempt with
 * student name, score, awarded coins, completedAt.
 *
 * Open-ended attempts (score = null) bubble to the top so the teacher can
 * grade them via `reviewAttempt` from `lib/mini-task-attempts`. Auto-graded
 * attempts are read-only.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  fetchAttemptsForTask,
  reviewAttempt,
  type MiniTaskAttempt,
} from '@/lib/mini-task-attempts';
import type { MiniTask } from '@/lib/mini-tasks';

interface Props {
  task: MiniTask;
  onClose: () => void;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MiniTaskResultsModal({ task, onClose }: Props) {
  const [rows, setRows] = useState<MiniTaskAttempt[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAttemptsForTask(task.documentId)
      .then(r => alive && setRows(r))
      .catch(e => alive && setError(e instanceof Error ? e.message : 'failed'));
    return () => {
      alive = false;
    };
  }, [task.documentId]);

  // Sort: pending-review first, then by completedAt desc.
  const sorted = useMemo(() => {
    if (!rows) return null;
    return [...rows].sort((a, b) => {
      const pa = a.score === null ? 0 : 1;
      const pb = b.score === null ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return (b.completedAt ?? '').localeCompare(a.completedAt ?? '');
    });
  }, [rows]);

  const stats = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { total: 0, uniqueKids: 0, avgScore: null as number | null, pending: 0 };
    }
    const userIds = new Set<string>();
    let scoredSum = 0;
    let scoredCount = 0;
    let pending = 0;
    for (const r of rows) {
      if (r.userId) userIds.add(r.userId);
      if (r.score === null) pending += 1;
      else {
        scoredSum += r.score;
        scoredCount += 1;
      }
    }
    return {
      total: rows.length,
      uniqueKids: userIds.size,
      avgScore: scoredCount > 0 ? Math.round(scoredSum / scoredCount) : null,
      pending,
    };
  }, [rows]);

  async function gradeOpen(attempt: MiniTaskAttempt) {
    const raw = window.prompt(
      `Оцінка для ${attempt.userDisplayName ?? 'учня'} (0..100):`,
      attempt.score?.toString() ?? '',
    );
    if (raw === null) return;
    const score = Number(raw);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      window.alert('Введіть число 0..100');
      return;
    }
    const feedback = window.prompt('Фідбек (необов\'язково):', attempt.teacherFeedback ?? '');
    setReviewing(attempt.documentId);
    try {
      const updated = await reviewAttempt(attempt.documentId, {
        score,
        teacherFeedback: feedback?.trim() || null,
      });
      setRows(prev =>
        (prev ?? []).map(r => (r.documentId === updated.documentId ? updated : r)),
      );
    } catch (e: any) {
      window.alert(e?.message ?? 'Не вдалось зберегти');
    } finally {
      setReviewing(null);
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Виконання — ${task.title}`}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label="Спроб" value={stats.total} />
          <Stat label="Учнів" value={stats.uniqueKids} />
          <Stat
            label="Сер. бал"
            value={stats.avgScore !== null ? `${stats.avgScore}%` : '—'}
          />
          <Stat
            label="На перевірці"
            value={stats.pending}
            highlight={stats.pending > 0}
          />
        </div>

        {error && (
          <p className="text-[12px] font-semibold text-danger-dark bg-danger/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {sorted === null ? (
          <p className="py-6 text-center text-[13px] text-ink-muted">Завантаження…</p>
        ) : sorted.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-muted">
            Поки що немає спроб. Поділись завданням з учнями.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto -mx-4 px-4">
            {sorted.map(r => (
              <li
                key={r.documentId}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-border bg-white"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">
                    {r.userDisplayName ?? '—'}
                  </p>
                  <p className="text-[11px] text-ink-muted tabular-nums">
                    {fmtDate(r.completedAt)}
                    {r.timeSpentSec ? ` · ${r.timeSpentSec}с` : ''}
                    {r.awardedCoins > 0 ? ` · +${r.awardedCoins} 🪙` : ''}
                  </p>
                  {r.teacherFeedback && (
                    <p className="text-[11px] text-ink-muted italic mt-0.5 line-clamp-2">
                      «{r.teacherFeedback}»
                    </p>
                  )}
                </div>
                {r.score === null ? (
                  <Button
                    size="sm"
                    onClick={() => gradeOpen(r)}
                    loading={reviewing === r.documentId}
                  >
                    Оцінити
                  </Button>
                ) : (
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className={`text-[13px] font-black tabular-nums ${
                        r.correct ? 'text-primary-dark' : r.score >= 50 ? 'text-accent-dark' : 'text-danger-dark'
                      }`}
                    >
                      {Math.round(r.score)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => gradeOpen(r)}
                      className="text-[10px] text-ink-faint hover:text-ink"
                    >
                      змінити
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`px-3 py-2 rounded-xl border ${
        highlight ? 'border-accent bg-accent/10' : 'border-border bg-surface-muted/50'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
      <p
        className={`text-[18px] font-black tabular-nums mt-0.5 ${
          highlight ? 'text-accent-dark' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
