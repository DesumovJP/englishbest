'use client';
import { useState } from 'react';
import { LevelBadge } from '@/components/teacher/ui';
import type { Level } from '@/lib/teacher-mocks';

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
  statusDot: string;
  joinedAt: string;
}

const MOCK_SCHEDULE = [
  { id: 's1', date: '2 квіт 2026', time: '18:00', student: 'Микола С.',   level: 'A1' },
  { id: 's2', date: '2 квіт 2026', time: '19:00', student: 'Дарина П.',   level: 'A2' },
  { id: 's3', date: '4 квіт 2026', time: '17:00', student: 'Соня М.',     level: 'A1' },
  { id: 's4', date: '4 квіт 2026', time: '18:00', student: 'Артем В.',    level: 'A1' },
  { id: 's5', date: '6 квіт 2026', time: '11:00', student: 'Юлія Г.',     level: 'B1' },
  { id: 's6', date: '7 квіт 2026', time: '17:00', student: 'Віталій Н.',  level: 'A1' },
];

const MOCK_STUDENTS = [
  { slug: 'mykola-s',  name: 'Микола С.',   photo: 'https://randomuser.me/api/portraits/men/14.jpg',   level: 'A1', lastLesson: '30 бер 2026' },
  { slug: 'daryna-p',  name: 'Дарина П.',   photo: 'https://randomuser.me/api/portraits/women/24.jpg', level: 'A2', lastLesson: '27 бер 2026' },
  { slug: 'sofiia-m',  name: 'Соня М.',     photo: 'https://randomuser.me/api/portraits/women/33.jpg', level: 'A1', lastLesson: '29 бер 2026' },
  { slug: 'artem-v',   name: 'Артем В.',    photo: 'https://randomuser.me/api/portraits/men/31.jpg',   level: 'A1', lastLesson: '31 бер 2026' },
  { slug: 'yuliia-h',  name: 'Юлія Г.',    photo: 'https://randomuser.me/api/portraits/women/52.jpg', level: 'B1', lastLesson: '28 бер 2026' },
  { slug: 'vitalii-n', name: 'Віталій Н.', photo: 'https://randomuser.me/api/portraits/men/55.jpg',   level: 'A1', lastLesson: '29 бер 2026' },
  { slug: 'pavlo-r',   name: 'Павло Р.',    photo: 'https://randomuser.me/api/portraits/men/43.jpg',   level: 'A2', lastLesson: '25 бер 2026' },
];

const MOCK_REVIEWS = [
  { id: 'r1', author: 'Тетяна К.',  rating: 5, text: 'Відмінний вчитель! Дитина обожнює уроки, завжди чекає на них з нетерпінням.', date: '28 бер 2026' },
  { id: 'r2', author: 'Олег П.',    rating: 5, text: 'Дарина за 2 місяці вже знає базові фрази і не боїться говорити. Дякуємо!',    date: '22 бер 2026' },
  { id: 'r3', author: 'Ірина В.',   rating: 4, text: 'Гарний підхід до дітей, терпляча та добра. Рекомендую.',                      date: '15 бер 2026' },
];

export function TeacherDetail({ teacher, onClose }: { teacher: TeacherDetailData; onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>('schedule');

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={teacher.photo}
            alt={teacher.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold text-ink leading-snug truncate">{teacher.name}</h2>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="ios-chip-outline tabular-nums">{teacher.levels}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                <span className={`ios-dot ${teacher.statusDot}`} aria-hidden />
                {teacher.status}
              </span>
              {teacher.specialization.map(s => (
                <span key={s} className="ios-chip-outline">{s}</span>
              ))}
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

        <div className="ios-card flex items-stretch divide-x divide-border">
          <Stat label="Учнів"       value={teacher.studentsCount.toString()} />
          <Stat label="Уроків/міс"  value={teacher.lessonsThisMonth ? teacher.lessonsThisMonth.toString() : '—'} />
          <Stat label="ЗП/міс"      value={teacher.salaryThisMonth ? `₴ ${teacher.salaryThisMonth.toLocaleString()}` : '—'} />
        </div>

        <p className="text-[11px] text-ink-faint mt-3">
          З {teacher.joinedAt}
          {teacher.rating > 0 && ` · ★ ${teacher.rating} (${teacher.reviews} відгуків)`}
          {` · ₴ ${teacher.ratePerLesson}/урок`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-5 flex-shrink-0">
        {([
          ['schedule', `Розклад · ${MOCK_SCHEDULE.length}`],
          ['students', `Учні · ${MOCK_STUDENTS.length}`],
          ['reviews',  `Відгуки · ${MOCK_REVIEWS.length}`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-1 py-3 mr-5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === key ? 'border-primary text-ink' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {tab === 'schedule' && (
          <ul className="divide-y divide-border">
            {MOCK_SCHEDULE.map(s => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-surface-muted/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 flex-shrink-0">
                    <p className="text-[12px] font-semibold text-ink tabular-nums">{s.date.split(' ').slice(0, 2).join(' ')}</p>
                    <p className="text-[11px] text-ink-muted tabular-nums">{s.time}</p>
                  </div>
                  <p className="text-[13px] text-ink truncate">{s.student}</p>
                </div>
                <LevelBadge level={s.level as Level} />
              </li>
            ))}
          </ul>
        )}

        {tab === 'students' && (
          <ul className="divide-y divide-border">
            {MOCK_STUDENTS.map(s => (
              <li key={s.slug} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-surface-muted/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.photo} alt={s.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{s.name}</p>
                    <p className="text-[11px] text-ink-muted">Останній урок · {s.lastLesson}</p>
                  </div>
                </div>
                <LevelBadge level={s.level as Level} />
              </li>
            ))}
          </ul>
        )}

        {tab === 'reviews' && (
          <ul className="divide-y divide-border">
            {MOCK_REVIEWS.map(r => (
              <li key={r.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{r.author}</p>
                    <p className="text-[11px] text-ink-faint tabular-nums">{r.date}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0 text-[12px] text-ink-muted tabular-nums">
                    {r.rating.toFixed(1)}
                    <span className="ml-1 text-ink-faint">★</span>
                  </div>
                </div>
                <p className="text-[13px] text-ink-muted leading-relaxed mt-1">{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 py-3 px-2 text-center">
      <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[18px] font-semibold text-ink tabular-nums whitespace-nowrap">{value}</p>
    </div>
  );
}
