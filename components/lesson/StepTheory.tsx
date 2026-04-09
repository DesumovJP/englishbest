import type { StepTheory } from '@/mocks/lessons/types';
import { getEmoji } from '@/lib/emojiMap';

interface Props {
  step: StepTheory;
  onContinue: () => void;
}

export function StepTheory({ step, onContinue }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">

      {/* Персонаж + заголовок */}
      <div className="flex items-end gap-4">
        {/* Міні-сова inline для теорії */}
        <div className="flex-shrink-0 hidden sm:block">
          <svg width="72" height="88" viewBox="0 0 100 120" className="drop-shadow-lg">
            <ellipse cx="50" cy="117" rx="28" ry="5" fill="#000" opacity="0.10"/>
            <ellipse cx="50" cy="85" rx="34" ry="36" fill="#16a34a"/>
            <ellipse cx="50" cy="92" rx="22" ry="26" fill="#dcfce7"/>
            <circle cx="50" cy="44" r="32" fill="#16a34a"/>
            <polygon points="24,20 18,4 32,16" fill="#15803d"/>
            <polygon points="76,20 82,4 68,16" fill="#15803d"/>
            <circle cx="37" cy="42" r="14" fill="white"/>
            <circle cx="63" cy="42" r="14" fill="white"/>
            <circle cx="37" cy="42" r="9" fill="#1e3a5f"/>
            <circle cx="63" cy="42" r="9" fill="#1e3a5f"/>
            <circle cx="40" cy="39" r="3.5" fill="white"/>
            <circle cx="66" cy="39" r="3.5" fill="white"/>
            <polygon points="50,52 44,60 56,60" fill="#fbbf24"/>
            <ellipse cx="17" cy="84" rx="13" ry="24" fill="#15803d" transform="rotate(12 17 84)"/>
            <ellipse cx="83" cy="84" rx="13" ry="24" fill="#15803d" transform="rotate(-12 83 84)"/>
            <ellipse cx="40" cy="118" rx="11" ry="5" fill="#fbbf24"/>
            <ellipse cx="60" cy="118" rx="11" ry="5" fill="#fbbf24"/>
          </svg>
        </div>
        {/* Бульбашка + заголовок */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl rounded-bl-sm border-2 border-border px-4 py-3 mb-2 shadow-sm">
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-0.5">Новий матеріал</p>
            <p className="text-sm text-ink-muted">Вивчи нові слова, а потім виконай вправи!</p>
          </div>
          <h2 className="text-2xl font-black text-ink">{step.title}</h2>
          <p className="text-ink-muted mt-1 leading-relaxed">{step.body}</p>
        </div>
      </div>

      {/* Таблиця слів з емодзі */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-surface-muted">
          <p className="text-xs font-black text-ink-muted uppercase tracking-wide">Нові слова</p>
        </div>
        <ul className="divide-y divide-border">
          {step.examples.map((ex, i) => {
            const emoji = getEmoji(ex.en);
            return (
              <li key={i} className="flex items-center justify-between px-5 py-3 hover:bg-surface-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {emoji && (
                    <span className="text-2xl w-8 text-center flex-shrink-0" role="img" aria-hidden>
                      {emoji}
                    </span>
                  )}
                  <span className="font-black text-ink text-base">{ex.en}</span>
                </div>
                <span className="text-ink-muted text-sm">{ex.ua}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Підказка */}
      {step.tip && (
        <div className="bg-accent/8 border border-accent/20 rounded-2xl px-5 py-4">
          <p className="text-sm text-accent-dark">{step.tip}</p>
        </div>
      )}

      <button
        onClick={onContinue}
        className="w-full py-4 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white font-black text-base hover:opacity-90 transition-opacity"
      >
        Зрозуміло, далі →
      </button>
    </div>
  );
}
