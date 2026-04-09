'use client';
import { useState } from 'react';

const LANGUAGES = [
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

export function LanguageSwitcher() {
  const [current, setCurrent] = useState(LANGUAGES[0]);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink transition-colors px-2 py-1.5 rounded-lg hover:bg-surface-muted"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:block">{current.code.toUpperCase()}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          {/* overlay to close on outside click */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />

          <ul
            role="listbox"
            aria-label="Мова"
            className="absolute right-0 top-full mt-2 z-20 bg-white border border-border rounded-2xl shadow-lg overflow-hidden w-44 py-1"
          >
            {LANGUAGES.map(lang => (
              <li key={lang.code} role="option" aria-selected={lang.code === current.code}>
                <button
                  onClick={() => { setCurrent(lang); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    lang.code === current.code
                      ? 'bg-primary/10 text-primary-dark font-bold'
                      : 'text-ink hover:bg-surface-muted'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
