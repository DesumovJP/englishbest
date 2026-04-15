type OptionState = 'idle' | 'selected-correct' | 'selected-wrong' | 'reveal-correct' | 'disabled';

interface OptionButtonProps {
  label: string;
  state: OptionState;
  onClick?: () => void;
  leading?: React.ReactNode;
  disabled?: boolean;
}

const STATE_CLASSES: Record<OptionState, string> = {
  'idle':              'border-border bg-white text-ink hover:border-primary/40 hover:bg-primary/5',
  'selected-correct':  'border-success/60 bg-success/10 text-success-dark',
  'selected-wrong':    'border-danger/60  bg-danger/10  text-danger-dark',
  'reveal-correct':    'border-success/60 bg-success/10 text-success-dark',
  'disabled':          'border-border bg-white text-ink opacity-60',
};

export function OptionButton({ label, state, onClick, leading, disabled }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-base transition-all disabled:cursor-default ${STATE_CLASSES[state]}`}
    >
      <span className="inline-flex items-center gap-3">
        {leading && (
          <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">
            {leading}
          </span>
        )}
        {label}
      </span>
    </button>
  );
}

export type { OptionState };
