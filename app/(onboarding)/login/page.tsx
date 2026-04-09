'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

      {/* ── Ліва панель — маркетинг ── */}
      <aside className="hidden lg:flex flex-col justify-between w-[460px] flex-shrink-0 bg-ink px-10 py-12 relative overflow-hidden">

        {/* Декоративне тло */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          {/* Великий фоновий текст */}
          <span className="absolute -bottom-6 -left-4 text-[200px] font-black text-white/[0.03] leading-none tracking-tighter">
            EN
          </span>
          {/* Кола */}
          <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 -left-20 w-48 h-48 rounded-full bg-primary/8 blur-2xl" />
        </div>

        {/* Логотип */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            English<span className="text-primary">Best</span>
          </span>
        </div>

        {/* Центральний блок */}
        <div className="relative flex flex-col gap-10">

          {/* Головна статистика */}
          <div>
            <p className="text-[72px] font-black text-white leading-none tracking-tight">
              1 200
              <span className="text-primary">+</span>
            </p>
            <p className="text-white/50 text-base mt-2 font-medium">
              учнів у 5 країнах вже з нами
            </p>
            {/* Аватарки */}
            <div className="flex items-center gap-3 mt-5">
              <div className="flex">
                {[
                  { id: 12, g: 'women' },
                  { id: 44, g: 'women' },
                  { id: 32, g: 'men' },
                  { id: 65, g: 'women' },
                  { id: 23, g: 'women' },
                ].map((a, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={a.id}
                    src={`https://randomuser.me/api/portraits/${a.g}/${a.id}.jpg`}
                    alt=""
                    aria-hidden
                    className={`w-8 h-8 rounded-full border-2 border-ink object-cover${i > 0 ? ' -ml-2' : ''}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="text-accent text-xs">★</span>
                ))}
                <span className="text-white/50 text-xs ml-1">4.9</span>
              </div>
            </div>
          </div>

          {/* Шлях рівнів */}
          <div>
            <p className="text-xs font-black text-white/30 uppercase tracking-widest mb-4">
              Всі рівні в одній школі
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { level: 'A0', label: 'Стартер',    color: 'bg-danger/20 text-danger border-danger/30' },
                { level: 'A1', label: 'Базовий',    color: 'bg-accent/20 text-accent border-accent/30' },
                { level: 'A2', label: 'Передній',   color: 'bg-accent/20 text-accent border-accent/30' },
                { level: 'B1', label: 'Середній',   color: 'bg-success/20 text-success border-success/30' },
                { level: 'B2', label: 'Впевнений',  color: 'bg-primary/30 text-primary border-primary/40' },
              ].map((l, i) => (
                <div key={l.level} className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${l.color}`}>
                    {l.level}
                  </span>
                  {i < 4 && <span className="text-white/20 text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Відгук */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <span key={s} className="text-accent text-sm">★</span>)}
            </div>
            <p className="text-white/70 text-sm leading-relaxed italic">
              &ldquo;Микола вже рік займається з Maria S. Здав шкільний тест на 94 бали.
              Головне — він перестав боятись говорити англійською.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://randomuser.me/api/portraits/men/22.jpg"
                alt=""
                aria-hidden
                className="w-8 h-8 rounded-full object-cover border border-white/20"
              />
              <div>
                <p className="text-white text-xs font-bold">Дмитро Бондаренко</p>
                <p className="text-white/40 text-xs">тато Миколи, 10 років</p>
              </div>
            </div>
          </div>
        </div>

        {/* Футер */}
        <p className="relative text-white/20 text-xs">© 2026 EnglishBest</p>
      </aside>

      {/* ── Права панель — форма ── */}
      <main className="flex-1 flex items-center justify-center bg-surface-muted px-5 py-12">
        <div className="w-full max-w-[360px]">

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
            <h1 className="text-3xl font-black text-ink tracking-tight">З поверненням</h1>
            <p className="text-ink-muted text-sm mt-2">Введіть дані для входу в особистий кабінет</p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

            {/* Телефон */}
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-xs font-black text-ink-muted uppercase tracking-widest">
                Номер телефону
              </label>
              <div className="flex gap-2">
                <div className="flex items-center h-14 px-3.5 rounded-2xl border border-border bg-white text-sm font-semibold text-ink-muted whitespace-nowrap select-none">
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
                  className="flex-1 h-14 px-4 rounded-2xl border border-border bg-white text-sm text-ink font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-ink-muted"
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
                  className="w-full h-14 pl-4 pr-12 rounded-2xl border border-border bg-white text-sm text-ink font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-ink-muted"
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

            {/* Кнопка з 3D press-ефектом */}
            <button
              type="submit"
              disabled={loading || !phone || !password}
              className="
                relative w-full h-14 rounded-2xl font-black text-base text-white mt-2
                bg-primary
                shadow-[0_5px_0_theme(colors.primary-dark)]
                transition-all duration-100
                hover:brightness-105
                active:translate-y-[3px] active:shadow-[0_2px_0_theme(colors.primary-dark)]
                disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-[0_5px_0_theme(colors.primary-dark)]
              "
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

          {/* Низ форми */}
          <div className="mt-8 text-center">
            <p className="text-sm text-ink-muted">
              Немає акаунту?{' '}
              <Link href="#" className="font-bold text-primary hover:underline">
                Зверніться до адміністратора
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
