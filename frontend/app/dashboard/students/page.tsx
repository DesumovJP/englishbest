/**
 * /dashboard/students — role-aware student roster.
 *
 *   teacher → GET /api/teacher/me/students aggregation (sessions + submissions)
 *             rendered as filterable/sortable table + StudentDetail modal.
 *   admin   → GET /api/admin/students platform-wide aggregation, same UI shape
 *             with an extra "teacher(s)" column.
 *   other   → empty state (students page is teacher-facing).
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { StudentDetail, type StudentDetailData } from '@/components/molecules/StudentDetail';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import {
  FilterChips,
  LevelBadge,
  SearchInput,
  type FilterChipOption,
} from '@/components/teacher/ui';
import { useSession } from '@/lib/session-context';
import {
  fetchMyStudentsCached,
  peekMyStudents,
  type TeacherStudent,
  type TeacherStudentStatus,
} from '@/lib/teacher-students';
import {
  fetchAdminStudentsCached,
  peekAdminStudents,
  type AdminStudent,
} from '@/lib/admin-students';
import type { GroupLevel } from '@/lib/groups';

type SortKey = 'name' | 'level' | 'lastLesson' | 'nextLesson';
type StatusFilter = TeacherStudentStatus | 'all' | 'low-balance';

type StudentRow = TeacherStudent & { teacherNames?: string[] };

function toStudentRow(s: TeacherStudent | AdminStudent): StudentRow {
  const teacherNames = 'teacherNames' in s ? s.teacherNames : undefined;
  return {
    documentId: s.documentId,
    firstName: s.firstName,
    lastName: s.lastName,
    displayName: s.displayName,
    level: s.level,
    avatarUrl: s.avatarUrl,
    lastSessionAt: s.lastSessionAt,
    nextSessionAt: s.nextSessionAt,
    pendingHomework: s.pendingHomework,
    totalHomework: s.totalHomework,
    completedHomework: s.completedHomework,
    status: s.status,
    teacherNames,
  };
}

const STATUS_CONFIG: Record<TeacherStudentStatus, { label: string; dot: string }> = {
  active:  { label: 'Активний',   dot: 'ios-dot-positive' },
  paused:  { label: 'Пауза',      dot: 'ios-dot-warn' },
  trial:   { label: 'Пробний',    dot: 'ios-dot-info' },
  expired: { label: 'Закінчився', dot: 'ios-dot-danger' },
};

const LEVEL_ORDER: Record<GroupLevel, number> = {
  A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6,
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'nextLesson', label: 'Наступний урок' },
  { value: 'name',       label: "За ім'ям" },
  { value: 'level',      label: 'За рівнем' },
  { value: 'lastLesson', label: 'Останній урок' },
];

const LEVEL_FILTER_OPTIONS: { value: GroupLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Всі рівні' },
  { value: 'A0',  label: 'A0' },
  { value: 'A1',  label: 'A1' },
  { value: 'A2',  label: 'A2' },
  { value: 'B1',  label: 'B1' },
  { value: 'B2',  label: 'B2' },
  { value: 'C1',  label: 'C1' },
  { value: 'C2',  label: 'C2' },
];

const STATUS_FILTER_OPTIONS: ReadonlyArray<FilterChipOption<StatusFilter>> = [
  { value: 'all',         label: 'Усі' },
  { value: 'active',      label: 'Активні' },
  { value: 'trial',       label: 'Пробні' },
  { value: 'paused',      label: 'Пауза' },
  { value: 'expired',     label: 'Закінчився' },
  { value: 'low-balance', label: 'Є борги' },
];

function formatShortDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  } catch {
    return '—';
  }
}

function toDetailData(s: StudentRow): StudentDetailData {
  const cfg = STATUS_CONFIG[s.status];
  return {
    slug: s.documentId,
    name: s.displayName,
    photo: s.avatarUrl ?? '',
    level: s.level ?? 'A0',
    program: s.level ? `Рівень ${s.level}` : '—',
    teacher: '',
    lessonsBalance: Math.max(0, s.totalHomework - s.completedHomework),
    moneyBalance: 0,
    lastLesson: formatShortDate(s.lastSessionAt),
    status: cfg.label,
    statusDot: cfg.dot,
    joinedAt: '',
    streak: 0,
    totalLessons: s.completedHomework,
  };
}

export default function StudentsPage() {
  const { session, status: sessionStatus } = useSession();
  const role = session?.profile?.role ?? null;

  const cachedRoster = useMemo<StudentRow[] | null>(() => {
    if (role === 'admin') {
      const rows = peekAdminStudents();
      return rows ? rows.map(toStudentRow) : null;
    }
    if (role === 'teacher') {
      const rows = peekMyStudents();
      return rows ? rows.map(toStudentRow) : null;
    }
    return null;
  }, [role]);

  const [students, setStudents]   = useState<StudentRow[]>(cachedRoster ?? []);
  const [loading,  setLoading]    = useState(cachedRoster === null);
  const [error,    setError]      = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery]                 = useState('');
  const [sortKey, setSortKey]             = useState<SortKey>('nextLesson');
  const [levelFilter, setLevelFilter]     = useState<GroupLevel | 'all'>('all');
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailData | null>(null);

  useEffect(() => {
    if (role !== 'teacher' && role !== 'admin') return;
    let alive = true;
    const loader = role === 'admin'
      ? fetchAdminStudentsCached().then((rows) => rows.map(toStudentRow))
      : fetchMyStudentsCached().then((rows) => rows.map(toStudentRow));
    loader
      .then((rows) => { if (alive) setStudents(rows); })
      .catch((e) => { if (alive) setError(e?.message ?? 'Не вдалось завантажити'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [role, reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .filter(s => !q || s.displayName.toLowerCase().includes(q))
      .filter(s => levelFilter === 'all' || s.level === levelFilter)
      .filter(s => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'low-balance') return s.pendingHomework > 0;
        return s.status === statusFilter;
      })
      .sort((a, b) => {
        if (sortKey === 'name')  return a.displayName.localeCompare(b.displayName, 'uk');
        if (sortKey === 'level') return (LEVEL_ORDER[a.level ?? 'A0'] ?? 99) - (LEVEL_ORDER[b.level ?? 'A0'] ?? 99);
        if (sortKey === 'lastLesson') return (b.lastSessionAt ?? '').localeCompare(a.lastSessionAt ?? '');
        // nextLesson — upcoming first, then "none" bucket
        const aNext = a.nextSessionAt ?? '';
        const bNext = b.nextSessionAt ?? '';
        if (aNext && !bNext) return -1;
        if (!aNext && bNext) return 1;
        return aNext.localeCompare(bNext);
      });
  }, [students, query, sortKey, levelFilter, statusFilter]);

  const activeCount = students.filter(s => s.status === 'active').length;
  const pending     = students.reduce((sum, s) => sum + s.pendingHomework, 0);

  // Non-teacher branches
  if (sessionStatus === 'loading') {
    return (
      <DashboardPageShell
        title="Учні"
        subtitle="Завантаження…"
        status="loading"
        loadingShape="table"
      />
    );
  }

  if (role !== 'teacher' && role !== 'admin') {
    return (
      <DashboardPageShell
        title="Учні"
        subtitle="Недоступно для цієї ролі"
        status="empty"
        empty={{
          title: 'Розділ для вчителів або адмінів',
          description: 'Список учнів доступний обліковим записам вчителів та адміністраторів.',
        }}
      />
    );
  }

  const isAdmin = role === 'admin';
  const title = isAdmin ? 'Усі учні' : 'Мої учні';

  const subtitle = loading
    ? 'Завантаження…'
    : error
      ? '—'
      : `${students.length} · ${activeCount} активних${pending > 0 ? ` · ${pending} ДЗ у роботі` : ''}`;

  const toolbar = (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <SearchInput
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Пошук учнів..."
          containerClassName="flex-1 min-w-0 sm:flex-none sm:w-64"
        />
        <Select
          selectSize="sm"
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value as GroupLevel | 'all')}
          options={LEVEL_FILTER_OPTIONS}
          className="sm:w-40"
        />
        <Select
          selectSize="sm"
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          options={SORT_OPTIONS}
          className="sm:w-52"
        />
      </div>
      <FilterChips value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTIONS} />
    </div>
  );

  const shellStatus = loading
    ? 'loading'
    : error
      ? 'error'
      : filtered.length === 0
        ? 'empty'
        : 'ready';

  return (
    <>
      <DashboardPageShell
        title={title}
        subtitle={subtitle}
        toolbar={toolbar}
        status={shellStatus}
        error={error}
        onRetry={() => setReloadKey(k => k + 1)}
        loadingShape="table"
        empty={{
          title: students.length === 0 ? 'Поки немає учнів' : 'Нічого не знайдено',
          description: students.length === 0
            ? 'Учні з’являться тут після того, як будуть додані в заплановані уроки.'
            : 'Спробуй інший запит або зміни фільтр.',
        }}
      >
        <Card variant="surface" padding="none" className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Учень</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Рівень</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Останній</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Наступний</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">ДЗ</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Статус</th>
                  {isAdmin && (
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Вчитель</th>
                  )}
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const cfg = STATUS_CONFIG[s.status];
                  return (
                    <tr
                      key={s.documentId}
                      onClick={() => setSelectedStudent(toDetailData(s))}
                      className="border-t border-border hover:bg-surface-muted/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" src={s.avatarUrl} name={s.displayName} />
                          <span className="text-[13px] font-semibold text-ink">{s.displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {s.level ? <LevelBadge level={s.level} /> : <span className="text-[12px] text-ink-faint">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] text-ink-muted tabular-nums">{formatShortDate(s.lastSessionAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[13px] tabular-nums ${s.nextSessionAt ? 'text-ink font-semibold' : 'text-ink-faint'}`}>
                          {formatShortDate(s.nextSessionAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] text-ink tabular-nums">
                          {s.completedHomework}/{s.totalHomework}
                          {s.pendingHomework > 0 && (
                            <span className="ml-1 text-[11px] text-warning-dark font-semibold">·{s.pendingHomework}↻</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                          <span className={`ios-dot ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-ink-muted truncate block max-w-[180px]">
                            {s.teacherNames && s.teacherNames.length > 0
                              ? s.teacherNames.slice(0, 2).join(', ') + (s.teacherNames.length > 2 ? ` +${s.teacherNames.length - 2}` : '')
                              : <span className="text-ink-faint">—</span>}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <svg className="w-3.5 h-3.5 text-ink-faint ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="md:hidden">
            {filtered.map(s => {
              const cfg = STATUS_CONFIG[s.status];
              return (
                <li
                  key={s.documentId}
                  onClick={() => setSelectedStudent(toDetailData(s))}
                  className="border-t border-border first:border-t-0 px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-surface-muted/50 transition-colors"
                >
                  <Avatar size="sm" src={s.avatarUrl} name={s.displayName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-ink truncate">{s.displayName}</p>
                      {s.level && <LevelBadge level={s.level} />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted">
                        <span className={`ios-dot ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-ink-faint tabular-nums">
                        {s.nextSessionAt ? `→ ${formatShortDate(s.nextSessionAt)}` : `• ${formatShortDate(s.lastSessionAt)}`}
                      </span>
                      {s.pendingHomework > 0 && (
                        <span className="text-[11px] text-warning-dark font-semibold tabular-nums">{s.pendingHomework} ДЗ</span>
                      )}
                    </div>
                  </div>
                  <svg className="w-3.5 h-3.5 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                </li>
              );
            })}
          </ul>

          <div className="px-5 py-2.5 border-t border-border bg-surface-muted/50 flex items-center justify-between text-[11px] text-ink-muted tabular-nums">
            <span>Показано {filtered.length} з {students.length}</span>
          </div>
        </Card>
      </DashboardPageShell>

      <Modal
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        width="lg"
        bodyClassName="p-0"
      >
        {selectedStudent && (
          <StudentDetail student={selectedStudent} isAdmin={false} />
        )}
      </Modal>
    </>
  );
}
