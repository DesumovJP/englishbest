'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  MOCK_TODAY,
  MOCK_STUDENTS,
  MOCK_SCHEDULE,
  MOCK_GROUPS,
  LESSON_STATUS_STYLES,
  HOMEWORK_KIND_ICONS,
  lessonsOnDate,
  pendingHomework,
  atRiskStudents,
  getStudent,
  getGroup,
} from '@/lib/teacher-mocks';
import {
  EmptyState,
  LevelBadge,
  StatTile,
  StatusPill,
} from '@/components/teacher/ui';

const TEACHER = {
  name: 'Maria Sydorenko',
  photo: 'https://randomuser.me/api/portraits/women/65.jpg',
};

const DATE_LABEL = new Date(MOCK_TODAY + 'T00:00').toLocaleDateString('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
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

  const pendingBanner =
    pending.length >= 20
      ? { cls: 'text-danger-dark bg-danger/10 border-danger/30', text: 'Накопичилось — перевір терміново' }
      : pending.length >= 10
        ? { cls: 'text-accent-dark bg-accent/15 border-accent/30', text: 'Купа завдань чекає — глянь, як знайдеш час' }
        : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <section className="rounded-3xl overflow-hidden shadow-card-md">
        <div className="bg-gradient-to-br from-primary to-primary-dark px-6 pt-6 pb-14">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TEACHER.photo}
              alt={TEACHER.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30 flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="type-label text-white/70">Викладач</p>
              <h1 className="type-h1 text-white mt-0.5">Привіт, Maria! 👋</h1>
              <p className="text-white/65 text-sm mt-0.5">{DATE_LABEL}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-3xl -mt-6 px-6 pt-5 pb-5">
          <div className="flex items-center gap-4">
            <StatTile label="проведено" value={done} tone="primary" className="flex-1" />
            <div className="w-px h-10 bg-border flex-shrink-0" />
            <StatTile label="залишилось" value={remaining} className="flex-1" />
            <div className="w-px h-10 bg-border flex-shrink-0" />
            <StatTile
              label="на перевірці"
              value={pending.length}
              tone={pendingBanner ? (pending.length >= 20 ? 'danger' : 'accent') : 'default'}
              className="flex-1"
            />
            <Link
              href="/dashboard/teacher-calendar"
              className="ml-1 flex-shrink-0 px-4 py-2 rounded-xl bg-surface-muted text-sm font-bold text-ink hover:bg-border transition-colors"
            >
              📅 Розклад
            </Link>
          </div>
        </div>
      </section>

      {/* Active lesson callout */}
      {active && (
        <section className="bg-white rounded-2xl border border-border p-5">
          <ActiveLessonRow
            lesson={active}
            studentName={active.studentId ? getStudent(active.studentId)?.name : undefined}
            studentPhoto={active.studentId ? getStudent(active.studentId)?.photo : undefined}
          />
        </section>
      )}

      {/* 2.1 Today schedule */}
      <section className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="type-h3 text-ink">Розклад на сьогодні</h2>
          <span className="text-xs text-ink-muted">{DATE_LABEL}</span>
        </div>

        {todayLessons.length === 0 ? (
          <EmptyState
            emoji="🌤️"
            title="Сьогодні уроків немає"
            subtitle="Гарний день для підготовки нових матеріалів!"
            action={
              <Link
                href="/dashboard/teacher-calendar"
                className="text-sm font-black text-primary-dark hover:underline"
              >
                Переглянути тиждень →
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {todayLessons.map(lesson => {
              const cfg = LESSON_STATUS_STYLES[lesson.status];
              const student = lesson.studentId ? getStudent(lesson.studentId) : undefined;
              const group = lesson.groupId ? getGroup(lesson.groupId) : undefined;
              const title = student?.name ?? group?.name ?? 'Невідомо';
              const photo = student?.photo;
              const open = noteOpen === lesson.id;
              return (
                <li key={lesson.id}>
                  <div
                    className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                      lesson.status === 'in-progress'
                        ? 'bg-accent/5'
                        : 'hover:bg-surface-muted/40'
                    }`}
                  >
                    <div className="w-12 flex-shrink-0 text-center">
                      <p
                        className={`text-sm font-black ${
                          lesson.status === 'in-progress' ? 'text-accent-dark' : 'text-ink'
                        }`}
                      >
                        {lesson.time}
                      </p>
                      <p className="text-[10px] text-ink-muted">{lesson.duration} хв</p>
                    </div>

                    <div className={`w-0.5 h-10 rounded-full flex-shrink-0 ${cfg.dot}`} aria-hidden />

                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt={title}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="w-9 h-9 rounded-full bg-secondary/15 text-secondary-dark flex items-center justify-center text-sm font-black flex-shrink-0"
                      >
                        {group ? '👥' : '?'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{title}</p>
                      <p className="text-xs text-ink-muted truncate">
                        {lesson.topic} · {lesson.level}
                      </p>
                    </div>

                    <StatusPill {...cfg} className="hidden sm:inline-flex" />

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {lesson.status === 'scheduled' && (
                        <button
                          type="button"
                          className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-opacity"
                        >
                          Почати
                        </button>
                      )}
                      {lesson.status === 'in-progress' && (
                        <button
                          type="button"
                          className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-opacity"
                        >
                          Завершити
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNoteOpen(open ? null : lesson.id)}
                        aria-label="Нотатка"
                        aria-expanded={open}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          aria-hidden
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="px-5 py-3 bg-surface-muted border-t border-border">
                      <p className="type-tiny text-ink-muted mb-1.5">Нотатка — {title}</p>
                      <textarea
                        className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm text-ink resize-none focus:outline-none focus:border-primary/40"
                        rows={2}
                        placeholder="Що опрацювали, ДЗ, прогрес..."
                        value={notes[lesson.id] ?? ''}
                        onChange={e => setNotes(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                      />
                      <div className="flex justify-end gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setNoteOpen(null)}
                          className="text-xs text-ink-muted hover:text-ink font-semibold"
                        >
                          Скасувати
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteOpen(null)}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Зберегти
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 2.2 Pending homework */}
      <section className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="type-h3 text-ink">Неперевірені ДЗ</h2>
            <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-secondary/15 text-secondary-dark text-xs font-black">
              {pending.length}
            </span>
          </div>
          <Link href="/dashboard/homework" className="text-xs font-bold text-primary-dark hover:underline">
            Всі →
          </Link>
        </div>

        {pendingBanner && (
          <div className={`px-5 py-2.5 border-b text-xs font-semibold ${pendingBanner.cls}`}>
            ⚠️ {pendingBanner.text}
          </div>
        )}

        {pending.length === 0 ? (
          <EmptyState emoji="✨" title="Все чисто" subtitle="Немає завдань на перевірці." />
        ) : (
          <ul className="divide-y divide-border">
            {pending.slice(0, 6).map(hw => {
              const student = hw.assignedTo.type === 'student' ? getStudent(hw.assignedTo.id) : undefined;
              const group = hw.assignedTo.type === 'group' ? getGroup(hw.assignedTo.id) : undefined;
              const assigneeName = student?.name ?? group?.name ?? '—';
              return (
                <li
                  key={hw.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface-muted/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center flex-shrink-0 text-lg" aria-hidden>
                    {HOMEWORK_KIND_ICONS[hw.kind]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{hw.title}</p>
                    <p className="text-xs text-ink-muted truncate">
                      {assigneeName} · здано {daysAgoText(hw.deadline)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/homework/${hw.id}/review`}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary-dark text-xs font-black hover:bg-primary hover:text-white transition-colors flex-shrink-0"
                  >
                    Перевірити
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 2.3 Students at risk */}
      <section className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="type-h3 text-ink">Учні під загрозою</h2>
          <span className="text-xs text-ink-muted">{atRisk.length} потребують уваги</span>
        </div>
        {atRisk.length === 0 ? (
          <EmptyState emoji="🙌" title="Всі учні в нормі" subtitle="Ніхто не потребує уваги зараз." />
        ) : (
          <ul className="divide-y divide-border">
            {atRisk.map(student => {
              const balanceFlag = student.lessonsLeft <= 2;
              const streakFlag = student.missedHomeworkStreak >= 3;
              return (
                <li
                  key={student.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface-muted/40 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-ink truncate">{student.name}</p>
                      <LevelBadge level={student.level} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {balanceFlag && (
                        <span className="text-[11px] font-semibold text-danger-dark">
                          ⏳ Залишилось {student.lessonsLeft} уроків
                        </span>
                      )}
                      {streakFlag && (
                        <span className="text-[11px] font-semibold text-accent-dark">
                          ⚠️ {student.missedHomeworkStreak} ДЗ поспіль не виконано
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href={`/dashboard/chat?thread=student:${student.id}`}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-ink hover:border-primary/40 hover:text-primary-dark transition-colors"
                    >
                      Написати
                    </Link>
                    {student.parentName && (
                      <Link
                        href={`/dashboard/chat?thread=parent:${student.id}`}
                        className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-ink-muted hover:border-primary/40 hover:text-primary-dark transition-colors"
                      >
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_GROUPS.map(group => (
          <Link
            key={group.id}
            href={`/dashboard/groups?id=${group.id}`}
            className="bg-white rounded-2xl border border-border p-4 hover:border-primary/40 hover:shadow-card-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg" aria-hidden>🧩</span>
              <p className="font-black text-ink truncate">{group.name}</p>
              <LevelBadge level={group.level} className="ml-auto" />
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <span>{group.studentIds.length} учнів</span>
              <span className="text-border">·</span>
              <span>Відвід. {Math.round(group.avgAttendance * 100)}%</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

interface ActiveLessonRowProps {
  lesson: ReturnType<typeof lessonsOnDate>[number];
  studentName?: string;
  studentPhoto?: string;
}

function ActiveLessonRow({ lesson, studentName, studentPhoto }: ActiveLessonRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {studentPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={studentPhoto}
            alt={studentName ?? ''}
            className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            aria-hidden
            className="w-11 h-11 rounded-xl bg-accent/15 text-accent-dark flex items-center justify-center font-black flex-shrink-0"
          >
            ⚡
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" aria-hidden />
            <span className="text-xs font-black text-accent-dark uppercase tracking-wide">
              Зараз · {lesson.time}
            </span>
          </div>
          <p className="font-black text-ink truncate">{lesson.topic}</p>
          <p className="text-xs text-ink-muted truncate">
            {studentName ?? 'Невідомо'} · {lesson.level}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 transition-opacity"
      >
        Приєднатись →
      </button>
    </div>
  );
}
