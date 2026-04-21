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

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className = '',
  label,
}: SegmentedControlProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={`ios-seg ${className}`}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`ios-seg-btn ${active ? 'active' : ''}`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
