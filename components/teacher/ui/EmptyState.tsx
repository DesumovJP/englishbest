interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  emoji = '📭',
  title,
  subtitle,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`py-12 px-6 text-center text-ink-muted ${className}`}>
      <p className="text-3xl mb-2" aria-hidden>{emoji}</p>
      <p className="font-semibold text-sm text-ink">{title}</p>
      {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
      {action && <div className="mt-4 flex items-center justify-center">{action}</div>}
    </div>
  );
}
