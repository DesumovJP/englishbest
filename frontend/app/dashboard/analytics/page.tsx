'use client';
import { useEffect, useMemo, useState } from 'react';
import { TeacherAnalytics } from '@/components/teacher/TeacherAnalytics';
import { SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useSession } from '@/lib/session-context';
import {
  fetchAdminAnalyticsCached,
  peekAdminAnalytics,
  type AdminAnalyticsData,
} from '@/lib/analytics';

type Metric = 'revenue' | 'lessons' | 'students';

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

const LEVEL_LABEL: Record<string, string> = {
  A0: 'Стартер',
  A1: 'Базовий',
  A2: 'Перед-середній',
  B1: 'Середній',
  B2: 'Впевнений',
  C1: 'Просунутий',
  C2: 'Майстер',
};

function formatBarValue(metric: Metric, v: number) {
  if (metric === 'revenue') return v >= 1000 ? `₴${Math.round(v / 1000)}к` : `₴${v}`;
  return String(v);
}

function formatFullAmount(n: number) {
  return `₴${n.toLocaleString('uk-UA')}`;
}

export default function AnalyticsPage() {
  const { session, status } = useSession();
  const role = session?.profile?.role ?? null;

  const cachedAnalytics = useMemo(
    () => (role === 'admin' ? peekAdminAnalytics() : null),
    [role],
  );

  const [metric, setMetric] = useState<Metric>('revenue');
  const [data, setData] = useState<AdminAnalyticsData | null>(cachedAnalytics ?? null);
  const [loading, setLoading] = useState(role === 'admin' && cachedAnalytics === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'admin') return;
    let alive = true;
    setError(null);
    fetchAdminAnalyticsCached()
      .then(d => { if (alive) setData(d); })
      .catch(e => { if (alive) setError(e?.message ?? 'Не вдалось завантажити'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [role]);

  const months = data?.timeSeries ?? [];
  const current  = months[months.length - 1];
  const previous = months[months.length - 2];

  const { min, max } = useMemo(() => {
    if (months.length === 0) return { min: 0, max: 0 };
    const vals = months.map(m => m[metric]);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [months, metric]);

  if (status === 'loading') {
    return <DashboardPageShell title="Аналітика" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }
  if (status === 'anonymous' || !role) {
    return (
      <DashboardPageShell
        title="Аналітика"
        status="empty"
        empty={{ title: 'Потрібно увійти', description: 'Щоб побачити аналітику, увійдіть у свій акаунт.' }}
      />
    );
  }
  if (role === 'teacher') return <TeacherAnalytics />;
  if (role !== 'admin') {
    return (
      <DashboardPageShell
        title="Аналітика"
        status="empty"
        empty={{ title: 'Недоступно', description: 'Аналітика платформи — лише для адміністраторів.' }}
      />
    );
  }
  if (loading && !data) {
    return <DashboardPageShell title="Аналітика" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }
  if (error) {
    return (
      <DashboardPageShell
        title="Аналітика"
        status="error"
        error={error}
      />
    );
  }
  if (!data) return null;

  const { kpis, topTeachers, levelBuckets } = data;

  const revGrowth = previous && previous.revenue > 0
    ? (((current!.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1)
    : null;
  const stuGrowth = previous && previous.students > 0
    ? (((current!.students - previous.students) / previous.students) * 100).toFixed(1)
    : null;
  const lessonsDelta = previous ? current!.lessons - previous.lessons : 0;

  const kpiCards: ReadonlyArray<{ label: string; value: string; delta: string }> = [
    {
      label: 'Дохід / міс',
      value: formatFullAmount(kpis.revenueThisMonth),
      delta: revGrowth !== null ? `${revGrowth.startsWith('-') ? '' : '+'}${revGrowth}% до минулого` : 'Недостатньо історії',
    },
    {
      label: 'Активних учнів',
      value: String(kpis.activeStudents),
      delta: stuGrowth !== null ? `${stuGrowth.startsWith('-') ? '' : '+'}${stuGrowth}% до минулого` : `${kpis.learnersTotal} всього`,
    },
    {
      label: 'Уроків / міс',
      value: String(kpis.lessonsThisMonth),
      delta: previous ? `${lessonsDelta >= 0 ? '+' : ''}${lessonsDelta} до минулого` : 'Недостатньо історії',
    },
    {
      label: 'Рейтинг вчителів',
      value: kpis.avgRating !== null ? kpis.avgRating.toFixed(2) : '—',
      delta: `${kpis.reviewsTotal} відгуків · ${kpis.teachersTotal} вчителів`,
    },
  ];

  return (
    <DashboardPageShell title="Аналітика" subtitle="Платформа · 6 місяців">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map(k => (
          <Card key={k.label} variant="surface" padding="sm">
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{k.label}</p>
            <p className="text-[22px] font-semibold text-ink mt-1 tabular-nums leading-none">{k.value}</p>
            <p className="text-[11px] text-ink-muted mt-2 tabular-nums">{k.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Card variant="surface" className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Динаміка за 6 місяців</h2>
              <p className="text-[12px] text-ink-muted mt-0.5">{METRIC_LABEL[metric]}</p>
            </div>
            <SegmentedControl value={metric} onChange={setMetric} options={METRIC_OPTIONS} label="Метрика" />
          </div>

          <div className="flex items-stretch gap-3 h-56 pt-2">
            {months.map((m, i) => {
              const val = m[metric];
              const range = max - min || 1;
              const pct = val === 0 && max === 0 ? 0 : 22 + Math.round(((val - min) / range) * 78);
              const isLast = i === months.length - 1;
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] font-semibold text-ink tabular-nums mb-1">
                    {formatBarValue(metric, val)}
                  </span>
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-[height] ${isLast ? 'bg-primary' : 'bg-surface-muted'}`}
                      style={{ height: `${pct}%` }}
                      role="img"
                      aria-label={`${m.label}: ${val}`}
                    />
                  </div>
                  <span className="text-[10px] text-ink-faint font-semibold mt-2">{m.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card variant="surface" className="flex flex-col gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Розподіл за рівнями</h2>
            <p className="text-[12px] text-ink-muted mt-0.5">
              Всього: <span className="font-semibold text-ink tabular-nums">{kpis.learnersTotal}</span> учнів
            </p>
          </div>
          {levelBuckets.length === 0 ? (
            <p className="text-[12px] text-ink-muted">Немає даних.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {levelBuckets.map(l => (
                <li key={l.level}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-semibold text-ink tabular-nums">{l.level}</span>
                      <span className="text-[12px] text-ink-muted truncate">{LEVEL_LABEL[l.level] ?? l.level}</span>
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
          )}
        </Card>
      </div>

      <Card variant="surface" padding="none" className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Топ вчителі</h2>
          <p className="text-[11px] text-ink-faint">За доходом · поточний місяць</p>
        </div>
        {topTeachers.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-ink-muted">
            Немає виплат за поточний місяць.
          </div>
        ) : (
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
              {topTeachers.map((t, i) => (
                <tr key={t.documentId} className="border-t border-border hover:bg-surface-muted/40 transition-colors">
                  <td className="px-5 py-2.5 text-[12px] font-semibold text-ink-muted tabular-nums">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={t.name} size="sm" className="bg-primary/15 text-primary-dark" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink truncate">{t.name}</p>
                        <p className="text-[11px] text-ink-muted tabular-nums">
                          {t.rating !== null ? `★ ${t.rating.toFixed(2)}` : 'Без рейтингу'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-[13px] text-ink tabular-nums">{t.students}</td>
                  <td className="px-5 py-2.5 text-right text-[13px] font-semibold text-ink tabular-nums">
                    {formatFullAmount(t.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </DashboardPageShell>
  );
}
