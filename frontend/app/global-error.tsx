'use client';

import { useEffect } from 'react';

// Global error boundary runs BEFORE the root layout, so Tailwind/globals.css are
// not applied. All styling here is intentionally inline-hex and not tokenized.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/global-error.tsx]', error);
  }, [error]);

  return (
    <html lang="uk">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Критична помилка</h1>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>
              Додаток не зміг завантажитись. Спробуйте оновити сторінку.
            </p>
            <button
              onClick={reset}
              style={{ padding: '10px 18px', borderRadius: 12, border: 0, background: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
            >
              Оновити
            </button>
            {error.digest && (
              <p style={{ marginTop: 16, fontSize: 11, color: '#afafaf', fontFamily: 'monospace' }}>
                ref: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
