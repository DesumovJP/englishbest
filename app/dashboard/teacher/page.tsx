'use client';
import { useState } from 'react';
import Link from 'next/link';

/* ─── Дані вчителя ───────────────────────────── */
const TEACHER = {
  name: 'Maria Sydorenko',
  photo: 'https://randomuser.me/api/portraits/women/65.jpg',
};

const TODAY_LESSONS = [
  { id: '1', time: '09:00', duration: 45, student: 'Аліса К.',   level: 'A1', topic: 'Food & Drinks',         status: 'done',    photo: 'https://randomuser.me/api/portraits/girls/44.jpg' },
  { id: '2', time: '11:00', duration: 45, student: 'Микола С.',  level: 'A1', topic: 'Daily Routines',        status: 'done',    photo: 'https://randomuser.me/api/portraits/men/14.jpg'   },
  { id: '3', time: '14:00', duration: 45, student: 'Віталій Н.', level: 'A1', topic: 'Present Simple',        status: 'current', photo: 'https://randomuser.me/api/portraits/men/55.jpg'   },
  { id: '4', time: '16:00', duration: 45, student: 'Софія М.',   level: 'A1', topic: 'Animals & Nature',      status: 'upcoming',photo: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { id: '5', time: '18:00', duration: 45, student: 'Юлія Г.',   level: 'A2', topic: 'Reading Comprehension', status: 'upcoming',photo: 'https://randomuser.me/api/portraits/women/52.jpg' },
];

const STATUS_CFG = {
  done:     { label: 'Проведено', cls: 'bg-primary/10 text-primary-dark', bar: 'bg-primary'              },
  current:  { label: 'Зараз',     cls: 'bg-accent/10 text-accent',        bar: 'bg-accent animate-pulse' },
  upcoming: { label: 'Далі',      cls: 'bg-surface-muted text-ink-muted', bar: 'bg-border'               },
};

/* ─── Компонент ──────────────────────────────── */
export default function TeacherDashboard() {
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [notes, setNotes]       = useState<Record<string, string>>({});

  const doneLessons      = TODAY_LESSONS.filter(l => l.status === 'done').length;
  const remainingLessons = TODAY_LESSONS.filter(l => l.status !== 'done').length;
  const currentLesson    = TODAY_LESSONS.find(l => l.status === 'current');

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero — єдина кольорова зона ──────────── */}
      <div className="rounded-3xl overflow-hidden shadow-sm">
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
              <p className="text-[10px] font-black tracking-[0.18em] text-white/60 uppercase">Вчитель</p>
              <h1 className="text-2xl font-black text-white mt-0.5">Привіт, Maria! 👋</h1>
              <p className="text-white/65 text-sm mt-0.5">2 квітня 2026</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-t-3xl -mt-6 px-6 pt-5 pb-5">
          <div className="flex items-center gap-5">
            <div className="flex-1 text-center">
              <p className="text-2xl font-black text-primary">{doneLessons}</p>
              <p className="text-[11px] text-ink-muted font-medium">проведено</p>
            </div>
            <div className="w-px h-10 bg-border flex-shrink-0" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-black text-ink">{remainingLessons}</p>
              <p className="text-[11px] text-ink-muted font-medium">залишилось</p>
            </div>
            <div className="w-px h-10 bg-border flex-shrink-0" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-black text-ink">{TODAY_LESSONS.length}</p>
              <p className="text-[11px] text-ink-muted font-medium">всього</p>
            </div>
            <Link
              href="/dashboard/teacher-calendar"
              className="ml-2 flex-shrink-0 px-4 py-2 rounded-xl bg-surface-muted text-sm font-bold text-ink hover:bg-border transition-colors"
            >
              📅 Розклад
            </Link>
          </div>
        </div>
      </div>

      {/* ── Поточний урок (якщо є) ───────────────── */}
      {currentLesson && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentLesson.photo}
                alt={currentLesson.student}
                className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" aria-hidden />
                  <span className="text-xs font-black text-accent uppercase tracking-wide">Зараз · {currentLesson.time}</span>
                </div>
                <p className="font-black text-ink">{currentLesson.topic}</p>
                <p className="text-xs text-ink-muted">{currentLesson.student} · {currentLesson.level}</p>
              </div>
            </div>
            <button className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 transition-opacity">
              Приєднатись →
            </button>
          </div>
        </div>
      )}

      {/* ── Розклад сьогодні ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-black text-ink">Розклад на сьогодні</h2>
          <span className="text-xs text-ink-muted">2 квітня 2026</span>
        </div>
        <div className="divide-y divide-border">
          {TODAY_LESSONS.map(lesson => {
            const cfg = STATUS_CFG[lesson.status as keyof typeof STATUS_CFG];
            return (
              <div key={lesson.id}>
                <div className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                  lesson.status === 'current' ? 'bg-accent/5' : 'hover:bg-surface-muted/40'
                }`}>
                  {/* Час */}
                  <div className="w-12 flex-shrink-0 text-center">
                    <p className={`text-sm font-black ${lesson.status === 'current' ? 'text-accent' : 'text-ink'}`}>{lesson.time}</p>
                    <p className="text-[10px] text-ink-muted">{lesson.duration} хв</p>
                  </div>

                  <div className={`w-0.5 h-10 rounded-full flex-shrink-0 ${cfg.bar}`} aria-hidden />

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lesson.photo} alt={lesson.student} className="w-9 h-9 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{lesson.student}</p>
                    <p className="text-xs text-ink-muted truncate">{lesson.topic} · {lesson.level}</p>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.cls}`}>
                    {cfg.label}
                  </span>

                  {/* Нотатка */}
                  <button
                    onClick={() => setNoteOpen(noteOpen === lesson.id ? null : lesson.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
                    title="Нотатка"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>

                {noteOpen === lesson.id && (
                  <div className="px-5 py-3 bg-surface-muted border-t border-border">
                    <p className="text-xs font-black text-ink-muted mb-1.5">Нотатка — {lesson.student}</p>
                    <textarea
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm text-ink resize-none focus:outline-none focus:border-primary/40"
                      rows={2}
                      placeholder="Що опрацювали, домашнє завдання, прогрес..."
                      value={notes[lesson.id] ?? ''}
                      onChange={e => setNotes(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                    />
                    <div className="flex justify-end gap-2 mt-1.5">
                      <button onClick={() => setNoteOpen(null)} className="text-xs text-ink-muted hover:text-ink font-semibold">Скасувати</button>
                      <button onClick={() => setNoteOpen(null)} className="text-xs font-bold text-primary hover:underline">Зберегти</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
