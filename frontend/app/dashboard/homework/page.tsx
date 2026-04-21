'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
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
  { value: 'submitted', label: 'Перевірка' },
  { value: 'reviewed',  label: 'Готово' },
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
      .filter(h => (tab === 'all' ? true : h.status === tab))
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
          <button type="button" onClick={() => setCreateOpen(true)} className="ios-btn ios-btn-primary">
            + Створити
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl value={tab} onChange={setTab} options={TAB_OPTIONS} label="Статус ДЗ" />
        <SearchInput
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Пошук за назвою або учнем…"
          containerClassName="w-full sm:w-72 sm:ml-auto"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="ios-card py-16 text-center">
          <p className="text-[14px] font-semibold text-ink">Нічого не знайдено</p>
          <p className="text-[13px] text-ink-muted mt-1">Спробуй інший запит або фільтр</p>
        </div>
      ) : (
        <div className="ios-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Учень / Група</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Завдання</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Дедлайн</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Статус</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Монети</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => {
                  const who = targetInfo(h);
                  const status = HOMEWORK_STATUS_STYLES[h.status];
                  const deadline = deadlineLabel(h.deadline, h.status);
                  const deadlineCls =
                    deadline.tone === 'danger' ? 'text-danger-dark font-semibold' :
                    deadline.tone === 'warn'   ? 'text-ink font-semibold' :
                                                  'text-ink-muted';
                  return (
                    <tr key={h.id} className="border-t border-border hover:bg-surface-muted/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {who.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={who.photo} alt={who.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-surface-muted text-ink-muted text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                              Гр.
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-ink truncate">{who.name}</p>
                            <p className="text-[11px] text-ink-muted">{who.sub}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-semibold text-ink truncate">{h.title}</p>
                        <p className="text-[11px] text-ink-muted">{HOMEWORK_KIND_LABELS[h.kind]}</p>
                      </td>
                      <td className={`px-4 py-3 text-[13px] whitespace-nowrap tabular-nums ${deadlineCls}`}>
                        {deadline.text}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill label={status.label} cls={status.cls} />
                      </td>
                      <td className="px-4 py-3">
                        <CoinTag amount={h.coins} bonus={h.bonusCoins} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {h.status === 'submitted' || h.status === 'reviewed' || h.status === 'returned' ? (
                          <Link href={`/dashboard/homework/${h.id}/review`} className="ios-btn ios-btn-sm ios-btn-secondary">
                            {h.status === 'submitted' ? 'Перевірити' : 'Відкрити'}
                          </Link>
                        ) : (
                          <span className="text-[12px] text-ink-faint">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="md:hidden">
            {filtered.map(h => {
              const who = targetInfo(h);
              const status = HOMEWORK_STATUS_STYLES[h.status];
              const deadline = deadlineLabel(h.deadline, h.status);
              const deadlineCls =
                deadline.tone === 'danger' ? 'text-danger-dark' :
                deadline.tone === 'warn'   ? 'text-ink font-semibold' :
                                              'text-ink-muted';
              return (
                <li key={h.id} className="border-t border-border first:border-t-0 px-4 py-3 flex gap-3">
                  {who.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={who.photo} alt={who.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-surface-muted text-ink-muted text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                      Гр.
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink truncate">{h.title}</p>
                        <p className="text-[12px] text-ink-muted truncate">{who.name}</p>
                      </div>
                      <StatusPill label={status.label} cls={status.cls} className="flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className={`text-[11px] tabular-nums ${deadlineCls}`}>{deadline.text}</span>
                      {(h.status === 'submitted' || h.status === 'reviewed' || h.status === 'returned') && (
                        <Link href={`/dashboard/homework/${h.id}/review`} className="ios-btn ios-btn-sm ios-btn-secondary">
                          {h.status === 'submitted' ? 'Перевірити' : 'Відкрити'}
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="px-5 py-2.5 border-t border-border bg-surface-muted/50 flex items-center justify-between text-[11px] text-ink-muted tabular-nums">
            <span>Показано {filtered.length} з {MOCK_HOMEWORK.length}</span>
            <span>Оновлено: {MOCK_TODAY}</span>
          </div>
        </div>
      )}

      <CreateHomeworkModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
