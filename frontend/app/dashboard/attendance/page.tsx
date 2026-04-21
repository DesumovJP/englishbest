'use client';
import { useMemo, useState } from 'react';
import {
  MOCK_GROUPS,
  MOCK_SCHEDULE,
  MOCK_STUDENTS,
  type Student,
} from '@/lib/teacher-mocks';
import {
  LevelBadge,
  PageHeader,
  SegmentedControl,
  type SegmentedControlOption,
} from '@/components/teacher/ui';

type Scope = 'students' | 'groups';
type Mark = 'present' | 'late' | 'absent' | null;

const SCOPE_OPTIONS: ReadonlyArray<SegmentedControlOption<Scope>> = [
  { value: 'students', label: 'Учні' },
  { value: 'groups',   label: 'Групи' },
];

const MONTHS_UA = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

const MARK_CFG: Record<Exclude<Mark, null>, { label: string }> = {
  present: { label: 'Присутній' },
  late:    { label: 'Запізнився' },
  absent:  { label: 'Відсутній' },
};

function MarkGlyph({ mark, size = 'sm' }: { mark: Exclude<Mark, null>; size?: 'sm' | 'md' }) {
  const dot = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  const cross = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  if (mark === 'present') return <span className={`${dot} rounded-full bg-primary block`} aria-hidden />;
  if (mark === 'late')    return <span className={`${dot} rounded-full border-[1.5px] border-primary block`} aria-hidden />;
  return (
    <svg className={`${cross} text-danger`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function seedMark(student: Student, dateStr: string): Mark {
  const lesson = MOCK_SCHEDULE.find(
    l => l.date === dateStr && (l.studentId === student.id || (l.groupId && student.groupId === l.groupId)),
  );
  if (!lesson) return null;
  if (lesson.status === 'cancelled') return null;
  if (lesson.status === 'done') {
    const hash = (student.id.charCodeAt(1) + Number(dateStr.slice(-2))) % 10;
    if (hash < student.homeworkCompletionRate * 10) return 'present';
    if (hash < 9) return 'late';
    return 'absent';
  }
  return null;
}

export default function AttendancePage() {
  const [scope, setScope] = useState<Scope>('students');
  const today = new Date('2026-04-19');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [groupId, setGroupId] = useState<string>(MOCK_GROUPS[0]?.id ?? '');
  const [overrides, setOverrides] = useState<Record<string, Mark>>({});

  const days = daysInMonth(year, month);
  const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const visibleStudents = useMemo(() => {
    if (scope === 'students') return MOCK_STUDENTS;
    return MOCK_STUDENTS.filter(s => s.groupId === groupId);
  }, [scope, groupId]);

  function getMark(studentId: string, day: number): Mark {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const key = `${studentId}:${dateStr}`;
    if (key in overrides) return overrides[key];
    const student = MOCK_STUDENTS.find(s => s.id === studentId);
    if (!student) return null;
    return seedMark(student, dateStr);
  }

  function cycleMark(studentId: string, day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cur = getMark(studentId, day);
    const next: Mark = cur === null ? 'present' : cur === 'present' ? 'late' : cur === 'late' ? 'absent' : null;
    setOverrides(prev => ({ ...prev, [`${studentId}:${dateStr}`]: next }));
  }

  function shiftMonth(delta: number) {
    const nm = month + delta;
    if (nm < 0) { setYear(y => y - 1); setMonth(11); }
    else if (nm > 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(nm);
  }

  const stats = useMemo(() => {
    let present = 0, late = 0, absent = 0, total = 0;
    visibleStudents.forEach(s => {
      for (let d = 1; d <= days; d++) {
        const m = getMark(s.id, d);
        if (m === null) continue;
        total += 1;
        if (m === 'present') present += 1;
        else if (m === 'late') late += 1;
        else absent += 1;
      }
    });
    const pct = total === 0 ? 0 : Math.round(((present + late * 0.5) / total) * 100);
    return { present, late, absent, total, pct };
  }, [visibleStudents, overrides, year, month, days]);

  function exportMock(kind: 'xlsx' | 'pdf') {
    window.alert(`Експорт ${kind.toUpperCase()} — буде додано з бекендом.`);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Відвідуваність"
        subtitle={`${visibleStudents.length} ${scope === 'students' ? 'учнів' : 'учнів у групі'} · ${MONTHS_UA[month]} ${year}`}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <SegmentedControl value={scope} onChange={setScope} options={SCOPE_OPTIONS} label="Тип перегляду" />
          {scope === 'groups' && (
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-white text-[13px] font-semibold text-ink focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-[border-color,box-shadow]"
            >
              {MOCK_GROUPS.map(g => (
                <option key={g.id} value={g.id}>{g.name} · {g.level}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Попередній місяць" className="ios-btn ios-btn-secondary w-9 p-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="text-[13px] font-semibold text-ink min-w-[9rem] text-center tabular-nums">
            {MONTHS_UA[month]} {year}
          </span>
          <button type="button" onClick={() => shiftMonth(+1)} aria-label="Наступний місяць" className="ios-btn ios-btn-secondary w-9 p-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <div className="ios-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-white text-left px-4 py-2.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider min-w-[200px] border-r border-border">
                  Учень
                </th>
                {Array.from({ length: days }, (_, i) => i + 1).map(d => {
                  const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const isToday = dayStr === todayStr;
                  return (
                    <th key={d} className={`w-8 text-center text-[10px] font-semibold py-2 tabular-nums ${isToday ? 'text-ink' : 'text-ink-faint'}`}>
                      {d}
                      {isToday && <span className="block w-1 h-1 rounded-full bg-primary mx-auto mt-0.5" />}
                    </th>
                  );
                })}
                <th className="px-3 py-2 text-[10px] font-semibold text-ink-faint uppercase tracking-wider text-right whitespace-nowrap border-l border-border">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map(s => {
                let sPresent = 0, sLate = 0, sAbsent = 0, sTotal = 0;
                const cells: Mark[] = [];
                for (let d = 1; d <= days; d++) {
                  const m = getMark(s.id, d);
                  cells.push(m);
                  if (m === null) continue;
                  sTotal += 1;
                  if (m === 'present') sPresent += 1;
                  else if (m === 'late') sLate += 1;
                  else sAbsent += 1;
                }
                const pct = sTotal === 0 ? 0 : Math.round(((sPresent + sLate * 0.5) / sTotal) * 100);
                return (
                  <tr key={s.id} className="border-t border-border hover:bg-surface-muted/30">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2 border-r border-border min-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.photo} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-ink truncate">{s.name}</p>
                          <LevelBadge level={s.level} />
                        </div>
                      </div>
                    </td>
                    {cells.map((m, i) => (
                      <td key={i} className="text-center p-0">
                        <button
                          type="button"
                          onClick={() => cycleMark(s.id, i + 1)}
                          title={m ? MARK_CFG[m].label : 'Не було уроку'}
                          className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-surface-muted transition-colors"
                        >
                          {m
                            ? <MarkGlyph mark={m} />
                            : <span className="w-1 h-1 rounded-full bg-ink-faint/30 block" aria-hidden />}
                        </button>
                      </td>
                    ))}
                    <td className="px-3 py-2 text-[12px] font-semibold text-ink text-right whitespace-nowrap tabular-nums border-l border-border">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 border-t border-border bg-surface-muted/40">
          <div className="flex items-center gap-4 flex-wrap text-[12px]">
            <span className="font-semibold text-ink tabular-nums">Середнє: {stats.pct}%</span>
            {(Object.keys(MARK_CFG) as Array<keyof typeof MARK_CFG>).map(k => (
              <span key={k} className="flex items-center gap-1.5 text-ink-muted">
                <span className="w-5 h-5 inline-flex items-center justify-center">
                  <MarkGlyph mark={k} size="md" />
                </span>
                {MARK_CFG[k].label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => exportMock('xlsx')} className="ios-btn ios-btn-sm ios-btn-secondary">
              Excel
            </button>
            <button type="button" onClick={() => exportMock('pdf')} className="ios-btn ios-btn-sm ios-btn-secondary">
              PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
