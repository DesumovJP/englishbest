import { LEVEL_STYLES, type Level } from '@/lib/teacher-mocks';

interface LevelBadgeProps {
  level: Level;
  className?: string;
}

export function LevelBadge({ level, className = '' }: LevelBadgeProps) {
  return (
    <span className={`inline-flex items-center justify-center text-xs font-black px-2 py-0.5 rounded-md ${LEVEL_STYLES[level]} ${className}`}>
      {level}
    </span>
  );
}
