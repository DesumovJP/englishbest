/**
 * VocabularySection — kids "Слова" tab.
 *
 * Mirrors the LibraryCatalog UX inside /kids/school: mobile drawer
 * trigger + bottom sheet, desktop left sidebar with categories, and a
 * grouped list of vocabulary sets in the main pane. One LibListItem-
 * style row per set: thumbnail tile (topic accent + emoji), title /
 * subtitle / description, type label + level chip + word count.
 *
 * Categories:
 *   - Все
 *   - Загальні теми (no course/lesson link)
 *   - За курсами   (has course, no lesson)
 *   - За уроками   (has both course + lesson)
 */
'use client';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
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

type CategoryId = 'all' | 'standalone' | 'by-course' | 'by-lesson';

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'all',         label: 'Все' },
  { id: 'standalone',  label: 'Загальні теми' },
  { id: 'by-course',   label: 'За курсами' },
  { id: 'by-lesson',   label: 'За уроками' },
];

const TYPE_LABEL: Record<Exclude<CategoryId, 'all'>, string> = {
  standalone: 'Тема',
  'by-course': 'Курс',
  'by-lesson': 'Урок',
};

const TYPE_SECTION: Record<Exclude<CategoryId, 'all'>, string> = {
  standalone: 'Загальні теми 📚',
  'by-course': 'За курсами 🎓',
  'by-lesson': 'За уроками 📝',
};

const LEVEL_ORDER: Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function canAccessLevel(userLevel: Level, req: Level): boolean {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(req);
}

// Stable kid-friendly palette derived from slug hash. Matches the
// LibListItem `--accent` / `--cover-bg` contract.
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

function categoryOf(set: VocabularySet): Exclude<CategoryId, 'all'> {
  if (set.lessonSlug) return 'by-lesson';
  if (set.courseSlug) return 'by-course';
  return 'standalone';
}

function VocabRow({
  set,
  isLocked,
  onNavigate,
}: {
  set: VocabularySet;
  isLocked: boolean;
  onNavigate: () => void;
}) {
  const cat = categoryOf(set);
  // Slug palette colours the cover only; chips and other UI stay neutral
  // so the row reads quietly (one-accent-per-page rule).
  const { cover } = paletteFor(set.slug);
  const rowVars = { '--cover-bg': cover } as CSSProperties;

  return (
    <div
      className={[
        'flex gap-3 px-3 py-3 md:gap-5 md:px-6 md:py-5 cursor-pointer transition-colors border-b border-border hover:bg-surface-muted',
        isLocked ? 'opacity-65' : 'opacity-100',
      ].join(' ')}
      style={rowVars}
      onClick={onNavigate}
    >
      {set.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={set.coverImageUrl}
          alt=""
          aria-hidden
          className={[
            'flex-shrink-0 rounded-lg md:rounded-xl object-cover w-16 h-[88px] md:w-24 md:h-[130px] shadow-card-md',
            isLocked && 'grayscale-50',
          ].filter(Boolean).join(' ')}
        />
      ) : (
        <div className={[
          'flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center w-16 h-[88px] text-[36px] md:w-24 md:h-[130px] md:text-[52px] shadow-card-md bg-[image:var(--cover-bg)]',
          isLocked && 'grayscale-50',
        ].filter(Boolean).join(' ')}>
          {set.iconEmoji}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <p className="font-black leading-snug text-[15px] md:text-lg text-ink -tracking-[0.02em]">
          {set.titleUa}
          <span className="font-medium text-[13px] md:text-[15px] text-ink-muted"> — {set.title}</span>
        </p>
        {set.lessonTitle && (
          <p className="font-medium mt-0.5 text-[11.5px] md:text-[13px] text-ink-faint truncate">
            Урок: {set.lessonTitle}
          </p>
        )}
        {!set.lessonTitle && set.courseTitle && (
          <p className="font-medium mt-0.5 text-[11.5px] md:text-[13px] text-ink-faint truncate">
            Курс: {set.courseTitle}
          </p>
        )}

        {set.description && (
          <p className="font-medium leading-snug md:leading-relaxed mt-1 md:mt-2 text-[12px] md:text-[13.5px] text-ink line-clamp-2 md:line-clamp-3">
            {set.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 md:gap-2 mt-auto pt-2 md:pt-3 flex-wrap">
          <span className="ios-chip">{TYPE_LABEL[cat]}</span>
          <span className="ios-chip">{set.level}</span>
          <span className="ios-chip tabular-nums">{set.words.length} слів</span>
          {isLocked && <span className="text-sm" aria-hidden>🔒</span>}
        </div>
      </div>
    </div>
  );
}

export function VocabularySection({ level }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<VocabularySet[] | null>(() => peekVocabularySets());
  const [loading, setLoading] = useState(items === null);
  const [tab, setTab] = useState<CategoryId>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchVocabularySets()
      .then((rows) => {
        if (!alive) return;
        setItems(rows);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (!items) return [];
    if (tab === 'all') return items;
    return items.filter((s) => categoryOf(s) === tab);
  }, [items, tab]);

  const counts: Record<CategoryId, number> = useMemo(() => {
    const c: Record<CategoryId, number> = { all: 0, standalone: 0, 'by-course': 0, 'by-lesson': 0 };
    if (!items) return c;
    c.all = items.length;
    for (const s of items) c[categoryOf(s)] += 1;
    return c;
  }, [items]);

  const grouped = useMemo<{ header: string; items: VocabularySet[] }[]>(() => {
    if (tab === 'all') {
      return (['standalone', 'by-course', 'by-lesson'] as Exclude<CategoryId, 'all'>[])
        .map((t) => ({
          header: TYPE_SECTION[t],
          items: visible.filter((s) => categoryOf(s) === t),
        }))
        .filter((g) => g.items.length > 0);
    }
    return [{ header: '', items: visible }];
  }, [tab, visible]);

  const activeCat = CATEGORIES.find((c) => c.id === tab) ?? CATEGORIES[0];

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
      {/* Mobile: drawer trigger */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden flex items-center justify-between gap-2 px-4 h-11 bg-surface-raised border-b border-border text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-black text-[14px] text-ink truncate">{activeCat.label}</span>
          <span className="font-bold text-[11px] text-ink-faint">{counts[activeCat.id]}</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="flex-shrink-0 text-ink-muted">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0 overflow-y-auto bg-surface-raised w-[196px] border-r border-border py-5">
        <p className="px-5 mb-2 font-black uppercase tracking-widest text-[10px] text-ink-faint">
          Категорія
        </p>
        {CATEGORIES.map((cat) => {
          const isActive = tab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setTab(cat.id)}
              className={[
                'flex items-center justify-between px-5 py-2.5 text-left transition-colors border-l-[3px]',
                isActive ? 'bg-surface-muted border-primary' : 'bg-transparent border-transparent',
              ].join(' ')}
            >
              <span className={['text-[13px]', isActive ? 'text-ink font-extrabold' : 'text-ink-muted font-medium'].join(' ')}>
                {cat.label}
              </span>
              <span className="font-medium text-[11px] text-ink-faint">{counts[cat.id]}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile bottom sheet */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[4px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-h-[85dvh] flex flex-col rounded-t-3xl bg-surface-raised shadow-overlay animate-[slide-up_220ms_ease-out]">
            <div className="flex-shrink-0 flex justify-center pt-2.5 pb-2">
              <span className="h-1 w-10 rounded-full bg-border" aria-hidden />
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom,16px)]">
              <p className="px-5 pb-2 font-black uppercase tracking-widest text-[10px] text-ink-faint">Категорія</p>
              <div className="px-2 pb-2">
                {CATEGORIES.map((cat) => {
                  const isActive = tab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setTab(cat.id); setDrawerOpen(false); }}
                      className={[
                        'w-full flex items-center justify-between px-3 py-3 rounded-xl transition-colors',
                        isActive ? 'bg-primary text-white' : 'bg-transparent text-ink active:bg-surface-muted',
                      ].join(' ')}
                    >
                      <span className="font-extrabold text-[15px]">{cat.label}</span>
                      <span className={['font-bold text-[12px]', isActive ? 'text-white/70' : 'text-ink-faint'].join(' ')}>{counts[cat.id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+96px)] bg-surface-raised">
        {loading ? (
          <div className="py-10 px-4">
            <LoadingState shape="list" rows={5} />
          </div>
        ) : grouped.length === 0 ? (
          <div className="py-10 px-4">
            <EmptyState
              title="Слова ще не додано"
              description="Скоро тут зʼявляться добірки слів за темами, курсами та уроками."
            />
          </div>
        ) : (
          grouped.map((group, gi) => (
            <div key={gi}>
              {tab === 'all' && (
                <div className="px-6 pt-6 pb-3 border-b border-border">
                  <p className="font-black text-xs text-ink-faint uppercase tracking-[0.08em]">
                    {group.header}
                  </p>
                </div>
              )}
              {group.items.map((set) => (
                <VocabRow
                  key={set.slug}
                  set={set}
                  isLocked={!canAccessLevel(level, set.level)}
                  onNavigate={() => router.push(`/kids/vocab/${set.slug}`)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
