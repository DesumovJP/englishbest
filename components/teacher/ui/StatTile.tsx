interface StatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'primary' | 'danger' | 'accent' | 'success';
  className?: string;
}

const TONE_VALUE: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: 'text-ink',
  primary: 'text-primary-dark',
  danger:  'text-danger',
  accent:  'text-accent-dark',
  success: 'text-success-dark',
};

export function StatTile({
  label,
  value,
  hint,
  tone = 'default',
  className = '',
}: StatTileProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <p className={`type-h2 ${TONE_VALUE[tone]}`}>{value}</p>
      <p className="text-[11px] text-ink-muted font-medium mt-0.5">{label}</p>
      {hint && <p className="text-[10px] text-ink-faint mt-0.5">{hint}</p>}
    </div>
  );
}
