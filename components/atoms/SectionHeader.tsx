interface SectionHeaderProps {
  title: string;
  meta?: string | React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, meta, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">{title}</p>
      {meta != null && (
        <span className="text-xs font-bold text-ink-muted">{meta}</span>
      )}
    </div>
  );
}
