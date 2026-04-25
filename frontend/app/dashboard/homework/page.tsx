'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchSubmissionsCached,
  peekSubmissions,
  resetSubmissionsCache,
  type Submission,
  type SubmissionStatus,
} from '@/lib/homework';
import {
  SearchInput,
  SegmentedControl,
  StatusPill,
  type SegmentedControlOption,
} from '@/components/teacher/ui';
import { CreateHomeworkModal } from '@/components/teacher/CreateHomeworkModal';
import { ManageHomeworksModal } from '@/components/teacher/ManageHomeworksModal';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

type Tab = 'all' | 'submitted' | 'reviewed' | 'returned' | 'overdue' | 'notStarted';

const TAB_OPTIONS: ReadonlyArray<SegmentedControlOption<Tab>> = [
  { value: 'all',        label: 'Всі' },
  { value: 'submitted',  label: 'Перевірка' },
  { value: 'reviewed',   label: 'Готово' },
  { value: 'returned',   label: 'Повернуто' },
  { value: 'overdue',    label: 'Прострочено' },
  { value: 'notStarted', label: 'Не розпочато' },
];

const STATUS_DISPLAY: Record<SubmissionStatus, { label: string; cls: string }> = {
  notStarted: { label: 'Не розпочато', cls: 'bg-surface-muted text-ink-muted' },
  inProgress: { label: 'В процесі',    cls: 'bg-surface-muted text-ink' },
  submitted:  { label: 'На перевірці', cls: 'bg-primary text-white' },
  reviewed:   { label: 'Перевірено',   cls: 'bg-surface-muted text-ink-muted' },
  returned:   { label: 'Повернуто',    cls: 'bg-surface-muted text-danger-dark' },
  overdue:    { label: 'Прострочено',  cls: 'bg-danger/10 text-danger-dark' },
};

function deadlineLabel(
  dueAt: string | null,
  status: SubmissionStatus,
): { text: string; tone: 'muted' | 'warn' | 'danger' } {
  if (!dueAt) return { text: '—', tone: 'muted' };
  if (status === 'reviewed' || status === 'returned') {
    return { text: formatDate(dueAt), tone: 'muted' };
  }
  const due = new Date(dueAt).getTime();
  const now = Date.now();
  const days = Math.round((due - now) / 86_400_000);
  if (status === 'overdue' || days < 0) {
    return { text: `Прострочено · ${Math.abs(days)} дн`, tone: 'danger' };
  }
  if (days === 0) return { text: 'Сьогодні', tone: 'warn' };
  if (days <= 2) return { text: `Через ${days} дн`, tone: 'warn' };
  return { text: formatDate(dueAt), tone: 'muted' };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

export default function HomeworkPage() {
  const [tab, setTab] = useState<Tab>('submitted');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const cachedSubs = peekSubmissions();
  const [submissions, setSubmissions] = useState<Submission[]>(cachedSubs ?? []);
  const [loading, setLoading] = useState(cachedSubs === null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (reloadKey > 0) resetSubmissionsCache();
        const rows = await fetchSubmissionsCached();
        if (!alive) return;
        setSubmissions(rows);
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
  }, [reloadKey]);

  const counts = useMemo(() => {
    const base: Record<Tab, number> = {
      all: submissions.length,
      submitted: 0,
      reviewed: 0,
      returned: 0,
      overdue: 0,
      notStarted: 0,
    };
    submissions.forEach((s) => {
      if (s.status in base) base[s.status as Tab]++;
    });
    return base;
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions
      .filter((s) => (tab === 'all' ? true : s.status === tab))
      .filter((s) => {
        if (q === '') return true;
        const title = s.homework?.title ?? '';
        const name = s.student?.displayName ?? '';
        return title.toLowerCase().includes(q) || name.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const ad = a.homework?.dueAt ?? '';
        const bd = b.homework?.dueAt ?? '';
        return ad.localeCompare(bd);
      });
  }, [submissions, tab, query]);

  const shellStatus: 'loading' | 'error' | 'empty' | 'ready' =
    error ? 'error'
    : loading ? 'loading'
    : filtered.length === 0 ? 'empty'
    : 'ready';

  return (
    <>
    <DashboardPageShell
      title="Домашні завдання"
      subtitle={
        loading
          ? 'Завантаження…'
          : `${submissions.length} здач · ${counts.submitted} на перевірці`
      }
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setManageOpen(true)}>Керувати</Button>
          <Button onClick={() => setCreateOpen(true)}>+ Створити</Button>
        </div>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-3 w-full">
          <SegmentedControl value={tab} onChange={setTab} options={TAB_OPTIONS} label="Статус ДЗ" />
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за назвою або учнем…"
            containerClassName="w-full sm:w-72 sm:ml-auto"
          />
        </div>
      }
      status={shellStatus}
      error={error ?? undefined}
      loadingShape="table"
      empty={{
        title: 'Нічого не знайдено',
        description:
          submissions.length === 0
            ? 'Коли ви опублікуєте ДЗ, здачі учнів з’являться тут'
            : 'Спробуй інший запит або фільтр',
      }}
    >
      <Card variant="surface" padding="none" className="overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Учень</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Завдання</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Дедлайн</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Статус</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <SubmissionRow key={s.documentId} submission={s} />
              ))}
            </tbody>
          </table>
        </div>

        <ul className="md:hidden">
          {filtered.map((s) => (
            <SubmissionCard key={s.documentId} submission={s} />
          ))}
        </ul>

        <div className="px-5 py-2.5 border-t border-border bg-surface-muted/50 flex items-center justify-between text-[11px] text-ink-muted tabular-nums">
          <span>Показано {filtered.length} з {submissions.length}</span>
        </div>
      </Card>
    </DashboardPageShell>

    <CreateHomeworkModal
      open={createOpen}
      onClose={() => setCreateOpen(false)}
      onCreated={() => setReloadKey(k => k + 1)}
    />

    <ManageHomeworksModal
      open={manageOpen}
      onClose={() => setManageOpen(false)}
      onMutated={() => setReloadKey(k => k + 1)}
    />
    </>
  );
}

function SubmissionRow({ submission }: { submission: Submission }) {
  const status = STATUS_DISPLAY[submission.status];
  const deadline = deadlineLabel(submission.homework?.dueAt ?? null, submission.status);
  const deadlineCls =
    deadline.tone === 'danger'
      ? 'text-danger-dark font-semibold'
      : deadline.tone === 'warn'
        ? 'text-ink font-semibold'
        : 'text-ink-muted';
  const canReview =
    submission.status === 'submitted' ||
    submission.status === 'reviewed' ||
    submission.status === 'returned';

  return (
    <tr className="border-t border-border hover:bg-surface-muted/50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            name={submission.student?.displayName ?? '—'}
            src={submission.student?.avatarUrl ?? null}
            size="sm"
            className="bg-surface-muted text-ink-muted"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink truncate">
              {submission.student?.displayName ?? '—'}
            </p>
            <p className="text-[11px] text-ink-muted">
              Учень · {submission.student?.level ?? ''}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-[13px] font-semibold text-ink truncate">
          {submission.homework?.title ?? '—'}
        </p>
      </td>
      <td className={`px-4 py-3 text-[13px] whitespace-nowrap tabular-nums ${deadlineCls}`}>
        {deadline.text}
      </td>
      <td className="px-4 py-3">
        <StatusPill label={status.label} cls={status.cls} />
      </td>
      <td className="px-4 py-3 text-right">
        {canReview ? (
          <Link
            href={`/dashboard/homework/${submission.documentId}/review`}
            className="ios-btn ios-btn-sm ios-btn-secondary"
          >
            {submission.status === 'submitted' ? 'Перевірити' : 'Відкрити'}
          </Link>
        ) : (
          <span className="text-[12px] text-ink-faint">—</span>
        )}
      </td>
    </tr>
  );
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const status = STATUS_DISPLAY[submission.status];
  const deadline = deadlineLabel(submission.homework?.dueAt ?? null, submission.status);
  const deadlineCls =
    deadline.tone === 'danger'
      ? 'text-danger-dark'
      : deadline.tone === 'warn'
        ? 'text-ink font-semibold'
        : 'text-ink-muted';
  const canReview =
    submission.status === 'submitted' ||
    submission.status === 'reviewed' ||
    submission.status === 'returned';

  return (
    <li className="border-t border-border first:border-t-0 px-4 py-3 flex gap-3">
      <Avatar
        name={submission.student?.displayName ?? '—'}
        src={submission.student?.avatarUrl ?? null}
        size="sm"
        className="bg-surface-muted text-ink-muted"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink truncate">
              {submission.homework?.title ?? '—'}
            </p>
            <p className="text-[12px] text-ink-muted truncate">
              {submission.student?.displayName ?? '—'}
            </p>
          </div>
          <StatusPill label={status.label} cls={status.cls} className="flex-shrink-0" />
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className={`text-[11px] tabular-nums ${deadlineCls}`}>{deadline.text}</span>
          {canReview && (
            <Link
              href={`/dashboard/homework/${submission.documentId}/review`}
              className="ios-btn ios-btn-sm ios-btn-secondary"
            >
              {submission.status === 'submitted' ? 'Перевірити' : 'Відкрити'}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
