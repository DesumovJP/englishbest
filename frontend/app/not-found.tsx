import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-display font-black text-ink-faint leading-none">404</p>
        <h1 className="text-h2 font-black text-ink mt-2 mb-2">Сторінку не знайдено</h1>
        <p className="text-ink-muted mb-6">
          Перевірте URL або поверніться на головну.
        </p>
        <Link href="/" className="ios-btn ios-btn-primary inline-flex">
          На головну
        </Link>
      </div>
    </div>
  );
}
