interface StepFrameProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StepFrame({ title, subtitle, children }: StepFrameProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {(title || subtitle) && (
        <div>
          {subtitle && <p className="type-label text-primary mb-1">{subtitle}</p>}
          {title && <h2 className="type-h2 text-ink">{title}</h2>}
        </div>
      )}
      {children}
    </div>
  );
}
