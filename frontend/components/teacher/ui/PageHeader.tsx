interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 pb-5 mb-5 border-b border-border ${className}`}>
      <div className="min-w-0">
        <h1 className="text-[22px] md:text-[26px] font-semibold text-ink tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}
