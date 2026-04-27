'use client';
import { useState } from 'react';
import { useKidsIdentity } from '@/lib/use-kids-identity';
import { LessonTreeSection } from '@/components/kids/LessonTreeSection';
import { LessonCarouselSection } from '@/components/kids/LessonCarouselSection';
import { VocabularySection } from '@/components/kids/VocabularySection';

type PageTab = 'lessons' | 'vocab';
type LessonView = 'carousel' | 'list';

export default function SchoolPage() {
  const [tab, setTab] = useState<PageTab>('lessons');
  const [lessonView, setLessonView] = useState<LessonView>('carousel');
  const { level: kidsLevel } = useKidsIdentity();

  return (
    <div className="flex flex-col h-[100dvh] bg-surface-raised overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4 px-3 sm:px-4 border-b border-border pt-[env(safe-area-inset-top,8px)]">
        <div className="flex flex-shrink-0">
          {([
            { id: 'lessons', label: 'Уроки', emoji: '📚' },
            { id: 'vocab',   label: 'Слова', emoji: '🔤' },
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
        ) : (
          <div className="flex-1 overflow-y-auto max-w-screen-md mx-auto w-full pb-[calc(env(safe-area-inset-bottom,0px)+72px)]">
            <VocabularySection level={kidsLevel} />
          </div>
        )}
      </div>
    </div>
  );
}
