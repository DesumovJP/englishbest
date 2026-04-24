import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("py-12 px-6 text-center flex flex-col items-center gap-3", className)}>
      {icon && <div className="text-ink-faint text-3xl" aria-hidden>{icon}</div>}
      <p className="type-h3 text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
