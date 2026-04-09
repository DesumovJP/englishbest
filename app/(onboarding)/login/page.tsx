'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CompanionSVG from '@/components/kids/CompanionSVG';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const error = '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    router.push('/welcome');
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Ліва панель — персонажі ── */}
      <aside className="hidden lg:flex flex-col w-[460px] flex-shrink-0 relative overflow-hidden bg-gradient-to-b from-primary to-primary-dark">

        {/* Декоративні кола */}
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" aria-hidden />
        <div className="absolute top-32 -right-10 w-36 h-36 rounded-full bg-white/8 pointer-events-none" aria-hidden />
        <div className="absolute bottom-32 -left-10 w-28 h-28 rounded-full bg-white/8 pointer-events-none" aria-hidden />

        {/* Плаваючі бейджі */}
        <div className="absolute top-24 right-8 flex flex-col gap-3 pointer-events-none" aria-hidden>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-white font-black text-sm leading-none">14 днів</p>
              <p className="text-white/60 text-xs">серія</p>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-lg">⭐</span>
            <div>
              <p className="text-white font-black text-sm leading-none">2 450 XP</p>
              <p className="text-white/60 text-xs">цього тижня</p>
            </div>
          </div>
        </div>

        {/* Логотип */}
        <div className="relative z-10 px-10 pt-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-black text-white tracking-tight">
            English<span className="text-white/70">Best</span>
          </span>
        </div>

        {/* Мовна бульбашка */}
        <div className="relative z-10 mx-10 mt-10">
          <div className="bg-white rounded-3xl rounded-bl-sm px-5 py-4 shadow-lg inline-block max-w-[220px]">
            <p className="font-black text-ink text-base leading-snug">
              Ти не забув про мене? 👀
            </p>
            <p className="text-ink-muted text-sm mt-1">
              Твоя серія чекає!
            </p>
          </div>
          {/* Хвостик бульбашки */}
          <div
            className="absolute -bottom-3 left-8 w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '0px solid transparent',
              borderTop: '14px solid white',
            }}
            aria-hidden
          />
        </div>

        {/* Персонажі */}
        <div className="relative z-10 flex-1 flex items-end justify-center pb-0">
          <div className="relative flex items-end justify-center w-full">

            {/* Дракончик зліва (менший) */}
            <div className="absolute left-6 bottom-0 opacity-80" style={{ transform: 'scale(1.3) scaleX(-1)', transformOrigin: 'bottom center' }}>
              <CompanionSVG animal="dragon" mood="happy" />
            </div>

            {/* Лисиця по центру (головна) */}
            <div style={{ transform: 'scale(1.75)', transformOrigin: 'bottom center', marginBottom: 0 }}>
              <CompanionSVG animal="fox" mood="excited" />
            </div>

            {/* Кролик справа (менший) */}
            <div className="absolute right-6 bottom-0 opacity-80" style={{ transform: 'scale(1.3)', transformOrigin: 'bottom center' }}>
              <CompanionSVG animal="rabbit" mood="happy" />
            </div>
          </div>
        </div>

        {/* Зелена підлога */}
        <div className="h-10 bg-primary-dark w-full flex-shrink-0" />
      </aside>

      {/* ── Права панель — форма ── */}
      <main className="flex-1 flex items-center justify-center bg-surface-muted px-5 py-12 min-h-screen">
        <div className="w-full max-w-[380px]">

          {/* Мобільний логотип */}
          <Link href="/home" className="inline-flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-black text-ink">English<span className="text-primary">Best</span></span>
          </Link>

          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-ink tracking-tight">З поверненням!</h1>
            <p className="text-ink-muted text-sm mt-2">Твої персонажі вже чекають на тебе</p>
          </div>

          {/* Google-кнопка */}
          <button
            type="button"
            className="w-full h-14 rounded-2xl border-2 border-border bg-white flex items-center justify-center gap-3 font-bold text-ink text-sm hover:bg-surface-muted hover:border-primary/30 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Увійти через Google
          </button>

          {/* Або */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-ink-muted">або</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* Телефон */}
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-xs font-black text-ink-muted uppercase tracking-widest">
                Номер телефону
              </label>
              <div className="flex gap-2">
                <div className="flex items-center h-14 px-3.5 rounded-2xl border-2 border-border bg-white text-sm font-semibold text-ink whitespace-nowrap select-none">
                  🇺🇦 +38
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(0XX) XXX-XX-XX"
                  required
                  autoComplete="tel"
                  className="flex-1 h-14 px-4 rounded-2xl border-2 border-border bg-white text-sm text-ink font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-ink-muted"
                />
              </div>
            </div>

            {/* Пароль */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-black text-ink-muted uppercase tracking-widest">
                  Пароль
                </label>
                <Link href="#" className="text-xs text-primary font-bold hover:underline">
                  Забули пароль?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-14 pl-4 pr-12 rounded-2xl border-2 border-border bg-white text-sm text-ink font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-ink-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Приховати пароль' : 'Показати пароль'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                >
                  {showPw ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Помилка */}
            {error && (
              <div role="alert" className="flex items-center gap-2.5 text-xs text-danger font-semibold bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* 3D-кнопка Duolingo style */}
            <button
              type="submit"
              disabled={loading || !phone || !password}
              onMouseDown={e => { if (!e.currentTarget.disabled) e.currentTarget.style.cssText += 'transform:translateY(4px);box-shadow:0 2px 0 var(--color-primary-dark)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              className="relative w-full h-14 rounded-2xl font-black text-base text-white mt-2 bg-primary hover:brightness-105 transition-[filter] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 5px 0 var(--color-primary-dark)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Входимо…
                </span>
              ) : (
                'Увійти →'
              )}
            </button>
          </form>

          {/* Низ */}
          <p className="text-center text-sm text-ink-muted mt-8">
            Немає акаунту?{' '}
            <Link href="#" className="font-bold text-primary hover:underline">
              Зверніться до адміністратора
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
