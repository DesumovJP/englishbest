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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          /* ── Success state ── */
          <div className="glass-strong flex flex-col items-center gap-5 text-center px-8 py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl">🦉</div>
            <div>
              <h3 className="text-2xl font-black text-white">Дякуємо, {name}!</h3>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">
                {noCall
                  ? `Напишемо вам у ${messenger === 'telegram' ? 'Telegram' : 'Viber'} найближчим часом.`
                  : 'Зателефонуємо у зручний для вас час.'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="glass rounded-xl px-6 py-2.5 text-sm font-semibold text-white/70 hover:text-white transition-colors mt-1"
            >
              Закрити
            </button>
          </div>
        ) : (
          <>
            {/* ── Верхній зелений блок ── */}
            <div className="relative bg-gradient-to-br from-primary to-primary-dark px-7 pt-7 pb-6 overflow-hidden">
              {/* Декоративні кільця */}
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full border border-white/15" />
              <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 w-24 h-24 rounded-full border border-white/10" />
              <div aria-hidden className="pointer-events-none absolute -left-8 -bottom-8 w-32 h-32 rounded-full border border-white/10" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Спеціальна пропозиція</p>
                  <h3 className="text-[1.6rem] font-black text-white leading-tight tracking-tight">
                    Перший урок<br />безкоштовно
                  </h3>
                  <p className="text-white/65 text-sm mt-2.5 leading-relaxed max-w-[240px]">
                    Підберемо вчителя під вік і рівень. Без зобов&rsquo;язань.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Закрити"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5"
                >
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Нижній dark glass блок з формою ── */}
            <div className="glass-strong px-7 py-6 flex flex-col gap-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Ваше ім'я"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="glass-input h-11 px-4 rounded-xl text-sm font-medium w-full"
                />

                <input
                  type="tel"
                  placeholder="+380 XX XXX XX XX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required={!noCall}
                  autoComplete="tel"
                  disabled={noCall}
                  className="glass-input h-11 px-4 rounded-xl text-sm font-medium w-full disabled:opacity-30"
                />

                {/* Чекбокс */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={noCall}
                    onChange={e => { setNoCall(e.target.checked); setMessenger(''); }}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-white/45">Не телефонуйте — напишіть у месенджер</span>
                </label>

                {/* Месенджер */}
                {noCall && (
                  <div className="flex gap-2">
                    {(['viber', 'telegram'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMessenger(m)}
                        className={[
                          'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                          messenger === m
                            ? 'bg-primary/20 border border-primary/50 text-primary-light'
                            : 'glass-subtle border-transparent text-white/50 hover:text-white/80',
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
                  onMouseDown={e => { if (!e.currentTarget.disabled) e.currentTarget.style.cssText += 'transform:translateY(3px);box-shadow:0 1px 0 var(--color-primary-dark)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  className="h-12 bg-primary hover:brightness-110 disabled:opacity-35 disabled:cursor-not-allowed text-white font-black rounded-xl transition-[filter] mt-1"
                  style={{ boxShadow: '0 4px 0 var(--color-primary-dark)' }}
                >
                  Спробувати безкоштовно →
                </button>
              </form>

              <p className="text-xs text-white/25 text-center">
                Без зобов&rsquo;язань · Скасування в один клік
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
