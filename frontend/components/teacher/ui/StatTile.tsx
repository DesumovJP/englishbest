interface StatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'primary' | 'danger' | 'accent' | 'success';
  className?: string;
}

export function StatTile({
  label,
  value,
  hint,
  className = '',
}: StatTileProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <p className="text-[11px] text-ink-muted font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-ink mt-1.5 leading-none tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-ink-faint mt-1">{hint}</p>}
    </div>
  );
}
