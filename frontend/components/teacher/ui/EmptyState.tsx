interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  subtitle,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`py-12 px-6 text-center ${className}`}>
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {subtitle && <p className="text-[13px] text-ink-muted mt-1">{subtitle}</p>}
      {action && <div className="mt-4 flex items-center justify-center">{action}</div>}
    </div>
  );
}
