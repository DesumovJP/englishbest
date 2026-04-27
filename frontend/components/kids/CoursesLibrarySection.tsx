/**
 * CoursesLibrarySection — kids course catalog.
 *
 * Live data via `fetchCoursesCached()` — already filtered server-side to
 * `status != archived`. Filters to `kind=course` (books/videos/games are
 * hidden until real content is curated through admin) and to courses that
 * are kid-friendly (`audience` of `kids` / `any` / unset). Each card links
 * to `/kids/library/[slug]` for the full description + lessons list.
 */
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCoursesCached, peekCourses } from '@/lib/api';
import type { Course, Level } from '@/lib/types';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  level: Level;
}

const LEVEL_ORDER: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function levelRank(l?: Level): number {
  return l ? LEVEL_ORDER.indexOf(l) : -1;
}

function isKidsCourse(c: Course): boolean {
  if (c.kind && c.kind !== 'course') return false;
  const aud = c.audience;
  return !aud || aud === 'kids' || aud === 'any';
}

export function CoursesLibrarySection({ level }: Props) {
  const [courses, setCourses] = useState<Course[] | null>(() => peekCourses());
  const [loading, setLoading] = useState(courses === null);

  useEffect(() => {
    let alive = true;
    fetchCoursesCached()
      .then((rows) => {
        if (!alive) return;
        setCourses(rows);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setCourses([]);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <LoadingState shape="list" rows={4} />
      </div>
    );
  }

  const visible = (courses ?? [])
    .filter(isKidsCourse)
    .sort((a, b) => levelRank(a.level) - levelRank(b.level) || a.title.localeCompare(b.title));

  if (visible.length === 0) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          title="Курси наповнюються"
          description="Скоро тут зʼявляться нові курси."
        />
      </div>
    );
  }

  const userRank = levelRank(level);
  const grouped = LEVEL_ORDER.map((l) => ({
    level: l,
    items: visible.filter((c) => c.level === l),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="px-4 py-4 space-y-5">
      {grouped.map((g) => (
        <section key={g.level}>
          <p className="font-black uppercase tracking-widest text-[10px] text-ink-faint mb-2 px-1">
            Рівень {g.level}
          </p>
          <div className="flex flex-col gap-2">
            {g.items.map((c) => {
              const locked = userRank >= 0 && levelRank(c.level) > userRank;
              return (
                <Link
                  key={c.documentId}
                  href={`/kids/library/${c.slug}`}
                  className={[
                    'flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 border-border bg-surface-raised transition-colors',
                    locked
                      ? 'opacity-60'
                      : 'hover:border-primary/40 active:scale-[0.99]',
                  ].join(' ')}
                >
                  <span
                    aria-hidden
                    className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-[26px]"
                  >
                    {c.iconEmoji ?? '🎓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-[14.5px] text-ink leading-snug truncate flex-1 min-w-0">
                        {c.titleUa ?? c.title}
                      </p>
                      <span className="rounded-md px-1.5 py-0.5 font-bold text-[10px] bg-surface-muted text-ink-muted border border-border flex-shrink-0">
                        {c.level ?? 'A1'}
                      </span>
                    </div>
                    {c.subtitle && (
                      <p className="font-medium text-[11.5px] text-ink-faint truncate">
                        {c.subtitle}
                      </p>
                    )}
                    {c.descriptionShort && (
                      <p className="font-medium text-[12.5px] text-ink-muted leading-snug mt-1 line-clamp-2">
                        {c.descriptionShort}
                      </p>
                    )}
                    {locked && (
                      <p className="font-bold text-[11px] text-ink-faint mt-1.5">
                        🔒 Потрібен рівень {c.level}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
