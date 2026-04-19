interface StatusPillProps {
  label: string;
  cls: string;
  dot?: string;
  className?: string;
}

export function StatusPill({ label, cls, dot, className = '' }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cls} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden />}
      {label}
    </span>
  );
}
