'use client';
import { useMemo, useState } from 'react';
import {
  MOCK_HOMEWORK,
  MOCK_SCHEDULE,
  MOCK_STUDENTS,
  type Level,
} from '@/lib/teacher-mocks';
import { LevelBadge, PageHeader, SegmentedControl, type SegmentedControlOption } from '@/components/teacher/ui';

type Metric = 'lessons' | 'homework' | 'grade';

interface MonthStat {
  label: string;
  lessons: number;
  homework: number;
  grade: number;
}

const MONTHS: MonthStat[] = [
  { label: 'Лист', lessons: 52, homework: 84, grade: 8.4 },
  { label: 'Груд', lessons: 48, homework: 80, grade: 8.1 },
  { label: 'Січ',  lessons: 55, homework: 88, grade: 8.6 },
  { label: 'Лют',  lessons: 59, homework: 92, grade: 8.8 },
  { label: 'Бер',  lessons: 61, homework: 95, grade: 9.0 },
  { label: 'Кві',  lessons: 44, homework: 72, grade: 9.1 },
];

const METRIC_META: Record<Metric, { label: string; unit: string; key: keyof Pick<MonthStat, 'lessons' | 'homework' | 'grade'> }> = {
  lessons:  { label: 'Уроків',        unit: '',    key: 'lessons'  },
  homework: { label: 'ДЗ перевірено', unit: '',    key: 'homework' },
  grade:    { label: 'Середній бал',  unit: '/12', key: 'grade'    },
};

const METRIC_OPTIONS: ReadonlyArray<SegmentedControlOption<Metric>> = [
  { value: 'lessons',  label: 'Уроки' },
  { value: 'homework', label: 'ДЗ'    },
  { value: 'grade',    label: 'Бал'   },
];

export function TeacherAnalytics() {
  const [metric, setMetric] = useState<Metric>('lessons');

  const current  = MONTHS[MONTHS.length - 1];
  const previous = MONTHS[MONTHS.length - 2];
  const delta    = current[METRIC_META[metric].key] - previous[METRIC_META[metric].key];
  const deltaPct = Math.round((delta / previous[METRIC_META[metric].key]) * 100);

  const lessonsThisMonth = useMemo(
    () => MOCK_SCHEDULE.filter(l => l.status === 'done').length,
    [],
  );
  const pendingHomework = useMemo(
    () => MOCK_HOMEWORK.filter(h => h.status === 'submitted').length,
    [],
  );
  const avgAttendance = 0.93;
  const avgGrade = 8.9;

  const honorRoll = useMemo(() => {
    return [...MOCK_STUDENTS]
      .filter(s => s.status !== 'blocked')
      .sort((a, b) => b.homeworkCompletionRate - a.homeworkCompletionRate)
      .slice(0, 3);
  }, []);

  const { min, max } = useMemo(() => {
    const vals = MONTHS.map(m => m[METRIC_META[metric].key]);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [metric]);

  const levelBuckets = useMemo(() => {
    const buckets: Record<Level, number> = { A0: 0, A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
    MOCK_STUDENTS.forEach(s => { buckets[s.level] = (buckets[s.level] ?? 0) + 1; });
    return (Object.entries(buckets) as Array<[Level, number]>).filter(([, n]) => n > 0);
  }, []);

  const kpis: ReadonlyArray<{ label: string; value: string; delta: string }> = [
    { label: 'Уроків / місяць',  value: String(lessonsThisMonth),           delta: `${deltaPct > 0 ? '+' : ''}${deltaPct}% до минулого` },
    { label: 'ДЗ на перевірці',  value: String(pendingHomework),            delta: 'Потребують уваги' },
    { label: 'Відвідуваність',   value: `${Math.round(avgAttendance * 100)}%`, delta: 'Середнє по учнях' },
    { label: 'Середній бал',     value: avgGrade.toFixed(1),                delta: '/12 за квартал' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Моя аналітика"
        subtitle="Квітень 2026 · персональна статистика"
      />

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
              <p className="text-[12px] text-ink-muted mt-0.5">{METRIC_META[metric].label}</p>
            </div>
            <SegmentedControl value={metric} onChange={setMetric} options={METRIC_OPTIONS} label="Метрика" />
          </div>

          <div className="flex items-stretch gap-3 h-56 pt-2">
            {MONTHS.map((m, i) => {
              const val = m[METRIC_META[metric].key];
              const range = max - min || 1;
              const pct = 22 + Math.round(((val - min) / range) * 78);
              const isLast = i === MONTHS.length - 1;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] font-semibold text-ink tabular-nums mb-1">
                    {metric === 'grade' ? val.toFixed(1) : val}
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

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <p className="text-[11px] text-ink-muted">Поточний місяць</p>
            <p className="text-[13px] font-semibold text-ink tabular-nums">
              {metric === 'grade' ? current.grade.toFixed(1) : current[METRIC_META[metric].key]}
              <span className="ml-2 text-[11px] font-medium text-ink-muted">
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
              </span>
            </p>
          </div>
        </div>

        <div className="ios-card p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Рівні учнів</h2>
            <p className="text-[12px] text-ink-muted mt-0.5">Всього: <span className="font-semibold text-ink tabular-nums">{MOCK_STUDENTS.length}</span> учнів</p>
          </div>
          <ul className="flex flex-col gap-3">
            {levelBuckets.map(([lvl, n]) => {
              const pct = Math.round((n / MOCK_STUDENTS.length) * 100);
              return (
                <li key={lvl}>
                  <div className="flex items-center justify-between mb-1.5">
                    <LevelBadge level={lvl} />
                    <div className="flex items-baseline gap-1.5 tabular-nums flex-shrink-0">
                      <span className="text-[13px] font-semibold text-ink">{n}</span>
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
        </div>
      </div>

      <div className="ios-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-baseline justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Дошка пошани</h2>
          <p className="text-[11px] text-ink-faint">Топ-3 за виконанням ДЗ</p>
        </div>
        <ul>
          {honorRoll.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 px-5 py-3 border-t border-border first:border-t-0 hover:bg-surface-muted/40 transition-colors">
              <span className="w-6 text-[12px] font-semibold text-ink-muted tabular-nums text-center flex-shrink-0">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.photo} alt={s.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink truncate">{s.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <LevelBadge level={s.level} />
                  <span className="text-[11px] text-ink-muted tabular-nums">
                    {s.lessonsLeft} / {s.lessonsTotal} уроків
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[13px] font-semibold text-ink tabular-nums">{Math.round(s.homeworkCompletionRate * 100)}%</span>
                <span className="text-[10px] text-ink-faint uppercase tracking-wider font-semibold mt-0.5">ДЗ</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
