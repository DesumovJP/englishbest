'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { apiErrorMessage } from '@/lib/fetcher';

type DemoRole = 'kids' | 'teacher' | 'parent';

interface DemoAccount {
  role: DemoRole;
  label: string;
  sublabel: string;
  email: string;
  password: string;
  tone: 'primary' | 'secondary' | 'purple';
  initials: string;
}

const DEMO_PASSWORD = 'Demo2026!';

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'kids',
    label: 'Student',
    sublabel: 'Учень',
    email: 'demo-kids@englishbest.app',
    password: DEMO_PASSWORD,
    tone: 'primary',
    initials: 'ST',
  },
  {
    role: 'teacher',
    label: 'Teacher',
    sublabel: 'Вчитель',
    email: 'demo-teacher@englishbest.app',
    password: DEMO_PASSWORD,
    tone: 'secondary',
    initials: 'TE',
  },
  {
    role: 'parent',
    label: 'Parent',
    sublabel: 'Батьки',
    email: 'demo-parent@englishbest.app',
    password: DEMO_PASSWORD,
    tone: 'purple',
    initials: 'PA',
  },
];

const TONE: Record<DemoAccount['tone'], { chip: string; bubble: string }> = {
  primary:   { chip: 'bg-primary/10 text-primary-dark',     bubble: 'bg-primary text-white' },
  secondary: { chip: 'bg-secondary/10 text-secondary-dark', bubble: 'bg-secondary text-white' },
  purple:    { chip: 'bg-purple/10 text-purple-dark',       bubble: 'bg-purple text-white' },
};

function redirectForRole(role: string | undefined): string {
  switch (role) {
    case 'teacher': return '/dashboard/teacher';
    case 'admin':   return '/dashboard/admin';
    case 'parent':  return '/dashboard/parent';
    case 'adult':
    case 'kids':
    default:        return '/kids/dashboard';
  }
}

function resolveNextForRole(next: string | null, role: string | undefined): string {
  const role_ = role ?? '';
  const isKids = role_ === 'kids' || role_ === 'adult';
  if (isKids) return '/kids/dashboard';
  if (next && next.startsWith('/') && next !== '/login') return next;
  return redirectForRole(role);
}

function DemoAccountCard({
  account,
  onUse,
}: {
  account: DemoAccount;
  onUse: (acc: DemoAccount) => void;
}) {
  const tone = TONE[account.tone];
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[13px] tracking-tight ${tone.bubble}`}
        >
          {account.initials}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-ink text-[14px] leading-tight">{account.label}</p>
          <p className="text-[11px] text-ink-muted leading-tight mt-0.5">{account.sublabel}</p>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${tone.chip}`}>
          {account.role}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 bg-surface-muted/60 rounded-xl p-2.5">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-ink-faint font-semibold w-14 shrink-0">Email</span>
          <code className="flex-1 font-mono text-ink-muted truncate">{account.email}</code>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-ink-faint font-semibold w-14 shrink-0">Пароль</span>
          <code className="flex-1 font-mono text-ink-muted">{account.password}</code>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onUse(account)}
        className="w-full h-10 rounded-xl bg-primary/10 text-primary-dark font-black text-[12px] hover:bg-primary/15 transition-colors"
      >
        Заповнити форму →
      </button>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, status, login } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    const next = searchParams.get('next');
    router.replace(resolveNextForRole(next, session.profile.role));
  }, [status, session, router, searchParams]);

  function handleUseDemo(acc: DemoAccount) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const s = await login({ identifier: email, password });
      const next = searchParams.get('next');
      router.push(resolveNextForRole(next, s.profile.role));
    } catch (err) {
      setError(apiErrorMessage(err, 'Не вдалося увійти. Перевірте email і пароль.'));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-surface-muted/60 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 h-16 flex-shrink-0">
        <Link href="/home" className="flex items-center gap-2.5">
          <span className="relative flex-shrink-0 w-9 h-9 rounded-2xl bg-primary/10 ring-1 ring-primary/20 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/characters/fox/hi.png"
              alt=""
              aria-hidden
              className="absolute inset-0 w-[120%] h-[120%] object-contain -translate-x-[2px] translate-y-[2px]"
            />
          </span>
          <span className="font-black text-ink text-lg">
            English<span className="text-primary">Best</span>
          </span>
        </Link>
        <Link
          href="/home"
          className="text-[12px] font-semibold text-ink-muted hover:text-ink px-3 h-9 rounded-lg hover:bg-surface-muted inline-flex items-center transition-colors"
        >
          ← На головну
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-10 items-start">
          {/* ── LEFT: Demo accounts ── */}
          <aside className="order-2 lg:order-1 bg-surface rounded-3xl border border-border p-5 sm:p-7 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <DemoAccountCard key={acc.role} account={acc} onUse={handleUseDemo} />
              ))}
            </div>
          </aside>

          {/* ── RIGHT: Login form ── */}
          <section className="order-1 lg:order-2 bg-surface rounded-3xl border border-border p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">Ласкаво просимо</p>
              <h1 className="text-3xl font-black text-ink tracking-tight mt-1">Вхід</h1>
              <p className="text-[13px] text-ink-muted mt-2">
                Увійдіть у свій акаунт, щоб продовжити навчання.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[11px] font-black text-ink-muted uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ваш@email.com"
                  autoComplete="email"
                  className="h-12 px-4 rounded-2xl text-sm font-medium w-full border border-border bg-surface text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[11px] font-black text-ink-muted uppercase tracking-wider">
                    Пароль
                  </label>
                  <Link href="#" className="text-[11px] text-primary font-black hover:underline">
                    Забули?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-12 pl-4 pr-12 rounded-2xl text-sm font-medium w-full border border-border bg-surface text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Приховати' : 'Показати'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors"
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

              {error && (
                <p role="alert" className="text-[12px] font-semibold text-danger-dark bg-danger/10 px-3 py-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-14 rounded-2xl font-black text-[15px] text-white mt-2 transition-transform active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed bg-primary shadow-press-primary"
              >
                {loading ? 'Входимо…' : 'Увійти →'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-border" aria-hidden />
              <span className="text-[10px] font-black text-ink-faint uppercase tracking-widest">або</span>
              <span className="flex-1 h-px bg-border" aria-hidden />
            </div>

            <Link
              href="/auth/register"
              className="w-full inline-flex items-center justify-center h-12 rounded-2xl bg-surface-muted border-2 border-border text-ink font-black text-[13px] hover:border-primary/40 transition-colors"
            >
              Створити новий акаунт
            </Link>

            <p className="text-center text-[11px] text-ink-faint">
              Продовжуючи, ви погоджуєтесь з{' '}
              <Link href="#" className="font-black text-ink-muted hover:text-ink transition-colors">
                умовами використання
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
