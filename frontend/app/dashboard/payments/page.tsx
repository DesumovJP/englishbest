'use client';
import { useEffect, useMemo, useState } from 'react';
import { LevelBadge, SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Level } from '@/lib/types';
import { useSession } from '@/lib/session-context';
import {
  fetchTeacherPayouts,
  periodLabel,
  type PayoutStatus,
  type TeacherPayout,
} from '@/lib/payments';
import {
  fetchTeacherMonthSessions,
  type SessionLite,
} from '@/lib/attendance';

const LEVELS = new Set<Level>(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
function asLevel(v: string | null): Level | null {
  return v && LEVELS.has(v as Level) ? (v as Level) : null;
}

const STATUS_CONFIG: Record<PayoutStatus, { label: string; dot: string }> = {
  paid:       { label: 'Виплачено',  dot: 'ios-dot-positive' },
  pending:    { label: 'Очікується', dot: 'ios-dot-warn' },
  processing: { label: 'В обробці',  dot: 'ios-dot-info' },
  cancelled:  { label: 'Скасовано',  dot: 'ios-dot-warn' },
};

const TAB_OPTIONS: ReadonlyArray<SegmentedControlOption<'history' | 'upcoming'>> = [
  { value: 'history',  label: 'Історія виплат' },
  { value: 'upcoming', label: 'Майбутні уроки' },
];

const MONTHS_SHORT = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'гру'];

function formatPaidAt(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDayShort(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '—', time: '—' };
  return {
    date: `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  };
}

function formatAmount(n: number, currency: string): string {
  const sym = currency === 'UAH' ? '₴' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  return `${sym}${Math.round(n).toLocaleString('uk-UA')}`;
}

export default function PaymentsPage() {
  const { session, status } = useSession();
  const teacherId =
    session?.profile.role === 'teacher'
      ? ((session.profile.teacherProfile as { documentId?: string } | null | undefined)?.documentId ?? null)
      : null;

  const [tab, setTab] = useState<'history' | 'upcoming'>('history');
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [upcoming, setUpcoming] = useState<SessionLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!teacherId) return;
    let alive = true;
    setLoading(true);
    setError(null);
    const year = today.getFullYear();
    const month = today.getMonth();
    Promise.all([
      fetchTeacherPayouts(),
      fetchTeacherMonthSessions(teacherId, year, month),
    ])
      .then(([ps, ss]) => {
        if (!alive) return;
        setPayouts(ps);
        const now = today.getTime();
        setUpcoming(ss.filter(s => new Date(s.startAt).getTime() >= now));
      })
      .catch(e => { if (alive) setError(e?.message ?? 'Не вдалось завантажити дані'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [teacherId, today]);

  const currency = payouts[0]?.currency ?? 'UAH';

  const currentMonthPayout = useMemo(() => {
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    return payouts.find(p => p.periodYear === y && p.periodMonth === m) ?? null;
  }, [payouts, today]);

  const totalPaid = useMemo(
    () => payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0),
    [payouts],
  );
  const pendingAmount = useMemo(
    () => payouts.filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((s, p) => s + p.total, 0),
    [payouts],
  );

  const nextMonthRate = currentMonthPayout?.ratePerLesson ?? payouts[0]?.ratePerLesson ?? 0;

  function exportPayoutsCsv() {
    if (payouts.length === 0) return;
    const header = ['Період', 'Уроків', 'Ставка', 'Сума', 'Валюта', 'Статус', 'Виплата', 'Нотатка'];
    const rows = payouts.map(p => [
      periodLabel(p),
      String(p.lessonsCount),
      String(p.ratePerLesson),
      String(p.total),
      p.currency,
      STATUS_CONFIG[p.status].label,
      formatPaidAt(p.paidAt),
      p.note ?? '',
    ]);
    const csv = '\uFEFF' + [header, ...rows]
      .map(row => row.map(c => /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c).join(','))
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (status === 'loading') {
    return <DashboardPageShell title="Виплати" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }
  if (status === 'anonymous') {
    return (
      <DashboardPageShell
        title="Виплати"
        status="empty"
        empty={{ title: 'Потрібно увійти', description: 'Щоб побачити виплати, увійдіть у свій акаунт.' }}
      />
    );
  }
  if (!teacherId) {
    return (
      <DashboardPageShell
        title="Виплати"
        status="empty"
        empty={{ title: 'Недоступно', description: 'Розділ виплат — лише для вчителів.' }}
      />
    );
  }

  return (
    <DashboardPageShell title="Виплати" subtitle="Ваші заробітки та графік виплат">
      {error && (
        <Card variant="outline" padding="sm" className="text-[13px] text-danger border-danger/30">{error}</Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-card bg-primary/[0.06] border border-primary/25 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark/70">
            {currentMonthPayout ? periodLabel(currentMonthPayout) : '—'}
          </p>
          <p className="text-[28px] font-semibold tabular-nums leading-none mt-1 text-primary-dark">
            {currentMonthPayout ? formatAmount(currentMonthPayout.total, currentMonthPayout.currency) : formatAmount(0, currency)}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/20 text-[12px] text-ink-muted tabular-nums">
            <span>{currentMonthPayout?.lessonsCount ?? 0} уроків</span>
            <span className="w-px h-3 bg-primary/25" />
            <span>{formatAmount(currentMonthPayout?.ratePerLesson ?? 0, currency)}/урок</span>
          </div>
          <p className="text-[11px] mt-2 text-ink-muted">
            {currentMonthPayout?.status === 'paid' ? `Виплачено ${formatPaidAt(currentMonthPayout.paidAt)}` : 'Очікується виплата'}
          </p>
        </div>

        <Card variant="surface" padding="sm">
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">До виплати</p>
          <p className="text-[22px] font-semibold text-ink tabular-nums leading-none mt-1">
            {formatAmount(pendingAmount, currency)}
          </p>
          <p className="text-[11px] text-ink-muted mt-2 tabular-nums">
            {payouts.filter(p => p.status === 'pending' || p.status === 'processing').length} період(ів)
          </p>
        </Card>

        <Card variant="surface" padding="sm">
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Всього зароблено</p>
          <p className="text-[22px] font-semibold text-ink tabular-nums leading-none mt-1">
            {formatAmount(totalPaid + pendingAmount, currency)}
          </p>
          <p className="text-[11px] text-ink-muted mt-2">за весь час роботи</p>
        </Card>
      </div>

      <SegmentedControl value={tab} onChange={setTab} options={TAB_OPTIONS} label="Розділ" />

      {tab === 'history' && (
        <Card variant="surface" padding="none" className="overflow-hidden">
          {loading && payouts.length === 0 ? (
            <div className="px-5 py-10 text-center text-ink-muted text-[13px]">Завантаження…</div>
          ) : payouts.length === 0 ? (
            <div className="px-5 py-10 text-center text-ink-muted text-[13px]">
              Історія виплат порожня. Перші записи з&apos;являться після першої виплати.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Період</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Уроків</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Ставка</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Сума</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Статус</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Виплата</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => {
                    const cfg = STATUS_CONFIG[p.status];
                    return (
                      <tr key={p.documentId} className="border-t border-border hover:bg-surface-muted/40 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-[13px] font-semibold text-ink">{periodLabel(p)}</p>
                          {p.note && <p className="text-[11px] text-ink-muted">{p.note}</p>}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] text-ink tabular-nums">{p.lessonsCount}</td>
                        <td className="px-4 py-3 text-right text-[13px] text-ink-muted tabular-nums">{formatAmount(p.ratePerLesson, p.currency)}</td>
                        <td className="px-4 py-3 text-right text-[13px] font-semibold text-ink tabular-nums">{formatAmount(p.total, p.currency)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
                            <span className={`ios-dot ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-[12px] text-ink-muted tabular-nums whitespace-nowrap">
                          {formatPaidAt(p.paidAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-5 py-2.5 border-t border-border bg-surface-muted/50 flex items-center justify-between text-[11px] text-ink-muted">
            <span>Виплати до 5-го числа наступного місяця</span>
            <Button
              variant="link"
              size="sm"
              disabled={payouts.length === 0}
              onClick={exportPayoutsCsv}
            >
              Експортувати CSV
            </Button>
          </div>
        </Card>
      )}

      {tab === 'upcoming' && (
        <Card variant="surface" padding="none" className="overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[13px] font-semibold text-ink">
              Цей місяць · {upcoming.length} запланованих
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5 tabular-nums">
              Прогноз: ≈ {formatAmount(upcoming.length * nextMonthRate, currency)}
            </p>
          </div>
          {loading && upcoming.length === 0 ? (
            <div className="px-5 py-10 text-center text-ink-muted text-[13px]">Завантаження…</div>
          ) : upcoming.length === 0 ? (
            <div className="px-5 py-10 text-center text-ink-muted text-[13px]">Немає запланованих уроків.</div>
          ) : (
            <ul>
              {upcoming.map(s => {
                const { date, time } = formatDayShort(s.startAt);
                const student = s.attendees[0];
                const level = student ? asLevel(student.level) : null;
                const studentLabel = student?.displayName ?? s.title ?? '—';
                return (
                  <li key={s.documentId} className="flex items-center justify-between gap-4 px-5 py-3 border-t border-border first:border-t-0 hover:bg-surface-muted/40 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex flex-col items-center w-14 flex-shrink-0 tabular-nums text-center">
                        <span className="text-[11px] text-ink-muted">{date}</span>
                        <span className="text-[13px] font-semibold text-ink">{time}</span>
                      </div>
                      <div className="w-px h-7 bg-border flex-shrink-0" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink truncate">{studentLabel}</p>
                        {level && <LevelBadge level={level} />}
                      </div>
                    </div>
                    <span className="text-[13px] font-semibold text-ink tabular-nums flex-shrink-0">
                      +{formatAmount(nextMonthRate, currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </DashboardPageShell>
  );
}
