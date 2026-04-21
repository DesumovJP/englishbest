'use client';
import { useState } from 'react';
import { HOMEWORK_KIND_ICONS, HOMEWORK_STATUS_STYLES, MOCK_HOMEWORK, type Level } from '@/lib/teacher-mocks';
import { LevelBadge } from '@/components/teacher/ui';

type AdminTab   = 'balance' | 'video' | 'progress';
type TeacherTab = 'video'   | 'history' | 'progress' | 'homework' | 'notes';

interface TeacherNoteLocal {
  id: string;
  authoredAt: string;
  body: string;
}

interface StudentDetailLesson {
  id: string;
  date: string;
  time: string;
  title: string;
  status: 'upcoming' | 'completed' | 'missed';
  grade?: number;
}

interface Payment {
  id: string;
  date: string;
  desc: string;
  amount: string;
  lessons: string;
  positive: boolean;
}

interface ProgressLesson {
  slug: string;
  title: string;
  type: string;
  status: 'done' | 'current' | 'locked';
}

interface ProgressSection {
  title: string;
  lessons: ProgressLesson[];
}

export interface StudentDetailData {
  slug: string;
  name: string;
  photo: string;
  level: string;
  program: string;
  teacher: string;
  lessonsBalance: number;
  moneyBalance: number;
  lastLesson: string;
  status: string;
  statusDot: string;
  joinedAt: string;
  streak: number;
  totalLessons: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

const MOCK_ALL_LESSONS: StudentDetailLesson[] = [
  { id: 'l1',  date: '9 квіт 2026',  time: '18:00', title: 'Daily Routines',        status: 'upcoming' },
  { id: 'l2',  date: '4 квіт 2026',  time: '17:00', title: 'Food & Drinks',          status: 'upcoming' },
  { id: 'l3',  date: '2 квіт 2026',  time: '18:00', title: 'Present Simple',         status: 'upcoming' },
  { id: 'l4',  date: '28 бер 2026',  time: '18:00', title: 'Animals & Colors',       status: 'completed', grade: 92 },
  { id: 'l5',  date: '25 бер 2026',  time: '17:00', title: 'Hello & Goodbye',        status: 'completed', grade: 88 },
  { id: 'l6',  date: '21 бер 2026',  time: '18:00', title: 'Numbers & Colors',       status: 'completed', grade: 95 },
  { id: 'l7',  date: '14 бер 2026',  time: '17:00', title: 'Grammar Review',         status: 'missed' },
  { id: 'l8',  date: '7 бер 2026',   time: '18:00', title: 'My House',               status: 'completed', grade: 79 },
  { id: 'l9',  date: '3 бер 2026',   time: '17:00', title: 'Family & Friends',       status: 'missed' },
  { id: 'l10', date: '24 лют 2026',  time: '18:00', title: 'Colors & Numbers',       status: 'completed', grade: 84 },
  { id: 'l11', date: '17 лют 2026',  time: '17:00', title: 'Greetings Recap',        status: 'completed', grade: 91 },
];

const MOCK_UPCOMING = MOCK_ALL_LESSONS.filter(l => l.status === 'upcoming');
const MOCK_HISTORY  = MOCK_ALL_LESSONS.filter(l => l.status !== 'upcoming');

const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', date: '28 бер 2026', desc: 'Поповнення',      amount: '+₴ 1 500', lessons: '+10 уроків', positive: true },
  { id: 'p2', date: '25 бер 2026', desc: 'Урок проведено',  amount: '−₴ 150',   lessons: '−1 урок',   positive: false },
  { id: 'p3', date: '21 бер 2026', desc: 'Урок проведено',  amount: '−₴ 150',   lessons: '−1 урок',   positive: false },
  { id: 'p4', date: '14 бер 2026', desc: 'Урок пропущено',  amount: '−₴ 150',   lessons: '−1 урок',   positive: false },
  { id: 'p5', date: '1 бер 2026',  desc: 'Поповнення',      amount: '+₴ 750',   lessons: '+5 уроків', positive: true },
  { id: 'p6', date: '15 лют 2026', desc: 'Урок проведено',  amount: '−₴ 150',   lessons: '−1 урок',   positive: false },
];

const PAYMENT_TIMES: Record<string, string> = {
  p1: '14:32', p2: '18:05', p3: '17:58', p4: '18:01', p5: '09:15', p6: '17:45',
};

const MOCK_PROGRESS: ProgressSection[] = [
  {
    title: 'Розділ 1 — Знайомство та вітання',
    lessons: [
      { slug: 'hello-goodbye',  title: 'Hello & Goodbye',  type: 'Розмова',   status: 'done' },
      { slug: 'my-name-is',     title: 'My name is...',    type: 'Граматика', status: 'done' },
      { slug: 'numbers-colors', title: 'Numbers & Colors', type: 'Лексика',   status: 'done' },
    ],
  },
  {
    title: 'Розділ 2 — Щоденне життя',
    lessons: [
      { slug: 'daily-routines', title: 'Daily Routines',   type: 'Розмова',   status: 'done' },
      { slug: 'food-drinks',    title: 'Food & Drinks',    type: 'Лексика',   status: 'current' },
      { slug: 'my-house',       title: 'My House',         type: 'Граматика', status: 'locked' },
      { slug: 'family-friends', title: 'Family & Friends', type: 'Розмова',   status: 'locked' },
    ],
  },
  {
    title: 'Розділ 3 — Present Simple',
    lessons: [
      { slug: 'ps-1', title: 'Стверджувальні речення', type: 'Граматика', status: 'locked' },
      { slug: 'ps-2', title: 'Питання',                type: 'Граматика', status: 'locked' },
      { slug: 'ps-3', title: 'Заперечення',            type: 'Практика',  status: 'locked' },
      { slug: 'ps-4', title: 'Фінальна практика',      type: 'Тест',      status: 'locked' },
    ],
  },
];

const VIDEO_STATUS: Record<StudentDetailLesson['status'], { label: string; dot: string }> = {
  upcoming:  { label: 'Заплановано', dot: 'ios-dot-info' },
  completed: { label: 'Завершено',   dot: 'ios-dot-positive' },
  missed:    { label: 'Пропущено',   dot: 'ios-dot-danger' },
};

function Stat({ label, value, muted = false }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex-1 min-w-0 px-4 py-3 text-center">
      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider">{label}</p>
      <p className={`text-[15px] font-semibold tabular-nums mt-1 truncate ${muted ? 'text-ink-muted' : 'text-ink'}`}>{value}</p>
    </div>
  );
}

function VideoRow({ lesson }: { lesson: StudentDetailLesson }) {
  const cfg = VIDEO_STATUS[lesson.status];
  return (
    <li className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-surface-muted/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col items-center w-14 flex-shrink-0 tabular-nums text-center">
          <span className="text-[11px] text-ink-muted">{lesson.date.split(' ').slice(0, 2).join(' ')}</span>
          <span className="text-[13px] font-semibold text-ink">{lesson.time}</span>
        </div>
        <div className="w-px h-7 bg-border flex-shrink-0" aria-hidden />
        <p className={`text-[13px] font-semibold truncate ${lesson.status === 'missed' ? 'text-ink-muted' : 'text-ink'}`}>
          {lesson.title}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {lesson.grade !== undefined && (
          <span className="text-[13px] font-semibold text-ink tabular-nums">{lesson.grade}%</span>
        )}
        <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted whitespace-nowrap">
          <span className={`ios-dot ${cfg.dot}`} aria-hidden />
          {cfg.label}
        </span>
      </div>
    </li>
  );
}

export function StudentDetail({
  student,
  isAdmin = false,
  onClose,
}: {
  student: StudentDetailData;
  isAdmin?: boolean;
  onClose?: () => void;
}) {
  const [adminTab,   setAdminTab]   = useState<AdminTab>('balance');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('video');
  const [notes, setNotes] = useState<TeacherNoteLocal[]>([
    { id: 'n1', authoredAt: '12 квіт 2026', body: 'Гарно прогресує у вимові. Потрібно більше writing.' },
    { id: 'n2', authoredAt: '5 квіт 2026',  body: 'Пропустила урок — хвороба, домовились перенести.' },
  ]);
  const [draftNote, setDraftNote] = useState('');

  const studentHomework = MOCK_HOMEWORK.slice(0, 4);

  const totalDone = MOCK_PROGRESS.flatMap(s => s.lessons).filter(l => l.status === 'done').length;
  const totalAll  = MOCK_PROGRESS.flatMap(s => s.lessons).length;
  const lowBalance = student.lessonsBalance <= 2;

  function addNote() {
    const body = draftNote.trim();
    if (!body) return;
    const today = new Date().toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
    setNotes(prev => [{ id: `n${Date.now()}`, authoredAt: today, body }, ...prev]);
    setDraftNote('');
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.photo}
            alt={student.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold text-ink leading-snug truncate">{student.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <LevelBadge level={student.level as Level} />
              <span className="text-[12px] text-ink-muted truncate">{student.program}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                <span className={`ios-dot ${student.statusDot}`} aria-hidden />
                {student.status}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Закрити"
              className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {isAdmin ? (
          <>
            <div className="ios-card flex items-stretch divide-x divide-border">
              <Stat
                label="Баланс"
                value={
                  <span className={lowBalance ? 'text-danger-dark' : undefined}>
                    {student.lessonsBalance} <span className="text-[12px] text-ink-muted font-medium">уроків</span>
                  </span>
                }
              />
              <Stat label="Сума" value={`₴ ${student.moneyBalance.toLocaleString('uk-UA')}`} />
              <Stat label="Вчитель" value={student.teacher} muted />
            </div>
            <p className="text-[11px] text-ink-muted tabular-nums mt-2">
              З {student.joinedAt} · Останній урок {student.lastLesson}
            </p>
            {lowBalance && (
              <p className="mt-2 text-[12px] text-danger-dark font-medium">
                Уроки майже закінчились — потрібне поповнення
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-[12px] text-ink-muted flex-wrap tabular-nums">
            <span>З {student.joinedAt}</span>
            <span className="text-border">·</span>
            <span>Останній урок: <span className="text-ink font-semibold">{student.lastLesson}</span></span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-6 flex-shrink-0 overflow-x-auto">
        {isAdmin ? (
          ([
            ['balance',  'Баланс та платежі'],
            ['video',    `Відеоуроки (${MOCK_ALL_LESSONS.length})`],
            ['progress', `Прогрес (${totalDone}/${totalAll})`],
          ] as [AdminTab, string][]).map(([key, label]) => {
            const active = adminTab === key;
            return (
              <button
                key={key}
                onClick={() => setAdminTab(key)}
                className={`relative px-1 py-3 mr-5 text-[13px] transition-colors whitespace-nowrap ${
                  active ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink font-medium'
                }`}
              >
                {label}
                {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary" aria-hidden />}
              </button>
            );
          })
        ) : (
          ([
            ['video',    `Уроки (${MOCK_UPCOMING.length})`],
            ['history',  `Історія (${MOCK_HISTORY.length})`],
            ['homework', `ДЗ (${studentHomework.length})`],
            ['progress', `Прогрес (${totalDone}/${totalAll})`],
            ['notes',    `Нотатки (${notes.length})`],
          ] as [TeacherTab, string][]).map(([key, label]) => {
            const active = teacherTab === key;
            return (
              <button
                key={key}
                onClick={() => setTeacherTab(key)}
                className={`relative px-1 py-3 mr-5 text-[13px] transition-colors whitespace-nowrap ${
                  active ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink font-medium'
                }`}
              >
                {label}
                {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary" aria-hidden />}
              </button>
            );
          })
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {isAdmin && adminTab === 'balance' && (
          <ul className="divide-y divide-border">
            {MOCK_PAYMENTS.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-surface-muted/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[13px] ${p.positive ? 'bg-surface-muted text-ink' : 'bg-surface-muted text-ink-muted'}`}>
                    {p.positive ? '↑' : '↓'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink truncate">{p.desc}</p>
                    <p className="text-[11px] text-ink-muted tabular-nums">{p.date} · {PAYMENT_TIMES[p.id]}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-semibold text-ink tabular-nums whitespace-nowrap">{p.amount}</p>
                  <p className="text-[11px] text-ink-muted tabular-nums">{p.lessons}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {(isAdmin ? adminTab === 'video' : teacherTab === 'video') && (
          <ul className="divide-y divide-border">
            {(isAdmin ? MOCK_ALL_LESSONS : MOCK_UPCOMING).map(l => <VideoRow key={l.id} lesson={l} />)}
            {!isAdmin && MOCK_UPCOMING.length === 0 && (
              <li className="py-12 text-center">
                <p className="text-[13px] text-ink-muted">Немає запланованих відеоуроків</p>
              </li>
            )}
          </ul>
        )}

        {!isAdmin && teacherTab === 'history' && (
          <ul className="divide-y divide-border">
            {MOCK_HISTORY.map(l => <VideoRow key={l.id} lesson={l} />)}
          </ul>
        )}

        {!isAdmin && teacherTab === 'homework' && (
          <ul className="divide-y divide-border">
            {studentHomework.length === 0 && (
              <li className="py-12 text-center">
                <p className="text-[13px] text-ink-muted">Немає ДЗ</p>
              </li>
            )}
            {studentHomework.map(hw => {
              const cfg = HOMEWORK_STATUS_STYLES[hw.status];
              return (
                <li key={hw.id} className="flex items-center gap-3 px-6 py-3 hover:bg-surface-muted/40 transition-colors">
                  <span className="w-8 h-8 rounded-md bg-surface-muted flex items-center justify-center text-base flex-shrink-0">
                    {HOMEWORK_KIND_ICONS[hw.kind]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink truncate">{hw.title}</p>
                    <p className="text-[11px] text-ink-muted truncate tabular-nums flex items-center gap-1">
                      <span>До {hw.deadline}</span>
                      <span className="text-ink-faint">·</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/coin.png" alt="" className="w-3 h-3 flex-shrink-0" />
                      <span>{hw.coins}</span>
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {!isAdmin && teacherTab === 'notes' && (
          <div className="px-6 py-4 flex flex-col gap-3">
            <div>
              <textarea
                value={draftNote}
                onChange={e => setDraftNote(e.target.value)}
                placeholder="Нова нотатка про учня — бачиш лише ти…"
                className="ios-input w-full min-h-20 resize-y"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={addNote}
                  disabled={!draftNote.trim()}
                  className="ios-btn ios-btn-primary ios-btn-sm"
                >
                  Зберегти нотатку
                </button>
              </div>
            </div>

            {notes.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-ink-muted">Поки що немає нотаток</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {notes.map(n => (
                  <li key={n.id} className="px-3 py-2.5 rounded-md bg-surface-muted">
                    <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1 tabular-nums">{n.authoredAt}</p>
                    <p className="text-[13px] text-ink whitespace-pre-wrap">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {(isAdmin ? adminTab === 'progress' : teacherTab === 'progress') && (
          <div className="px-6 py-4 flex flex-col gap-5">
            {MOCK_PROGRESS.map(section => (
              <div key={section.title}>
                <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-2">{section.title}</p>
                <div className="rounded-[14px] border border-border overflow-hidden bg-white">
                  {section.lessons.map((lesson, i) => (
                    <div
                      key={lesson.slug}
                      className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-border' : ''} ${lesson.status === 'locked' ? 'opacity-50' : ''}`}
                    >
                      {lesson.status === 'done'    && <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] flex-shrink-0">✓</span>}
                      {lesson.status === 'current' && <span className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-primary" /></span>}
                      {lesson.status === 'locked'  && <span className="w-5 h-5 rounded-full border border-border flex-shrink-0" />}
                      <p className={`text-[13px] flex-1 truncate ${lesson.status === 'current' ? 'text-ink font-semibold' : 'text-ink'}`}>{lesson.title}</p>
                      <span className="text-[11px] text-ink-muted flex-shrink-0">{lesson.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parent contact (admin only) */}
      {isAdmin && student.parentName && (
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-3">Контакт батьків</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-muted">Ім&apos;я</span>
              <span className="text-[13px] font-semibold text-ink">{student.parentName}</span>
            </div>
            {student.parentPhone && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-muted">Телефон</span>
                <a href={`tel:${student.parentPhone}`} className="text-[13px] font-semibold text-ink hover:underline underline-offset-2 tabular-nums">{student.parentPhone}</a>
              </div>
            )}
            {student.parentEmail && (
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-muted">Email</span>
                <a href={`mailto:${student.parentEmail}`} className="text-[13px] font-semibold text-ink hover:underline underline-offset-2">{student.parentEmail}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
