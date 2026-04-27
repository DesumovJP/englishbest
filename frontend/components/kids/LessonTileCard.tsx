/**
 * LessonTileCard — one lesson, rendered as a tactile tile.
 *
 * Used in the new course-detail page (lessons grid) and in the Roadmap
 * panel of the Lessons tab. Three states:
 *   - done     → green check badge, full opacity
 *   - current  → pulsing course-accent ring, "Поточний" label
 *   - upcoming → muted, lock icon
 *
 * The lesson's `accentColor` (admin-editable) overrides the course
 * accent for the "current" highlight, so a teacher can spotlight a
 * specific lesson with a different colour if they want.
 */
'use client';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Lesson, LessonType } from '@/lib/types';

export type LessonStatus = 'done' | 'current' | 'upcoming';

const TYPE_EMOJI: Record<LessonType, string> = {
  video: '🎬',
  reading: '📖',
  quiz: '🎯',
  interactive: '✏️',
};

const TYPE_LABEL: Record<LessonType, string> = {
  video: 'Відео',
  reading: 'Читання',
  quiz: 'Тест',
  interactive: 'Урок',
};

interface Props {
  lesson: Lesson;
  index: number;
  status: LessonStatus;
  href: string;
  /** Course accent — used for "current" ring colour when the lesson
      doesn't override via its own accentColor. */
  courseAccent: string;
  /** Disable navigation (level-locked). */
  isLocked?: boolean;
}

export function LessonTileCard({
  lesson,
  index,
  status,
  href,
  courseAccent,
  isLocked,
}: Props) {
  const accent = lesson.accentColor ?? courseAccent;
  const emoji = TYPE_EMOJI[lesson.type] ?? '📘';
  const typeLabel = TYPE_LABEL[lesson.type] ?? 'Урок';

  const ring: CSSProperties =
    status === 'current'
      ? { boxShadow: `0 0 0 3px ${accent}33, 0 0 0 1.5px ${accent}` }
      : {};

  const tone = (() => {
    if (status === 'done') return 'bg-success/8 border-success/35';
    if (status === 'current') return 'bg-surface-raised border-transparent';
    return 'bg-surface-raised border-border opacity-65';
  })();

  const numberBadge = (() => {
    if (status === 'done') {
      return (
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-success text-white flex items-center justify-center font-black text-base">
          ✓
        </span>
      );
    }
    if (status === 'current') {
      return (
        <span
          className="flex-shrink-0 w-9 h-9 rounded-full text-white flex items-center justify-center font-black text-[14px] tabular-nums"
          style={{ background: accent }}
        >
          {index + 1}
        </span>
      );
    }
    return (
      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-surface-muted text-ink-faint flex items-center justify-center font-black text-[14px] tabular-nums">
        {index + 1}
      </span>
    );
  })();

  const inner = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${tone}`}
      style={ring}
    >
      {numberBadge}
      <span aria-hidden className="text-[24px] flex-shrink-0">
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-black text-[14.5px] text-ink leading-tight truncate">
          {lesson.title}
        </p>
        <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 truncate">
          {typeLabel}
          {lesson.durationMin ? ` · ${lesson.durationMin} хв` : ''}
          {status === 'current' ? ' · Поточний' : ''}
        </p>
      </div>
      {status === 'upcoming' && !isLocked && (
        <span aria-hidden className="text-ink-faint font-black text-base flex-shrink-0">›</span>
      )}
      {isLocked && <span aria-hidden className="text-base flex-shrink-0">🔒</span>}
    </div>
  );

  if (isLocked) return <div className="cursor-not-allowed">{inner}</div>;
  return (
    <Link href={href} className="block active:scale-[0.99] transition-transform">
      {inner}
    </Link>
  );
}
