'use client';
import { useState } from 'react';

/* ─── Типи ───────────────────────────────────── */
type Tab = 'schedule' | 'students' | 'reviews';

export interface TeacherDetailData {
  slug: string;
  name: string;
  photo: string;
  levels: string;
  specialization: string[];
  studentsCount: number;
  lessonsThisMonth: number;
  rating: number;
  reviews: number;
  ratePerLesson: number;
  salaryThisMonth: number;
  pendingSalary: number;
  status: string;
  statusCls: string;
  joinedAt: string;
}

/* ─── Мок: розклад ───────────────────────────── */
const MOCK_SCHEDULE = [
  { id: 's1', date: '2 квіт 2026',  time: '18:00', student: 'Микола С.',   level: 'A1', levelColor: 'bg-accent/10 text-accent-dark' },
  { id: 's2', date: '2 квіт 2026',  time: '19:00', student: 'Дарина П.',   level: 'A2', levelColor: 'bg-accent/20 text-accent-dark' },
  { id: 's3', date: '4 квіт 2026',  time: '17:00', student: 'Соня М.',     level: 'A1', levelColor: 'bg-accent/10 text-accent-dark' },
  { id: 's4', date: '4 квіт 2026',  time: '18:00', student: 'Артем В.',    level: 'A1', levelColor: 'bg-accent/10 text-accent-dark' },
  { id: 's5', date: '6 квіт 2026',  time: '11:00', student: 'Юлія Г.',     level: 'B1', levelColor: 'bg-success/10 text-success-dark' },
  { id: 's6', date: '7 квіт 2026',  time: '17:00', student: 'Віталій Н.',  level: 'A1', levelColor: 'bg-accent/10 text-accent-dark' },
];

/* ─── Мок: учні ──────────────────────────────── */
const MOCK_STUDENTS = [
  { slug: 'mykola-s',  name: 'Микола С.',   photo: 'https://randomuser.me/api/portraits/men/14.jpg',   level: 'A1', lastLesson: '30 бер 2026' },
  { slug: 'daryna-p',  name: 'Дарина П.',   photo: 'https://randomuser.me/api/portraits/women/24.jpg', level: 'A2', lastLesson: '27 бер 2026' },
  { slug: 'sofiia-m',  name: 'Соня М.',     photo: 'https://randomuser.me/api/portraits/women/33.jpg', level: 'A1', lastLesson: '29 бер 2026' },
  { slug: 'artem-v',   name: 'Артем В.',    photo: 'https://randomuser.me/api/portraits/men/31.jpg',   level: 'A1', lastLesson: '31 бер 2026' },
  { slug: 'yuliia-h',  name: 'Юлія Г.',    photo: 'https://randomuser.me/api/portraits/women/52.jpg', level: 'B1', lastLesson: '28 бер 2026' },
  { slug: 'vitalii-n', name: 'Віталій Н.', photo: 'https://randomuser.me/api/portraits/men/55.jpg',   level: 'A1', lastLesson: '29 бер 2026' },
  { slug: 'pavlo-r',   name: 'Павло Р.',    photo: 'https://randomuser.me/api/portraits/men/43.jpg',   level: 'A2', lastLesson: '25 бер 2026' },
];

/* ─── Мок: відгуки ───────────────────────────── */
const MOCK_REVIEWS = [
  { id: 'r1', author: 'Тетяна К.',  rating: 5, text: 'Відмінний вчитель! Дитина обожнює уроки, завжди чекає на них з нетерпінням.', date: '28 бер 2026' },
  { id: 'r2', author: 'Олег П.',    rating: 5, text: 'Дарина за 2 місяці вже знає базові фрази і не боїться говорити. Дякуємо!',    date: '22 бер 2026' },
  { id: 'r3', author: 'Ірина В.',   rating: 4, text: 'Гарний підхід до дітей, терпляча та добра. Рекомендую.',                      date: '15 бер 2026' },
];

const LEVEL_COLORS: Record<string, string> = {
  A0: 'bg-danger/10 text-danger-dark',
  A1: 'bg-accent/10 text-accent-dark',
  A2: 'bg-accent/20 text-accent-dark',
  B1: 'bg-success/10 text-success-dark',
  B2: 'bg-purple/10 text-purple-dark',
};

/* ─── Компонент ──────────────────────────────── */
export function TeacherDetail({ teacher, onClose }: { teacher: TeacherDetailData; onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>('schedule');

  return (
    <div className="flex flex-col h-full">

      {/* ── Профіль ──────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-border flex-shrink-0">

        {/* Фото + ім'я + закрити */}
        <div className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={teacher.photo} alt={teacher.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" referrerPolicy="no-referrer" />
          <div className="min-w-0 flex-1">
            <p className="font-black text-ink text-lg leading-tight truncate">{teacher.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-surface-muted text-ink-muted">{teacher.levels}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${teacher.statusCls}`}>{teacher.status}</span>
              {teacher.specialization.map(s => (
                <span key={s} className="text-xs text-ink-muted px-2 py-0.5 rounded-md bg-surface-muted">{s}</span>
              ))}
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} aria-label="Закрити" className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Головний блок: 3 метрики */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-muted mb-3">
          <div className="flex-1 text-center">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">Учнів</p>
            <p className="text-xl font-black text-ink">{teacher.studentsCount}</p>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">Уроків/міс</p>
            <p className="text-xl font-black text-ink">{teacher.lessonsThisMonth || '—'}</p>
          </div>
          <div className="w-px h-10 bg-border flex-shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-wide mb-0.5">ЗП/міс</p>
            <p className="text-xl font-black text-ink">
              {teacher.salaryThisMonth ? `₴ ${teacher.salaryThisMonth.toLocaleString()}` : '—'}
            </p>
          </div>
        </div>

        {/* Вторинна інфо */}
        <p className="text-[11px] text-ink-muted text-center">
          З {teacher.joinedAt}
          {teacher.rating > 0 && ` · ★ ${teacher.rating} (${teacher.reviews} відгуків)`}
          {` · ₴ ${teacher.ratePerLesson}/урок`}
        </p>

      </div>

      {/* ── Таби ─────────────────────────────────── */}
      <div className="flex border-b border-border px-6 flex-shrink-0">
        {([
          ['schedule', `Розклад (${MOCK_SCHEDULE.length})`],
          ['students', `Учні (${MOCK_STUDENTS.length})`],
          ['reviews',  `Відгуки (${MOCK_REVIEWS.length})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-1 py-3.5 mr-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              tab === key ? 'border-primary text-primary-dark' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Вміст ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Розклад */}
        {tab === 'schedule' && (
          <ul className="divide-y divide-border">
            {MOCK_SCHEDULE.map(s => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-right w-14 flex-shrink-0">
                    <p className="text-xs font-black text-ink">{s.date.split(' ').slice(0, 2).join(' ')}</p>
                    <p className="text-xs text-ink-muted">{s.time}</p>
                  </div>
                  <div className="w-px h-8 bg-border flex-shrink-0" />
                  <p className="text-sm font-semibold text-ink">{s.student}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.levelColor}`}>{s.level}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Учні */}
        {tab === 'students' && (
          <ul className="divide-y divide-border">
            {MOCK_STUDENTS.map(s => (
              <li key={s.slug} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-surface-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.photo} alt={s.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{s.name}</p>
                    <p className="text-xs text-ink-muted">Останній урок: {s.lastLesson}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${LEVEL_COLORS[s.level] ?? 'bg-surface-muted text-ink-muted'}`}>{s.level}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Відгуки */}
        {tab === 'reviews' && (
          <ul className="divide-y divide-border">
            {MOCK_REVIEWS.map(r => (
              <li key={r.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <div>
                    <p className="text-sm font-bold text-ink">{r.author}</p>
                    <p className="text-xs text-ink-muted">{r.date}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < r.rating ? 'text-accent' : 'text-border'}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-ink-muted leading-relaxed">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
