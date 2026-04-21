type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-border text-ink-muted',
  success: 'bg-success/15 text-success-dark',
  warning: 'bg-accent/15 text-accent-dark',
  danger:  'bg-danger/15 text-danger-dark',
  info:    'bg-secondary/15 text-secondary-dark',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
