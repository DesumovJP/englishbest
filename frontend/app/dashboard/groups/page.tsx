'use client';
import { useMemo, useState } from 'react';
import {
  MOCK_GROUPS,
  MOCK_SCHEDULE,
  MOCK_STUDENTS,
  MOCK_TODAY,
  type Group,
} from '@/lib/teacher-mocks';
import { LevelBadge, PageHeader, SearchInput } from '@/components/teacher/ui';
import { Modal } from '@/components/atoms/Modal';
import { AssignLessonModal } from '@/components/teacher/AssignLessonModal';

export default function GroupsPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Group | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_GROUPS.filter(g => q === '' || g.name.toLowerCase().includes(q));
  }, [query]);

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Групи"
        subtitle={`${MOCK_GROUPS.length} активних груп`}
        action={
          <button type="button" onClick={() => flashToast('Створення групи — незабаром')} className="ios-btn ios-btn-primary">
            + Група
          </button>
        }
      />

      <SearchInput
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Пошук за назвою…"
        containerClassName="w-full sm:w-80"
      />

      {filtered.length === 0 ? (
        <div className="ios-card py-16 text-center">
          <p className="text-[14px] font-semibold text-ink">Нічого не знайдено</p>
          <p className="text-[13px] text-ink-muted mt-1">Спробуй інший запит</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <GroupCard key={g.id} group={g} onClick={() => setSelected(g)} />
          ))}
        </div>
      )}

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
            onMessage={() => flashToast(`Відкриваю груповий чат: ${selected.name}`)}
          />
        )}
      </Modal>

      <AssignLessonModal open={assignOpen} onClose={() => setAssignOpen(false)} lesson={null} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-semibold shadow-card-md">
          {toast}
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  const members = group.studentIds.map(id => MOCK_STUDENTS.find(s => s.id === id)).filter(Boolean);
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

      <div className="flex -space-x-1.5">
        {members.slice(0, 5).map(m => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={m!.id}
            src={m!.photo}
            alt={m!.name}
            className="w-7 h-7 rounded-full object-cover border-2 border-white"
          />
        ))}
        {members.length > 5 && (
          <span className="w-7 h-7 rounded-full bg-surface-muted border-2 border-white text-[10px] font-semibold text-ink-muted flex items-center justify-center">
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
  onMessage,
}: {
  group: Group;
  onAssignClick: () => void;
  onMessage: () => void;
}) {
  const members = group.studentIds.map(id => MOCK_STUDENTS.find(s => s.id === id)!).filter(Boolean);
  const upcoming = MOCK_SCHEDULE
    .filter(l => l.groupId === group.id && l.date >= MOCK_TODAY)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);
  const recent = MOCK_SCHEDULE
    .filter(l => l.groupId === group.id && l.date < MOCK_TODAY)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 3);

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
          <button type="button" onClick={onAssignClick} className="ios-btn ios-btn-primary flex-1">
            Призначити ДЗ
          </button>
          <button type="button" onClick={onMessage} className="ios-btn ios-btn-secondary flex-1">
            Чат групи
          </button>
        </div>
      </div>

      <div>
        <Section title="Учасники">
          <ul>
            {members.map(m => (
              <li key={m.id} className="flex items-center gap-3 px-6 py-2.5 border-t border-border first:border-t-0 hover:bg-surface-muted/50 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{m.name}</p>
                  <p className="text-[11px] text-ink-muted tabular-nums">
                    Баланс: {m.lessonsLeft} · ДЗ {Math.round(m.homeworkCompletionRate * 100)}%
                  </p>
                </div>
                <LevelBadge level={m.level} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Наступні уроки">
          {upcoming.length === 0 ? (
            <p className="px-6 py-4 text-[13px] text-ink-muted">Немає запланованих уроків</p>
          ) : (
            <ul>
              {upcoming.map(l => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-6 py-2.5 border-t border-border first:border-t-0">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{l.topic}</p>
                    <p className="text-[11px] text-ink-muted tabular-nums">{l.date} · {l.time} · {l.duration} хв</p>
                  </div>
                  <LevelBadge level={l.level} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Останні уроки">
          {recent.length === 0 ? (
            <p className="px-6 py-4 text-[13px] text-ink-muted">Ще не було уроків</p>
          ) : (
            <ul>
              {recent.map(l => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-6 py-2.5 border-t border-border first:border-t-0">
                  <div className="min-w-0">
                    <p className="text-[13px] text-ink truncate">{l.topic}</p>
                    <p className="text-[11px] text-ink-faint tabular-nums">{l.date}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-ink-muted">{l.status === 'done' ? 'Проведено' : l.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
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
