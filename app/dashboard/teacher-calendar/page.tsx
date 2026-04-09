'use client';
import { useState } from 'react';
import { CalendarGrid, toDateStr } from '@/components/molecules/CalendarGrid';

/* ─── Типи ────────────────────────────────────── */
type LessonStatus = 'done' | 'upcoming' | 'cancelled';

interface TeacherLesson {
  id: string;
  date: string;
  time: string;
  duration: number;
  student: string;
  studentPhoto: string;
  level: string;
  topic: string;
  status: LessonStatus;
  note?: string;
}

/* ─── Конфіг ──────────────────────────────────── */
const STATUS_CFG: Record<LessonStatus, { label: string; color: string; bg: string; dot: string }> = {
  done:      { label: 'Проведено',  color: 'text-primary-dark',  bg: 'bg-primary/10',    dot: 'bg-primary' },
  upcoming:  { label: 'Очікується', color: 'text-secondary-dark', bg: 'bg-secondary/15',  dot: 'bg-secondary' },
  cancelled: { label: 'Скасовано',  color: 'text-ink-muted',     bg: 'bg-surface-muted', dot: 'bg-border' },
};

const MONTHS = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];

/* ─── Мок-дані ────────────────────────────────── */
const LESSONS: TeacherLesson[] = [
  { id: 'l1',  date: '2026-04-01', time: '09:00', duration: 45, student: 'Аліса К.',   studentPhoto: 'https://randomuser.me/api/portraits/girls/44.jpg',  level: 'A1', topic: 'Daily Routines',       status: 'done' },
  { id: 'l2',  date: '2026-04-01', time: '11:00', duration: 45, student: 'Микола С.',  studentPhoto: 'https://randomuser.me/api/portraits/men/14.jpg',    level: 'A1', topic: 'Food & Drinks',         status: 'done' },
  { id: 'l3',  date: '2026-04-02', time: '09:00', duration: 45, student: 'Аліса К.',   studentPhoto: 'https://randomuser.me/api/portraits/girls/44.jpg',  level: 'A1', topic: 'Food & Drinks',         status: 'done' },
  { id: 'l4',  date: '2026-04-02', time: '14:00', duration: 45, student: 'Віталій Н.',studentPhoto: 'https://randomuser.me/api/portraits/men/55.jpg',    level: 'A1', topic: 'Present Simple',        status: 'done' },
  { id: 'l5',  date: '2026-04-02', time: '16:00', duration: 45, student: 'Софія М.',   studentPhoto: 'https://randomuser.me/api/portraits/women/33.jpg',  level: 'A1', topic: 'Animals & Nature',      status: 'upcoming' },
  { id: 'l6',  date: '2026-04-02', time: '18:00', duration: 45, student: 'Юлія Г.',    studentPhoto: 'https://randomuser.me/api/portraits/women/52.jpg',  level: 'A2', topic: 'Reading Comprehension', status: 'upcoming' },
  { id: 'l7',  date: '2026-04-04', time: '10:00', duration: 45, student: 'Дарина П.', studentPhoto: 'https://randomuser.me/api/portraits/women/24.jpg',  level: 'A2', topic: 'Past Simple',            status: 'upcoming' },
  { id: 'l8',  date: '2026-04-04', time: '14:00', duration: 45, student: 'Микола С.',  studentPhoto: 'https://randomuser.me/api/portraits/men/14.jpg',    level: 'A1', topic: 'My House',               status: 'upcoming' },
  { id: 'l9',  date: '2026-04-07', time: '09:00', duration: 45, student: 'Аліса К.',   studentPhoto: 'https://randomuser.me/api/portraits/girls/44.jpg',  level: 'A1', topic: 'Family & Friends',      status: 'upcoming' },
  { id: 'l10', date: '2026-04-07', time: '16:00', duration: 45, student: 'Юлія Г.',    studentPhoto: 'https://randomuser.me/api/portraits/women/52.jpg',  level: 'A2', topic: 'Present Perfect',       status: 'upcoming' },
  { id: 'l11', date: '2026-04-03', time: '15:00', duration: 45, student: 'Дарина П.', studentPhoto: 'https://randomuser.me/api/portraits/women/24.jpg',  level: 'A2', topic: 'Numbers & Colors',       status: 'cancelled', note: 'Учениця захворіла' },
  { id: 'l12', date: '2026-04-09', time: '11:00', duration: 45, student: 'Офіса М.',  studentPhoto: 'https://randomuser.me/api/portraits/women/65.jpg',  level: 'A1', topic: 'Greetings',              status: 'upcoming' },
  { id: 'l13', date: '2026-04-14', time: '09:00', duration: 45, student: 'Аліса К.',   studentPhoto: 'https://randomuser.me/api/portraits/girls/44.jpg',  level: 'A1', topic: 'Review — Unit 2',        status: 'upcoming' },
  { id: 'l14', date: '2026-04-16', time: '14:00', duration: 45, student: 'Віталій Н.',studentPhoto: 'https://randomuser.me/api/portraits/men/55.jpg',    level: 'A1', topic: 'Speaking Practice',      status: 'upcoming' },
  { id: 'l15', date: '2026-04-21', time: '18:00', duration: 45, student: 'Юлія Г.',    studentPhoto: 'https://randomuser.me/api/portraits/women/52.jpg',  level: 'A2', topic: 'Writing Skills',         status: 'upcoming' },
];

/* ─── Компонент ───────────────────────────────── */
export default function TeacherCalendarPage() {
  const [detail, setDetail] = useState<string | null>(null); // dateStr
  const [calYear,  setCalYear]  = useState(2026);
  const [calMonth, setCalMonth] = useState(3);

  function lessonsOn(dateStr: string) {
    return LESSONS.filter(l => l.date === dateStr);
  }

  const selectedLessons = detail ? lessonsOn(detail) : [];
  const monthLessons    = LESSONS.filter(l => l.date.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, '0')}`));
  const doneCnt         = monthLessons.filter(l => l.status === 'done').length;
  const upcomingCnt     = monthLessons.filter(l => l.status === 'upcoming').length;
  const earnedMonth     = doneCnt * 180;

  return (
    <div className="flex flex-col gap-5 max-w-4xl">

      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-black text-ink">Мій календар</h1>
        <p className="text-ink-muted text-sm mt-0.5">{doneCnt} проведено · {upcomingCnt} заплановано</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* Сітка */}
        <CalendarGrid
          initialYear={2026}
          initialMonth={3}
          onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m); }}
          renderDay={({ dateStr }) => {
            const dayLessons = lessonsOn(dateStr);
            return (
              <>
                {dayLessons.slice(0, 3).map(l => (
                  <button
                    key={l.id}
                    onClick={() => setDetail(detail === dateStr ? null : dateStr)}
                    className="flex items-center gap-1 w-full text-left"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CFG[l.status].dot}`} />
                    <span className="text-[10px] text-ink-muted truncate leading-none">{l.time} {l.student.split(' ')[0]}</span>
                  </button>
                ))}
                {dayLessons.length > 3 && (
                  <span className="text-[10px] text-ink-muted font-bold">+{dayLessons.length - 3}</span>
                )}
              </>
            );
          }}
          footer={
            <div className="flex items-center gap-4 px-5 py-3 bg-surface-muted">
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              ))}
            </div>
          }
        />

        {/* Деталі дня + наступні уроки */}
        <div className="flex flex-col gap-4">

          {detail ? (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="font-black text-ink">
                    {new Date(detail + 'T00:00').toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-xs text-ink-muted">{selectedLessons.length} урок{selectedLessons.length !== 1 ? 'ів' : ''}</p>
                </div>
                <button onClick={() => setDetail(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {selectedLessons.length === 0 ? (
                <div className="px-5 py-10 text-center text-ink-muted">
                  <p className="text-2xl mb-2">📭</p>
                  <p className="text-sm font-semibold">Немає уроків</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {selectedLessons.map(lesson => {
                    const cfg = STATUS_CFG[lesson.status];
                    return (
                      <div key={lesson.id} className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={lesson.studentPhoto} alt={lesson.student} className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-ink">{lesson.student}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <p className="text-xs text-ink-muted mt-0.5">{lesson.time} · {lesson.duration} хв · {lesson.level}</p>
                            <p className="text-xs text-ink mt-1 font-medium">{lesson.topic}</p>
                            {lesson.note && <p className="text-xs text-accent-dark bg-accent/8 rounded-lg px-2 py-1 mt-1.5">{lesson.note}</p>}
                          </div>
                        </div>
                        {lesson.status === 'upcoming' && (
                          <div className="flex gap-2 mt-3">
                            <button className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-black hover:opacity-90 transition-opacity">📹 Приєднатись</button>
                            <button className="px-3 py-2 rounded-xl border border-border text-xs font-bold text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors">✎ Нотатка</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border p-5 text-center text-ink-muted">
              <p className="text-2xl mb-2">📅</p>
              <p className="text-sm font-semibold">Оберіть день</p>
              <p className="text-xs mt-1">щоб переглянути уроки</p>
            </div>
          )}

          {/* Наступні уроки */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-black text-ink">Наступні уроки</h3>
            </div>
            <div className="divide-y divide-border">
              {LESSONS.filter(l => l.status === 'upcoming').slice(0, 5).map(l => (
                <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted/50 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.studentPhoto} alt={l.student} className="w-7 h-7 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{l.student}</p>
                    <p className="text-xs text-ink-muted truncate">{l.topic}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-ink">{l.time}</p>
                    <p className="text-[10px] text-ink-muted">
                      {new Date(l.date + 'T00:00').toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
