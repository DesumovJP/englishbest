export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center" aria-busy="true" aria-live="polite">
      <div className="w-10 h-10 rounded-full border-[3px] border-border border-t-primary animate-spin" />
      <span className="sr-only">Завантаження…</span>
    </div>
  );
}
