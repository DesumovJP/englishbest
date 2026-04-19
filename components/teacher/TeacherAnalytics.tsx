'use client';
import { useMemo, useState } from 'react';
import {
  MOCK_HOMEWORK,
  MOCK_SCHEDULE,
  MOCK_STUDENTS,
  type Level,
} from '@/lib/teacher-mocks';
import { LevelBadge, PageHeader } from '@/components/teacher/ui';

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

  const max = Math.max(...MONTHS.map(m => m[METRIC_META[metric].key]));

  const levelBuckets = useMemo(() => {
    const buckets: Record<Level, number> = { A0: 0, A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
    MOCK_STUDENTS.forEach(s => { buckets[s.level] = (buckets[s.level] ?? 0) + 1; });
    return (Object.entries(buckets) as Array<[Level, number]>).filter(([, n]) => n > 0);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Моя аналітика"
        subtitle="Квітень 2026 · персональна статистика"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon="📅" label="Уроків / місяць" value={String(lessonsThisMonth)} hint={`${deltaPct > 0 ? '+' : ''}${deltaPct}% vs минулий`} tone="primary" />
        <KpiCard icon="✍️" label="ДЗ на перевірці" value={String(pendingHomework)} hint="Потребують уваги" tone={pendingHomework > 5 ? 'danger' : 'secondary'} />
        <KpiCard icon="📋" label="Відвідуваність" value={`${Math.round(avgAttendance * 100)}%`} hint="Середнє по учнях" tone="success" />
        <KpiCard icon="⭐" label="Середній бал" value={avgGrade.toFixed(1)} hint="/12 за квартал" tone="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-black text-ink">Динаміка за 6 місяців</h2>
            <div className="flex gap-1 p-1 bg-surface-muted rounded-xl">
              {(Object.keys(METRIC_META) as Metric[]).map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    metric === m ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {METRIC_META[m].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-3 h-48 pt-4">
            {MONTHS.map((m, i) => {
              const val = m[METRIC_META[metric].key];
              const pct = Math.max(8, Math.round((val / max) * 100));
              const isLast = i === MONTHS.length - 1;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-black text-ink-muted">
                    {metric === 'grade' ? val.toFixed(1) : val}
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all ${isLast ? 'bg-gradient-to-t from-primary to-primary-dark' : 'bg-surface-muted'}`}
                    style={{ height: `${pct}%` }}
                    role="img"
                    aria-label={`${m.label}: ${val}`}
                  />
                  <span className="text-xs text-ink-muted font-semibold">{m.label}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-ink-muted">Поточний місяць</p>
            <p className="text-sm font-black text-ink">
              {metric === 'grade' ? current.grade.toFixed(1) : current[METRIC_META[metric].key]}
              <span className={`ml-2 text-xs font-bold ${delta >= 0 ? 'text-primary-dark' : 'text-danger-dark'}`}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
          <h2 className="font-black text-ink">Рівні учнів</h2>
          <ul className="flex flex-col gap-2.5">
            {levelBuckets.map(([lvl, n]) => {
              const pct = Math.round((n / MOCK_STUDENTS.length) * 100);
              return (
                <li key={lvl}>
                  <div className="flex items-center justify-between mb-1">
                    <LevelBadge level={lvl} />
                    <span className="text-xs text-ink-muted">
                      <span className="font-black text-ink">{n}</span> · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-ink-muted">Всього: <span className="font-black text-ink">{MOCK_STUDENTS.length}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-black text-ink">Дошка пошани</h2>
            <p className="text-xs text-ink-muted mt-0.5">Топ-3 за виконанням ДЗ</p>
          </div>
          <span className="text-2xl" aria-hidden>🏆</span>
        </div>
        <ul className="divide-y divide-border">
          {honorRoll.map((s, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
            return (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-xl w-8 text-center flex-shrink-0" aria-hidden>{medal}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.photo} alt={s.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-ink truncate">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <LevelBadge level={s.level} />
                    <span className="text-[11px] text-ink-muted">
                      {s.lessonsLeft} / {s.lessonsTotal} уроків
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-black text-primary-dark">{Math.round(s.homeworkCompletionRate * 100)}%</span>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wide font-black">ДЗ</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const TONE_CLS: Record<'primary' | 'danger' | 'accent' | 'success' | 'secondary', string> = {
  primary:   'text-primary-dark',
  danger:    'text-danger-dark',
  accent:    'text-accent-dark',
  success:   'text-success-dark',
  secondary: 'text-secondary-dark',
};

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  hint: string;
  tone: keyof typeof TONE_CLS;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="type-label text-ink-muted">{label}</p>
        <span className="text-xl" aria-hidden>{icon}</span>
      </div>
      <p className={`type-h2 ${TONE_CLS[tone]}`}>{value}</p>
      <p className="text-xs mt-1 font-semibold text-ink-muted">{hint}</p>
    </div>
  );
}
