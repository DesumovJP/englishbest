'use client';

interface FeedbackPanelProps {
  state: 'correct' | 'wrong';
  message: string;
  hint?: string;
  continueLabel: string;
  onContinue: () => void;
}

export function FeedbackPanel({ state, message, hint, continueLabel, onContinue }: FeedbackPanelProps) {
  const isCorrect = state === 'correct';
  const tone = isCorrect
    ? { panel: 'bg-success/10 border-success/30', icon: 'bg-success/20', text: 'text-success-dark', btn: 'bg-success shadow-press-success' }
    : { panel: 'bg-danger/10 border-danger/30',   icon: 'bg-danger/20',  text: 'text-danger-dark',  btn: 'bg-danger  shadow-press-danger' };

  return (
    <div className={`rounded-2xl border-2 p-3 sm:p-4 animate-slide-up ${tone.panel}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg sm:text-xl ${tone.icon}`}>
            {isCorrect ? '🎉' : '💪'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-black text-sm leading-tight ${tone.text}`}>{message}</p>
            {hint && <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5">{hint}</p>}
          </div>
        </div>

        <button
          onClick={onContinue}
          className={`w-full sm:w-auto flex-shrink-0 px-5 py-3 sm:py-2.5 rounded-xl font-black text-sm text-white active:translate-y-1 active:shadow-none transition-transform ${tone.btn}`}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
