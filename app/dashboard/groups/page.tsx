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
import { SlideOver } from '@/components/atoms/SlideOver';
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
        subtitle={`${MOCK_GROUPS.length} груп`}
        action={
          <button
            type="button"
            onClick={() => flashToast('🧩 Створення групи — незабаром')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-black hover:opacity-90 transition-opacity"
          >
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
        <div className="py-16 text-center text-ink-muted">
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-semibold">Нічого не знайдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <GroupCard key={g.id} group={g} onClick={() => setSelected(g)} />
          ))}
        </div>
      )}

      <SlideOver
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name}
        width="md"
      >
        {selected && (
          <GroupDetail
            group={selected}
            onAssignClick={() => setAssignOpen(true)}
            onMessage={() => flashToast(`💬 Відкриваю груповий чат: ${selected.name}`)}
          />
        )}
      </SlideOver>

      <AssignLessonModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        lesson={null}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-bold shadow-card-md">
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
      className="bg-white rounded-2xl border border-border p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-card-md transition-all text-left"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-black text-ink truncate">{group.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <LevelBadge level={group.level} />
            <span className="text-xs text-ink-muted">{members.length} учнів</span>
          </div>
        </div>
      </div>

      <div className="flex -space-x-2">
        {members.slice(0, 5).map(m => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={m!.id}
            src={m!.photo}
            alt={m!.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-white"
          />
        ))}
        {members.length > 5 && (
          <span className="w-8 h-8 rounded-full bg-surface-muted border-2 border-white text-[11px] font-black text-ink-muted flex items-center justify-center">
            +{members.length - 5}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatBox label="Відвідуваність" value={`${attPct}%`} tone={attPct >= 85 ? 'success' : attPct >= 70 ? 'accent' : 'danger'} />
        <StatBox label="ДЗ" value={`${hwPct}%`} tone={hwPct >= 80 ? 'success' : hwPct >= 60 ? 'accent' : 'danger'} />
      </div>
    </button>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone: 'success' | 'accent' | 'danger' }) {
  const cls =
    tone === 'success'
      ? 'bg-primary/8 text-primary-dark'
      : tone === 'accent'
        ? 'bg-accent/10 text-accent-dark'
        : 'bg-danger/10 text-danger-dark';
  return (
    <div className={`rounded-xl px-3 py-2 ${cls}`}>
      <p className="text-[10px] font-black uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-sm font-black mt-0.5">{value}</p>
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
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-5 border-b border-border flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <LevelBadge level={group.level} />
          <span className="text-sm text-ink-muted">{members.length} учнів</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Відвідуваність" value={`${Math.round(group.avgAttendance * 100)}%`}
            tone={group.avgAttendance >= 0.85 ? 'success' : group.avgAttendance >= 0.7 ? 'accent' : 'danger'} />
          <StatBox label="ДЗ" value={`${Math.round(group.avgHomework * 100)}%`}
            tone={group.avgHomework >= 0.8 ? 'success' : group.avgHomework >= 0.6 ? 'accent' : 'danger'} />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAssignClick}
            className="flex-1 h-9 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-opacity"
          >
            ✍️ Призначити ДЗ
          </button>
          <button
            type="button"
            onClick={onMessage}
            className="flex-1 h-9 rounded-xl border border-border text-xs font-bold text-ink-muted hover:text-ink hover:border-primary/40 transition-colors"
          >
            💬 Чат групи
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Учасники">
          <ul className="divide-y divide-border">
            {members.map(m => (
              <li key={m.id} className="flex items-center gap-3 px-6 py-3 hover:bg-surface-muted/40 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{m.name}</p>
                  <p className="text-[11px] text-ink-muted">
                    Баланс: {m.lessonsLeft} уроків · ДЗ {Math.round(m.homeworkCompletionRate * 100)}%
                  </p>
                </div>
                <LevelBadge level={m.level} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Наступні уроки">
          {upcoming.length === 0 ? (
            <p className="px-6 py-6 text-sm text-ink-muted">Немає запланованих уроків</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map(l => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{l.topic}</p>
                    <p className="text-[11px] text-ink-muted">{l.date} · {l.time} · {l.duration} хв</p>
                  </div>
                  <LevelBadge level={l.level} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Останні уроки">
          {recent.length === 0 ? (
            <p className="px-6 py-6 text-sm text-ink-muted">Ще не було уроків</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map(l => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink-muted truncate">{l.topic}</p>
                    <p className="text-[11px] text-ink-faint">{l.date}</p>
                  </div>
                  <span className="text-[11px] font-bold text-primary-dark">{l.status === 'done' ? 'Проведено' : l.status}</span>
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
      <p className="px-6 pt-4 pb-1 text-[10px] font-black text-ink-muted uppercase tracking-widest">
        {title}
      </p>
      {children}
    </section>
  );
}
