'use client';
import { useState } from 'react';
import { LevelBadge, PageHeader, SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import type { Level } from '@/lib/teacher-mocks';

type PaymentStatus = 'paid' | 'pending' | 'processing';

interface PaymentRow {
  id: string;
  period: string;
  desc: string;
  lessonsCount: number;
  ratePerLesson: number;
  total: number;
  status: PaymentStatus;
  paidAt?: string;
}

const PAYMENTS: PaymentRow[] = [
  { id: 'p1', period: 'Березень 2026',  desc: 'Виплата за березень',  lessonsCount: 42, ratePerLesson: 180, total: 7560, status: 'pending' },
  { id: 'p2', period: 'Лютий 2026',     desc: 'Виплата за лютий',     lessonsCount: 38, ratePerLesson: 180, total: 6840, status: 'paid', paidAt: '5 бер 2026' },
  { id: 'p3', period: 'Січень 2026',    desc: 'Виплата за січень',    lessonsCount: 35, ratePerLesson: 175, total: 6125, status: 'paid', paidAt: '4 лют 2026' },
  { id: 'p4', period: 'Грудень 2025',   desc: 'Виплата за грудень',   lessonsCount: 41, ratePerLesson: 175, total: 7175, status: 'paid', paidAt: '6 січ 2026' },
  { id: 'p5', period: 'Листопад 2025',  desc: 'Виплата за листопад',  lessonsCount: 37, ratePerLesson: 170, total: 6290, status: 'paid', paidAt: '5 гру 2025' },
  { id: 'p6', period: 'Жовтень 2025',   desc: 'Виплата за жовтень',   lessonsCount: 40, ratePerLesson: 170, total: 6800, status: 'paid', paidAt: '6 лист 2025' },
];

const UPCOMING_LESSONS: ReadonlyArray<{ date: string; time: string; student: string; level: Level }> = [
  { date: '1 квіт', time: '18:00', student: 'Микола С.',  level: 'A1' },
  { date: '2 квіт', time: '16:00', student: 'Аліса К.',   level: 'A0' },
  { date: '3 квіт', time: '18:00', student: 'Дарина П.',  level: 'A2' },
  { date: '4 квіт', time: '17:00', student: 'Мартина З.', level: 'A1' },
];

const STATUS_CONFIG: Record<PaymentStatus, { label: string; dot: string }> = {
  paid:       { label: 'Виплачено',  dot: 'ios-dot-positive' },
  pending:    { label: 'Очікується', dot: 'ios-dot-warn' },
  processing: { label: 'В обробці',  dot: 'ios-dot-info' },
};

const TAB_OPTIONS: ReadonlyArray<SegmentedControlOption<'history' | 'upcoming'>> = [
  { value: 'history',  label: 'Історія виплат' },
  { value: 'upcoming', label: 'Майбутні уроки' },
];

export default function PaymentsPage() {
  const [tab, setTab] = useState<'history' | 'upcoming'>('history');

  const totalEarned   = PAYMENTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);
  const pendingAmount = PAYMENTS.filter(p => p.status === 'pending').reduce((s, p) => s + p.total, 0);
  const currentMonth  = PAYMENTS.find(p => p.period === 'Березень 2026');

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Виплати" subtitle="Ваші заробітки та графік виплат" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-[14px] bg-primary/[0.06] border border-primary/25 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark/70">Березень 2026</p>
          <p className="text-[28px] font-semibold tabular-nums leading-none mt-1 text-primary-dark">₴{currentMonth?.total.toLocaleString('uk-UA')}</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/20 text-[12px] text-ink-muted tabular-nums">
            <span>{currentMonth?.lessonsCount} уроків</span>
            <span className="w-px h-3 bg-primary/25" />
            <span>₴{currentMonth?.ratePerLesson}/урок</span>
          </div>
          <p className="text-[11px] mt-2 text-ink-muted">Очікується виплата</p>
        </div>

        <div className="ios-card p-4">
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">До виплати</p>
          <p className="text-[22px] font-semibold text-ink tabular-nums leading-none mt-1">₴{pendingAmount.toLocaleString('uk-UA')}</p>
          <p className="text-[11px] text-ink-muted mt-2 tabular-nums">виплата ~5 квіт 2026</p>
        </div>

        <div className="ios-card p-4">
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Всього зароблено</p>
          <p className="text-[22px] font-semibold text-ink tabular-nums leading-none mt-1">
            ₴{(totalEarned + pendingAmount).toLocaleString('uk-UA')}
          </p>
          <p className="text-[11px] text-ink-muted mt-2">за весь час роботи</p>
        </div>
      </div>

      <SegmentedControl value={tab} onChange={setTab} options={TAB_OPTIONS} label="Розділ" />

      {tab === 'history' && (
        <div className="ios-card overflow-hidden">
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
                {PAYMENTS.map(p => {
                  const { label, dot } = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-surface-muted/40 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-[13px] font-semibold text-ink">{p.period}</p>
                        <p className="text-[11px] text-ink-muted">{p.desc}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] text-ink tabular-nums">{p.lessonsCount}</td>
                      <td className="px-4 py-3 text-right text-[13px] text-ink-muted tabular-nums">₴{p.ratePerLesson}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-semibold text-ink tabular-nums">₴{p.total.toLocaleString('uk-UA')}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
                          <span className={`ios-dot ${dot}`} />
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-[12px] text-ink-muted tabular-nums whitespace-nowrap">{p.paidAt ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 border-t border-border bg-surface-muted/50 flex items-center justify-between text-[11px] text-ink-muted">
            <span>Виплати до 5-го числа наступного місяця</span>
            <button className="font-semibold text-ink hover:underline underline-offset-2">Завантажити PDF</button>
          </div>
        </div>
      )}

      {tab === 'upcoming' && (
        <div className="ios-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-[13px] font-semibold text-ink">Квітень 2026 · {UPCOMING_LESSONS.length} запланованих уроки</p>
            <p className="text-[11px] text-ink-muted mt-0.5 tabular-nums">
              Прогноз: ≈ ₴{(UPCOMING_LESSONS.length * (currentMonth?.ratePerLesson ?? 180) * 8).toLocaleString('uk-UA')} за місяць
            </p>
          </div>
          <ul>
            {UPCOMING_LESSONS.map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-4 px-5 py-3 border-t border-border first:border-t-0 hover:bg-surface-muted/40 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex flex-col items-center w-14 flex-shrink-0 tabular-nums text-center">
                    <span className="text-[11px] text-ink-muted">{l.date}</span>
                    <span className="text-[13px] font-semibold text-ink">{l.time}</span>
                  </div>
                  <div className="w-px h-7 bg-border flex-shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{l.student}</p>
                    <LevelBadge level={l.level} />
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-ink tabular-nums flex-shrink-0">+₴{currentMonth?.ratePerLesson}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
