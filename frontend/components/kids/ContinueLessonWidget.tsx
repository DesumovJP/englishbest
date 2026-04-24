/**
 * ContinueLessonWidget — "pick up where you left off" shortcut pill.
 *
 * Renders a compact green CTA with course icon, lesson title, course/lesson
 * number, a "GO →" chip, and a thin progress bar. Deep-links straight to
 * `/courses/{courseSlug}/lessons/{lessonSlug}`.
 *
 * When the learner has no in-progress lesson, the widget renders nothing —
 * it's a shortcut, not a generic "go to school" button. The School tab in the
 * bottom nav already covers that case.
 */
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchContinueLesson, type UserProgressRow } from '@/lib/user-progress';

interface Props {
  compact?: boolean;
}

export function ContinueLessonWidget({ compact: _compact }: Props) {
  const [row, setRow] = useState<UserProgressRow | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    fetchContinueLesson()
      .then(r => {
        if (!alive) return;
        setRow(r);
        setStatus(r && r.lesson?.courseSlug ? 'ready' : 'empty');
      })
      .catch(() => {
        if (!alive) return;
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="block rounded-[20px] overflow-hidden bg-primary/80 animate-pulse">
        <div className="flex items-center gap-2.5 px-2.5 py-2 h-[60px]">
          <div className="w-10 h-10 rounded-full bg-white/20 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 rounded bg-white/30" />
            <div className="h-2.5 w-1/2 rounded bg-white/20" />
          </div>
          <div className="w-14 h-8 rounded-full bg-white/20" />
        </div>
        <div className="h-1 bg-white/15" />
      </div>
    );
  }

  if (status !== 'ready' || !row || !row.lesson?.courseSlug) return null;

  const lesson = row.lesson;
  const pct = Math.min(100, Math.max(0, row.score ?? 0));
  const lessonNum = (lesson.orderIndex ?? 0) + 1;
  const href = `/courses/${lesson.courseSlug}/lessons/${lesson.slug}`;

  return (
    <Link
      href={href}
      className="group block rounded-[20px] overflow-hidden bg-primary shadow-press-primary active:translate-y-1 active:shadow-none transition-transform"
    >
      <div className="flex items-center gap-2.5 px-2.5 py-2">
        <span
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-[20px] leading-none flex-shrink-0"
          aria-hidden
        >
          {row.course?.iconEmoji ?? '📚'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-[14px] sm:text-[15px] leading-tight truncate">
            {lesson.title}
          </p>
          <p className="text-white/80 font-semibold text-[11px] sm:text-[12px] leading-tight mt-0.5 truncate">
            {row.course?.title ?? 'Курс'} · Урок {lessonNum}
          </p>
        </div>
        <span className="ml-1 px-3 h-8 rounded-full bg-white/20 group-hover:bg-white/30 text-white font-black text-[11px] sm:text-[12px] inline-flex items-center flex-shrink-0 transition-colors">
          GO →
        </span>
      </div>
      <div className="h-1 bg-white/15" aria-hidden>
        <div
          className="h-full bg-white transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  );
}
