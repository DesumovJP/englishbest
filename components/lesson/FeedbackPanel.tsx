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
    <div className={`rounded-2xl border-2 p-4 animate-slide-up ${tone.panel}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${tone.icon}`}>
          {isCorrect ? '🎉' : '💪'}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm leading-tight ${tone.text}`}>{message}</p>
          {hint && <p className="text-xs text-ink-muted mt-0.5">{hint}</p>}
        </div>

        <button
          onClick={onContinue}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-black text-sm text-white active:translate-y-1 active:shadow-none transition-transform ${tone.btn}`}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
