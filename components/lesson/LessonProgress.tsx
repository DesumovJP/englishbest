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
    <header className="flex items-center gap-4 px-4 py-3 bg-white/70 backdrop-blur-md border-b border-white/60 flex-shrink-0 relative z-10">
      <Link
        href="/dashboard/lessons"
        aria-label="Вийти з уроку"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors flex-shrink-0"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </Link>

      <ProgressBar current={current} total={total} tone="primary" size="lg" className="flex-1" label={`Прогрес уроку`} />

      <XpBadge amount={xp} size="md" />
    </header>
  );
}
