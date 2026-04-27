/**
 * VocabularySection — list of standalone vocabulary sets at the learner's
 * current level. Independent of the lesson catalog; tapping a set opens a
 * detail page where the user flips through the words.
 *
 * Data: `fetchVocabularySets()` (cached) — sets are fetched once and shown
 * grouped by level, accessible if the kid has reached that level.
 */
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchVocabularySets,
  peekVocabularySets,
  type VocabularySet,
  type Level,
} from '@/lib/vocabulary';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  level: Level;
}

const LEVEL_ORDER: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function canAccessLevel(userLevel: Level, req: Level): boolean {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(req);
}

export function VocabularySection({ level }: Props) {
  const [sets, setSets] = useState<VocabularySet[] | null>(() => peekVocabularySets());
  const [loading, setLoading] = useState(sets === null);

  useEffect(() => {
    let alive = true;
    fetchVocabularySets()
      .then((rows) => {
        if (!alive) return;
        setSets(rows);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setSets([]);
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

  if (!sets || sets.length === 0) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          title="Словничок наповнюється"
          description="Скоро тут зʼявляться добірки слів за темами — родина, дієслова руху, числа і час та інші."
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      <p className="font-medium text-[13px] text-ink-muted leading-relaxed">
        Окремі добірки слів — швидко вивчити тему без проходження всього курсу. Тапни на добірку, щоб почати.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sets.map((set) => {
          const locked = !canAccessLevel(level, set.level);
          return (
            <Link
              key={set.slug}
              href={locked ? '#' : `/kids/vocab/${set.slug}`}
              aria-disabled={locked}
              onClick={(e) => {
                if (locked) e.preventDefault();
              }}
              className={[
                'flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-surface-raised border border-border transition-colors',
                locked ? 'opacity-55 cursor-not-allowed' : 'hover:bg-surface-muted active:scale-[0.99]',
              ].join(' ')}
            >
              <span
                aria-hidden
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-[26px]"
              >
                {set.iconEmoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[14.5px] text-ink leading-snug truncate">
                  {set.titleUa}
                </p>
                <p className="font-medium text-[12px] text-ink-faint mt-0.5 truncate">
                  {set.title} · {set.words.length} слів
                </p>
              </div>
              <span className="flex-shrink-0 rounded-md px-2 py-0.5 font-bold text-[10.5px] bg-surface-muted text-ink-muted border border-border">
                {set.level}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
