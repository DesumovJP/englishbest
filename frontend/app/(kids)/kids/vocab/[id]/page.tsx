/**
 * Vocabulary set detail — mirrors the kids library-detail layout.
 *
 * Layout:
 *   - sticky breadcrumb header (Бібліотека > Слова > {set.title})
 *   - HERO: cover tile (slug-derived gradient + emoji), title /
 *     subtitle / description, level chip + category chip + word count
 *   - quick actions row: "Показати всі" / "Приховати"
 *   - "Слова" — flashcard-style list with reveal-translation taps
 *   - "Слова курсу/уроку" cross-link (when set is course/lesson-bound)
 *
 * Word reveal state is local — flipping a card shows the translation,
 * example, and example translation. "Показати всі" is the bulk-toggle.
 */
'use client';

import { use, useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchVocabularySetBySlug,
  fetchVocabularySets,
  peekVocabularySets,
  type VocabularySet,
} from '@/lib/vocabulary';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Params {
  id: string;
}

const PALETTE: { accent: string; cover: string }[] = [
  { accent: '#F97316', cover: 'linear-gradient(160deg, #7c2d12 0%, #f97316 100%)' },
  { accent: '#3B82F6', cover: 'linear-gradient(160deg, #1e3a8a 0%, #3b82f6 100%)' },
  { accent: '#22C55E', cover: 'linear-gradient(160deg, #14532d 0%, #22c55e 100%)' },
  { accent: '#A855F7', cover: 'linear-gradient(160deg, #581c87 0%, #a855f7 100%)' },
  { accent: '#06B6D4', cover: 'linear-gradient(160deg, #164e63 0%, #06b6d4 100%)' },
  { accent: '#F43F5E', cover: 'linear-gradient(160deg, #881337 0%, #f43f5e 100%)' },
  { accent: '#EAB308', cover: 'linear-gradient(160deg, #713f12 0%, #eab308 100%)' },
  { accent: '#EC4899', cover: 'linear-gradient(160deg, #831843 0%, #ec4899 100%)' },
];

function paletteFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}

function categoryLabel(set: VocabularySet): string {
  if (set.lessonSlug) return 'Урок';
  if (set.courseSlug) return 'Курс';
  return 'Тема';
}

export default function VocabSetPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();

  const [set, setSet] = useState<VocabularySet | null>(null);
  const [allSets, setAllSets] = useState<VocabularySet[] | null>(() => peekVocabularySets());
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchVocabularySetBySlug(id),
      fetchVocabularySets().catch(() => [] as VocabularySet[]),
    ])
      .then(([s, all]) => {
        if (!alive) return;
        setSet(s);
        setAllSets(all);
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

  const related = useMemo(() => {
    if (!set || !allSets) return [];
    return allSets
      .filter((s) => s.slug !== set.slug)
      .filter((s) => {
        if (set.courseSlug && s.courseSlug === set.courseSlug) return true;
        if (!set.courseSlug && !s.courseSlug && !s.lessonSlug) return true;
        return false;
      })
      .slice(0, 4);
  }, [set, allSets]);

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

  const PAGE_BOTTOM_PAD = 'pb-[calc(env(safe-area-inset-bottom,0px)+96px)]';

  if (loading && !set) {
    return (
      <div className={`min-h-[100dvh] bg-surface-raised ${PAGE_BOTTOM_PAD}`}>
        <Header onBack={() => router.back()} title="Слова" />
        <div className="max-w-screen-md mx-auto w-full px-4 py-10">
          <LoadingState shape="card" rows={1} />
        </div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className={`min-h-[100dvh] bg-surface-raised ${PAGE_BOTTOM_PAD}`}>
        <Header onBack={() => router.back()} title="Слова" />
        <div className="max-w-screen-md mx-auto w-full px-4 py-10">
          <EmptyState
            title="Добірку не знайдено"
            description="Можливо, її було перейменовано чи знято з публікації."
            icon={<span aria-hidden>😕</span>}
          />
          <div className="mt-6 text-center">
            <Link href="/kids/school" className="font-bold text-primary text-[14px]">
              ← Повернутись до Школи
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { accent, cover } = paletteFor(set.slug);
  const accentVars = { '--accent': accent, '--cover-bg': cover } as CSSProperties;
  const cat = categoryLabel(set);
  const revealedCount = revealed.size;
  const totalWords = set.words.length;

  return (
    <div className={`flex flex-col min-h-[100dvh] bg-surface-raised ${PAGE_BOTTOM_PAD}`} style={accentVars}>
      <Header onBack={() => router.push('/kids/school')} title={set.titleUa} />

      {/* HERO */}
      <section className="px-5 md:px-10 py-6 border-b border-border">
        <div className="max-w-screen-md mx-auto w-full flex gap-4 md:gap-6 flex-col md:flex-row">
          <div
            className="flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center w-[140px] h-[180px] md:w-[180px] md:h-[240px] text-[64px] md:text-[88px] shadow-card-md bg-[image:var(--cover-bg)] mx-auto md:mx-0"
            aria-hidden
          >
            {set.iconEmoji}
          </div>

          <div className="flex flex-col gap-3 flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md px-2.5 py-0.5 font-bold text-[11.5px] bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/25">
                {cat}
              </span>
              <span className="rounded-md px-2.5 py-0.5 font-bold text-[11.5px] bg-surface-muted text-ink border border-border">
                {set.level}
              </span>
              <span className="rounded-md px-2.5 py-0.5 font-bold text-[11.5px] bg-surface-muted text-ink-muted border border-border tabular-nums">
                {totalWords} слів
              </span>
            </div>

            <div>
              <h1 className="font-black leading-tight text-[24px] md:text-[28px] text-ink tracking-tight">
                {set.titleUa}
              </h1>
              <p className="font-medium mt-1 text-[14px] md:text-[15px] text-ink-muted">
                {set.title}
              </p>
              {(set.lessonTitle || set.courseTitle) && (
                <p className="font-medium mt-0.5 text-[12.5px] text-ink-faint">
                  {set.lessonTitle ? `Урок: ${set.lessonTitle}` : `Курс: ${set.courseTitle}`}
                </p>
              )}
            </div>

            {set.description && (
              <p className="font-medium leading-relaxed text-[14px] md:text-[14.5px] text-ink">
                {set.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap mt-1">
              <button
                onClick={revealAll}
                className="rounded-2xl px-4 h-10 font-black text-[13px] bg-[color:var(--accent)] text-white shadow-card-sm active:translate-y-0.5 active:shadow-none transition-all"
              >
                Показати всі
              </button>
              <button
                onClick={hideAll}
                className="rounded-2xl px-4 h-10 font-black text-[13px] bg-surface-muted text-ink border border-border active:scale-95 transition-transform"
              >
                Приховати
              </button>
              <span className="font-bold text-[12px] text-ink-faint tabular-nums ml-auto">
                {revealedCount} / {totalWords} відкрито
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Words list */}
      <section className="px-5 md:px-10 py-6 flex-1">
        <div className="max-w-screen-md mx-auto w-full">
          <p className="font-black mb-3 text-[11px] text-ink-faint uppercase tracking-[0.09em]">
            Слова
          </p>
          <ol className="rounded-2xl border border-border bg-surface-raised overflow-hidden divide-y divide-border">
            {set.words.map((w, i) => {
              const isOpen = revealed.has(i);
              return (
                <li key={`${w.word}-${i}`}>
                  <button
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-4 md:px-5 py-3.5 hover:bg-surface-muted active:bg-surface-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] tabular-nums bg-surface-muted text-ink-muted"
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-black text-[16px] text-ink truncate">
                            {w.word}
                          </span>
                          {w.partOfSpeech && (
                            <span className="font-bold text-[10.5px] text-ink-faint uppercase tracking-wider flex-shrink-0">
                              {w.partOfSpeech}
                            </span>
                          )}
                        </div>
                        <p
                          className={[
                            'font-medium text-[13.5px] mt-1 transition-opacity',
                            isOpen
                              ? 'text-ink opacity-100'
                              : 'text-transparent select-none',
                          ].join(' ')}
                          style={
                            isOpen
                              ? undefined
                              : { background: 'var(--color-surface-muted)', borderRadius: 4, height: '1em' }
                          }
                        >
                          {w.translation || ' '}
                        </p>
                      </div>
                      {!isOpen && (
                        <span aria-hidden className="text-[11px] font-bold text-ink-faint flex-shrink-0">
                          натисни
                        </span>
                      )}
                    </div>

                    {isOpen && (w.example || w.exampleTranslation) && (
                      <div
                        className="mt-3 ml-11 pl-3 border-l-2"
                        style={{ borderColor: 'var(--accent)' }}
                      >
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
          </ol>
        </div>
      </section>

      {/* Related sets */}
      {related.length > 0 && (
        <section className="px-5 md:px-10 pb-12">
          <div className="max-w-screen-md mx-auto w-full">
            <p className="font-black mb-4 text-[11px] text-ink-faint uppercase tracking-[0.09em]">
              {set.courseSlug ? 'Ще зі словника курсу' : 'Інші теми'}
            </p>
            <div className="flex flex-col border-[1.5px] border-border rounded-2xl overflow-hidden">
              {related.map((rel, idx) => {
                const p = paletteFor(rel.slug);
                return (
                  <Link
                    key={rel.slug}
                    href={`/kids/vocab/${rel.slug}`}
                    className={[
                      'flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-muted',
                      idx < related.length - 1 && 'border-b border-border',
                    ].filter(Boolean).join(' ')}
                  >
                    <div
                      className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center w-11 h-[58px] text-[26px]"
                      style={{ background: p.cover }}
                      aria-hidden
                    >
                      {rel.iconEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black leading-tight truncate text-sm text-ink">{rel.titleUa}</p>
                      <p className="font-medium text-xs text-ink-muted tabular-nums">
                        {rel.words.length} слів
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="rounded-md px-2 py-0.5 font-bold text-[11px] bg-surface-muted text-ink">{rel.level}</span>
                      <span className="text-base text-ink-faint" aria-hidden>›</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-surface-raised pt-[max(12px,env(safe-area-inset-top))]">
      <div className="max-w-screen-md mx-auto w-full flex items-center gap-3 px-4 md:px-6 py-3">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 bg-surface-muted text-ink active:scale-90 transition-transform"
        >
          ←
        </button>
        <p className="font-black text-[15px] text-ink">Слова</p>
        <span className="text-sm text-ink-faint" aria-hidden>›</span>
        <p className="font-medium truncate text-sm text-ink-muted">{title}</p>
      </div>
    </div>
  );
}
