/**
 * Vocabulary set detail.
 *
 * Layout (iOS-mode):
 *   - sticky breadcrumb header (Слова > {set.title})
 *   - HERO: book-cover thumbnail (slug-derived gradient + emoji),
 *     title / en subtitle / chips (тип · рівень · кількість слів) /
 *     short description
 *   - "СЛОВА" section header with counter + ghost-toggle "Показати всі"
 *   - flashcard list — each row reveals translation + example on tap
 *   - related sets — same row pattern
 *
 * Word reveal state is local; chevron rotates 90° when open.
 * No per-row hint, no skeleton placeholders for hidden translations
 * — closed state is a single row with chevron, nothing else.
 */
'use client';

import { use, useEffect, useMemo, useState } from 'react';
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

/* Slug-derived cover gradients — kept on the thumbnail only.
   Accent never bleeds into chips/buttons (one-accent-per-page rule). */
const COVERS: string[] = [
  'linear-gradient(160deg, #7c2d12 0%, #f97316 100%)',
  'linear-gradient(160deg, #1e3a8a 0%, #3b82f6 100%)',
  'linear-gradient(160deg, #14532d 0%, #22c55e 100%)',
  'linear-gradient(160deg, #581c87 0%, #a855f7 100%)',
  'linear-gradient(160deg, #164e63 0%, #06b6d4 100%)',
  'linear-gradient(160deg, #881337 0%, #f43f5e 100%)',
  'linear-gradient(160deg, #713f12 0%, #eab308 100%)',
  'linear-gradient(160deg, #831843 0%, #ec4899 100%)',
];

function coverFor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return COVERS[h % COVERS.length];
}

function categoryLabel(set: VocabularySet): string {
  if (set.lessonSlug) return 'Урок';
  if (set.courseSlug) return 'Курс';
  return 'Тема';
}

const PAGE_BOTTOM_PAD = 'pb-[calc(env(safe-area-inset-bottom,0px)+96px)]';

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

  const cover = coverFor(set.slug);
  const cat = categoryLabel(set);
  const totalWords = set.words.length;
  const revealedCount = revealed.size;
  const allRevealed = revealedCount === totalWords && totalWords > 0;

  function toggleAll() {
    if (!set) return;
    if (allRevealed) setRevealed(new Set());
    else setRevealed(new Set(set.words.map((_, i) => i)));
  }

  return (
    <div className={`flex flex-col min-h-[100dvh] bg-surface-raised ${PAGE_BOTTOM_PAD}`}>
      <Header onBack={() => router.push('/kids/school')} title={set.titleUa} />

      {/* HERO — compact, library-listing thumbnail proportions */}
      <section className="px-4 md:px-6 py-5">
        <div className="max-w-screen-md mx-auto w-full flex gap-4 md:gap-5 items-start">
          {set.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={set.coverImageUrl}
              alt=""
              aria-hidden
              className="flex-shrink-0 rounded-xl object-cover w-16 h-[88px] md:w-[88px] md:h-[120px] shadow-card"
            />
          ) : (
            <div
              aria-hidden
              className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center w-16 h-[88px] md:w-[88px] md:h-[120px] text-[36px] md:text-[44px] shadow-card"
              style={{ background: cover }}
            >
              {set.iconEmoji}
            </div>
          )}

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="ios-chip">{cat}</span>
              <span className="ios-chip">{set.level}</span>
              <span className="ios-chip tabular-nums">{totalWords} слів</span>
            </div>

            <div>
              <h1 className="font-black text-[20px] md:text-[24px] leading-tight tracking-tight text-ink">
                {set.titleUa}
              </h1>
              <p className="font-medium text-[13px] md:text-sm text-ink-faint mt-0.5">
                {set.title}
              </p>
              {(set.lessonTitle || set.courseTitle) && (
                <p className="font-medium text-[12px] text-ink-faint mt-0.5 truncate">
                  {set.lessonTitle ? `Урок: ${set.lessonTitle}` : `Курс: ${set.courseTitle}`}
                </p>
              )}
            </div>

            {set.description && (
              <p className="font-medium leading-relaxed text-[13.5px] md:text-sm text-ink-muted line-clamp-3">
                {set.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="ios-divider" />

      {/* Words */}
      <section className="px-4 md:px-6 py-5 flex-1">
        <div className="max-w-screen-md mx-auto w-full">
          <div className="flex items-end justify-between gap-3 mb-2 px-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted">
                Слова
              </span>
              <span className="font-bold text-[11px] text-ink-faint tabular-nums">
                {revealedCount}/{totalWords}
              </span>
            </div>
            {totalWords > 0 && (
              <button onClick={toggleAll} className="ios-btn ios-btn-ghost ios-btn-sm">
                {allRevealed ? 'Приховати всі' : 'Показати всі'}
              </button>
            )}
          </div>

          {totalWords > 1 && revealedCount === 0 && (
            <p className="font-medium text-[12.5px] text-ink-faint px-1 mb-3">
              Натисни на слово, щоб побачити переклад.
            </p>
          )}

          <ol className="ios-list">
            {set.words.map((w, i) => {
              const isOpen = revealed.has(i);
              return (
                <li key={`${w.word}-${i}`} className="border-t border-border first:border-t-0">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start gap-3 min-h-11 px-4 py-3 text-left transition-colors hover:bg-surface-hover focus:outline-none focus-visible:bg-surface-hover"
                  >
                    <span
                      aria-hidden
                      className="flex-shrink-0 w-6 mt-0.5 text-center font-bold text-[12px] tabular-nums text-ink-faint"
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-black text-[15.5px] md:text-base text-ink leading-snug">
                          {w.word}
                        </span>
                        {w.partOfSpeech && (
                          <span className="font-bold text-[10px] text-ink-faint uppercase tracking-wider">
                            {w.partOfSpeech}
                          </span>
                        )}
                      </div>
                      {isOpen && w.translation && (
                        <p className="font-medium text-[13.5px] text-ink-muted mt-0.5 leading-snug">
                          {w.translation}
                        </p>
                      )}
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
                    </div>
                    <span
                      aria-hidden
                      className={[
                        'flex-shrink-0 mt-1 text-ink-faint text-base font-black transition-transform duration-150',
                        isOpen ? 'rotate-90' : 'rotate-0',
                      ].join(' ')}
                    >
                      ›
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Related sets */}
      {related.length > 0 && (
        <section className="px-4 md:px-6 pb-12">
          <div className="max-w-screen-md mx-auto w-full">
            <p className="font-bold text-[11px] uppercase tracking-[0.04em] text-ink-muted mb-2 px-1">
              {set.courseSlug ? 'Ще зі словника курсу' : 'Інші теми'}
            </p>
            <div className="ios-list">
              {related.map((rel, idx) => (
                <Link
                  key={rel.slug}
                  href={`/kids/vocab/${rel.slug}`}
                  className={[
                    'flex items-center gap-3 min-h-11 px-4 py-3 transition-colors hover:bg-surface-hover',
                    idx > 0 && 'border-t border-border',
                  ].filter(Boolean).join(' ')}
                >
                  {rel.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rel.coverImageUrl}
                      alt=""
                      aria-hidden
                      className="flex-shrink-0 rounded-md object-cover w-10 h-[52px]"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="flex-shrink-0 rounded-md overflow-hidden flex items-center justify-center w-10 h-[52px] text-[22px]"
                      style={{ background: coverFor(rel.slug) }}
                    >
                      {rel.iconEmoji}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[14px] text-ink leading-tight truncate">
                      {rel.titleUa}
                    </p>
                    <p className="font-medium text-[11.5px] text-ink-faint mt-0.5 tabular-nums">
                      {rel.words.length} слів · {rel.level}
                    </p>
                  </div>
                  <span aria-hidden className="text-ink-faint text-base font-black flex-shrink-0">
                    ›
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-surface-raised/95 backdrop-blur-md pt-[max(8px,env(safe-area-inset-top))]">
      <div className="max-w-screen-md mx-auto w-full flex items-center gap-3 px-4 md:px-6 py-3">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 bg-surface-muted text-ink active:scale-90 transition-transform hover:bg-surface-hover"
        >
          ←
        </button>
        <p className="font-black text-[14.5px] text-ink shrink-0">Слова</p>
        <span className="text-sm text-ink-faint" aria-hidden>›</span>
        <p className="font-medium truncate text-sm text-ink-muted">{title}</p>
      </div>
    </div>
  );
}
