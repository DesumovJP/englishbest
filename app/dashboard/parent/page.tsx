export default function ParentPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl" aria-hidden>
          🛠️
        </div>
        <h1 className="type-h1 text-ink">В розробці</h1>
        <p className="text-sm text-ink-muted max-w-sm">
          Батьківський кабінет незабаром буде доступним.
        </p>
      </div>
    </div>
  );
}
