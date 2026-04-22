'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error.tsx]', error);
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-xl border border-border bg-surface p-8 text-center">
        <h1 className="text-h2 font-black text-ink mb-2">Щось пішло не так</h1>
        <p className="text-ink-muted mb-6">
          Виникла неочікувана помилка. Спробуйте оновити сторінку або повторити дію.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="ios-btn ios-btn-primary">
            Спробувати знову
          </button>
          <Link href="/" className="ios-btn ios-btn-ghost">
            На головну
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 text-tiny text-ink-faint font-mono">ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
