/**
 * VocabularySection — kids vocabulary catalog.
 *
 * Three groups, in order of specificity:
 *   1. Загальні теми       — sets with no course/lesson link (standalone topics)
 *   2. За курсами          — anchor sets per course (one per v2 course)
 *   3. За уроками — {курс}  — per-lesson sets, grouped under the parent course
 *
 * Tapping a set opens `/kids/vocab/[slug]` for the flashcard view.
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

function SetRow({ set, locked }: { set: VocabularySet; locked: boolean }) {
  return (
    <Link
      href={locked ? '#' : `/kids/vocab/${set.slug}`}
      aria-disabled={locked}
      onClick={(e) => {
        if (locked) e.preventDefault();
      }}
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-raised border border-border transition-colors',
        locked
          ? 'opacity-55 cursor-not-allowed'
          : 'hover:bg-surface-muted active:scale-[0.99]',
      ].join(' ')}
    >
      <span
        aria-hidden
        className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-[22px]"
      >
        {set.iconEmoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-black text-[14px] text-ink leading-snug truncate">
          {set.titleUa}
        </p>
        <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 truncate">
          {set.title} · {set.words.length} слів
        </p>
      </div>
      <span className="flex-shrink-0 rounded-md px-2 py-0.5 font-bold text-[10.5px] bg-surface-muted text-ink-muted border border-border">
        {set.level}
      </span>
    </Link>
  );
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
          description="Скоро тут зʼявляться добірки слів за темами та курсами."
        />
      </div>
    );
  }

  const standalone = sets.filter((s) => !s.courseSlug && !s.lessonSlug);
  const perCourse = sets.filter((s) => s.courseSlug && !s.lessonSlug);
  const perLessonByCourse = new Map<string, VocabularySet[]>();
  for (const s of sets) {
    if (!s.lessonSlug || !s.courseSlug) continue;
    const arr = perLessonByCourse.get(s.courseSlug) ?? [];
    arr.push(s);
    perLessonByCourse.set(s.courseSlug, arr);
  }

  return (
    <div className="px-4 py-4 space-y-6">
      <p className="font-medium text-[12.5px] text-ink-muted leading-relaxed">
        Тапни на добірку — перегортай слова, відкривай переклад. Загальні теми не
        привʼязані до курсу; за курсами і уроками — вивчиш потрібну лексику паралельно
        з уроком.
      </p>

      {standalone.length > 0 && (
        <section>
          <p className="font-black uppercase tracking-widest text-[10px] text-ink-faint mb-2 px-1">
            Загальні теми
          </p>
          <div className="flex flex-col gap-2">
            {standalone.map((s) => (
              <SetRow key={s.slug} set={s} locked={!canAccessLevel(level, s.level)} />
            ))}
          </div>
        </section>
      )}

      {perCourse.length > 0 && (
        <section>
          <p className="font-black uppercase tracking-widest text-[10px] text-ink-faint mb-2 px-1">
            За курсами
          </p>
          <div className="flex flex-col gap-2">
            {perCourse.map((s) => (
              <SetRow key={s.slug} set={s} locked={!canAccessLevel(level, s.level)} />
            ))}
          </div>
        </section>
      )}

      {Array.from(perLessonByCourse.entries()).map(([courseSlug, lessonSets]) => {
        const courseTitle =
          lessonSets[0]?.courseTitle ?? courseSlug.replace(/-/g, ' ');
        return (
          <section key={courseSlug}>
            <p className="font-black uppercase tracking-widest text-[10px] text-ink-faint mb-2 px-1">
              За уроками · {courseTitle}
            </p>
            <div className="flex flex-col gap-2">
              {lessonSets.map((s) => (
                <SetRow key={s.slug} set={s} locked={!canAccessLevel(level, s.level)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
