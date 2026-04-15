'use client';
import type { StepTheory } from '@/mocks/lessons/types';
import { getEmoji } from '@/lib/emojiMap';
import CharacterAvatar from '@/components/kids/CharacterAvatar';
import { useKidsState } from '@/lib/use-kids-store';
import type { CharacterEmotion } from '@/lib/characters';
import { SpeechBubble } from '@/components/kids/ui';

interface Props {
  step: StepTheory;
  onContinue: () => void;
  characterEmotion?: CharacterEmotion;
  characterBubble?: string;
}

export function StepTheoryMobile({ step, onContinue, characterEmotion = 'idle', characterBubble }: Props) {
  const { state } = useKidsState();
  const characterId = state.activeCharacterId || 'fox';

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Character strip — reserved space, thumb-free zone at top */}
      <div className="flex-shrink-0 flex items-end justify-center gap-2 px-4 pt-2 pb-1 h-[92px] relative">
        {characterBubble && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[78px]">
            <SpeechBubble text={characterBubble} maxWidth={200} size="sm" />
          </div>
        )}
        <CharacterAvatar characterId={characterId} emotion={characterEmotion} size={84} animate />
      </div>

      {/* Content block — centered between character and CTA */}
      <div className="flex-1 min-h-0 flex flex-col justify-center px-4 gap-2.5">
        <div className="flex-shrink-0">
          <p className="type-label text-primary text-[10px]">Новий матеріал</p>
          <h2 className="font-black text-ink text-[18px] leading-tight mt-0.5">{step.title}</h2>
          <p className="text-ink-muted text-[12px] leading-snug mt-1 line-clamp-3">{step.body}</p>
        </div>

        <ul className="min-h-0 overflow-y-auto overscroll-contain bg-white rounded-2xl border border-border divide-y divide-border">
          {step.examples.map((ex, i) => {
            const emoji = getEmoji(ex.en);
            return (
              <li key={i} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  {emoji && (
                    <span className="text-lg w-6 text-center flex-shrink-0" role="img" aria-hidden>{emoji}</span>
                  )}
                  <span className="font-black text-ink text-[13px] truncate">{ex.en}</span>
                </div>
                <span className="text-ink-muted text-[11px] truncate ml-2">{ex.ua}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className="flex-shrink-0 px-4 pt-2 pb-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base shadow-press-primary active:translate-y-1 active:shadow-none transition-transform"
        >
          Зрозуміло, далі →
        </button>
      </div>
    </div>
  );
}
