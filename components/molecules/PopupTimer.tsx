'use client';
import { useEffect, useState } from 'react';

const SESSION_KEY = 'popup_dismissed';

export function PopupTimer() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [noCall, setNoCall] = useState(false);
  const [messenger, setMessenger] = useState<'viber' | 'telegram' | ''>('');
  const [submitted, setSubmitted] = useState(false);

  function handleClose() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setOpen(false);
  }

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => setOpen(true), 25000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl p-7 max-w-sm w-full flex flex-col gap-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="text-6xl">🦉</div>
            <h3 className="text-2xl font-black text-ink">Дякуємо, {name}!</h3>
            <p className="text-ink-muted text-sm">
              {noCall
                ? `Напишемо вам у ${messenger === 'telegram' ? 'Telegram' : 'Viber'} найближчим часом.`
                : 'Зателефонуємо у зручний для вас час.'}
            </p>
            <button
              onClick={handleClose}
              className="mt-2 border-2 border-border text-ink-muted font-semibold px-6 py-2.5 rounded-xl hover:bg-surface-muted transition-colors text-sm"
            >
              Закрити
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-ink text-xl leading-snug">
                  Перший урок — безкоштовно 🎁
                </h3>
                <p className="text-ink-muted text-sm mt-1.5">
                  Залиште контакти і ми підберемо вчителя під рівень вашої дитини
                </p>
              </div>
              <button
                onClick={handleClose}
                aria-label="Закрити"
                className="text-ink-muted hover:text-ink flex-shrink-0 mt-0.5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ваше ім'я"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-12 px-4 rounded-xl border-2 border-border text-ink font-medium focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="tel"
                placeholder="+380 XX XXX XX XX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required={!noCall}
                autoComplete="tel"
                className="h-12 px-4 rounded-xl border-2 border-border text-ink font-medium focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                disabled={noCall}
              />

              {/* "Не телефонуйте" чекбокс */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={noCall}
                  onChange={e => { setNoCall(e.target.checked); setMessenger(''); }}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm text-ink-muted">Не телефонуйте мені</span>
              </label>

              {/* Вибір месенджера */}
              {noCall && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-black text-ink-muted uppercase tracking-wide">Напишіть у месенджер:</p>
                  <div className="flex gap-2">
                    {(['viber', 'telegram'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMessenger(m)}
                        className={[
                          'flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all',
                          messenger === m
                            ? 'border-primary bg-primary/8 text-primary'
                            : 'border-border text-ink-muted hover:border-primary/40',
                        ].join(' ')}
                      >
                        {m === 'viber' ? '💜 Viber' : '✈️ Telegram'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!name || (!noCall ? !phone : !messenger)}
                className="h-12 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl transition-colors mt-1"
              >
                Спробувати безкоштовно →
              </button>
              <p className="text-xs text-ink-muted text-center">
                Без зобов&rsquo;язань · Скасування в один клік
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
