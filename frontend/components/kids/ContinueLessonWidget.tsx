/**
 * ContinueLessonWidget — the "pick up where you left off" surface.
 *
 * Reads the caller's most recent inProgress user-progress row (server-scoped)
 * and renders a compact tap target that deep-links to the lesson player
 * (`/courses/{courseSlug}/lessons/{lessonSlug}`).
 *
 * Three shapes:
 *   - `loading` — skeleton
 *   - `empty`   — gentle "start your first lesson" CTA pointing to /kids/school
 *   - `ready`   — lesson title + course + a compact progress chip
 *
 * Intended for /kids/dashboard right column (desktop) and the mobile bottom
 * sheet. The component is self-contained — it owns its own fetch.
 */
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HudCard } from '@/components/kids/ui';
import { fetchContinueLesson, type UserProgressRow } from '@/lib/user-progress';

interface Props {
  compact?: boolean;
}

export function ContinueLessonWidget({ compact }: Props) {
  const [row, setRow] = useState<UserProgressRow | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    fetchContinueLesson()
      .then(r => {
        if (!alive) return;
        setRow(r);
        setStatus(r ? 'ready' : 'empty');
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
      <HudCard className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink-faint/15 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 rounded bg-ink-faint/15 animate-pulse" />
            <div className="h-2.5 w-1/2 rounded bg-ink-faint/10 animate-pulse" />
          </div>
        </div>
      </HudCard>
    );
  }

  if (status === 'error') {
    return (
      <HudCard className={compact ? 'p-3' : 'p-4'}>
        <p className="font-black text-[12px] sm:text-sm text-ink mb-0.5">Продовжити урок</p>
        <p className="font-medium text-[11px] sm:text-xs text-ink-muted">Не вдалось завантажити прогрес</p>
      </HudCard>
    );
  }

  if (status === 'empty' || !row) {
    return (
      <Link href="/kids/school" className="block">
        <HudCard className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-[20px] flex-shrink-0" aria-hidden>
              📚
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[12px] sm:text-sm text-ink">Почати вчитись</p>
              <p className="font-medium text-[11px] sm:text-xs text-ink-muted">Обери урок у Школі</p>
            </div>
          </div>
        </HudCard>
      </Link>
    );
  }

  const lesson = row.lesson;
  if (!lesson?.courseSlug) {
    return (
      <Link href="/kids/school" className="block">
        <HudCard className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-[20px] flex-shrink-0" aria-hidden>
              📚
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[12px] sm:text-sm text-ink">До Школи</p>
              <p className="font-medium text-[11px] sm:text-xs text-ink-muted">Обери новий урок</p>
            </div>
          </div>
        </HudCard>
      </Link>
    );
  }

  const attemptLabel =
    row.attempts > 1 ? `${row.attempts} спроб` : row.attempts === 1 ? '1 спроба' : 'новий урок';

  return (
    <Link href={`/courses/${lesson.courseSlug}/lessons/${lesson.slug}`} className="block">
      <HudCard className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-[20px] flex-shrink-0" aria-hidden>
            {row.course?.iconEmoji ?? '📚'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-[10px] uppercase tracking-wider text-primary mb-0.5">
              Продовжити урок
            </p>
            <p className="font-black text-[12px] sm:text-sm text-ink truncate">{lesson.title}</p>
            <p className="font-medium text-[11px] sm:text-xs text-ink-muted truncate">
              {row.course?.title ?? 'Курс'} · {attemptLabel}
            </p>
          </div>
        </div>
      </HudCard>
    </Link>
  );
}
