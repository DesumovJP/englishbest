/**
 * /dashboard/parent — parent role-landing.
 *
 * Live composition of /api/parent/me/children (api::parent.parent route-only
 * aggregation). Admins can also view this page (role-branch passthrough).
 * Uses the canonical K3 shell: loading / error / empty / ready.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { useSession } from '@/lib/session-context';
import {
  childDisplayName,
  fetchMyChildrenCached,
  peekMyChildren,
  type ChildSummary,
  type SessionLite,
  type HomeworkPending,
  type ProgressEntry,
} from '@/lib/parent';

const MONTHS_UA = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
const WEEKDAYS_UA = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function formatDayShort(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_UA[d.getMonth()]}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDueAt(iso: string | null | undefined): string {
  if (!iso) return 'Без дедлайну';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.round((d.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return `Прострочено (${formatDayShort(iso)})`;
  if (diffDays === 0) return 'Сьогодні';
  if (diffDays === 1) return 'Завтра';
  if (diffDays <= 7) return `Через ${diffDays} дн.`;
  return formatDayShort(iso);
}

function childInitials(name: string): string {
  const parts = (name || '?').trim().split(/\s+/);
  return parts.slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase() || '?';
}

const COMPANION_MAP: Record<string, string> = {
  fox: '🦊', cat: '🐱', dragon: '🐲', rabbit: '🐰', raccoon: '🦝', frog: '🐸',
};

function CompanionIcon({ animal }: { animal: string | null }) {
  return <span aria-hidden>{animal ? COMPANION_MAP[animal] ?? '⭐' : '⭐'}</span>;
}

function SessionRow({ session }: { session: SessionLite }) {
  const teacherUser = session.teacher?.user;
  const teacherName = teacherUser?.displayName
    ?? [teacherUser?.firstName, teacherUser?.lastName].filter(Boolean).join(' ')
    ?? '—';
  const dayLabel = `${WEEKDAYS_UA[new Date(session.startAt).getDay()]}, ${formatDayShort(session.startAt)}`;
  return (
    <li className="flex items-center gap-3 px-5 py-3 border-t border-border first:border-t-0 hover:bg-surface-muted/40 transition-colors">
      <div className="w-11 text-center flex-shrink-0">
        <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{dayLabel}</p>
        <p className="text-[15px] font-semibold text-ink tabular-nums mt-0.5">{formatTime(session.startAt)}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink truncate">{session.title}</p>
        <p className="text-[11px] text-ink-muted truncate mt-0.5">{teacherName} · {session.durationMin} хв · {session.type}</p>
      </div>
      {session.joinUrl && (
        <a
          href={session.joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ios-btn ios-btn-secondary text-[11px]"
        >
          Приєднатися
        </a>
      )}
    </li>
  );
}

function HomeworkRow({ sub }: { sub: HomeworkPending }) {
  const hw = sub.homework;
  if (!hw) return null;
  const statusLabel = sub.status === 'notStarted' ? 'Не розпочато'
    : sub.status === 'inProgress' ? 'У процесі'
    : sub.status === 'submitted' ? 'На перевірці'
    : sub.status === 'overdue' ? 'Прострочено'
    : sub.status;
  return (
    <li className="flex items-center gap-3 px-5 py-3 border-t border-border first:border-t-0 hover:bg-surface-muted/40 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink truncate">{hw.title}</p>
        <p className="text-[11px] text-ink-muted mt-0.5">{formatDueAt(hw.dueAt)} · {statusLabel}</p>
      </div>
    </li>
  );
}

function ProgressRow({ row }: { row: ProgressEntry }) {
  if (!row.lesson) return null;
  const label = row.status === 'completed' ? 'Завершено'
    : row.status === 'inProgress' ? 'У процесі'
    : row.status === 'notStarted' ? 'Не розпочато'
    : 'Пропущено';
  const scoreText = row.score !== null && row.score !== undefined
    ? `${row.score}%`
    : row.status === 'completed' ? '✓' : '—';
  return (
    <li className="flex items-center gap-3 px-5 py-3 border-t border-border first:border-t-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink truncate">{row.lesson.title}</p>
        <p className="text-[11px] text-ink-muted mt-0.5">
          {label}
          {row.lastAttemptAt ? ` · ${formatDayShort(row.lastAttemptAt)}` : ''}
          {row.lesson.level ? ` · ${row.lesson.level}` : ''}
        </p>
      </div>
      <span className="text-[13px] font-semibold text-ink tabular-nums flex-shrink-0">{scoreText}</span>
    </li>
  );
}

function ChildBlock({ summary }: { summary: ChildSummary }) {
  const name = childDisplayName(summary.child);
  const kp = summary.child.kidsProfile;

  const kpis: ReadonlyArray<{ label: string; value: string }> = [
    { label: 'Завершено уроків', value: String(summary.completedLessons) },
    { label: 'Середній бал', value: summary.avgScore !== null ? `${summary.avgScore}%` : '—' },
    { label: 'ДЗ чекає', value: String(summary.pendingHomeworkCount) },
    { label: 'Стрік', value: `${kp?.streakDays ?? 0} 🔥` },
  ];

  return (
    <section className="flex flex-col gap-4">
      <Card variant="surface" padding="md">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/15 text-primary-dark flex items-center justify-center text-[22px] font-semibold flex-shrink-0">
            {childInitials(name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[17px] font-semibold text-ink">{name}</h2>
              {summary.child.level && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted px-2 py-0.5 rounded-md bg-surface-muted tabular-nums">
                  {summary.child.level}
                </span>
              )}
            </div>
            <p className="text-[12px] text-ink-muted mt-0.5 flex items-center gap-1.5">
              <CompanionIcon animal={kp?.companionAnimal ?? null} />
              <span>{kp?.companionName ?? '—'}</span>
              <span className="text-ink-faint">·</span>
              <span className="tabular-nums">💰 {kp?.totalCoins ?? 0}</span>
              <span className="text-ink-faint">·</span>
              <span className="tabular-nums">✨ {kp?.totalXp ?? 0} XP</span>
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <Card key={k.label} variant="surface" padding="md">
            <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{k.label}</p>
            <p className="text-[22px] font-semibold text-ink mt-1 tabular-nums leading-none">{k.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card variant="surface" padding="none" className="overflow-hidden">
          <div className="px-5 py-2.5 border-b border-border flex items-baseline justify-between">
            <h3 className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Найближчі заняття</h3>
            <span className="text-[11px] text-ink-faint tabular-nums">{summary.upcomingSessions.length}</span>
          </div>
          {summary.upcomingSessions.length === 0 ? (
            <p className="px-5 py-8 text-center text-[12px] text-ink-muted">Немає запланованих занять.</p>
          ) : (
            <ul>
              {summary.upcomingSessions.map(s => <SessionRow key={s.documentId} session={s} />)}
            </ul>
          )}
        </Card>

        <Card variant="surface" padding="none" className="overflow-hidden">
          <div className="px-5 py-2.5 border-b border-border flex items-baseline justify-between">
            <h3 className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Домашнє завдання</h3>
            <span className="text-[11px] text-ink-faint tabular-nums">{summary.pendingHomework.length}</span>
          </div>
          {summary.pendingHomework.length === 0 ? (
            <p className="px-5 py-8 text-center text-[12px] text-ink-muted">Усе перевірено або нічого не задано.</p>
          ) : (
            <ul>
              {summary.pendingHomework.map(h => <HomeworkRow key={h.documentId} sub={h} />)}
            </ul>
          )}
        </Card>
      </div>

      <Card variant="surface" padding="none" className="overflow-hidden">
        <div className="px-5 py-2.5 border-b border-border">
          <h3 className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">Останні уроки</h3>
        </div>
        {summary.recentProgress.length === 0 ? (
          <p className="px-5 py-8 text-center text-[12px] text-ink-muted">Ще немає активності.</p>
        ) : (
          <ul>
            {summary.recentProgress.map(p => <ProgressRow key={p.documentId} row={p} />)}
          </ul>
        )}
      </Card>
    </section>
  );
}

export default function ParentPage() {
  const { session, status: sessionStatus } = useSession();
  const role = session?.profile?.role ?? null;
  const canView = role === 'parent' || role === 'admin';

  const cachedChildren = canView ? peekMyChildren() : null;
  const [children, setChildren]   = useState<ChildSummary[] | null>(cachedChildren);
  const [loading, setLoading]     = useState(canView && cachedChildren === null);
  const [error, setError]         = useState<string | null>(null);
  const [activeId, setActiveId]   = useState<string | null>(
    cachedChildren && cachedChildren.length > 0 ? cachedChildren[0].child.documentId : null,
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!canView) return;
    let alive = true;
    fetchMyChildrenCached()
      .then(list => {
        if (!alive) return;
        setChildren(list);
        if (list.length > 0) setActiveId(prev => prev ?? list[0].child.documentId);
      })
      .catch(e => { if (alive) setError(e?.message ?? 'Не вдалось завантажити'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [canView, reloadKey]);

  const active = useMemo(
    () => (children ?? []).find(c => c.child.documentId === activeId) ?? null,
    [children, activeId],
  );

  if (sessionStatus === 'loading') {
    return <DashboardPageShell title="Кабінет батьків" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }

  if (sessionStatus === 'anonymous' || !role) {
    return (
      <DashboardPageShell
        title="Кабінет батьків"
        status="empty"
        empty={{ title: 'Потрібно увійти', description: 'Увійдіть в обліковий запис з роллю «Батько» або «Адмін».' }}
      />
    );
  }

  if (!canView) {
    return (
      <DashboardPageShell
        title="Кабінет батьків"
        status="empty"
        empty={{ title: 'Розділ для батьків', description: 'Ця сторінка доступна лише батькам і адміністраторам.' }}
      />
    );
  }

  if (loading && !children) {
    return <DashboardPageShell title="Кабінет батьків" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }

  if (error) {
    return (
      <DashboardPageShell
        title="Кабінет батьків"
        status="error"
        error={error}
        onRetry={() => setReloadKey(k => k + 1)}
      />
    );
  }

  if (!children || children.length === 0) {
    return (
      <DashboardPageShell
        title="Кабінет батьків"
        status="empty"
        empty={{
          title: 'Діти ще не прив\u2019язані',
          description: 'До вашого акаунту ще не прив\u2019язаний жоден учень. Зверніться до адміністратора школи.',
        }}
      />
    );
  }

  const subtitle = `${children.length} ${children.length === 1 ? 'дитина' : 'дітей'} · прогрес та розклад`;

  return (
    <DashboardPageShell
      title="Кабінет батьків"
      subtitle={subtitle}
      toolbar={
        children.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
            {children.map(c => {
              const name = childDisplayName(c.child);
              const isActive = c.child.documentId === activeId;
              return (
                <button
                  key={c.child.documentId}
                  type="button"
                  onClick={() => setActiveId(c.child.documentId)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors flex-shrink-0 ${
                    isActive ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-surface-muted'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 ${
                    isActive ? 'bg-primary text-white' : 'bg-surface-muted text-ink-muted'
                  }`}>
                    {childInitials(name)}
                  </span>
                  <div className="text-left">
                    <p className={`text-[13px] font-semibold leading-none ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                      {name}
                    </p>
                    {c.pendingHomeworkCount > 0 && (
                      <p className="text-[10px] text-warning-dark mt-0.5 tabular-nums">{c.pendingHomeworkCount} ДЗ</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : undefined
      }
    >
      {active && <ChildBlock summary={active} />}
    </DashboardPageShell>
  );
}
