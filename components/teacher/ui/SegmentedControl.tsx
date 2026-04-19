'use client';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

const SIZE: Record<NonNullable<SegmentedControlProps<string>['size']>, string> = {
  sm: 'h-9 text-xs',
  md: 'h-10 text-sm',
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = 'sm',
  className = '',
  label,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`inline-flex items-center p-1 rounded-xl bg-surface-muted border border-border ${SIZE[size]} ${className}`}
    >
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 h-full px-3 rounded-lg font-bold transition-colors ${
              active
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
