/**
 * /dashboard/teacher — teacher role-landing.
 *
 * Composition of existing live data (no new backend, no mocks):
 *   fetchMyStudents() · fetchHomeworks() · fetchSubmissions() · fetchGroups()
 *
 * Renders:
 *   - Greeting header (session firstName + current date)
 *   - Stat strip (active students · pending submissions · published homeworks)
 *   - "Unreviewed submissions" list → deep-link to /dashboard/homework/[id]/review
 *   - "Students at risk" (pending > 0) → deep-link to /dashboard/chat
 *   - "Groups" glance → /dashboard/groups
 *
 * Non-teacher roles: empty shell (platform-wide dashboards live elsewhere).
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/teacher/ui';
import { useSession } from '@/lib/session-context';
import { fetchMyStudentsCached, peekMyStudents, type TeacherStudent } from '@/lib/teacher-students';
import {
  fetchHomeworksCached,
  fetchSubmissionsCached,
  peekHomeworks,
  peekSubmissions,
  type Homework,
  type Submission,
} from '@/lib/homework';
import { fetchGroupsCached, peekGroups, type Group, type GroupLevel } from '@/lib/groups';

interface DashboardData {
  students: TeacherStudent[];
  homeworks: Homework[];
  submissions: Submission[];
  groups: Group[];
}

function formatShortDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  } catch {
    return '—';
  }
}

const DATE_LABEL = new Date().toLocaleDateString('uk-UA', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
});

export default function TeacherDashboardPage() {
  const { session, status: sessionStatus } = useSession();
  const role = session?.profile?.role ?? null;
  const firstName = session?.profile?.firstName ?? '';

  const cachedDashboard = useMemo<DashboardData | null>(() => {
    const students = peekMyStudents();
    const homeworks = peekHomeworks();
    const submissions = peekSubmissions();
    const groups = peekGroups();
    if (students && homeworks && submissions && groups) {
      return { students, homeworks, submissions, groups };
    }
    return null;
  }, []);

  const [data,    setData]    = useState<DashboardData | null>(cachedDashboard);
  const [loading, setLoading] = useState(cachedDashboard === null);
  const [error,   setError]   = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (role !== 'teacher') return;
    let alive = true;
    Promise.all([
      fetchMyStudentsCached(),
      fetchHomeworksCached(),
      fetchSubmissionsCached(),
      fetchGroupsCached(),
    ])
      .then(([students, homeworks, submissions, groups]) => {
        if (alive) setData({ students, homeworks, submissions, groups });
      })
      .catch(e => { if (alive) setError(e?.message ?? 'Не вдалось завантажити'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [role, reloadKey]);

  const pendingSubmissions = useMemo(
    () => (data?.submissions ?? []).filter(s => s.status === 'submitted').slice(0, 6),
    [data?.submissions],
  );
  const publishedHw = useMemo(
    () => (data?.homeworks ?? []).filter(h => h.status === 'published').length,
    [data?.homeworks],
  );
  const atRisk = useMemo(
    () => (data?.students ?? [])
      .filter(s => s.pendingHomework > 0 || s.status === 'expired')
      .slice(0, 5),
    [data?.students],
  );
  const activeStudents = useMemo(
    () => (data?.students ?? []).filter(s => s.status === 'active').length,
    [data?.students],
  );

  // Non-teacher branches
  if (sessionStatus === 'loading') {
    return <DashboardPageShell title="Кабінет вчителя" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }

  if (role !== 'teacher') {
    return (
      <DashboardPageShell
        title="Кабінет вчителя"
        subtitle="Доступно тільки вчителям"
        status="empty"
        empty={{
          title: 'Розділ для вчителів',
          description: 'Ця сторінка збирає зведені дані по учнях, ДЗ та групах — доступна лише обліковим записам із роллю «teacher».',
        }}
      />
    );
  }

  if (loading && !data) {
    return <DashboardPageShell title={`Привіт${firstName ? `, ${firstName}` : ''}`} subtitle={DATE_LABEL} status="loading" loadingShape="card" />;
  }

  if (error) {
    return (
      <DashboardPageShell
        title={`Привіт${firstName ? `, ${firstName}` : ''}`}
        subtitle={DATE_LABEL}
        status="error"
        error={error}
        onRetry={() => setReloadKey(k => k + 1)}
      />
    );
  }

  return (
    <DashboardPageShell
      title={firstName ? `Привіт, ${firstName}` : 'Кабінет вчителя'}
      subtitle={DATE_LABEL}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/homework" className="ios-btn ios-btn-primary">Перевірити ДЗ</Link>
          <Link href="/dashboard/students" className="ios-btn ios-btn-secondary">Мої учні</Link>
        </div>
      }
    >
      {/* Stat strip */}
      <Card variant="surface" padding="none" className="overflow-hidden">
        <div className="grid grid-cols-3">
          <StatCell label="Активних учнів" value={activeStudents} hint={`з ${data?.students.length ?? 0}`} />
          <StatCell label="На перевірку"   value={pendingSubmissions.length > 6 ? '6+' : pendingSubmissions.length} hint="ДЗ у черзі" className="border-l border-border" hintClass={pendingSubmissions.length >= 6 ? 'text-warning-dark font-semibold' : undefined} />
          <StatCell label="Опубліковано ДЗ" value={publishedHw} hint="активних завдань" className="border-l border-border" />
        </div>
      </Card>

      {/* Pending submissions */}
      <section>
        <SectionHead title="Неперевірені роботи" count={pendingSubmissions.length} href="/dashboard/homework" />
        {pendingSubmissions.length === 0 ? (
          <Card variant="surface" padding="md">
            <div className="py-6 text-center">
              <p className="text-[13px] font-semibold text-ink">Все чисто</p>
              <p className="text-[12px] text-ink-muted mt-1">Немає робіт на перевірці</p>
            </div>
          </Card>
        ) : (
          <Card variant="surface" padding="none" className="overflow-hidden">
            <ul className="divide-y divide-border">
              {pendingSubmissions.map(sub => (
                <li key={sub.documentId} className="flex items-center gap-3 px-4 py-3">
                  <Avatar size="sm" src={sub.student?.avatarUrl} name={sub.student?.displayName ?? '—'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{sub.student?.displayName ?? '—'}</p>
                    <p className="text-[12px] text-ink-muted truncate">
                      {sub.homework?.title ?? 'ДЗ'}
                      {sub.submittedAt && <> · здано {formatShortDate(sub.submittedAt)}</>}
                    </p>
                  </div>
                  <Link
                    href={sub.homework ? `/dashboard/homework/${sub.homework.documentId}/review` : '/dashboard/homework'}
                    className="ios-btn ios-btn-sm ios-btn-secondary flex-shrink-0"
                  >
                    Перевірити
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Students at risk */}
      <section>
        <SectionHead title="Учні, яким потрібна увага" count={atRisk.length} href="/dashboard/students" />
        {atRisk.length === 0 ? (
          <Card variant="surface" padding="md">
            <div className="py-6 text-center">
              <p className="text-[13px] font-semibold text-ink">Усі в нормі</p>
              <p className="text-[12px] text-ink-muted mt-1">Немає учнів із простроченим ДЗ</p>
            </div>
          </Card>
        ) : (
          <Card variant="surface" padding="none" className="overflow-hidden">
            <ul className="divide-y divide-border">
              {atRisk.map(s => (
                <li key={s.documentId} className="flex items-center gap-3 px-4 py-3">
                  <Avatar size="sm" src={s.avatarUrl} name={s.displayName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-ink truncate">{s.displayName}</p>
                      {s.level && <LevelBadge level={s.level} />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {s.pendingHomework > 0 && (
                        <span className="text-[11px] text-warning-dark inline-flex items-center gap-1.5">
                          <span className="ios-dot ios-dot-warn" />
                          {s.pendingHomework} ДЗ у роботі
                        </span>
                      )}
                      {s.status === 'expired' && (
                        <span className="text-[11px] text-danger-dark inline-flex items-center gap-1.5">
                          <span className="ios-dot ios-dot-danger" />
                          Немає занять {s.lastSessionAt ? `з ${formatShortDate(s.lastSessionAt)}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/chat?thread=student:${s.documentId}`}
                    className="ios-btn ios-btn-sm ios-btn-secondary flex-shrink-0"
                  >
                    Написати
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Groups glance */}
      <section>
        <SectionHead title="Групи" count={data?.groups.length} href="/dashboard/groups" />
        {(data?.groups.length ?? 0) === 0 ? (
          <Card variant="surface" padding="md">
            <div className="py-6 text-center">
              <p className="text-[13px] font-semibold text-ink">Поки немає груп</p>
              <p className="text-[12px] text-ink-muted mt-1">Створи першу групу, щоб планувати заняття</p>
              <div className="mt-3 flex justify-center">
                <Link href="/dashboard/groups" className="ios-btn ios-btn-sm ios-btn-primary">Перейти до груп</Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.groups.slice(0, 6).map(group => (
              <Link
                key={group.documentId}
                href={`/dashboard/groups?id=${group.documentId}`}
                className="ios-card p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-[13px] font-semibold text-ink truncate">{group.name}</p>
                  <LevelBadge level={group.level as GroupLevel} />
                </div>
                <div className="flex items-center gap-4 text-[12px] text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="ios-dot" />
                    {group.members.length} учнів
                  </span>
                  {group.avgAttendance > 0 && (
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      {Math.round(group.avgAttendance * 100)}% відвід.
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </DashboardPageShell>
  );
}

function StatCell({ label, value, hint, hintClass, className = '' }: { label: string; value: React.ReactNode; hint?: string; hintClass?: string; className?: string }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{label}</p>
      <p className="text-[22px] font-semibold text-ink tabular-nums leading-none mt-1.5">{value}</p>
      {hint && <p className={`text-[11px] mt-1 ${hintClass ?? 'text-ink-muted'}`}>{hint}</p>}
    </div>
  );
}

function SectionHead({ title, count, href }: { title: string; count?: number; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-semibold text-ink tracking-tight">{title}</h2>
        {count !== undefined && (
          <span className="text-[12px] font-semibold text-ink-faint tabular-nums">{count}</span>
        )}
      </div>
      {href && (
        <Link href={href} className="text-[12px] font-semibold text-ink-muted hover:text-ink transition-colors">
          Все →
        </Link>
      )}
    </div>
  );
}
