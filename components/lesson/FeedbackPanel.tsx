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

  return (
    <div className={`rounded-2xl border-2 p-4 animate-slide-up ${
      isCorrect
        ? 'bg-success/8 border-success/30'
        : 'bg-danger/8 border-danger/30'
    }`}>
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
          isCorrect ? 'bg-success/15' : 'bg-danger/15'
        }`}>
          {isCorrect ? '🎉' : '💪'}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm leading-tight ${isCorrect ? 'text-success-dark' : 'text-danger-dark'}`}>
            {message}
          </p>
          {hint && (
            <p className="text-xs text-ink-muted mt-0.5">{hint}</p>
          )}
        </div>

        {/* Button */}
        <button
          onClick={onContinue}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-black text-sm transition-opacity hover:opacity-90 ${
            isCorrect
              ? 'bg-success text-white'
              : 'bg-danger text-white'
          }`}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
