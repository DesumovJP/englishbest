import { LEVEL_STYLES, type Level } from '@/lib/teacher-mocks';

interface LevelBadgeProps {
  level: Level;
  className?: string;
}

export function LevelBadge({ level, className = '' }: LevelBadgeProps) {
  return (
    <span className={`inline-flex items-center justify-center text-[10px] font-semibold px-1.5 py-0.5 rounded border border-border text-ink-muted tracking-wide ${className}`}>
      {level}
    </span>
  );
}
