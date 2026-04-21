import Link from 'next/link';
import { ProgressBar, XpBadge } from '@/components/kids/ui';

interface LessonProgressProps {
  current: number;
  total: number;
  xp: number;
  courseSlug: string;
}

export function LessonProgress({ current, total, xp }: LessonProgressProps) {
  return (
    <header
      className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 bg-white/70 backdrop-blur-md border-b border-white/60 flex-shrink-0 relative z-10"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
    >
      <Link
        href="/kids/school"
        aria-label="Вийти з уроку"
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </Link>

      <ProgressBar current={current} total={total} tone="primary" size="md" className="flex-1" label={`Прогрес уроку`} />

      <XpBadge amount={xp} size="sm" />
    </header>
  );
}
