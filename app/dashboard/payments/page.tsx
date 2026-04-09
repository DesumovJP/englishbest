'use client';
import { useState } from 'react';

/* ─── Типи ───────────────────────────────────── */
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

/* ─── Мок-дані ───────────────────────────────── */
const PAYMENTS: PaymentRow[] = [
  { id: 'p1', period: 'Березень 2026',  desc: 'Виплата за березень',  lessonsCount: 42, ratePerLesson: 180, total: 7560, status: 'pending' },
  { id: 'p2', period: 'Лютий 2026',     desc: 'Виплата за лютий',     lessonsCount: 38, ratePerLesson: 180, total: 6840, status: 'paid',       paidAt: '5 бер 2026' },
  { id: 'p3', period: 'Січень 2026',    desc: 'Виплата за січень',    lessonsCount: 35, ratePerLesson: 175, total: 6125, status: 'paid',       paidAt: '4 лют 2026' },
  { id: 'p4', period: 'Грудень 2025',   desc: 'Виплата за грудень',   lessonsCount: 41, ratePerLesson: 175, total: 7175, status: 'paid',       paidAt: '6 січ 2026' },
  { id: 'p5', period: 'Листопад 2025',  desc: 'Виплата за листопад',  lessonsCount: 37, ratePerLesson: 170, total: 6290, status: 'paid',       paidAt: '5 гру 2025' },
  { id: 'p6', period: 'Жовтень 2025',   desc: 'Виплата за жовтень',   lessonsCount: 40, ratePerLesson: 170, total: 6800, status: 'paid',       paidAt: '6 лист 2025' },
];

const UPCOMING_LESSONS = [
  { date: '1 квіт', time: '18:00', student: 'Микола С.',  level: 'A1', levelColor: 'bg-accent/10 text-accent-dark' },
  { date: '2 квіт', time: '16:00', student: 'Аліса К.',   level: 'A0', levelColor: 'bg-danger/10 text-danger-dark' },
  { date: '3 квіт', time: '18:00', student: 'Дарина П.',  level: 'A2', levelColor: 'bg-accent/20 text-accent-dark' },
  { date: '4 квіт', time: '17:00', student: 'Мартина З.', level: 'A1', levelColor: 'bg-accent/10 text-accent-dark' },
];

const STATUS_CONFIG: Record<PaymentStatus, { label: string; cls: string }> = {
  paid:       { label: 'Виплачено',  cls: 'bg-primary/10 text-primary-dark' },
  pending:    { label: 'Очікується', cls: 'bg-accent/15 text-accent-dark' },
  processing: { label: 'В обробці',  cls: 'bg-secondary/15 text-secondary-dark' },
};

/* ─── Компонент ──────────────────────────────── */
export default function PaymentsPage() {
  const [tab, setTab] = useState<'history' | 'upcoming'>('history');

  const totalEarned   = PAYMENTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);
  const pendingAmount = PAYMENTS.filter(p => p.status === 'pending').reduce((s, p) => s + p.total, 0);
  const currentMonth  = PAYMENTS.find(p => p.period === 'Березень 2026');

  return (
    <div className="flex flex-col gap-6">

      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-black text-ink">Виплати</h1>
        <p className="text-ink-muted mt-0.5 text-sm">Ваші заробітки та графік виплат</p>
      </div>

      {/* Зведення */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Поточний місяць */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Березень 2026</p>
          <p className="text-4xl font-black leading-none">₴ {currentMonth?.total.toLocaleString()}</p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20 text-sm">
            <span className="text-white/70">{currentMonth?.lessonsCount} уроків</span>
            <span className="text-white/50">·</span>
            <span className="text-white/70">₴ {currentMonth?.ratePerLesson}/урок</span>
          </div>
          <div className="mt-3">
            <span className="inline-flex text-xs font-bold px-2.5 py-1 rounded-full bg-accent/20 text-white/80">
              Очікується виплата
            </span>
          </div>
        </div>

        {/* Очікується */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1">До виплати</p>
          <p className="text-3xl font-black text-accent-dark">₴ {pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-ink-muted mt-1">виплата ~5 квіт 2026</p>
        </div>

        {/* Всього */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1">Всього зароблено</p>
          <p className="text-3xl font-black text-ink">₴ {(totalEarned + pendingAmount).toLocaleString()}</p>
          <p className="text-xs text-ink-muted mt-1">за весь час роботи</p>
        </div>
      </div>

      {/* Таби */}
      <div className="flex gap-1 p-1 bg-surface-muted rounded-xl w-fit">
        {([['history', 'Історія виплат'], ['upcoming', 'Майбутні уроки']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === key ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Таблиця виплат */}
      {tab === 'history' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-surface-muted">
                  <th className="text-left px-5 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Період</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Уроків</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Ставка</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Сума</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-black text-ink-muted uppercase tracking-wide">Дата виплати</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PAYMENTS.map(p => {
                  const { label, cls } = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-ink">{p.period}</p>
                        <p className="text-xs text-ink-muted">{p.desc}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-ink">{p.lessonsCount}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-ink-muted">₴ {p.ratePerLesson}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-black text-ink">₴ {p.total.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-ink-muted">{p.paidAt ?? '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-surface-muted flex items-center justify-between text-xs text-ink-muted">
            <span>Виплати відбуваються до 5-го числа наступного місяця</span>
            <button className="font-bold text-primary-dark hover:underline">Завантажити PDF</button>
          </div>
        </div>
      )}

      {/* Майбутні уроки */}
      {tab === 'upcoming' && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="font-black text-ink">Квітень 2026 — {UPCOMING_LESSONS.length} запланованих уроки</p>
            <p className="text-xs text-ink-muted mt-0.5">Прогноз: ≈ ₴ {(UPCOMING_LESSONS.length * (currentMonth?.ratePerLesson ?? 180) * 8).toLocaleString()} за місяць</p>
          </div>
          <ul className="divide-y divide-border">
            {UPCOMING_LESSONS.map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-surface-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center w-12 flex-shrink-0 text-center">
                    <span className="text-xs text-ink-muted">{l.date.split(' ')[0]} {l.date.split(' ')[1]}</span>
                    <span className="text-sm font-black text-ink">{l.time}</span>
                  </div>
                  <div className="w-px h-8 bg-border flex-shrink-0" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-ink">{l.student}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.levelColor}`}>{l.level}</span>
                  </div>
                </div>
                <span className="text-sm font-black text-primary-dark">+ ₴ {currentMonth?.ratePerLesson}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
