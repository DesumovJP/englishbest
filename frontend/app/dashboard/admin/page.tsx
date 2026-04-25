/**
 * /dashboard/admin — admin role-landing.
 *
 * Composition of existing live endpoints (no mocks):
 *   fetchAdminAnalytics()  — platform KPI, timeSeries, topTeachers, levelBuckets
 *   fetchGroups()          — active groups overview
 *
 * Non-admin roles: empty state (admin-only section).
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardPageShell } from '@/components/ui/shells';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { LevelBadge } from '@/components/teacher/ui';
import { useSession } from '@/lib/session-context';
import { fetchAdminAnalyticsCached, peekAdminAnalytics, type AdminAnalyticsData } from '@/lib/analytics';
import { fetchGroupsCached, peekGroups, type Group, type GroupLevel } from '@/lib/groups';

interface DashboardData {
  analytics: AdminAnalyticsData;
  groups: Group[];
}

const DATE_LABEL = new Date().toLocaleDateString('uk-UA', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
});

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `₴${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₴${Math.round(n / 1_000)}к`;
  return `₴${n.toLocaleString('uk-UA')}`;
}

export default function AdminDashboardPage() {
  const { session, status: sessionStatus } = useSession();
  const role = session?.profile?.role ?? null;
  const firstName = session?.profile?.firstName ?? '';

  const cachedDashboard = useMemo<DashboardData | null>(() => {
    if (role !== 'admin') return null;
    const analytics = peekAdminAnalytics();
    const groups = peekGroups();
    if (analytics && groups) return { analytics, groups };
    return null;
  }, [role]);

  const [data,    setData]    = useState<DashboardData | null>(cachedDashboard);
  const [loading, setLoading] = useState(role === 'admin' && cachedDashboard === null);
  const [error,   setError]   = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (role !== 'admin') return;
    let alive = true;
    setError(null);
    Promise.all([fetchAdminAnalyticsCached(), fetchGroupsCached()])
      .then(([analytics, groups]) => { if (alive) setData({ analytics, groups }); })
      .catch(e => { if (alive) setError(e?.message ?? 'Не вдалось завантажити'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [role, reloadKey]);

  const current  = useMemo(() => data?.analytics.timeSeries.at(-1), [data]);
  const previous = useMemo(() => data?.analytics.timeSeries.at(-2), [data]);
  const deltaPct = useMemo(() => {
    if (!current || !previous || previous.revenue === 0) return null;
    return Math.round(((current.revenue - previous.revenue) / previous.revenue) * 100);
  }, [current, previous]);

  if (sessionStatus === 'loading') {
    return <DashboardPageShell title="Кабінет адміністратора" subtitle="Завантаження…" status="loading" loadingShape="card" />;
  }

  if (role !== 'admin') {
    return (
      <DashboardPageShell
        title="Кабінет адміністратора"
        subtitle="Доступно тільки адміністраторам"
        status="empty"
        empty={{
          title: 'Розділ для адміністраторів',
          description: 'Платформенна панель доступна лише обліковим записам із роллю «admin».',
        }}
      />
    );
  }

  if (loading && !data) {
    return <DashboardPageShell title={firstName ? `Привіт, ${firstName}` : 'Кабінет адміністратора'} subtitle={DATE_LABEL} status="loading" loadingShape="card" />;
  }

  if (error) {
    return (
      <DashboardPageShell
        title={firstName ? `Привіт, ${firstName}` : 'Кабінет адміністратора'}
        subtitle={DATE_LABEL}
        status="error"
        error={error}
        onRetry={() => setReloadKey(k => k + 1)}
      />
    );
  }

  const kpis = data!.analytics.kpis;

  return (
    <DashboardPageShell
      title={firstName ? `Привіт, ${firstName}` : 'Кабінет адміністратора'}
      subtitle={DATE_LABEL}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/analytics" className="ios-btn ios-btn-primary">Повна аналітика</Link>
          <Link href="/dashboard/groups"    className="ios-btn ios-btn-secondary">Групи</Link>
        </div>
      }
    >
      {/* KPI strip */}
      <Card variant="surface" padding="none" className="overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4">
          <StatCell
            label="Дохід за місяць"
            value={formatMoney(kpis.revenueThisMonth)}
            hint={deltaPct !== null ? `${deltaPct >= 0 ? '+' : ''}${deltaPct}% від попер.` : 'початок періоду'}
            hintClass={deltaPct !== null && deltaPct < 0 ? 'text-danger-dark' : deltaPct !== null && deltaPct > 0 ? 'text-success-dark' : undefined}
          />
          <StatCell label="Активні учні"   value={kpis.activeStudents}    hint={`з ${kpis.learnersTotal}`} className="md:border-l border-border" />
          <StatCell label="Уроків за місяць" value={kpis.lessonsThisMonth} hint="проведено"              className="border-t md:border-t-0 md:border-l border-border" />
          <StatCell
            label="Середній рейтинг"
            value={kpis.avgRating !== null ? kpis.avgRating.toFixed(1) : '—'}
            hint={kpis.reviewsTotal > 0 ? `${kpis.reviewsTotal} відгуків` : 'немає відгуків'}
            className="border-t md:border-t-0 md:border-l border-border"
          />
        </div>
      </Card>

      {/* Level distribution */}
      <section>
        <SectionHead title="Розподіл за рівнями" count={data!.analytics.levelBuckets.reduce((sum, b) => sum + b.count, 0)} />
        {data!.analytics.levelBuckets.length === 0 ? (
          <Card variant="surface" padding="md">
            <p className="py-4 text-center text-[13px] text-ink-muted">Ще немає даних</p>
          </Card>
        ) : (
          <Card variant="surface" padding="md">
            <div className="flex flex-wrap gap-2">
              {data!.analytics.levelBuckets.map(b => (
                <span
                  key={b.level}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-muted text-[12px] font-semibold text-ink tabular-nums"
                >
                  <LevelBadge level={b.level as GroupLevel} />
                  {b.count}
                  <span className="text-ink-muted font-normal">· {Math.round(b.pct * 100)}%</span>
                </span>
              ))}
            </div>
          </Card>
        )}
      </section>

      {/* Top teachers */}
      <section>
        <SectionHead
          title="Топ вчителів"
          count={data!.analytics.topTeachers.length}
          href="/dashboard/analytics"
        />
        {data!.analytics.topTeachers.length === 0 ? (
          <Card variant="surface" padding="md">
            <p className="py-4 text-center text-[13px] text-ink-muted">Поки немає активних вчителів</p>
          </Card>
        ) : (
          <Card variant="surface" padding="none" className="overflow-hidden">
            <ul className="divide-y divide-border">
              {data!.analytics.topTeachers.slice(0, 5).map((t, i) => (
                <li key={t.documentId} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 text-center text-[11px] font-semibold text-ink-faint tabular-nums flex-shrink-0">#{i + 1}</span>
                  <Avatar size="sm" name={t.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{t.name}</p>
                    <p className="text-[12px] text-ink-muted truncate tabular-nums">
                      {t.students} учнів
                      {t.rating !== null && <> · ★ {t.rating.toFixed(1)}</>}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-ink tabular-nums flex-shrink-0">{formatMoney(t.revenue)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      {/* Groups glance */}
      <section>
        <SectionHead title="Активні групи" count={data!.groups.length} href="/dashboard/groups" />
        {data!.groups.length === 0 ? (
          <Card variant="surface" padding="md">
            <p className="py-4 text-center text-[13px] text-ink-muted">Ще немає створених груп</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data!.groups.slice(0, 6).map(group => (
              <Link
                key={group.documentId}
                href={`/dashboard/groups?id=${group.documentId}`}
                className="ios-card p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-[13px] font-semibold text-ink truncate">{group.name}</p>
                  <LevelBadge level={group.level as GroupLevel} />
                </div>
                <div className="flex items-center gap-3 text-[12px] text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="ios-dot" />
                    {group.members.length} учнів
                  </span>
                  {group.teacher && (
                    <span className="truncate">· {group.teacher.displayName}</span>
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
      <p className="text-[20px] font-semibold text-ink tabular-nums leading-none mt-1.5">{value}</p>
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
