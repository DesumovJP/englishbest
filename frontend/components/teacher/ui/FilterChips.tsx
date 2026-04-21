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
    <div
      role="tablist"
      className={`flex items-center gap-4 border-b border-border -mx-1 px-1 overflow-x-auto ${className}`}
    >
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`relative py-2.5 text-[13px] transition-colors whitespace-nowrap ${
              active
                ? 'text-ink font-semibold'
                : 'text-ink-muted hover:text-ink font-medium'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {opt.label}
              {opt.count !== undefined && (
                <span className={`text-[11px] tabular-nums ${active ? 'text-ink-muted' : 'text-ink-faint'}`}>
                  {opt.count}
                </span>
              )}
            </span>
            {active && (
              <span
                className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
