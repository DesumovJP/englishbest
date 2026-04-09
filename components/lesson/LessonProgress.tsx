import Link from 'next/link';

interface LessonProgressProps {
  current: number;
  total: number;
  xp: number;
  courseSlug: string;
}

export function LessonProgress({ current, total, xp, courseSlug }: LessonProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <header className="flex items-center gap-4 px-4 py-3 bg-white/70 backdrop-blur-md border-b border-white/60 flex-shrink-0 relative z-10">

      {/* Вихід */}
      <Link
        href="/dashboard/lessons"
        aria-label="Вийти з уроку"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors flex-shrink-0"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </Link>

      {/* Прогрес-бар з маскотом */}
      <div className="flex-1 relative">
        {/* Трек */}
        <div
          className="h-4 bg-surface-muted rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Прогрес уроку: ${pct}%`}
        >
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Маскот — сова, рухається по треку */}
        <div
          className="absolute -top-3 transition-all duration-500 pointer-events-none select-none"
          style={{ left: `calc(${pct}% - 14px)` }}
          aria-hidden
        >
          <span className="text-2xl drop-shadow-sm">
            {pct === 0 ? '🦉' : pct >= 100 ? '🌟' : pct >= 50 ? '🚀' : '🦉'}
          </span>
        </div>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1.5 flex-shrink-0 bg-accent/8 border border-accent/20 px-3 py-1.5 rounded-xl">
        <span className="text-accent text-sm">⚡</span>
        <span className="text-xs font-black text-accent-dark">+{xp} XP</span>
      </div>
    </header>
  );
}
