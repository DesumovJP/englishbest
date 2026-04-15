import type { StepTheory } from '@/mocks/lessons/types';
import { getEmoji } from '@/lib/emojiMap';
import { StepFrame } from './StepFrame';

interface Props {
  step: StepTheory;
  onContinue: () => void;
}

export function StepTheory({ step, onContinue }: Props) {
  return (
    <StepFrame>
      <div>
        <p className="type-label text-primary mb-1 sm:mb-2 text-[10px] sm:text-xs">Новий матеріал</p>
        <h2 className="type-h2 text-ink text-xl sm:text-2xl leading-tight">{step.title}</h2>
        <p className="text-ink-muted mt-1.5 sm:mt-2 text-sm sm:text-base leading-relaxed">{step.body}</p>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-4 sm:px-5 py-2 sm:py-3 border-b border-border bg-surface-muted">
          <p className="type-label text-ink-muted text-[10px] sm:text-xs">Нові слова</p>
        </div>
        <ul className="divide-y divide-border">
          {step.examples.map((ex, i) => {
            const emoji = getEmoji(ex.en);
            return (
              <li key={i} className="flex items-center justify-between px-4 sm:px-5 py-2 sm:py-3 hover:bg-surface-muted/50 transition-colors">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {emoji && (
                    <span className="text-xl sm:text-2xl w-7 sm:w-8 text-center flex-shrink-0" role="img" aria-hidden>
                      {emoji}
                    </span>
                  )}
                  <span className="font-black text-ink text-sm sm:text-base">{ex.en}</span>
                </div>
                <span className="text-ink-muted text-xs sm:text-sm">{ex.ua}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {step.tip && (
        <div className="bg-accent/8 border border-accent/20 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-4">
          <p className="text-xs sm:text-sm text-accent-dark">{step.tip}</p>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full py-3 sm:py-4 rounded-2xl bg-primary text-white font-black text-sm sm:text-base shadow-press-primary active:translate-y-1 active:shadow-none transition-transform"
      >
        Зрозуміло, далі →
      </button>
    </StepFrame>
  );
}
