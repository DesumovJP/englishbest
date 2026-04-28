'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/session-context';
import {
  fetchTeacherMonthSessionsCached,
  fetchMonthAttendanceCached,
  peekTeacherMonthSessions,
  peekMonthAttendance,
  upsertAttendance,
  deleteAttendance,
  type AttendanceRecord,
  type AttendanceStatus,
  type AttendanceStudent,
  type SessionLite,
} from '@/lib/attendance';
import { LevelBadge } from '@/components/teacher/ui';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Level } from '@/lib/types';

const LEVELS = new Set<Level>(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
function asLevel(v: string | null): Level | null {
  return v && LEVELS.has(v as Level) ? (v as Level) : null;
}

type DisplayMark = 'present' | 'late' | 'absent' | 'excused' | null;

const MONTHS_UA = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

const MARK_CFG: Record<Exclude<DisplayMark, null>, { label: string }> = {
  present: { label: 'Присутній' },
  late:    { label: 'Запізнився' },
  absent:  { label: 'Відсутній' },
  excused: { label: 'Поважна причина' },
};

// Cycle: (no lesson → no-op) | no-record → present → late → absent → excused → (delete record = null) → present …
const CYCLE_NEXT: Record<string, DisplayMark> = {
  'null': 'present',
  'present': 'late',
  'late': 'absent',
  'absent': 'excused',
  'excused': null,
};

const PRINT_CHAR: Record<Exclude<DisplayMark, null>, string> = {
  present: '✓',
  late:    'П',
  absent:  '✗',
  excused: 'У',
};

function MarkGlyph({ mark, size = 'sm' }: { mark: Exclude<DisplayMark, null>; size?: 'sm' | 'md' }) {
  // GitHub-contribution-style filled squares: each state is a uniform
  // rounded square with a tinted background — same footprint as before
  // but reads cleaner at small sizes and packs denser on mobile.
  const square = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const tint =
    mark === 'present' ? 'bg-success'
    : mark === 'late'    ? 'bg-warning'
    : mark === 'absent'  ? 'bg-danger'
    : 'bg-ink-faint/40';
  return (
    <>
      <span
        className="hidden print:inline text-[11px] font-bold text-black tabular-nums"
        aria-hidden
      >
        {PRINT_CHAR[mark]}
      </span>
      <span
        className={`${square} ${tint} rounded-[3px] block print:hidden`}
        aria-hidden
      />
    </>
  );
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function sessionDateKey(session: SessionLite): string {
  const d = new Date(session.startAt);
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function AttendancePage() {
  const { session, status } = useSession();
  const teacherId =
    session?.profile.role === 'teacher'
      ? ((session.profile.teacherProfile as { documentId?: string } | null | undefined)?.documentId ?? null)
      : null;

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const cachedSessions = teacherId ? peekTeacherMonthSessions(teacherId, year, month) : null;
  const cachedRecords = peekMonthAttendance(year, month);
  const cachedAvailable = cachedSessions !== null && cachedRecords !== null;

  const [sessions, setSessions] = useState<SessionLite[]>(cachedSessions ?? []);
  const [records, setRecords] = useState<AttendanceRecord[]>(cachedRecords ?? []);
  const [loading, setLoading] = useState(!cachedAvailable);
  const [error, setError] = useState<string | null>(null);

  const days = daysInMonth(year, month);
  const todayStr = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  useEffect(() => {
    let alive = true;
    if (!teacherId) return;
    const peekedSessions = peekTeacherMonthSessions(teacherId, year, month);
    const peekedRecords = peekMonthAttendance(year, month);
    if (peekedSessions !== null && peekedRecords !== null) {
      setSessions(peekedSessions);
      setRecords(peekedRecords);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    Promise.all([
      fetchTeacherMonthSessionsCached(teacherId, year, month),
      fetchMonthAttendanceCached(year, month),
    ])
      .then(([ss, rs]) => {
        if (!alive) return;
        setSessions(ss);
        setRecords(rs);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message ?? 'Не вдалось завантажити дані');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [teacherId, year, month]);

  // Build student list from unique attendees across all month sessions.
  const students = useMemo<AttendanceStudent[]>(() => {
    const seen = new Map<string, AttendanceStudent>();
    for (const s of sessions) {
      for (const a of s.attendees) {
        if (!seen.has(a.documentId)) seen.set(a.documentId, a);
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'uk'),
    );
  }, [sessions]);

  // Build day → sessions-on-that-day map and session → Set<studentId of attendees>.
  const sessionsByDay = useMemo(() => {
    const m = new Map<string, SessionLite[]>();
    for (const s of sessions) {
      const k = sessionDateKey(s);
      const arr = m.get(k);
      if (arr) arr.push(s);
      else m.set(k, [s]);
    }
    return m;
  }, [sessions]);

  // (sessionId, studentId) → record
  const recordIndex = useMemo(() => {
    const m = new Map<string, AttendanceRecord>();
    for (const r of records) m.set(`${r.sessionId}::${r.studentId}`, r);
    return m;
  }, [records]);

  function findSessionForCell(studentId: string, day: number): SessionLite | null {
    const k = dateKey(year, month, day);
    const list = sessionsByDay.get(k);
    if (!list) return null;
    return list.find(s => s.attendees.some(a => a.documentId === studentId)) ?? null;
  }

  function getMark(studentId: string, day: number): { mark: DisplayMark; session: SessionLite | null } {
    const sess = findSessionForCell(studentId, day);
    if (!sess) return { mark: null, session: null };
    const rec = recordIndex.get(`${sess.documentId}::${studentId}`);
    return { mark: rec ? rec.status : null, session: sess };
  }

  async function cycleMark(studentId: string, day: number) {
    const { mark, session: sess } = getMark(studentId, day);
    if (!sess) return;
    const cur = mark ?? 'null';
    const next = CYCLE_NEXT[cur] ?? 'present';
    const key = `${sess.documentId}::${studentId}`;
    const existing = recordIndex.get(key);

    if (next === null) {
      if (!existing) return;
      // Optimistic remove. On error, restore the record we just dropped — DON'T
      // call loadData(), which would also clobber other in-flight cycles and
      // make every cell flicker back to the last server state.
      setRecords(prev => prev.filter(r => r.documentId !== existing.documentId));
      try {
        await deleteAttendance(existing.documentId);
      } catch (e: any) {
        setError(e?.message ?? 'Не вдалось видалити відмітку');
        setRecords(prev => (prev.some(r => r.documentId === existing.documentId) ? prev : [...prev, existing]));
      }
      return;
    }

    const tempId = existing?.documentId ?? `temp-${Date.now()}`;
    const optimistic: AttendanceRecord = {
      documentId: tempId,
      status: next,
      note: existing?.note ?? null,
      recordedAt: new Date().toISOString(),
      sessionId: sess.documentId,
      studentId,
    };
    setRecords(prev => {
      if (existing) return prev.map(r => (r.documentId === existing.documentId ? optimistic : r));
      return [...prev, optimistic];
    });
    try {
      const saved = await upsertAttendance({
        sessionId: sess.documentId,
        studentId,
        status: next,
        fallbackDocumentId: existing?.documentId,
      });
      setRecords(prev =>
        prev.map(r => (r.documentId === tempId ? saved : r)),
      );
    } catch (e: any) {
      setError(e?.message ?? 'Не вдалось зберегти відмітку');
      // Roll back ONLY this cell to its prior state instead of reloading the
      // whole month — the latter visibly reverts every cell to old data.
      setRecords(prev => {
        const without = prev.filter(r => r.documentId !== tempId);
        return existing ? [...without, existing] : without;
      });
    }
  }

  function shiftMonth(delta: number) {
    const nm = month + delta;
    if (nm < 0) { setYear(y => y - 1); setMonth(11); }
    else if (nm > 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(nm);
  }

  const stats = useMemo(() => {
    let present = 0, late = 0, absent = 0, excused = 0, total = 0;
    for (const r of records) {
      total += 1;
      if (r.status === 'present') present += 1;
      else if (r.status === 'late') late += 1;
      else if (r.status === 'absent') absent += 1;
      else if (r.status === 'excused') excused += 1;
    }
    const pct = total === 0 ? 0 : Math.round(((present + late * 0.5 + excused * 0.5) / total) * 100);
    return { present, late, absent, excused, total, pct };
  }, [records]);

  function buildMatrix() {
    const header = [
      'Учень',
      ...Array.from({ length: days }, (_, i) => String(i + 1)),
      '%',
    ];
    const rows = students.map(s => {
      let sPresent = 0, sLate = 0, sExcused = 0, sTotal = 0;
      const cells: string[] = [];
      for (let d = 1; d <= days; d++) {
        const cell = getMark(s.documentId, d);
        if (!cell.session) { cells.push(''); continue; }
        if (cell.mark === null) { cells.push('·'); continue; }
        sTotal += 1;
        if (cell.mark === 'present') { sPresent += 1; cells.push('✓'); }
        else if (cell.mark === 'late') { sLate += 1; cells.push('П'); }
        else if (cell.mark === 'absent') { cells.push('✗'); }
        else { sExcused += 1; cells.push('У'); }
      }
      const pct = sTotal === 0 ? 0 : Math.round(((sPresent + sLate * 0.5 + sExcused * 0.5) / sTotal) * 100);
      return [s.displayName, ...cells, `${pct}%`];
    });
    return { header, rows };
  }

  function exportCsv() {
    const { header, rows } = buildMatrix();
    const lines = [header, ...rows].map(row =>
      row.map(cell => /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell).join(','),
    );
    const csv = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${year}-${String(month + 1).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPrint() {
    window.print();
  }

  if (status === 'loading') {
    return <DashboardPageShell title="Відвідуваність" subtitle="Завантаження…" status="loading" loadingShape="table" />;
  }
  if (status === 'anonymous') {
    return (
      <DashboardPageShell
        title="Відвідуваність"
        status="empty"
        empty={{ title: 'Потрібно увійти', description: 'Щоб побачити відвідуваність, увійдіть у свій акаунт.' }}
      />
    );
  }
  if (!teacherId) {
    return (
      <DashboardPageShell
        title="Відвідуваність"
        status="empty"
        empty={{ title: 'Недоступно', description: 'Розділ відвідуваності — лише для вчителів.' }}
      />
    );
  }

  return (
    <DashboardPageShell
      title="Відвідуваність"
      subtitle={`${students.length} ${students.length === 1 ? 'учень' : 'учнів'} · ${MONTHS_UA[month]} ${year}`}
      actions={
        <div className="flex items-center gap-2 print:hidden">
          <Button size="sm" variant="secondary" icon aria-label="Попередній місяць" onClick={() => shiftMonth(-1)}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Button>
          <span className="text-[13px] font-semibold text-ink min-w-[9rem] text-center tabular-nums">
            {MONTHS_UA[month]} {year}
          </span>
          <Button size="sm" variant="secondary" icon aria-label="Наступний місяць" onClick={() => shiftMonth(+1)}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </Button>
        </div>
      }
    >
      {error && (
        <Card variant="outline" padding="sm" className="text-[13px] text-danger border-danger/30">{error}</Card>
      )}

      <Card variant="surface" padding="none" className="overflow-hidden print:border-0 print:rounded-none">
        {loading && students.length === 0 ? (
          <div className="px-5 py-10 text-center text-ink-muted text-[13px]">Завантаження…</div>
        ) : students.length === 0 ? (
          <div className="px-5 py-10 text-center text-ink-muted text-[13px]">
            У цьому місяці немає запланованих занять.
          </div>
        ) : (
          <div className="overflow-x-auto print:overflow-visible">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-20 bg-surface-raised text-left px-3 sm:px-4 py-2.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider min-w-[160px] sm:min-w-[200px] border-r border-border print:static print:bg-transparent print:min-w-0 print:w-auto">
                    Учень
                  </th>
                  {Array.from({ length: days }, (_, i) => i + 1).map(d => {
                    const dayStr = dateKey(year, month, d);
                    const isToday = dayStr === todayStr;
                    return (
                      <th key={d} className={`w-6 sm:w-7 text-center text-[10px] font-semibold py-2 tabular-nums ${isToday ? 'text-ink' : 'text-ink-faint'}`}>
                        {d}
                        {isToday && <span className="block w-1 h-1 rounded-full bg-primary mx-auto mt-0.5" />}
                      </th>
                    );
                  })}
                  <th className="sticky right-0 z-20 bg-surface-raised px-3 py-2 text-[10px] font-semibold text-ink-faint uppercase tracking-wider text-right whitespace-nowrap border-l border-border print:static print:bg-transparent">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  let sPresent = 0, sLate = 0, sAbsent = 0, sExcused = 0, sTotal = 0;
                  const cells: Array<{ mark: DisplayMark; session: SessionLite | null }> = [];
                  for (let d = 1; d <= days; d++) {
                    const cell = getMark(s.documentId, d);
                    cells.push(cell);
                    if (!cell.session || cell.mark === null) continue;
                    sTotal += 1;
                    if (cell.mark === 'present') sPresent += 1;
                    else if (cell.mark === 'late') sLate += 1;
                    else if (cell.mark === 'absent') sAbsent += 1;
                    else if (cell.mark === 'excused') sExcused += 1;
                  }
                  const pct = sTotal === 0 ? 0 : Math.round(((sPresent + sLate * 0.5 + sExcused * 0.5) / sTotal) * 100);
                  return (
                    <tr key={s.documentId} className="border-t border-border hover:bg-surface-muted/30">
                      <td className="sticky left-0 z-20 bg-surface-raised px-3 sm:px-4 py-2 border-r border-border min-w-[160px] sm:min-w-[200px] print:static print:bg-transparent print:min-w-0 print:w-auto print:px-2 print:py-1">
                        <div className="flex items-center gap-2.5">
                          {s.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.avatarUrl} alt={s.displayName} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-surface-muted inline-flex items-center justify-center text-[11px] font-semibold text-ink-faint flex-shrink-0">
                              {s.displayName.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-ink truncate">{s.displayName}</p>
                            {asLevel(s.level) && <LevelBadge level={asLevel(s.level)!} />}
                          </div>
                        </div>
                      </td>
                      {cells.map((cell, i) => (
                        <td key={i} className="text-center p-0 print:border print:border-border">
                          <button
                            type="button"
                            disabled={!cell.session}
                            onClick={() => cycleMark(s.documentId, i + 1)}
                            title={cell.mark ? MARK_CFG[cell.mark].label : cell.session ? 'Натисніть, щоб відмітити' : 'Не було уроку'}
                            className="w-6 h-6 sm:w-7 sm:h-7 inline-flex items-center justify-center rounded hover:bg-surface-muted transition-colors disabled:hover:bg-transparent disabled:cursor-default print:w-full print:h-6"
                          >
                            {cell.mark ? (
                              <MarkGlyph mark={cell.mark} />
                            ) : cell.session ? (
                              <>
                                <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] border border-ink-faint/40 bg-surface-muted/40 block print:hidden" aria-hidden />
                                <span className="hidden print:inline text-[10px] text-ink-faint" aria-hidden>·</span>
                              </>
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-[3px] bg-ink-faint/10 block print:hidden" aria-hidden />
                            )}
                          </button>
                        </td>
                      ))}
                      <td className="sticky right-0 z-10 bg-surface-raised px-3 py-2 text-[12px] font-semibold text-ink text-right whitespace-nowrap tabular-nums border-l border-border print:static print:bg-transparent">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 border-t border-border bg-surface-muted/40 print:bg-transparent print:border-0 print:px-0 print:pt-3 print:pb-0">
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
          <div className="flex items-center gap-2 print:hidden">
            <Button size="sm" variant="secondary" onClick={exportCsv}>CSV</Button>
            <Button size="sm" variant="secondary" onClick={exportPrint}>Друк</Button>
          </div>
        </footer>
      </Card>
    </DashboardPageShell>
  );
}
