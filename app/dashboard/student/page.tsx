'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/atoms/Card';
import { SectionHeader } from '@/components/atoms/SectionHeader';
import { ProgressBar } from '@/components/atoms/ProgressBar';

/* ─── Дані ──────────────────────────────────────── */
const STUDENT = { name: 'Аліса', level: 'A1', streak: 14, dailyGoal: 50, dailyXp: 30 };

const LESSON = {
  unit: 3, unitTitle: 'Тварини та природа',
  lessonNum: 10, lessonTitle: 'Дикі тварини',
  emoji: '🦁', lessonsCompleted: 9, lessonsTotal: 15, xpReward: 15,
};

const RECENT_WORDS = [
  { en: 'wild',     ua: 'дикий',     known: true  },
  { en: 'forest',   ua: 'ліс',       known: true  },
  { en: 'ocean',    ua: 'океан',     known: true  },
  { en: 'brave',    ua: 'хоробрий',  known: false },
  { en: 'cloud',    ua: 'хмара',     known: true  },
  { en: 'journey',  ua: 'подорож',   known: false },
  { en: 'silent',   ua: 'тихий',     known: true  },
  { en: 'proud',    ua: 'гордий',    known: true  },
  { en: 'ancient',  ua: 'давній',    known: false },
  { en: 'fierce',   ua: 'лютий',     known: true  },
  { en: 'nature',   ua: 'природа',   known: true  },
  { en: 'hunter',   ua: 'мисливець', known: false },
];

const TASKS = [
  { id: 1, emoji: '📖', label: 'Пройти урок 10',    xp: 15, done: false },
  { id: 2, emoji: '🔁', label: 'Повторити 12 слів', xp: 5,  done: true  },
  { id: 3, emoji: '👂', label: 'Послухати аудіо',   xp: 5,  done: true  },
];

const LEADERBOARD = [
  { rank: 1,  name: 'Микола С.',  xp: 2410, photo: 'https://randomuser.me/api/portraits/men/14.jpg',    isMe: false },
  { rank: 2,  name: 'Дарина П.',  xp: 2180, photo: 'https://randomuser.me/api/portraits/women/24.jpg',  isMe: false },
  { rank: 3,  name: 'Аліса К.',   xp: 1847, photo: 'https://randomuser.me/api/portraits/girls/44.jpg',  isMe: true  },
  { rank: 4,  name: 'Іван Б.',    xp: 1650, photo: 'https://randomuser.me/api/portraits/men/32.jpg',    isMe: false },
  { rank: 5,  name: 'Софія М.',   xp: 1420, photo: 'https://randomuser.me/api/portraits/women/33.jpg',  isMe: false },
  { rank: 6,  name: 'Олена Р.',   xp: 1310, photo: 'https://randomuser.me/api/portraits/women/52.jpg',  isMe: false },
  { rank: 7,  name: 'Тарас Н.',   xp: 1180, photo: 'https://randomuser.me/api/portraits/men/55.jpg',    isMe: false },
  { rank: 8,  name: 'Катя В.',    xp:  990, photo: 'https://randomuser.me/api/portraits/women/65.jpg',  isMe: false },
  { rank: 9,  name: 'Богдан К.',  xp:  870, photo: 'https://randomuser.me/api/portraits/men/22.jpg',    isMe: false },
  { rank: 10, name: 'Маша Л.',    xp:  740, photo: 'https://randomuser.me/api/portraits/girls/12.jpg',  isMe: false },
];

const NEXT_LESSON = { day: 'Ср', date: '2 квіт', time: '18:00', teacher: 'Maria S.' };

const PRACTICE = [
  { emoji: '🔁', label: 'Повторення',  desc: '12 слів чекають'      },
  { emoji: '✏️', label: 'Мінітест',   desc: 'Перевір за 2 хв'      },
  { emoji: '👂', label: 'Аудіювання', desc: 'Послухай і відповідай' },
  { emoji: '🗣️', label: 'Вимова',     desc: 'Повтори за диктором'   },
  { emoji: '📖', label: 'Читання',    desc: 'Короткий текст'         },
  { emoji: '✍️', label: 'Граматика',  desc: 'Швидка вправа'          },
];

/* ─── Компонент ─────────────────────────────────── */
export default function StudentDashboard() {
  const [tasks, setTasks] = useState(TASKS);
  const dailyPct = Math.round((STUDENT.dailyXp / STUDENT.dailyGoal) * 100);
  const knownCount = RECENT_WORDS.filter(w => w.known).length;

  function toggleTask(id: number) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero ─────────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-primary to-primary-dark px-6 pt-6 pb-14">
          <div className="flex items-start justify-between gap-4">
            {/* Ліво: привітання + стрік */}
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] text-white/60 uppercase">Рівень {STUDENT.level}</p>
              <h1 className="text-2xl font-black text-white mt-1.5">Привіт, {STUDENT.name}! 👋</h1>
              <p className="text-white/70 text-sm mt-1">🔥 {STUDENT.streak}-й день поспіль — так тримати!</p>
            </div>
            {/* Право: наступний урок — без фону */}
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] font-black tracking-[0.15em] text-white/55 uppercase">Наступний урок</p>
              <p className="text-4xl font-black text-white leading-none mt-1">{NEXT_LESSON.time}</p>
              <p className="text-sm font-bold text-white/80 mt-1">{NEXT_LESSON.day}, {NEXT_LESSON.date} · {NEXT_LESSON.teacher}</p>
              <Link href="/dashboard/calendar" className="text-xs font-bold text-white/60 hover:text-white mt-1.5 inline-block transition-colors">
                Розклад →
              </Link>
            </div>
          </div>
        </div>

        {/* White sheet: щоденна ціль */}
        <div className="bg-white rounded-t-3xl -mt-6 px-6 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Щоденна ціль</p>
                <span className="text-xs font-black text-primary">{STUDENT.dailyXp} / {STUDENT.dailyGoal} XP</span>
              </div>
              <ProgressBar value={dailyPct} size="xs" label="Щоденна ціль" />
            </div>
            <span className="text-xs text-ink-muted flex-shrink-0">ще {STUDENT.dailyGoal - STUDENT.dailyXp} XP</span>
          </div>
        </div>
      </div>

      {/* ── Двоколонковий layout ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* ── Ліва колонка ────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Продовжити урок */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">
                  Юніт {LESSON.unit} · Урок {LESSON.lessonNum}
                </p>
                <h2 className="text-xl font-black text-ink mt-1">{LESSON.lessonTitle}</h2>
                <p className="text-sm text-ink-muted mt-0.5">{LESSON.unitTitle}</p>
              </div>
              <span className="text-4xl flex-shrink-0">{LESSON.emoji}</span>
            </div>

            {/* Прогрес: сегментований бар */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Прогрес юніту</p>
                <span className="text-xs font-bold text-ink">{LESSON.lessonsCompleted}/{LESSON.lessonsTotal} уроків</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: LESSON.lessonsTotal }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2.5 rounded-full transition-colors ${
                      i < LESSON.lessonsCompleted ? 'bg-primary' :
                      i === LESSON.lessonsCompleted ? 'bg-primary/30' :
                      'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>

            <Link
              href="/dashboard/lessons"
              className="w-full bg-primary text-white font-black py-3 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>▶ Продовжити урок</span>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">+{LESSON.xpReward} XP</span>
            </Link>
          </Card>

          {/* Швидка практика */}
          <Card padding="sm">
            <SectionHeader title="Швидка практика" className="mb-3" />
            <div className="grid grid-cols-3 gap-2">
              {PRACTICE.map(a => (
                <button
                  key={a.label}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border border-border bg-surface-muted/50 text-center hover:bg-white hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-150 select-none"
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <p className="text-[11px] font-black text-ink leading-tight">{a.label}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Нещодавні слова */}
          <Card padding="none">
            {/* Шапка */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Словник · Урок {LESSON.lessonNum}</p>
                <h2 className="text-xl font-black text-ink mt-1">Час повторити!</h2>
                <p className="text-sm text-ink-muted mt-0.5">{RECENT_WORDS.length - knownCount} слова чекають на тебе</p>
              </div>
              <span className="text-xs font-bold text-ink-muted flex-shrink-0">{knownCount}/{RECENT_WORDS.length} слів</span>
            </div>

            {/* Слова для повторення */}
            <div className="px-4 pb-2 grid grid-cols-2 gap-2">
              {RECENT_WORDS.filter(w => !w.known).map(w => (
                <button
                  key={w.en}
                  className="flex flex-col items-center justify-center px-3 py-2.5 rounded-xl bg-accent/8 border-2 border-accent/20 hover:border-accent/40 hover:bg-accent/15 active:scale-95 transition-all select-none"
                >
                  <p className="text-sm font-black text-ink">{w.en}</p>
                  <p className="text-xs text-accent-dark font-semibold">{w.ua}</p>
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="px-5 pt-5 pb-5">
              <button className="w-full py-3 rounded-xl font-black text-sm text-white bg-accent hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center">
                Почати повторення →
              </button>
            </div>
          </Card>

        </div>

        {/* ── Права колонка ───────────────────────── */}
        <div className="flex flex-col gap-4 h-full">

          {/* Завдання */}
          <Card>
            <SectionHeader
              title="Завдання"
              meta={`${tasks.filter(t => t.done).length}/${tasks.length}`}
              className="mb-4"
            />
            <div className="flex flex-col gap-2">
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all active:scale-[0.98] ${
                    task.done
                      ? 'bg-surface-muted opacity-50'
                      : 'bg-surface-muted hover:bg-primary/5 hover:border-primary/20 border border-transparent'
                  }`}
                >
                  <span className={`text-xl flex-shrink-0 ${task.done ? 'grayscale' : ''}`}>{task.emoji}</span>
                  <span className={`flex-1 text-sm font-bold ${task.done ? 'line-through text-ink-muted' : 'text-ink'}`}>
                    {task.label}
                  </span>
                  {task.done ? (
                    <span className="text-primary text-base flex-shrink-0">✓</span>
                  ) : (
                    <span className="text-[11px] font-black text-accent-dark bg-accent/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      +{task.xp} XP
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Топ учнів */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Золота ліга</p>
                <p className="font-black text-ink mt-0.5">Тиждень 2</p>
              </div>
              <span className="text-2xl">🥇</span>
            </div>
            <div className="relative overflow-hidden max-h-[462px]">
              <div className="flex flex-col gap-1.5">
                {LEADERBOARD.map(player => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      player.isMe
                        ? 'bg-primary/8 border border-primary/20'
                        : 'bg-surface-muted'
                    }`}
                  >
                    <span className="w-5 text-center text-xs font-black text-ink-muted flex-shrink-0">
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={player.photo} alt={player.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                    <span className={`flex-1 text-sm font-bold truncate ${player.isMe ? 'text-primary' : 'text-ink'}`}>
                      {player.name}{player.isMe && <span className="ml-1 text-xs font-normal text-ink-muted">(я)</span>}
                    </span>
                    <span className={`text-[11px] font-black flex-shrink-0 tabular-nums px-2 py-0.5 rounded-full ${
                      player.isMe ? 'bg-primary/10 text-primary' : 'text-ink-muted'
                    }`}>
                      {player.xp.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
              {/* Fade + CTA */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-3">
                <Link href="/dashboard/prizes" className="text-xs font-black text-white bg-primary hover:opacity-90 active:scale-95 transition-all px-4 py-2 rounded-full shadow-md">
                  🏆 Отримуй приз!
                </Link>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
