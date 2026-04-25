'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchGroupsCached,
  peekGroups,
  type Group,
  type GroupMember,
} from '@/lib/groups';
import { fetchSessions, type Session } from '@/lib/sessions';
import { LevelBadge, SearchInput } from '@/components/teacher/ui';
import { Modal } from '@/components/ui/Modal';
import { CreateHomeworkModal } from '@/components/teacher/CreateHomeworkModal';
import { CreateGroupModal } from '@/components/teacher/CreateGroupModal';
import { DashboardPageShell } from '@/components/ui/shells';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export default function GroupsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const cachedGroups = peekGroups();
  const [groups, setGroups] = useState<Group[]>(cachedGroups ?? []);
  const [loading, setLoading] = useState(cachedGroups === null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Group | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await fetchGroupsCached();
        if (!alive) return;
        setGroups(rows);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'failed');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter(g => q === '' || g.name.toLowerCase().includes(q));
  }, [groups, query]);

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  }

  const shellStatus: 'loading' | 'error' | 'empty' | 'ready' =
    error ? 'error'
    : loading ? 'loading'
    : filtered.length === 0 ? 'empty'
    : 'ready';

  return (
    <>
    <DashboardPageShell
      title="Групи"
      subtitle={loading ? 'Завантаження…' : `${groups.length} активних груп`}
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          + Група
        </Button>
      }
      toolbar={
        <SearchInput
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Пошук за назвою…"
          containerClassName="w-full sm:w-80"
        />
      }
      status={shellStatus}
      error={error ?? undefined}
      onRetry={() => location.reload()}
      loadingShape="card"
      empty={{
        title: groups.length === 0 ? 'Ще немає груп' : 'Нічого не знайдено',
        description:
          groups.length === 0
            ? 'Створіть першу групу, щоб почати'
            : 'Спробуй інший запит',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(g => (
          <GroupCard key={g.documentId} group={g} onClick={() => setSelected(g)} />
        ))}
      </div>
    </DashboardPageShell>

    <Modal
      isOpen={selected !== null}
      onClose={() => setSelected(null)}
      title={selected?.name}
      width="lg"
      bodyClassName="p-0"
    >
      {selected && (
        <GroupDetail
          group={selected}
          onAssignClick={() => setAssignOpen(true)}
          onEdit={() => {
            setEditing(selected);
            setSelected(null);
          }}
          onMessage={() => {
            const qs = new URLSearchParams({ tab: 'group', q: selected.name });
            router.push(`/dashboard/chat?${qs.toString()}`);
          }}
        />
      )}
    </Modal>

    <CreateHomeworkModal
      open={assignOpen}
      onClose={() => setAssignOpen(false)}
      defaultTarget={selected ? { type: 'group', id: selected.documentId } : undefined}
      onCreated={hw => flashToast(`ДЗ опубліковано: ${hw.title}`)}
    />

    <CreateGroupModal
      open={createOpen}
      onClose={() => setCreateOpen(false)}
      onCreated={(g) => {
        setGroups((prev) => [g, ...prev]);
        flashToast(`Групу «${g.name}» створено`);
      }}
    />

    <CreateGroupModal
      open={editing !== null}
      onClose={() => setEditing(null)}
      editing={editing}
      onUpdated={(g) => {
        setGroups((prev) => prev.map((x) => (x.documentId === g.documentId ? g : x)));
        flashToast(`Групу «${g.name}» оновлено`);
      }}
      onDeleted={(groupId) => {
        setGroups((prev) => prev.filter((x) => x.documentId !== groupId));
        flashToast('Групу видалено');
      }}
    />

    {toast && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
        {toast}
      </div>
    )}
    </>
  );
}

function StackedAvatar({ member }: { member: GroupMember }) {
  return (
    <Avatar
      name={member.displayName || '?'}
      src={member.avatarUrl ?? null}
      size="sm"
      className="border-2 border-surface-raised bg-surface-muted text-ink-muted"
    />
  );
}

function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  const members = group.members;
  const attPct = Math.round(group.avgAttendance * 100);
  const hwPct = Math.round(group.avgHomework * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className="ios-card p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink truncate">{group.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <LevelBadge level={group.level} />
            <span className="text-[12px] text-ink-muted">{members.length} учнів</span>
          </div>
        </div>
      </div>

      <div className="flex -space-x-1.5 min-h-8">
        {members.slice(0, 5).map(m => (
          <StackedAvatar key={m.documentId} member={m} />
        ))}
        {members.length > 5 && (
          <span className="w-8 h-8 rounded-full bg-surface-muted border-2 border-surface-raised text-[10px] font-semibold text-ink-muted flex items-center justify-center">
            +{members.length - 5}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
        <StatCell label="Відвідуваність" value={`${attPct}%`} />
        <StatCell label="ДЗ" value={`${hwPct}%`} />
      </div>
    </button>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="text-[15px] font-semibold text-ink mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

function GroupDetail({
  group,
  onAssignClick,
  onEdit,
  onMessage,
}: {
  group: Group;
  onAssignClick: () => void;
  onEdit: () => void;
  onMessage: () => void;
}) {
  const members = group.members;
  const [upcoming, setUpcoming] = useState<Session[] | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setUpcoming(null);
    setSessionsError(null);
    (async () => {
      try {
        const all = await fetchSessions({
          fromISO: new Date().toISOString(),
          status: ['scheduled', 'live'],
        });
        if (!alive) return;
        const memberIds = new Set(members.map((m) => m.documentId));
        const mine = all
          .filter((s) => s.attendees.some((a) => memberIds.has(a.documentId)))
          .sort((a, b) => a.startAt.localeCompare(b.startAt))
          .slice(0, 5);
        setUpcoming(mine);
      } catch (e) {
        if (!alive) return;
        setSessionsError(e instanceof Error ? e.message : 'failed');
        setUpcoming([]);
      }
    })();
    return () => { alive = false; };
  }, [group.documentId, members]);

  return (
    <div>
      <div className="px-6 pt-4 pb-5 border-b border-border flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <LevelBadge level={group.level} />
          <span className="text-[13px] text-ink-muted">{members.length} учнів</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCell label="Відвідуваність" value={`${Math.round(group.avgAttendance * 100)}%`} />
          <StatCell label="Здача ДЗ" value={`${Math.round(group.avgHomework * 100)}%`} />
        </div>
        <div className="flex gap-2">
          <Button onClick={onAssignClick} fullWidth>
            Призначити ДЗ
          </Button>
          <Button variant="secondary" onClick={onMessage} fullWidth>
            Чат групи
          </Button>
        </div>
        <Button variant="secondary" onClick={onEdit} fullWidth>
          Редагувати групу
        </Button>
      </div>

      <div>
        <Section title="Учасники">
          {members.length === 0 ? (
            <p className="px-6 py-4 text-[13px] text-ink-muted">Ще немає учасників</p>
          ) : (
            <ul>
              {members.map(m => (
                <li
                  key={m.documentId}
                  className="flex items-center gap-3 px-6 py-2.5 border-t border-border first:border-t-0 hover:bg-surface-muted/50 transition-colors"
                >
                  <Avatar
                    name={m.displayName || '?'}
                    src={m.avatarUrl ?? null}
                    size="sm"
                    className="bg-surface-muted text-ink-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{m.displayName}</p>
                  </div>
                  {m.level && <LevelBadge level={m.level} />}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Наступні уроки">
          {upcoming === null ? (
            <p className="px-6 py-4 text-[13px] text-ink-muted">Завантаження…</p>
          ) : sessionsError ? (
            <p className="px-6 py-4 text-[13px] text-danger-dark">Не вдалось завантажити розклад</p>
          ) : upcoming.length === 0 ? (
            <p className="px-6 py-4 text-[13px] text-ink-muted">Поки немає запланованих уроків</p>
          ) : (
            <ul>
              {upcoming.map((s) => (
                <SessionRow key={s.documentId} session={s} />
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: Session }) {
  const when = formatSessionWhen(session.startAt);
  return (
    <li className="flex items-center gap-3 px-6 py-2.5 border-t border-border first:border-t-0">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink truncate">{session.title || 'Урок'}</p>
        <p className="text-[11px] text-ink-muted tabular-nums">
          {when} · {session.durationMin} хв · {session.attendees.length} учасників
        </p>
      </div>
      {session.joinUrl ? (
        <a
          href={session.joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ios-btn ios-btn-sm ios-btn-secondary"
        >
          Join
        </a>
      ) : (
        <span className="text-[11px] text-ink-faint">{session.status}</span>
      )}
    </li>
  );
}

function formatSessionWhen(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="px-6 pt-4 pb-1.5 text-[10px] font-semibold text-ink-faint uppercase tracking-wider">
        {title}
      </p>
      {children}
    </section>
  );
}
