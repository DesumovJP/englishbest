type ProgressBarSize = 'xs' | 'sm' | 'md';
type ProgressBarColor = 'primary' | 'success' | 'accent' | 'secondary' | 'danger';

const SIZE_H: Record<ProgressBarSize, string> = {
  xs: 'h-2',
  sm: 'h-3',
  md: 'h-4',
};

const FILL_COLOR: Record<ProgressBarColor, string> = {
  primary:   'bg-primary',
  success:   'bg-success',
  accent:    'bg-accent',
  secondary: 'bg-secondary',
  danger:    'bg-danger',
};

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  size?: ProgressBarSize;
  color?: ProgressBarColor;
  /** track background class */
  track?: string;
  className?: string;
  label?: string;
}

export function ProgressBar({
  value,
  size = 'sm',
  color = 'primary',
  track = 'bg-border',
  className = '',
  label,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`w-full ${SIZE_H[size]} ${track} rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`h-full ${FILL_COLOR[color]} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
