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
      <div className="flex-shrink-0">
        <p className="type-label text-primary mb-1 sm:mb-2 text-[10px] sm:text-xs">Новий матеріал</p>
        <h2 className="type-h2 text-ink text-lg sm:text-2xl leading-tight">{step.title}</h2>
        <p className="text-ink-muted mt-1 sm:mt-2 text-[13px] sm:text-base leading-snug sm:leading-relaxed">{step.body}</p>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden flex-1 min-h-0 sm:flex-none flex flex-col">
        <div className="hidden sm:block px-5 py-3 border-b border-border bg-surface-muted flex-shrink-0">
          <p className="type-label text-ink-muted">Нові слова</p>
        </div>
        <ul className="divide-y divide-border overflow-y-auto sm:overflow-visible">
          {step.examples.map((ex, i) => {
            const emoji = getEmoji(ex.en);
            return (
              <li key={i} className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 hover:bg-surface-muted/50 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {emoji && (
                    <span className="text-lg sm:text-2xl w-6 sm:w-8 text-center flex-shrink-0" role="img" aria-hidden>
                      {emoji}
                    </span>
                  )}
                  <span className="font-black text-ink text-sm sm:text-base truncate">{ex.en}</span>
                </div>
                <span className="text-ink-muted text-xs sm:text-sm truncate ml-2">{ex.ua}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {step.tip && (
        <div className="hidden sm:block bg-accent/8 border border-accent/20 rounded-2xl px-5 py-4">
          <p className="text-sm text-accent-dark">{step.tip}</p>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full py-3 sm:py-4 rounded-2xl bg-primary text-white font-black text-sm sm:text-base shadow-press-primary active:translate-y-1 active:shadow-none transition-transform flex-shrink-0"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        Зрозуміло, далі →
      </button>
    </StepFrame>
  );
}
