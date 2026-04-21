'use client';
import { useEffect, useMemo, useState } from 'react';
import { TeacherAnalytics } from '@/components/teacher/TeacherAnalytics';
import { PageHeader, SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';

type Metric = 'revenue' | 'lessons' | 'students';

const MONTHLY = [
  { month: 'Жовт', revenue: 48200, lessons: 281, students: 87  },
  { month: 'Лист', revenue: 52100, lessons: 304, students: 94  },
  { month: 'Груд', revenue: 49800, lessons: 291, students: 89  },
  { month: 'Січ',  revenue: 55400, lessons: 323, students: 102 },
  { month: 'Лют',  revenue: 58900, lessons: 344, students: 108 },
  { month: 'Бер',  revenue: 61200, lessons: 357, students: 113 },
] as const;

const TOP_TEACHERS = [
  { name: 'Maria S.',  photo: 'https://randomuser.me/api/portraits/women/65.jpg', students: 24, rating: 4.8, revenue: 12240 },
  { name: 'Olga K.',   photo: 'https://randomuser.me/api/portraits/women/44.jpg', students: 18, rating: 4.9, revenue: 8840  },
  { name: 'Dmytro P.', photo: 'https://randomuser.me/api/portraits/men/32.jpg',   students: 21, rating: 4.8, revenue: 11210 },
  { name: 'Anna V.',   photo: 'https://randomuser.me/api/portraits/women/23.jpg', students: 15, rating: 4.9, revenue: 8610  },
];

const LEVEL_DIST = [
  { level: 'A0', label: 'Стартер',    count: 31, pct: 27 },
  { level: 'A1', label: 'Базовий',    count: 42, pct: 37 },
  { level: 'A2', label: 'Перед-сер.', count: 18, pct: 16 },
  { level: 'B1', label: 'Середній',   count: 14, pct: 12 },
  { level: 'B2', label: 'Впевнений',  count:  8, pct:  8 },
];

type EventKind = 'user' | 'money' | 'rating' | 'teacher' | 'warn';

const RECENT_EVENTS: ReadonlyArray<{ kind: EventKind; text: string; time: string }> = [
  { kind: 'user',    text: 'Новий учень — Аліса К. (A0)',         time: '2 год тому' },
  { kind: 'money',   text: 'Поповнення ₴1 500 — Микола С.',        time: '4 год тому' },
  { kind: 'rating',  text: 'Відгук 5★ — Olga K. від батьків',       time: '6 год тому' },
  { kind: 'teacher', text: 'Новий вчитель — Iryna M. (Пробний)',    time: 'Вчора' },
  { kind: 'money',   text: 'Поповнення ₴750 — Павло Р.',            time: 'Вчора' },
  { kind: 'warn',    text: 'Низький баланс — Дарина П. (3 уроки)', time: '2 дні тому' },
];

const METRIC_OPTIONS: ReadonlyArray<SegmentedControlOption<Metric>> = [
  { value: 'revenue',  label: 'Дохід' },
  { value: 'lessons',  label: 'Уроки' },
  { value: 'students', label: 'Учні' },
];

const METRIC_LABEL: Record<Metric, string> = {
  revenue:  'Дохід, ₴',
  lessons:  'Уроків',
  students: 'Активних учнів',
};

function formatValue(metric: Metric, v: number) {
  if (metric === 'revenue') return `₴${Math.round(v / 1000)}к`;
  return String(v);
}

function EventGlyph({ kind }: { kind: EventKind }) {
  const paths: Record<EventKind, React.ReactNode> = {
    user:    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 1116 0" />,
    money:   <><path d="M4 7h16v10H4z" /><circle cx="12" cy="12" r="2.5" /></>,
    rating:  <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3z" />,
    teacher: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0114 0" /><path d="M17 4l2 2-2 2" /></>,
    warn:    <><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5" /><circle cx="12" cy="18" r=".6" /></>,
  };
  return (
    <span className="w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0">
      <svg className="w-3.5 h-3.5 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        {paths[kind]}
      </svg>
    </span>
  );
}

export default function AnalyticsPage() {
  const [metric, setMetric] = useState<Metric>('revenue');
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const demo = localStorage.getItem('demo_role');
    const sidebar = localStorage.getItem('sidebar_role');
    setIsTeacher(demo === 'teacher' || sidebar === 'teacher');
  }, []);

  const current  = MONTHLY[MONTHLY.length - 1];
  const previous = MONTHLY[MONTHLY.length - 2];
  const revGrowth = (((current.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1);
  const stuGrowth = (((current.students - previous.students) / previous.students) * 100).toFixed(1);

  const { min, max } = useMemo(() => {
    const vals = MONTHLY.map(m => m[metric]);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [metric]);
  const sortedTeachers = useMemo(() => [...TOP_TEACHERS].sort((a, b) => b.revenue - a.revenue), []);

  if (isTeacher) return <TeacherAnalytics />;

  const kpis: ReadonlyArray<{ label: string; value: string; delta: string }> = [
    { label: 'Дохід / міс',     value: `₴${current.revenue.toLocaleString('uk-UA')}`, delta: `+${revGrowth}% до лютого` },
    { label: 'Активних учнів',  value: String(current.students),                      delta: `+${stuGrowth}% до лютого` },
    { label: 'Уроків / міс',    value: String(current.lessons),                       delta: `+${current.lessons - previous.lessons} до лютого` },
    { label: 'Рейтинг вчителів',value: '4,85',                                        delta: '18 відгуків за місяць' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Аналітика" subtitle="Березень 2026 · оновлено сьогодні" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="ios-card p-4">
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{k.label}</p>
            <p className="text-[22px] font-semibold text-ink mt-1 tabular-nums leading-none">{k.value}</p>
            <p className="text-[11px] text-ink-muted mt-2 tabular-nums">{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="ios-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Динаміка за 6 місяців</h2>
              <p className="text-[12px] text-ink-muted mt-0.5">{METRIC_LABEL[metric]}</p>
            </div>
            <SegmentedControl value={metric} onChange={setMetric} options={METRIC_OPTIONS} label="Метрика" />
          </div>

          <div className="flex items-stretch gap-3 h-56 pt-2">
            {MONTHLY.map((m, i) => {
              const val = m[metric];
              const range = max - min || 1;
              const pct = 22 + Math.round(((val - min) / range) * 78);
              const isLast = i === MONTHLY.length - 1;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] font-semibold text-ink tabular-nums mb-1">
                    {formatValue(metric, val)}
                  </span>
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-[height] ${isLast ? 'bg-primary' : 'bg-surface-muted'}`}
                      style={{ height: `${pct}%` }}
                      role="img"
                      aria-label={`${m.month}: ${val}`}
                    />
                  </div>
                  <span className="text-[10px] text-ink-faint font-semibold mt-2">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ios-card p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Розподіл за рівнями</h2>
            <p className="text-[12px] text-ink-muted mt-0.5">Всього: <span className="font-semibold text-ink tabular-nums">113</span> учнів</p>
          </div>
          <ul className="flex flex-col gap-3">
            {LEVEL_DIST.map(l => (
              <li key={l.level}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-semibold text-ink tabular-nums">{l.level}</span>
                    <span className="text-[12px] text-ink-muted truncate">{l.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 tabular-nums flex-shrink-0">
                    <span className="text-[13px] font-semibold text-ink">{l.count}</span>
                    <span className="text-[10px] text-ink-faint">{l.pct}%</span>
                  </div>
                </div>
                <div className="h-1 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${l.pct}%` }}
                    role="progressbar"
                    aria-valuenow={l.pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ios-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold text-ink">Топ вчителі</h2>
            <p className="text-[11px] text-ink-faint">За доходом · березень</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2 text-[10px] font-semibold text-ink-faint uppercase tracking-wider w-12">#</th>
                <th className="text-left px-4 py-2 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Вчитель</th>
                <th className="text-right px-4 py-2 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Учнів</th>
                <th className="text-right px-5 py-2 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Дохід</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeachers.map((t, i) => (
                <tr key={t.name} className="border-t border-border hover:bg-surface-muted/40 transition-colors">
                  <td className="px-5 py-2.5 text-[12px] font-semibold text-ink-muted tabular-nums">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.photo} alt={t.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink truncate">{t.name}</p>
                        <p className="text-[11px] text-ink-muted tabular-nums">★ {t.rating}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[13px] text-ink tabular-nums">{t.students}</td>
                  <td className="px-5 py-2.5 text-right text-[13px] font-semibold text-ink tabular-nums">
                    ₴{t.revenue.toLocaleString('uk-UA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ios-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-[15px] font-semibold text-ink">Останні події</h2>
          </div>
          <ul>
            {RECENT_EVENTS.map((e, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3 border-t border-border first:border-t-0 hover:bg-surface-muted/40 transition-colors">
                <EventGlyph kind={e.kind} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-ink leading-snug">{e.text}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">{e.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
