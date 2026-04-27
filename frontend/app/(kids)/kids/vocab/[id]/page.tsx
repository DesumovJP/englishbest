'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchVocabularySetBySlug, type VocabularySet } from '@/lib/vocabulary';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Params {
  id: string;
}

export default function VocabSetPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const [set, setSet] = useState<VocabularySet | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    let alive = true;
    fetchVocabularySetBySlug(id)
      .then((s) => {
        if (!alive) return;
        setSet(s);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  function toggle(idx: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function revealAll() {
    if (!set) return;
    setRevealed(new Set(set.words.map((_, i) => i)));
  }

  function hideAll() {
    setRevealed(new Set());
  }

  if (loading) {
    return (
      <div className="px-4 py-10 max-w-screen-md mx-auto">
        <LoadingState shape="list" rows={5} />
      </div>
    );
  }

  if (!set) {
    return (
      <div className="px-4 py-10 max-w-screen-md mx-auto">
        <EmptyState
          title="Добірку не знайдено"
          description="Можливо, добірку було перейменовано чи видалено."
        />
        <div className="mt-6 text-center">
          <Link href="/kids/school" className="font-bold text-primary text-[14px]">
            ← Повернутись до Школи
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-surface-raised overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-[env(safe-area-inset-top,12px)] py-3 border-b border-border bg-surface-raised">
        <Link
          href="/kids/school"
          className="inline-flex items-center gap-1 font-bold text-[12.5px] text-ink-muted hover:text-ink"
        >
          ← Школа
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <span aria-hidden className="text-[34px] leading-none">{set.iconEmoji}</span>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-[18px] text-ink leading-tight">{set.titleUa}</h1>
            <p className="font-medium text-[12px] text-ink-faint mt-0.5">
              {set.title} · {set.words.length} слів · {set.level}
            </p>
          </div>
        </div>
        {set.description && (
          <p className="mt-2 font-medium text-[12.5px] text-ink-muted leading-relaxed">
            {set.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={revealAll}
            className="rounded-full px-3 py-1.5 font-bold text-[11.5px] bg-primary text-white shadow-card-sm active:scale-95 transition-transform"
          >
            Показати всі
          </button>
          <button
            onClick={hideAll}
            className="rounded-full px-3 py-1.5 font-bold text-[11.5px] bg-surface-muted text-ink border border-border active:scale-95 transition-transform"
          >
            Приховати
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+72px)]">
        <ul className="divide-y divide-border">
          {set.words.map((w, i) => {
            const isOpen = revealed.has(i);
            return (
              <li key={`${w.word}-${i}`}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left px-4 py-3.5 hover:bg-surface-muted active:bg-surface-muted transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-black text-[16px] text-ink">{w.word}</span>
                    {w.partOfSpeech && (
                      <span className="font-bold text-[10.5px] text-ink-faint uppercase tracking-wider">
                        {w.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p
                    className={[
                      'font-medium text-[13.5px] mt-1 transition-opacity',
                      isOpen ? 'text-ink opacity-100' : 'text-ink-muted opacity-0 select-none',
                    ].join(' ')}
                  >
                    {w.translation || ' '}
                  </p>
                  {isOpen && (w.example || w.exampleTranslation) && (
                    <div className="mt-2 pl-3 border-l-2 border-primary/30">
                      {w.example && (
                        <p className="font-medium italic text-[12.5px] text-ink-muted leading-snug">
                          {w.example}
                        </p>
                      )}
                      {w.exampleTranslation && (
                        <p className="font-medium text-[12px] text-ink-faint leading-snug mt-0.5">
                          {w.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
