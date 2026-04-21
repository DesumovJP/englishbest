'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  MOCK_TODAY,
  MOCK_GROUPS,
  LESSON_STATUS_STYLES,
  lessonsOnDate,
  pendingHomework,
  atRiskStudents,
  getStudent,
  getGroup,
} from '@/lib/teacher-mocks';
import {
  EmptyState,
  LevelBadge,
  StatusPill,
} from '@/components/teacher/ui';

const TEACHER = {
  name: 'Maria Sydorenko',
};

const DATE_LABEL = new Date(MOCK_TODAY + 'T00:00').toLocaleDateString('uk-UA', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
});

function daysAgoText(iso: string) {
  const today = new Date(MOCK_TODAY);
  const target = new Date(iso + 'T00:00');
  const days = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (days <= 0) return 'сьогодні';
  if (days === 1) return 'вчора';
  if (days < 5) return `${days} дні тому`;
  return `${days} днів тому`;
}

export default function TeacherDashboardPage() {
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const todayLessons = useMemo(() => lessonsOnDate(MOCK_TODAY), []);
  const pending = useMemo(pendingHomework, []);
  const atRisk = useMemo(atRiskStudents, []);

  const done = todayLessons.filter(l => l.status === 'done').length;
  const active = todayLessons.find(l => l.status === 'in-progress');
  const remaining = todayLessons.length - done;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-5 border-b border-border">
        <div>
          <p className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">{DATE_LABEL}</p>
          <h1 className="text-[22px] md:text-[26px] font-semibold text-ink tracking-tight leading-tight mt-1">
            Привіт, {TEACHER.name.split(' ')[0]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/teacher-calendar" className="ios-btn ios-btn-secondary">Розклад тижня</Link>
          <Link href="/dashboard/homework" className="ios-btn ios-btn-primary">Перевірити ДЗ</Link>
        </div>
      </header>

      {/* Stat row — 3 equal cells with hairline dividers */}
      <section className="grid grid-cols-3 ios-card overflow-hidden">
        <StatCell label="Проведено"  value={done}           hint="сьогодні" />
        <StatCell label="Залишилось" value={remaining}      hint="уроків"     className="border-l border-border" />
        <StatCell
          label="На перевірку"
          value={pending.length}
          hint={pending.length === 0 ? 'все чисто' : pending.length >= 20 ? 'терміново' : pending.length >= 10 ? 'як буде час' : 'у черзі'}
          hintClass={pending.length >= 20 ? 'text-danger-dark' : pending.length >= 10 ? 'text-accent-dark' : undefined}
          className="border-l border-border"
        />
      </section>

      {/* Active lesson callout */}
      {active && (
        <section className="ios-card p-5 flex items-center gap-4">
          <span className="relative flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-success/30 animate-ping" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-success block" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Зараз · {active.time}</p>
            <p className="text-[15px] font-semibold text-ink truncate mt-0.5">{active.topic}</p>
            <p className="text-[12px] text-ink-muted truncate">
              {(active.studentId && getStudent(active.studentId)?.name) ?? (active.groupId && getGroup(active.groupId)?.name) ?? '—'} · {active.level}
            </p>
          </div>
          <button type="button" className="ios-btn ios-btn-primary flex-shrink-0">Приєднатись</button>
        </section>
      )}

      {/* Today schedule */}
      <section>
        <SectionHead title="Розклад на сьогодні" count={todayLessons.length} href="/dashboard/teacher-calendar" />
        {todayLessons.length === 0 ? (
          <div className="ios-card">
            <EmptyState title="Сьогодні уроків немає" subtitle="Гарний день для підготовки матеріалів" />
          </div>
        ) : (
          <ul className="ios-list">
            {todayLessons.map(lesson => {
              const cfg = LESSON_STATUS_STYLES[lesson.status];
              const student = lesson.studentId ? getStudent(lesson.studentId) : undefined;
              const group = lesson.groupId ? getGroup(lesson.groupId) : undefined;
              const title = student?.name ?? group?.name ?? 'Невідомо';
              const photo = student?.photo;
              const open = noteOpen === lesson.id;
              return (
                <li key={lesson.id} className="flex flex-col">
                  <div className={`ios-row ${lesson.status === 'in-progress' ? 'bg-surface-muted/40' : ''}`}>
                    <div className="w-12 flex-shrink-0">
                      <p className="text-[13px] font-semibold text-ink tabular-nums">{lesson.time}</p>
                      <p className="text-[10px] text-ink-faint tabular-nums">{lesson.duration} хв</p>
                    </div>
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={title} className="w-8 h-8 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div aria-hidden className="w-8 h-8 rounded-full bg-surface-muted text-ink-muted flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                        {group ? 'Гр.' : '—'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{title}</p>
                      <p className="text-[12px] text-ink-muted truncate">{lesson.topic} · {lesson.level}</p>
                    </div>
                    <StatusPill {...cfg} className="hidden sm:inline-flex" />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {lesson.status === 'scheduled' && (
                        <button type="button" className="ios-btn ios-btn-sm ios-btn-secondary">Почати</button>
                      )}
                      {lesson.status === 'in-progress' && (
                        <button type="button" className="ios-btn ios-btn-sm ios-btn-primary">Завершити</button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNoteOpen(open ? null : lesson.id)}
                        aria-label="Нотатка"
                        aria-expanded={open}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-ink-faint hover:text-ink hover:bg-surface-muted transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {open && (
                    <div className="px-5 py-3 bg-surface-muted border-t border-border">
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white text-[13px] text-ink resize-none focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-[border-color,box-shadow]"
                        rows={2}
                        placeholder="Що опрацювали, ДЗ, прогрес..."
                        value={notes[lesson.id] ?? ''}
                        onChange={e => setNotes(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setNoteOpen(null)} className="ios-btn ios-btn-sm ios-btn-ghost">Скасувати</button>
                        <button type="button" onClick={() => setNoteOpen(null)} className="ios-btn ios-btn-sm ios-btn-primary">Зберегти</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Pending homework */}
      <section>
        <SectionHead title="Неперевірені ДЗ" count={pending.length} href="/dashboard/homework" />
        {pending.length === 0 ? (
          <div className="ios-card">
            <EmptyState title="Все чисто" subtitle="Немає завдань на перевірці" />
          </div>
        ) : (
          <ul className="ios-list">
            {pending.slice(0, 6).map(hw => {
              const student = hw.assignedTo.type === 'student' ? getStudent(hw.assignedTo.id) : undefined;
              const group = hw.assignedTo.type === 'group' ? getGroup(hw.assignedTo.id) : undefined;
              const assigneeName = student?.name ?? group?.name ?? '—';
              return (
                <li key={hw.id} className="ios-row">
                  <span className="w-1 h-8 rounded-full bg-primary/20 flex-shrink-0" aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{hw.title}</p>
                    <p className="text-[12px] text-ink-muted truncate">{assigneeName} · здано {daysAgoText(hw.deadline)}</p>
                  </div>
                  <Link href={`/dashboard/homework/${hw.id}/review`} className="ios-btn ios-btn-sm ios-btn-secondary flex-shrink-0">
                    Перевірити
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Students at risk */}
      <section>
        <SectionHead title="Учні під загрозою" count={atRisk.length} />
        {atRisk.length === 0 ? (
          <div className="ios-card">
            <EmptyState title="Всі учні в нормі" subtitle="Ніхто не потребує уваги зараз" />
          </div>
        ) : (
          <ul className="ios-list">
            {atRisk.map(student => {
              const balanceFlag = student.lessonsLeft <= 2;
              const streakFlag = student.missedHomeworkStreak >= 3;
              return (
                <li key={student.id} className="ios-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={student.photo} alt={student.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-ink truncate">{student.name}</p>
                      <LevelBadge level={student.level} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {balanceFlag && (
                        <span className="text-[11px] text-danger-dark inline-flex items-center gap-1.5">
                          <span className="ios-dot ios-dot-danger" />
                          Залишилось {student.lessonsLeft} уроків
                        </span>
                      )}
                      {streakFlag && (
                        <span className="text-[11px] text-ink-muted inline-flex items-center gap-1.5">
                          <span className="ios-dot ios-dot-warn" />
                          {student.missedHomeworkStreak} ДЗ поспіль не виконано
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href={`/dashboard/chat?thread=student:${student.id}`} className="ios-btn ios-btn-sm ios-btn-secondary">
                      Написати
                    </Link>
                    {student.parentName && (
                      <Link href={`/dashboard/chat?thread=parent:${student.id}`} className="ios-btn ios-btn-sm ios-btn-ghost">
                        Батькам
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Groups glance */}
      <section>
        <SectionHead title="Групи" count={MOCK_GROUPS.length} href="/dashboard/groups" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_GROUPS.map(group => (
            <Link
              key={group.id}
              href={`/dashboard/groups?id=${group.id}`}
              className="ios-card p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-[13px] font-semibold text-ink truncate">{group.name}</p>
                <LevelBadge level={group.level} />
              </div>
              <div className="flex items-center gap-4 text-[12px] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="ios-dot" />
                  {group.studentIds.length} учнів
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  {Math.round(group.avgAttendance * 100)}% відвід.
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
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
