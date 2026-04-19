'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  HOMEWORK_KIND_ICONS,
  HOMEWORK_KIND_LABELS,
  HOMEWORK_STATUS_STYLES,
  MOCK_GROUPS,
  MOCK_HOMEWORK,
  MOCK_STUDENTS,
  MOCK_TODAY,
  type HomeworkStatus,
  type HomeworkTask,
} from '@/lib/teacher-mocks';
import {
  CoinTag,
  PageHeader,
  SearchInput,
  SegmentedControl,
  StatusPill,
  type SegmentedControlOption,
} from '@/components/teacher/ui';
import { CreateHomeworkModal } from '@/components/teacher/CreateHomeworkModal';

type Tab = 'all' | 'submitted' | 'reviewed' | 'returned' | 'overdue';

const TAB_OPTIONS: ReadonlyArray<SegmentedControlOption<Tab>> = [
  { value: 'all',       label: 'Всі' },
  { value: 'submitted', label: 'На перевірці' },
  { value: 'reviewed',  label: 'Перевірено' },
  { value: 'returned',  label: 'Повернуто' },
  { value: 'overdue',   label: 'Прострочено' },
];

function targetInfo(task: HomeworkTask): { name: string; photo?: string; sub: string } {
  if (task.assignedTo.type === 'student') {
    const s = MOCK_STUDENTS.find(x => x.id === task.assignedTo.id);
    return { name: s?.name ?? '—', photo: s?.photo, sub: `Учень · ${s?.level ?? ''}` };
  }
  const g = MOCK_GROUPS.find(x => x.id === task.assignedTo.id);
  return { name: g?.name ?? '—', sub: `Група · ${g?.level ?? ''}` };
}

function daysUntil(deadline: string): number {
  const d = new Date(deadline).getTime();
  const t = new Date(MOCK_TODAY).getTime();
  return Math.round((d - t) / 86_400_000);
}

function deadlineLabel(deadline: string, status: HomeworkStatus): { text: string; tone: 'muted' | 'warn' | 'danger' } {
  const days = daysUntil(deadline);
  if (status === 'reviewed' || status === 'returned') return { text: deadline, tone: 'muted' };
  if (status === 'overdue' || days < 0) return { text: `Прострочено · ${Math.abs(days)} дн`, tone: 'danger' };
  if (days === 0) return { text: 'Сьогодні', tone: 'warn' };
  if (days <= 2) return { text: `Через ${days} дн`, tone: 'warn' };
  return { text: deadline, tone: 'muted' };
}

export default function HomeworkPage() {
  const [tab, setTab] = useState<Tab>('submitted');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const counts = useMemo(() => {
    const base: Record<Tab, number> = { all: MOCK_HOMEWORK.length, submitted: 0, reviewed: 0, returned: 0, overdue: 0 };
    MOCK_HOMEWORK.forEach(h => {
      if (h.status === 'submitted') base.submitted++;
      if (h.status === 'reviewed')  base.reviewed++;
      if (h.status === 'returned')  base.returned++;
      if (h.status === 'overdue')   base.overdue++;
    });
    return base;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_HOMEWORK
      .filter(h => {
        if (tab === 'all') return true;
        return h.status === tab;
      })
      .filter(h => {
        if (q === '') return true;
        const { name } = targetInfo(h);
        return h.title.toLowerCase().includes(q) || name.toLowerCase().includes(q);
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [tab, query]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Домашні завдання"
        subtitle={`${MOCK_HOMEWORK.length} завдань · ${counts.submitted} очікують перевірки`}
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity"
          >
            + Створити ДЗ
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl value={tab} onChange={setTab} options={TAB_OPTIONS} label="Статус ДЗ" />
        <SearchInput
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Пошук за назвою або учнем…"
          containerClassName="w-full sm:w-72"
        />
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 type-label text-ink-muted">Учень / Група</th>
                <th className="text-left px-4 py-3 type-label text-ink-muted">Завдання</th>
                <th className="text-left px-4 py-3 type-label text-ink-muted">Дедлайн</th>
                <th className="text-left px-4 py-3 type-label text-ink-muted">Статус</th>
                <th className="text-left px-4 py-3 type-label text-ink-muted">Монети</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(h => {
                const who = targetInfo(h);
                const status = HOMEWORK_STATUS_STYLES[h.status];
                const deadline = deadlineLabel(h.deadline, h.status);
                const deadlineCls =
                  deadline.tone === 'danger' ? 'text-danger font-bold' :
                  deadline.tone === 'warn'   ? 'text-accent-dark font-bold' :
                                               'text-ink-muted';
                return (
                  <tr key={h.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {who.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={who.photo} alt={who.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary-dark text-xs font-black flex items-center justify-center flex-shrink-0">
                            🧩
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{who.name}</p>
                          <p className="text-[11px] text-ink-muted">{who.sub}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base" title={HOMEWORK_KIND_LABELS[h.kind]} aria-hidden>
                          {HOMEWORK_KIND_ICONS[h.kind]}
                        </span>
                        <span className="text-sm font-semibold text-ink truncate">{h.title}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3.5 text-sm whitespace-nowrap ${deadlineCls}`}>
                      {deadline.text}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill label={status.label} cls={status.cls} />
                    </td>
                    <td className="px-4 py-3.5">
                      <CoinTag amount={h.coins} bonus={h.bonusCoins} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {h.status === 'submitted' || h.status === 'reviewed' || h.status === 'returned' ? (
                        <Link
                          href={`/dashboard/homework/${h.id}/review`}
                          className="inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-primary text-white text-xs font-black hover:opacity-90 transition-opacity"
                        >
                          {h.status === 'submitted' ? 'Перевірити' : 'Відкрити'}
                        </Link>
                      ) : (
                        <span className="text-xs text-ink-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-ink-muted">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold">Нічого не знайдено</p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-border bg-surface-muted flex items-center justify-between text-xs text-ink-muted">
          <span>Показано {filtered.length} з {MOCK_HOMEWORK.length}</span>
          <span>Оновлено: {MOCK_TODAY}</span>
        </div>
      </div>

      <CreateHomeworkModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
