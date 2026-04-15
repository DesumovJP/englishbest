interface StepFrameProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StepFrame({ title, subtitle, children }: StepFrameProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-6 w-full max-w-xl mx-auto">
      {(title || subtitle) && (
        <div>
          {subtitle && <p className="type-label text-primary mb-1 text-[10px] sm:text-xs">{subtitle}</p>}
          {title && <h2 className="type-h2 text-ink text-lg sm:text-2xl leading-tight">{title}</h2>}
        </div>
      )}
      {children}
    </div>
  );
}
