'use client';
import { useEffect, useMemo, useState } from 'react';
import { LevelBadge, PageHeader, SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';
import {
  fetchTeacherAnalyticsCached,
  peekTeacherAnalytics,
  type TeacherAnalyticsData,
  type Level,
} from '@/lib/analytics';

type Metric = 'lessons' | 'homework' | 'grade';

const METRIC_OPTIONS: ReadonlyArray<SegmentedControlOption<Metric>> = [
  { value: 'lessons',  label: 'Уроки' },
  { value: 'homework', label: 'ДЗ'    },
  { value: 'grade',    label: 'Бал'   },
];

const METRIC_LABEL: Record<Metric, string> = {
  lessons:  'Уроків',
  homework: 'ДЗ перевірено',
  grade:    'Середній бал (за 12-бальною шкалою)',
};

function formatGrade(n: number | null | undefined): string {
  return typeof n === 'number' ? n.toFixed(1) : '—';
}

function metricValue(point: TeacherAnalyticsData['timeSeries'][number], metric: Metric): number {
  if (metric === 'lessons') return point.lessons;
  if (metric === 'homework') return point.homeworkGraded;
  return point.avgGrade ?? 0;
}

export function TeacherAnalytics() {
  const [metric, setMetric] = useState<Metric>('lessons');
  const [data, setData] = useState<TeacherAnalyticsData | null>(() => peekTeacherAnalytics() ?? null);
  const [loading, setLoading] = useState(() => peekTeacherAnalytics() === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    fetchTeacherAnalyticsCached()
      .then(d => { if (alive) setData(d); })
      .catch(e => { if (alive) setError(e?.message ?? 'Не вдалось завантажити'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const months = data?.timeSeries ?? [];
  const current  = months[months.length - 1];
  const previous = months[months.length - 2];

  const { delta, deltaPct } = useMemo(() => {
    if (!current || !previous) return { delta: 0, deltaPct: 0 };
    const cur = metricValue(current, metric);
    const prev = metricValue(previous, metric);
    const d = cur - prev;
    const p = prev > 0 ? Math.round((d / prev) * 100) : 0;
    return { delta: d, deltaPct: p };
  }, [current, previous, metric]);

  const { min, max } = useMemo(() => {
    if (months.length === 0) return { min: 0, max: 0 };
    const vals = months.map(m => metricValue(m, metric));
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [months, metric]);

  const totalLearners = useMemo(
    () => (data?.levelBuckets ?? []).reduce((acc, b) => acc + b.count, 0),
    [data],
  );

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Моя аналітика" subtitle="Завантаження…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Моя аналітика" subtitle="Помилка завантаження" />
        <div className="ios-card px-5 py-5 text-[13px] text-danger border-danger/30">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, levelBuckets, honorRoll } = data;

  const kpiCards: ReadonlyArray<{ label: string; value: string; delta: string }> = [
    {
      label: 'Уроків / місяць',
      value: String(kpis.lessonsThisMonth),
      delta: previous ? `${deltaPct >= 0 ? '+' : ''}${deltaPct}% до минулого` : '—',
    },
    {
      label: 'ДЗ на перевірці',
      value: String(kpis.pendingHomework),
      delta: kpis.pendingHomework > 0 ? 'Потребують уваги' : 'Усе перевірено',
    },
    {
      label: 'Відвідуваність',
      value: kpis.attendancePct !== null ? `${kpis.attendancePct}%` : '—',
      delta: 'Зважене: present 1, late/excused 0.5',
    },
    {
      label: 'Середній бал',
      value: kpis.avgGrade !== null ? `${kpis.avgGrade.toFixed(1)} / 12` : '—',
      delta: '6-місячне вікно',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Моя аналітика"
        subtitle="Персональна статистика · 6 місяців"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map(k => (
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
            {months.map((m, i) => {
              const val = metricValue(m, metric);
              const range = max - min || 1;
              const pct = val === 0 && max === 0 ? 0 : 22 + Math.round(((val - min) / range) * 78);
              const isLast = i === months.length - 1;
              const display = metric === 'grade'
                ? formatGrade(m.avgGrade)
                : String(val);
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] font-semibold text-ink tabular-nums mb-1">
                    {display}
                  </span>
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-[height] ${isLast ? 'bg-primary' : 'bg-surface-muted'}`}
                      style={{ height: `${pct}%` }}
                      role="img"
                      aria-label={`${m.label}: ${display}`}
                    />
                  </div>
                  <span className="text-[10px] text-ink-faint font-semibold mt-2">{m.label}</span>
                </div>
              );
            })}
          </div>

          {current && previous && (
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <p className="text-[11px] text-ink-muted">Поточний місяць</p>
              <p className="text-[13px] font-semibold text-ink tabular-nums">
                {metric === 'grade'
                  ? `${formatGrade(current.avgGrade)} / 12`
                  : metricValue(current, metric)}
                <span className="ml-2 text-[11px] font-medium text-ink-muted">
                  {delta >= 0 ? '▲' : '▼'}{' '}
                  {metric === 'grade' ? Math.abs(delta).toFixed(1) : Math.abs(delta)}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="ios-card p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Рівні учнів</h2>
            <p className="text-[12px] text-ink-muted mt-0.5">
              Всього: <span className="font-semibold text-ink tabular-nums">{totalLearners}</span> учнів
            </p>
          </div>
          {levelBuckets.length === 0 ? (
            <p className="text-[12px] text-ink-muted">Ще немає учнів на уроках.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {levelBuckets.map(b => {
                const pct = totalLearners > 0 ? Math.round((b.count / totalLearners) * 100) : 0;
                return (
                  <li key={b.level}>
                    <div className="flex items-center justify-between mb-1.5">
                      <LevelBadge level={b.level as Level} />
                      <div className="flex items-baseline gap-1.5 tabular-nums flex-shrink-0">
                        <span className="text-[13px] font-semibold text-ink">{b.count}</span>
                        <span className="text-[10px] text-ink-faint">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1 bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="ios-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Дошка пошани</h2>
          <p className="text-[11px] text-ink-faint">Топ-3 за виконанням ДЗ</p>
        </div>
        {honorRoll.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-ink-muted">
            Недостатньо даних за обраний період (мінімум 3 ДЗ на учня).
          </div>
        ) : (
          <ul>
            {honorRoll.map((s, i) => (
              <li key={s.documentId} className="flex items-center gap-3 px-5 py-3 border-t border-border first:border-t-0 hover:bg-surface-muted/40 transition-colors">
                <span className="w-6 text-[12px] font-semibold text-ink-muted tabular-nums text-center flex-shrink-0">{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary-dark flex items-center justify-center text-[13px] font-semibold flex-shrink-0">
                  {s.name.trim().split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {s.level && <LevelBadge level={s.level as Level} />}
                    <span className="text-[11px] text-ink-muted tabular-nums">
                      {s.completed} / {s.total} ДЗ
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[13px] font-semibold text-ink tabular-nums">{Math.round(s.rate * 100)}%</span>
                  <span className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold mt-0.5">ДЗ</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
