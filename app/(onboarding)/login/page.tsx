'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AccountType = 'student' | 'teacher' | 'admin' | 'parent';
type Mode = 'picker' | 'signin';

interface AccountConfig {
  id: AccountType;
  emoji: string;
  label: string;
  sublabel: string;
  redirect: string;
  tone: 'primary' | 'secondary' | 'purple' | 'accent';
}

const ACCOUNT_TYPES: AccountConfig[] = [
  { id: 'student', emoji: '🦊',       label: 'Student', sublabel: 'Учень / дитина',    redirect: '/kids/dashboard',       tone: 'primary'   },
  { id: 'teacher', emoji: '👩‍🏫',      label: 'Teacher', sublabel: 'Вчитель',           redirect: '/dashboard/teacher',    tone: 'secondary' },
  { id: 'admin',   emoji: '🛡️',        label: 'Admin',   sublabel: 'Адміністратор',     redirect: '/dashboard/analytics',  tone: 'purple'    },
  { id: 'parent',  emoji: '👨‍👩‍👧',    label: 'Parent',  sublabel: 'Батьки',            redirect: '/dashboard/parent',     tone: 'accent'    },
];

const TONE: Record<AccountConfig['tone'], {
  ring: string; chip: string; cardActive: string; btn: string;
}> = {
  primary:   { ring: 'ring-primary/60',   chip: 'bg-primary/10 text-primary-dark',     cardActive: 'border-primary bg-primary/5',     btn: 'bg-primary shadow-press-primary' },
  secondary: { ring: 'ring-secondary/60', chip: 'bg-secondary/10 text-secondary-dark', cardActive: 'border-secondary bg-secondary/5', btn: 'bg-secondary shadow-press-secondary' },
  purple:    { ring: 'ring-purple/60',    chip: 'bg-purple/10 text-purple-dark',       cardActive: 'border-purple bg-purple/5',       btn: 'bg-purple shadow-press-purple' },
  accent:    { ring: 'ring-accent/60',    chip: 'bg-accent/10 text-accent-dark',       cardActive: 'border-accent bg-accent/5',       btn: 'bg-accent shadow-press-accent' },
};

function setDemoRole(type: AccountType) {
  localStorage.setItem('demo_role', type);
  localStorage.setItem('sidebar_role', type === 'student' ? 'student' : type);
}

/* ── Mode toggle (dev-only convenience switch) ─────────────────────── */
function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface-muted border border-border">
      {([
        { id: 'picker', label: 'Demo' },
        { id: 'signin', label: 'Увійти' },
      ] as { id: Mode; label: string }[]).map(opt => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={[
              'px-4 h-8 rounded-full text-xs font-black transition-colors',
              active ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Picker mode: 4 role cards with Demo→ buttons ──────────────────── */
function PickerPanel({ onDemo }: { onDemo: (t: AccountType) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-h1 text-ink">Увійти як…</h2>
        <p className="text-sm text-ink-muted mt-1">Оберіть тип акаунту для входу</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ACCOUNT_TYPES.map(type => {
          const tone = TONE[type.tone];
          return (
            <div key={type.id}
              className="flex flex-col gap-2 rounded-2xl p-4 text-left bg-white border-2 border-border shadow-card">
              <span className="text-[28px]">{type.emoji}</span>
              <div>
                <p className="font-black text-ink text-sm">{type.label}</p>
                <p className="font-medium text-ink-muted text-[11px]">{type.sublabel}</p>
              </div>
              <button
                onClick={() => onDemo(type.id)}
                className={`mt-1 w-full rounded-xl font-black text-white py-2 text-xs active:translate-y-0.5 active:shadow-none transition-transform ${tone.btn}`}
              >
                Demo →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Sign-in mode: Google + email/password ─────────────────────────── */
function SignInPanel({ selected }: { selected: AccountType }) {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const active = ACCOUNT_TYPES.find(t => t.id === selected)!;
  const tone   = TONE[active.tone];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDemoRole(selected);
    await new Promise(r => setTimeout(r, 500));
    router.push(active.redirect);
  }

  return (
    <div className="flex flex-col gap-5">

      <div>
        <h2 className="type-h1 text-ink">Вхід</h2>
        <p className="text-sm text-ink-muted mt-1">Увійдіть у свій акаунт</p>
      </div>

      {/* Google */}
      <button
        type="button"
        className="w-full h-11 rounded-2xl flex items-center justify-center gap-3 font-semibold text-ink text-sm border border-border bg-white hover:bg-surface-muted transition-colors"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Увійти через Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-semibold text-ink-faint">або</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="type-label text-ink-muted">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-11 pl-4 pr-12 rounded-2xl text-sm font-medium w-full border border-border bg-white text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
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

        <button
          type="submit"
          disabled={loading || !email || !password}
          className={`w-full h-12 rounded-2xl font-black text-sm text-white mt-1 transition-transform active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed ${tone.btn}`}
        >
          {loading ? 'Входимо…' : 'Увійти →'}
        </button>
      </form>

      <p className="text-center text-xs text-ink-faint">
        Немає доступу?{' '}
        <Link href="#" className="font-semibold text-ink-muted hover:text-ink transition-colors">Напишіть нам</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode]         = useState<Mode>('picker');
  const [selected] = useState<AccountType>('student');
  const router = useRouter();

  function handleDemo(type: AccountType) {
    const t = ACCOUNT_TYPES.find(a => a.id === type)!;
    setDemoRole(type);
    router.push(t.redirect);
  }

  return (
    <div className="min-h-dvh bg-surface flex flex-col">

      {/* Header */}
      <header className="bg-surface border-b border-border flex items-center justify-between px-6 h-16 flex-shrink-0">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-black text-ink text-lg">English<span className="text-primary">Best</span></span>
        </Link>

        <ModeToggle mode={mode} onChange={setMode} />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[480px]">
          <div className="bg-white rounded-3xl shadow-card-md border border-border p-6 sm:p-8">
            {mode === 'picker'
              ? <PickerPanel onDemo={handleDemo} />
              : <SignInPanel selected={selected} />
            }
          </div>
        </div>
      </main>
    </div>
  );
}
