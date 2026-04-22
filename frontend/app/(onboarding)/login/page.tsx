'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { apiErrorMessage } from '@/lib/fetcher';

type DemoRole = 'kids' | 'adult' | 'teacher' | 'parent';

interface DemoAccount {
  role: DemoRole;
  emoji: string;
  label: string;
  sublabel: string;
  email: string;
  password: string;
  tone: 'primary' | 'secondary' | 'purple' | 'accent';
}

const DEMO_PASSWORD = 'Demo2026!';

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'kids',
    emoji: '🦊',
    label: 'Kids',
    sublabel: 'Учень / дитина',
    email: 'demo-kids@englishbest.app',
    password: DEMO_PASSWORD,
    tone: 'primary',
  },
  {
    role: 'adult',
    emoji: '🎓',
    label: 'Adult',
    sublabel: 'Дорослий учень',
    email: 'demo-adult@englishbest.app',
    password: DEMO_PASSWORD,
    tone: 'accent',
  },
  {
    role: 'teacher',
    emoji: '👩‍🏫',
    label: 'Teacher',
    sublabel: 'Вчитель',
    email: 'demo-teacher@englishbest.app',
    password: DEMO_PASSWORD,
    tone: 'secondary',
  },
  {
    role: 'parent',
    emoji: '👨‍👩‍👧',
    label: 'Parent',
    sublabel: 'Батьки',
    email: 'demo-parent@englishbest.app',
    password: DEMO_PASSWORD,
    tone: 'purple',
  },
];

const TONE: Record<DemoAccount['tone'], { chip: string }> = {
  primary: { chip: 'bg-primary/10 text-primary-dark' },
  secondary: { chip: 'bg-secondary/10 text-secondary-dark' },
  purple: { chip: 'bg-purple/10 text-purple-dark' },
  accent: { chip: 'bg-accent/10 text-accent-dark' },
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

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API may be blocked; silently no-op.
    }
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Копіювати ${label}`}
      className="px-2 h-7 rounded-lg text-[11px] font-bold bg-surface-muted text-ink-muted hover:bg-border hover:text-ink transition-colors"
    >
      {copied ? '✓' : 'Копі'}
    </button>
  );
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
    <div className="flex flex-col gap-2 rounded-2xl p-3 bg-white border border-border">
      <div className="flex items-center gap-2">
        <span className="text-xl">{account.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-ink text-sm leading-tight">{account.label}</p>
          <p className="text-[11px] text-ink-muted leading-tight">{account.sublabel}</p>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${tone.chip}`}>
          {account.role}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[12px]">
        <span className="text-ink-faint font-semibold w-14 shrink-0">Email</span>
        <code className="flex-1 font-mono text-ink-muted truncate">{account.email}</code>
        <CopyButton text={account.email} label="email" />
      </div>

      <div className="flex items-center gap-2 text-[12px]">
        <span className="text-ink-faint font-semibold w-14 shrink-0">Пароль</span>
        <code className="flex-1 font-mono text-ink-muted">{account.password}</code>
        <CopyButton text={account.password} label="пароль" />
      </div>

      <button
        type="button"
        onClick={() => onUse(account)}
        className="mt-1 w-full rounded-xl bg-surface-muted text-ink font-black text-xs py-2 hover:bg-border transition-colors"
      >
        Заповнити форму →
      </button>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      router.push(next && next.startsWith('/') ? next : redirectForRole(s.profile.role));
    } catch (err) {
      setError(apiErrorMessage(err, 'Не вдалося увійти. Перевірте email і пароль.'));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <header className="bg-surface border-b border-border flex items-center justify-between px-6 h-16 flex-shrink-0">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-black text-ink text-lg">English<span className="text-primary">Best</span></span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[520px] flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-card-md border border-border p-6 sm:p-8">
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="type-h1 text-ink">Вхід</h2>
                <p className="text-sm text-ink-muted mt-1">Увійдіть у свій акаунт</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="type-label text-ink-muted">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ваш@email.com"
                    autoComplete="email"
                    className="h-11 px-4 rounded-2xl text-sm font-medium w-full border border-border bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="type-label text-ink-muted">Пароль</label>
                    <Link href="#" className="text-xs text-primary font-semibold hover:underline">Забули?</Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11 pl-4 pr-12 rounded-2xl text-sm font-medium w-full border border-border bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Приховати' : 'Показати'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors"
                    >
                      {showPw ? (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-xs font-semibold text-danger bg-danger/10 px-3 py-2 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full h-12 rounded-2xl font-black text-sm text-white mt-1 transition-transform active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed bg-primary shadow-press-primary"
                >
                  {loading ? 'Входимо…' : 'Увійти →'}
                </button>
              </form>

              <p className="text-center text-xs text-ink-faint">
                Ще немає акаунту?{' '}
                <Link href="/auth/register" className="font-semibold text-primary hover:underline">Створити</Link>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-card-md border border-border p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-black text-ink text-base">Тестові акаунти</h3>
                <p className="text-xs text-ink-muted mt-1">
                  По одному на кожну роль. Натисни «Заповнити форму» або скопіюй вручну.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <DemoAccountCard key={acc.role} account={acc} onUse={handleUseDemo} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
