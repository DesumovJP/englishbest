'use client';
import Link from 'next/link';
import { mockKidsUser } from '@/mocks/user';

const ACHIEVEMENTS = [
  { id: 'first-lesson',    emoji: '🎓', title: 'Перший урок',       desc: 'Заверши свій перший урок',          xp: 100, earned: true  },
  { id: 'streak-3',        emoji: '🔥', title: 'Стрік 3 дні',       desc: 'Займайся 3 дні підряд',             xp: 50,  earned: true  },
  { id: 'streak-7',        emoji: '🔥', title: 'Стрік 7 днів',      desc: 'Займайся 7 днів підряд',            xp: 150, earned: true  },
  { id: 'streak-30',       emoji: '🏅', title: 'Стрік місяць',      desc: 'Займайся 30 днів підряд',           xp: 500, earned: false },
  { id: 'vocab-50',        emoji: '📚', title: '50 слів',           desc: 'Вивчи 50 нових слів',               xp: 200, earned: true  },
  { id: 'vocab-200',       emoji: '📖', title: '200 слів',          desc: 'Вивчи 200 нових слів',              xp: 500, earned: false },
  { id: 'quiz-perfect',    emoji: '⚡', title: 'Ідеальний тест',    desc: 'Пройди міні-тест без помилок',      xp: 75,  earned: true  },
  { id: 'room-decorated',  emoji: '🏠', title: 'Декоратор',         desc: 'Постав 5 предметів у кімнаті',      xp: 100, earned: false },
  { id: 'coins-500',       emoji: '💰', title: 'Скарбничка',        desc: 'Збери 500 монет',                   xp: 50,  earned: false },
  { id: 'lessons-10',      emoji: '🌟', title: '10 уроків',         desc: 'Заверши 10 уроків',                 xp: 300, earned: false },
];

export default function AchievementsPage() {
  const user = mockKidsUser;
  const earned = ACHIEVEMENTS.filter(a => a.earned);
  const locked = ACHIEVEMENTS.filter(a => !a.earned);

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-surface border-b border-border flex-shrink-0">
        <Link
          href="/kids/dashboard"
          className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="text-sm font-semibold hidden sm:inline">Назад</span>
        </Link>
        <h1 className="font-black text-ink text-base">Нагороди 🏆</h1>
        <div className="flex items-center gap-1.5 bg-coin/10 rounded-xl px-3 py-1.5">
          <span className="text-base">🪙</span>
          <span className="font-black text-sm text-ink">{user.coins}</span>
        </div>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto flex flex-col gap-6">

        {/* Progress summary */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-5 flex items-center gap-4 text-white">
          <div className="text-4xl">🏆</div>
          <div>
            <p className="font-black text-xl">{earned.length} / {ACHIEVEMENTS.length}</p>
            <p className="text-white/70 text-sm">нагород отримано</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-black text-lg text-accent">+{earned.reduce((s, a) => s + a.xp, 0)} XP</p>
            <p className="text-white/60 text-xs">зароблено</p>
          </div>
        </div>

        {/* Earned */}
        <section>
          <p className="text-xs font-black text-ink-muted uppercase tracking-widest mb-3">Отримані ({earned.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {earned.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border-2 border-success/30 p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {a.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-ink text-sm">{a.title}</p>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">{a.desc}</p>
                </div>
                <span className="text-xs font-black text-success-dark bg-success/10 px-2 py-1 rounded-full flex-shrink-0">
                  +{a.xp}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Locked */}
        <section>
          <p className="text-xs font-black text-ink-muted uppercase tracking-widest mb-3">Заблоковані ({locked.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {locked.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 opacity-60">
                <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-2xl flex-shrink-0 grayscale">
                  {a.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-ink text-sm">{a.title}</p>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">{a.desc}</p>
                </div>
                <span className="text-xs font-bold text-ink-muted bg-surface-muted px-2 py-1 rounded-full flex-shrink-0">
                  🔒
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
