'use client';
import { useState } from 'react';

/* ─── Мок-дані ───────────────────────────────── */
const MONTHLY_REVENUE = [
  { month: 'Жовт',   revenue: 48200, lessons: 281, students: 87  },
  { month: 'Лист',   revenue: 52100, lessons: 304, students: 94  },
  { month: 'Груд',   revenue: 49800, lessons: 291, students: 89  },
  { month: 'Січ',    revenue: 55400, lessons: 323, students: 102 },
  { month: 'Лют',    revenue: 58900, lessons: 344, students: 108 },
  { month: 'Бер',    revenue: 61200, lessons: 357, students: 113 },
];

const TOP_TEACHERS = [
  { name: 'Maria S.',  photo: 'https://randomuser.me/api/portraits/women/65.jpg', students: 24, rating: 4.8, revenue: 12240 },
  { name: 'Olga K.',   photo: 'https://randomuser.me/api/portraits/women/44.jpg', students: 18, rating: 4.9, revenue: 8840 },
  { name: 'Dmytro P.', photo: 'https://randomuser.me/api/portraits/men/32.jpg',   students: 21, rating: 4.8, revenue: 11210 },
  { name: 'Anna V.',   photo: 'https://randomuser.me/api/portraits/women/23.jpg', students: 15, rating: 4.9, revenue: 8610 },
];

const LEVEL_DIST = [
  { level: 'A0', label: 'Стартер',  count: 31, color: 'bg-danger/70',   textColor: 'text-danger-dark', pct: 27 },
  { level: 'A1', label: 'Базовий',  count: 42, color: 'bg-accent',      textColor: 'text-accent-dark', pct: 37 },
  { level: 'A2', label: 'Перед.',   count: 18, color: 'bg-accent-dark', textColor: 'text-accent-dark', pct: 16 },
  { level: 'B1', label: 'Середній', count: 14, color: 'bg-success',     textColor: 'text-success-dark',pct: 12 },
  { level: 'B2', label: 'Впевнений',count:  8, color: 'bg-purple',      textColor: 'text-purple-dark', pct: 8  },
];

const RECENT_EVENTS = [
  { icon: '👤', text: 'Новий учень — Аліса К. (A0)',      time: '2 год тому' },
  { icon: '💰', text: 'Поповнення ₴1 500 — Микола С.',     time: '4 год тому' },
  { icon: '⭐', text: 'Відгук 5★ — Olga K. від батьків',   time: '6 год тому' },
  { icon: '👩‍🏫', text: 'Новий вчитель — Iryna M. (Пробний)', time: 'Вчора' },
  { icon: '💰', text: 'Поповнення ₴750 — Павло Р.',         time: 'Вчора' },
  { icon: '⚠️', text: 'Низький баланс — Дарина П. (3 уроки)', time: '2 дні тому' },
];

/* ─── Хелпери ────────────────────────────────── */
const maxRevenue = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));

/* ─── Компонент ──────────────────────────────── */
export default function AnalyticsPage() {
  const [revenueView, setRevenueView] = useState<'revenue' | 'lessons' | 'students'>('revenue');

  const current  = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1];
  const previous = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 2];
  const revGrowth = (((current.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1);
  const stuGrowth = (((current.students - previous.students) / previous.students) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-6">

      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-black text-ink">Аналітика</h1>
        <p className="text-ink-muted mt-0.5 text-sm">Березень 2026 · оновлено сьогодні</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Дохід / міс', value: `₴ ${current.revenue.toLocaleString()}`,
            sub: `+${revGrowth}% vs лютий`, positive: true, emoji: '💰',
          },
          {
            label: 'Учнів активних', value: current.students,
            sub: `+${stuGrowth}% vs лютий`, positive: true, emoji: '👥',
          },
          {
            label: 'Уроків / міс', value: current.lessons,
            sub: `+${current.lessons - previous.lessons} vs лютий`, positive: true, emoji: '📅',
          },
          {
            label: 'Ср. рейтинг вчителів', value: '4.85',
            sub: '18 відгуків за місяць', positive: true, emoji: '⭐',
          },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-black text-ink-muted uppercase tracking-wide">{kpi.label}</p>
              <span className="text-xl">{kpi.emoji}</span>
            </div>
            <p className="text-2xl font-black text-ink">{kpi.value}</p>
            <p className={`text-xs mt-1 font-semibold ${kpi.positive ? 'text-primary-dark' : 'text-danger'}`}>
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Нижній ряд: графік + розподіл рівнів */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Графік доходу */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-black text-ink">Динаміка за 6 місяців</h2>
            <div className="flex gap-1 p-1 bg-surface-muted rounded-xl">
              {([['revenue', 'Дохід'], ['lessons', 'Уроки'], ['students', 'Учні']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRevenueView(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    revenueView === key ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Бар-чарт */}
          <div className="flex items-end gap-3 h-48 pt-4">
            {MONTHLY_REVENUE.map((m, i) => {
              const val   = revenueView === 'revenue' ? m.revenue : revenueView === 'lessons' ? m.lessons * 100 : m.students * 500;
              const max   = revenueView === 'revenue' ? maxRevenue : revenueView === 'lessons' ? Math.max(...MONTHLY_REVENUE.map(x => x.lessons)) * 100 : Math.max(...MONTHLY_REVENUE.map(x => x.students)) * 500;
              const pct   = Math.round((val / max) * 100);
              const isLast = i === MONTHLY_REVENUE.length - 1;

              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-black text-ink-muted">
                    {revenueView === 'revenue'
                      ? `₴${Math.round(m.revenue / 1000)}к`
                      : revenueView === 'lessons'
                      ? m.lessons
                      : m.students}
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all ${isLast ? 'bg-gradient-to-t from-primary to-primary-dark' : 'bg-surface-muted'}`}
                    style={{ height: `${pct}%` }}
                    role="img"
                    aria-label={`${m.month}: ${m.revenue}`}
                  />
                  <span className="text-xs text-ink-muted font-semibold">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Розподіл за рівнями */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
          <h2 className="font-black text-ink">Розподіл учнів за рівнями</h2>
          <div className="flex flex-col gap-3">
            {LEVEL_DIST.map(l => (
              <div key={l.level}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.color} flex-shrink-0`} />
                    <span className="text-sm font-semibold text-ink">{l.level} — {l.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-ink">{l.count}</span>
                    <span className="text-xs text-ink-muted">{l.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${l.color} rounded-full`}
                    style={{ width: `${l.pct}%` }}
                    role="progressbar"
                    aria-valuenow={l.pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-ink-muted">Всього учнів: <span className="font-black text-ink">113</span></p>
          </div>
        </div>
      </div>

      {/* Нижній ряд: топ вчителі + стрічка подій */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Топ вчителі */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-black text-ink">Топ вчителі за доходом</h2>
            <p className="text-xs text-ink-muted mt-0.5">Березень 2026</p>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[360px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-2.5 text-xs font-black text-ink-muted uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-black text-ink-muted uppercase tracking-wide">Вчитель</th>
                <th className="text-left px-4 py-2.5 text-xs font-black text-ink-muted uppercase tracking-wide">Учнів</th>
                <th className="text-left px-4 py-2.5 text-xs font-black text-ink-muted uppercase tracking-wide">Дохід</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TOP_TEACHERS.sort((a, b) => b.revenue - a.revenue).map((t, i) => (
                <tr key={t.name} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`text-sm font-black ${i === 0 ? 'text-accent' : 'text-ink-muted'}`}>
                      {i === 0 ? '🏆' : `#${i + 1}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.photo} alt={t.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{t.name}</p>
                        <p className="text-xs text-accent">★ {t.rating}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-ink">{t.students}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-black text-primary-dark">₴ {t.revenue.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Стрічка подій */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-black text-ink">Останні події</h2>
          </div>
          <ul className="divide-y divide-border">
            {RECENT_EVENTS.map((e, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-muted/50 transition-colors">
                <span className="text-lg flex-shrink-0 mt-0.5">{e.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink font-medium">{e.text}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{e.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
