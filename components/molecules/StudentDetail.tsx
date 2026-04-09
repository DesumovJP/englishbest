'use client';
import { useState } from 'react';

/* ─── Типи ───────────────────────────────────── */
type AdminTab   = 'balance' | 'video' | 'progress';
type TeacherTab = 'video'   | 'history' | 'progress';

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
  levelColor: string;
  program: string;
  teacher: string;
  lessonsBalance: number;
  moneyBalance: number;
  lastLesson: string;
  status: string;
  statusCls: string;
  joinedAt: string;
  streak: number;
  totalLessons: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

/* ─── Мок: всі відеоуроки (хронологія) ──────── */
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

/* ─── Мок: платежі ───────────────────────────── */
const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', date: '28 бер 2026', desc: 'Поповнення',      amount: '+₴ 1 500', lessons: '+10 уроків', positive: true },
  { id: 'p2', date: '25 бер 2026', desc: 'Урок проведено',  amount: '−₴ 150',   lessons: '−1 урок',   positive: false },
  { id: 'p3', date: '21 бер 2026', desc: 'Урок проведено',  amount: '−₴ 150',   lessons: '−1 урок',   positive: false },
  { id: 'p4', date: '14 бер 2026', desc: 'Урок пропущено',  amount: '−₴ 150',   lessons: '−1 урок',   positive: false },
  { id: 'p5', date: '1 бер 2026',  desc: 'Поповнення',      amount: '+₴ 750',   lessons: '+5 уроків', positive: true },
  { id: 'p6', date: '15 лют 2026', desc: 'Урок проведено',  amount: '−₴ 150',   lessons: '−1 урок',   positive: false },
];

/* ─── Мок: час платежів ──────────────────────── */
const PAYMENT_TIMES: Record<string, string> = {
  p1: '14:32', p2: '18:05', p3: '17:58', p4: '18:01', p5: '09:15', p6: '17:45',
};

/* ─── Мок: прогрес ───────────────────────────── */
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

const STATUS_VIDEO: Record<string, { label: string; cls: string }> = {
  upcoming:  { label: 'Заплановано', cls: 'bg-primary/10 text-primary-dark' },
  completed: { label: 'Завершено',   cls: 'bg-surface-muted text-ink-muted' },
  missed:    { label: 'Пропущено',   cls: 'bg-danger/10 text-danger' },
};

const TYPE_COLORS: Record<string, string> = {
  'Розмова':   'bg-secondary/8 text-secondary-dark',
  'Граматика': 'bg-purple/8 text-purple-dark',
  'Лексика':   'bg-accent/8 text-accent-dark',
  'Практика':  'bg-success/8 text-success-dark',
  'Тест':      'bg-danger/8 text-danger-dark',
};

/* ─── Рядок відеоуроку ───────────────────────── */
function VideoRow({ lesson }: { lesson: StudentDetailLesson }) {
  return (
    <li className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-right w-14 flex-shrink-0">
          <p className="text-xs font-black text-ink">{lesson.date.split(' ').slice(0, 2).join(' ')}</p>
          <p className="text-xs text-ink-muted">{lesson.time}</p>
        </div>
        <div className="w-px h-8 bg-border flex-shrink-0" />
        <p className={`text-sm font-semibold ${lesson.status === 'missed' ? 'text-ink-muted' : 'text-ink'}`}>
          {lesson.title}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {lesson.grade !== undefined && (
          <span className="text-sm font-black text-primary-dark">{lesson.grade}%</span>
        )}
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_VIDEO[lesson.status].cls}`}>
          {STATUS_VIDEO[lesson.status].label}
        </span>
      </div>
    </li>
  );
}

/* ─── Компонент ──────────────────────────────── */
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

  const totalDone = MOCK_PROGRESS.flatMap(s => s.lessons).filter(l => l.status === 'done').length;
  const totalAll  = MOCK_PROGRESS.flatMap(s => s.lessons).length;
  const lowBalance = student.lessonsBalance <= 2;

  return (
    <div className="flex flex-col h-full">

      {/* ── Профіль ──────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={student.photo}
            alt={student.name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <p className="font-black text-ink text-lg leading-tight truncate">{student.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${student.levelColor}`}>{student.level}</span>
              <span className="text-xs text-ink-muted truncate">{student.program}</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Закрити"
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Адмін: баланс як головний блок */}
        {isAdmin ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-muted">
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">Баланс</p>
              <p className={`text-xl font-black ${lowBalance ? 'text-danger' : 'text-ink'}`}>
                {student.lessonsBalance} <span className="text-sm font-semibold text-ink-muted">уроків</span>
              </p>
            </div>
            <div className="w-px h-10 bg-border flex-shrink-0" />
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">Сума</p>
              <p className="text-xl font-black text-ink">₴ {student.moneyBalance.toLocaleString()}</p>
            </div>
            <div className="w-px h-10 bg-border flex-shrink-0" />
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">Вчитель</p>
              <p className="text-sm font-semibold text-ink">{student.teacher}</p>
            </div>
          </div>
        ) : (
          /* Вчитель: компактний рядок */
          <div className="flex items-center gap-3 text-xs text-ink-muted flex-wrap">
            <span>З {student.joinedAt}</span>
            <span className="text-border">·</span>
            <span>Останній урок: <span className="text-ink font-semibold">{student.lastLesson}</span></span>
          </div>
        )}

        {/* Адмін: вторинна інфо */}
        {isAdmin && (
          <p className="text-[11px] text-ink-muted text-center mt-2">
            З {student.joinedAt} · Останній урок {student.lastLesson}
          </p>
        )}

        {isAdmin && lowBalance && (
          <p className="mt-2 text-xs text-danger font-semibold">⚠️ Уроки майже закінчились — потрібно поповнення</p>
        )}
      </div>

      {/* ── Таби ─────────────────────────────────── */}
      <div className="flex border-b border-border px-6 flex-shrink-0">
        {isAdmin ? (
          ([
            ['balance',  'Баланс та платежі'],
            ['video',    `Відеоуроки (${MOCK_ALL_LESSONS.length})`],
            ['progress', `Прогрес (${totalDone}/${totalAll})`],
          ] as [AdminTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setAdminTab(key)}
              className={`px-1 py-3.5 mr-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                adminTab === key
                  ? 'border-primary text-primary-dark'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))
        ) : (
          ([
            ['video',    `Відеоуроки (${MOCK_UPCOMING.length})`],
            ['history',  `Історія (${MOCK_HISTORY.length})`],
            ['progress', `Прогрес (${totalDone}/${totalAll})`],
          ] as [TeacherTab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTeacherTab(key)}
              className={`px-1 py-3.5 mr-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                teacherTab === key
                  ? 'border-primary text-primary-dark'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))
        )}
      </div>

      {/* ── Вміст ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Баланс та платежі (адмін) */}
        {isAdmin && adminTab === 'balance' && (
          <ul className="divide-y divide-border">
            {MOCK_PAYMENTS.map(p => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${p.positive ? 'bg-primary/10 text-primary-dark' : 'bg-surface-muted text-ink-muted'}`}>
                    {p.positive ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.desc}</p>
                    <p className="text-xs text-ink-muted">{p.date} · {PAYMENT_TIMES[p.id]}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-black ${p.positive ? 'text-primary-dark' : 'text-ink'}`}>{p.amount}</p>
                  <p className="text-xs text-ink-muted">{p.lessons}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Відеоуроки */}
        {(isAdmin ? adminTab === 'video' : teacherTab === 'video') && (
          <ul className="divide-y divide-border">
            {(isAdmin ? MOCK_ALL_LESSONS : MOCK_UPCOMING).map(l => <VideoRow key={l.id} lesson={l} />)}
            {!isAdmin && MOCK_UPCOMING.length === 0 && (
              <li className="py-12 text-center text-ink-muted">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-sm font-semibold">Немає запланованих відеоуроків</p>
              </li>
            )}
          </ul>
        )}

        {/* Історія (вчитель окремо) */}
        {!isAdmin && teacherTab === 'history' && (
          <ul className="divide-y divide-border">
            {MOCK_HISTORY.map(l => <VideoRow key={l.id} lesson={l} />)}
          </ul>
        )}

        {/* Прогрес */}
        {(isAdmin ? adminTab === 'progress' : teacherTab === 'progress') && (
          <div className="px-6 py-4 flex flex-col gap-4">
            {MOCK_PROGRESS.map(section => (
              <div key={section.title}>
                <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-2">{section.title}</p>
                <div className="rounded-xl border border-border overflow-hidden">
                  {section.lessons.map((lesson, i) => (
                    <div
                      key={lesson.slug}
                      className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-border' : ''} ${lesson.status === 'locked' ? 'opacity-40' : ''}`}
                    >
                      {lesson.status === 'done'    && <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] flex-shrink-0">✓</span>}
                      {lesson.status === 'current' && <span className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 rounded-full bg-primary" /></span>}
                      {lesson.status === 'locked'  && <span className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />}
                      <p className="text-sm text-ink flex-1 truncate">{lesson.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[lesson.type] ?? 'bg-surface-muted text-ink-muted'}`}>
                        {lesson.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Контакти батьків (лише адмін) ────────── */}
      {isAdmin && student.parentName && (
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-3">Контакт батьків</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted">Ім&apos;я</span>
              <span className="text-sm font-semibold text-ink">{student.parentName}</span>
            </div>
            {student.parentPhone && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted">Телефон</span>
                <a href={`tel:${student.parentPhone}`} className="text-sm font-semibold text-primary-dark hover:underline">{student.parentPhone}</a>
              </div>
            )}
            {student.parentEmail && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted">Email</span>
                <a href={`mailto:${student.parentEmail}`} className="text-sm font-semibold text-primary-dark hover:underline">{student.parentEmail}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
