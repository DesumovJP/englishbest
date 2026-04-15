'use client';
import { useEffect, useState } from 'react';

const SESSION_KEY = 'popup_dismissed';

export function PopupTimer() {
  const [open, setOpen]         = useState(false);
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [noCall, setNoCall]     = useState(false);
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
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[6px]"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[420px] rounded-3xl overflow-hidden bg-white shadow-[0_25px_60px_-12px_rgba(15,23,42,0.35)]"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-5 text-center px-8 py-12">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-5xl">🦉</div>
            <div>
              <h3 className="text-2xl font-black text-ink">Дякуємо, {name}!</h3>
              <p className="text-ink-muted text-sm mt-2 leading-relaxed">
                {noCall
                  ? `Напишемо вам у ${messenger === 'telegram' ? 'Telegram' : 'Viber'} найближчим часом.`
                  : 'Зателефонуємо у зручний для вас час.'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="h-11 px-6 rounded-2xl bg-surface-muted hover:bg-black/5 text-sm font-black text-ink transition-colors"
            >
              Закрити
            </button>
          </div>
        ) : (
          <>
            {/* ── Primary gradient header ── */}
            <div className="relative bg-gradient-to-br from-primary to-primary-dark px-7 pt-7 pb-7 overflow-hidden">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full border border-white/20" />
              <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 w-24 h-24 rounded-full border border-white/15" />
              <div aria-hidden className="pointer-events-none absolute -left-8 -bottom-10 w-32 h-32 rounded-full border border-white/10" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">🎁</div>
                  <div>
                    <p className="text-white/80 text-[11px] font-black uppercase tracking-widest mb-1.5">Спеціальна пропозиція</p>
                    <h3 className="text-[1.55rem] font-black text-white leading-tight tracking-tight">
                      Перший урок<br />безкоштовно
                    </h3>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Закрити"
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Form ── */}
            <div className="px-7 py-6 flex flex-col gap-4 bg-white">
              <p className="text-ink-muted text-sm leading-relaxed">
                Підберемо вчителя під вік і рівень. Без зобов&rsquo;язань.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Ваше ім'я"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-12 px-4 rounded-2xl text-sm font-medium w-full bg-surface-muted border border-transparent focus:border-primary focus:bg-white focus:outline-none placeholder:text-ink-muted/60 text-ink transition-colors"
                />

                <input
                  type="tel"
                  placeholder="+380 XX XXX XX XX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required={!noCall}
                  autoComplete="tel"
                  disabled={noCall}
                  className="h-12 px-4 rounded-2xl text-sm font-medium w-full bg-surface-muted border border-transparent focus:border-primary focus:bg-white focus:outline-none placeholder:text-ink-muted/60 text-ink transition-colors disabled:opacity-40"
                />

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={noCall}
                    onChange={e => { setNoCall(e.target.checked); setMessenger(''); }}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-ink-muted">Не телефонуйте — напишіть у месенджер</span>
                </label>

                {noCall && (
                  <div className="flex gap-2">
                    {(['viber', 'telegram'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMessenger(m)}
                        className={[
                          'flex-1 h-11 rounded-2xl text-sm font-black transition-all',
                          messenger === m
                            ? 'bg-primary/10 border-2 border-primary text-primary-dark'
                            : 'bg-surface-muted border-2 border-transparent text-ink-muted hover:bg-black/5',
                        ].join(' ')}
                      >
                        {m === 'viber' ? '💜 Viber' : '✈️ Telegram'}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!name || (!noCall ? !phone : !messenger)}
                  className="h-12 bg-primary text-white font-black rounded-2xl shadow-press-primary active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:translate-y-0 mt-1"
                >
                  Спробувати безкоштовно →
                </button>
              </form>

              <p className="text-[11px] text-ink-muted/70 text-center">
                Без зобов&rsquo;язань · Скасування в один клік
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
