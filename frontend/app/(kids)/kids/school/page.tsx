'use client';
import { useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useKidsIdentity } from '@/lib/use-kids-identity';
import { useLibrary } from '@/lib/use-kids-store';
import {
  LIB_CATEGORIES,
  TYPE_ACCENT, TYPE_LABEL, TYPE_SECTION, COVER_BG,
  canAccessLevel,
  type LibTabId, type LibKind, type LibraryItem,
} from '@/lib/library';
import { LessonTreeSection } from '@/components/kids/LessonTreeSection';
import { LessonCarouselSection } from '@/components/kids/LessonCarouselSection';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

type PageTab = 'lessons' | 'library';
type LessonView = 'carousel' | 'list';

function LibListItem({ item, isLocked, onNavigate }: {
  item: LibraryItem; isLocked: boolean; onNavigate: () => void;
}) {
  const accent = TYPE_ACCENT[item.kind];
  const desc   = item.descriptionShort;
  const rowVars = { '--accent': accent, '--cover-bg': COVER_BG[item.kind] } as CSSProperties;

  return (
    <div
      className={[
        'flex gap-3 px-3 py-3 md:gap-5 md:px-6 md:py-5 cursor-pointer transition-colors border-b border-border hover:bg-surface-muted',
        isLocked ? 'opacity-65' : 'opacity-100',
      ].join(' ')}
      style={rowVars}
      onClick={onNavigate}
    >
      <div className={[
        'flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center w-16 h-[88px] text-[36px] md:w-24 md:h-[130px] md:text-[52px] shadow-card-md bg-[image:var(--cover-bg)]',
        isLocked && 'grayscale-50',
      ].filter(Boolean).join(' ')}>
        {item.iconEmoji}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <p className="font-black leading-snug text-[15px] md:text-lg text-ink -tracking-[0.02em]">
          {item.title}
          <span className="font-medium text-[13px] md:text-[15px] text-ink-muted"> — {item.subtitle}</span>
        </p>
        <p className="font-medium mt-0.5 text-[11.5px] md:text-[13px] text-ink-faint">{item.titleUa}</p>

        {desc && (
          <p className="font-medium leading-snug md:leading-relaxed mt-1 md:mt-2 text-[12px] md:text-[13.5px] text-ink line-clamp-2 md:line-clamp-3">
            {desc}
          </p>
        )}

        <div className="flex items-center gap-1.5 md:gap-2 mt-auto pt-2 md:pt-3 flex-wrap">
          <span className="rounded-md px-2 py-0.5 font-bold text-[10.5px] md:text-[11.5px] bg-[color:var(--accent)]/10 text-[color:var(--accent)] border border-[color:var(--accent)]/25">
            {TYPE_LABEL[item.kind]}
          </span>
          <span className="rounded-md px-2 py-0.5 font-bold text-[10.5px] md:text-[11.5px] bg-surface-muted text-ink border border-border">
            {item.level}
          </span>
          {isLocked && <span className="text-sm">🔒</span>}
        </div>
      </div>
    </div>
  );
}

function LibraryCatalog() {
  const router = useRouter();
  const { level: kidsLevel } = useKidsIdentity();
  const { items, loading } = useLibrary();
  const [libTab, setLibTab] = useState<LibTabId>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visible = items.filter(i => libTab === 'all' || i.kind === libTab);
  const counts: Record<LibTabId, number> = {
    all:    items.length,
    book:   items.filter(i => i.kind === 'book').length,
    course: items.filter(i => i.kind === 'course').length,
    video:  items.filter(i => i.kind === 'video').length,
    game:   items.filter(i => i.kind === 'game').length,
  };

  const grouped: { header: string; items: LibraryItem[] }[] =
    libTab === 'all'
      ? (['book', 'course', 'video', 'game'] as LibKind[])
          .map(t => ({ header: TYPE_SECTION[t], items: visible.filter(i => i.kind === t) }))
          .filter(g => g.items.length > 0)
      : [{ header: '', items: visible }];

  const activeCat = LIB_CATEGORIES.find(c => c.id === libTab) ?? LIB_CATEGORIES[0];

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
        {LIB_CATEGORIES.map(cat => {
          const isActive = libTab === cat.id;
          return (
            <button key={cat.id} onClick={() => setLibTab(cat.id)}
              className={[
                'flex items-center justify-between px-5 py-2.5 text-left transition-colors border-l-[3px]',
                isActive ? 'bg-surface-muted border-primary' : 'bg-transparent border-transparent',
              ].join(' ')}>
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
                {LIB_CATEGORIES.map(cat => {
                  const isActive = libTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setLibTab(cat.id); setDrawerOpen(false); }}
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

      <div className="flex-1 min-w-0 overflow-y-auto pb-28 bg-surface-raised">
        {loading ? (
          <div className="py-10 px-4"><LoadingState shape="list" rows={5} /></div>
        ) : grouped.length === 0 ? (
          <div className="py-10 px-4">
            <EmptyState
              title="Матеріали ще не додано"
              description="Скоро тут зʼявляться книжки, курси, відео та ігри."
            />
          </div>
        ) : (
          grouped.map((group, gi) => (
            <div key={gi}>
              {libTab === 'all' && (
                <div className="px-6 pt-6 pb-3 border-b border-border">
                  <p className="font-black text-xs text-ink-faint uppercase tracking-[0.08em]">
                    {group.header}
                  </p>
                </div>
              )}
              {group.items.map(item => (
                <LibListItem
                  key={item.slug}
                  item={item}
                  isLocked={!canAccessLevel(kidsLevel, item.level)}
                  onNavigate={() => router.push(`/kids/library/${item.slug}`)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SchoolPage() {
  const [tab, setTab] = useState<PageTab>('lessons');
  const [lessonView, setLessonView] = useState<LessonView>('carousel');
  const { level: kidsLevel } = useKidsIdentity();

  return (
    <div className="flex flex-col h-[100dvh] bg-surface-raised overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4 px-3 sm:px-4 border-b border-border pt-[env(safe-area-inset-top,8px)]">
        <div className="flex flex-shrink-0">
          {([
            { id: 'lessons', label: 'Уроки',      emoji: '📚' },
            { id: 'library', label: 'Бібліотека', emoji: '🎓' },
          ] as { id: PageTab; label: string; emoji: string }[]).map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={[
                  'flex items-center gap-1.5 sm:gap-2 py-3 px-1 mr-3 sm:mr-6 font-black transition-colors text-[13px] sm:text-sm border-b-[2.5px] -mb-px',
                  active ? 'text-ink border-primary' : 'text-ink-faint border-transparent',
                ].join(' ')}>
                <span className="text-[15px] sm:text-base">{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'lessons' && (
          <div className="ml-auto inline-flex rounded-full bg-surface-muted border border-border p-0.5 sm:p-1 flex-shrink-0">
            {([
              { id: 'carousel', label: 'Карусель' },
              { id: 'list',     label: 'Список' },
            ] as { id: LessonView; label: string }[]).map(v => {
              const active = lessonView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setLessonView(v.id)}
                  className={[
                    'px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-black text-[11px] sm:text-[12.5px] transition-colors',
                    active ? 'bg-primary text-white shadow-card-sm' : 'text-ink-muted',
                  ].join(' ')}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'lessons' ? (
          lessonView === 'carousel' ? (
            <div className="flex-1 min-h-0 w-full overflow-hidden pb-[calc(env(safe-area-inset-bottom,0px)+72px)]">
              <LessonCarouselSection level={kidsLevel} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-w-screen-md mx-auto w-full">
              <div className="px-4 py-6">
                <LessonTreeSection level={kidsLevel} />
              </div>
            </div>
          )
        ) : <LibraryCatalog />}
      </div>
    </div>
  );
}
