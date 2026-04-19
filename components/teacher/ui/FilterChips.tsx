'use client';

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: ReadonlyArray<FilterChipOption<T>>;
  className?: string;
}

export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  className = '',
}: FilterChipsProps<T>) {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              active
                ? 'border-primary bg-primary/10 text-primary-dark'
                : 'border-border text-ink-muted hover:border-primary/40 hover:text-ink bg-white'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`ml-1 ${active ? 'text-primary-dark' : 'text-ink-faint'}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
