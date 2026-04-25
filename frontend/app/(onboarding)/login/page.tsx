'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/session-context';
import { apiErrorMessage } from '@/lib/fetcher';

interface CohortAccount {
  email: string;
  name: string;
  detail: string;
}

const DEMO_PASSWORD = 'Demo2026!';

const COHORT_TEACHERS: CohortAccount[] = [
  { email: 'teacher-olena@englishbest.app',  name: 'Олена Коваленко',  detail: 'Kids · YLE · 7р.' },
  { email: 'teacher-andriy@englishbest.app', name: 'Андрій Петренко',  detail: 'Adults · IELTS · 8р.' },
  { email: 'teacher-iryna@englishbest.app',  name: 'Ірина Шевченко',   detail: 'Teen · Travel · 4р.' },
];

const COHORT_KIDS: CohortAccount[] = [
  { email: 'kid-sofia@englishbest.app',      name: 'Софія Бондар',      detail: 'A1 · 7-11' },
  { email: 'kid-maksym@englishbest.app',     name: 'Максим Лисенко',    detail: 'A1 · 7-11' },
  { email: 'kid-kateryna@englishbest.app',   name: 'Катерина Ткаченко', detail: 'A2 · 7-11' },
  { email: 'kid-bohdan@englishbest.app',     name: 'Богдан Гриценко',   detail: 'A0 · 4-7' },
  { email: 'kid-yelyzaveta@englishbest.app', name: 'Єлизавета Шумило',  detail: 'A2 · 11+' },
  { email: 'kid-artem@englishbest.app',      name: 'Артем Демченко',    detail: 'A2 · 11+' },
  { email: 'kid-dariia@englishbest.app',     name: 'Дарія Марченко',    detail: 'A1 · 7-11' },
  { email: 'kid-ihor@englishbest.app',       name: 'Ігор Романенко',    detail: 'B1 · 11+' },
];

const COHORT_ADULTS: CohortAccount[] = [
  { email: 'adult-yulia@englishbest.app',     name: 'Юлія Павленко',     detail: 'A2→B2 · exam' },
  { email: 'adult-oleg@englishbest.app',      name: 'Олег Сидоренко',    detail: 'B1→C1 · career' },
  { email: 'adult-nataliia@englishbest.app',  name: 'Наталія Бабенко',   detail: 'A1→A2 · travel' },
  { email: 'adult-volodymyr@englishbest.app', name: 'Володимир Сосницький', detail: 'B2→C1 · hobby' },
];

const COHORT_PARENTS: CohortAccount[] = [
  { email: 'parent-olha@englishbest.app',      name: 'Ольга Бондар',     detail: '→ Софія' },
  { email: 'parent-iryna-l@englishbest.app',   name: 'Ірина Лисенко',    detail: '→ Максим' },
  { email: 'parent-vira@englishbest.app',      name: 'Віра Ткаченко',    detail: '→ Катерина' },
  { email: 'parent-roman@englishbest.app',     name: 'Роман Гриценко',   detail: '→ Богдан' },
  { email: 'parent-mykhailo@englishbest.app',  name: 'Михайло Шумило',   detail: '→ Єлизавета' },
  { email: 'parent-halyna@englishbest.app',    name: 'Галина Демченко',  detail: '→ Артем' },
  { email: 'parent-tetiana@englishbest.app',   name: 'Тетяна Марченко',  detail: '→ Дарія' },
  { email: 'parent-larysa@englishbest.app',    name: 'Лариса Романенко', detail: '→ Ігор' },
];

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, status, login } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCohort, setShowCohort] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    const next = searchParams.get('next');
    router.replace(resolveNextForRole(next, session.profile.role));
  }, [status, session, router, searchParams]);

  function handleUseCohort(acc: CohortAccount) {
    setEmail(acc.email);
    setPassword(DEMO_PASSWORD);
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
      <header className="bg-surface border-b border-border grid grid-cols-[1fr_auto] items-center px-4 sm:px-6 h-16 flex-shrink-0">
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
        <div className="w-full max-w-md">
          <section className="bg-surface rounded-3xl border border-border p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-black text-ink tracking-tight">Вхід</h1>
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
                className="w-full h-14 rounded-2xl font-black text-[15px] text-white mt-1 transition-transform active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed bg-primary shadow-press-primary"
              >
                {loading ? 'Входимо…' : 'Увійти →'}
              </button>
            </form>

            {/* ── Demo accounts (cohort) ── */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowCohort(v => !v)}
                className="mt-1 flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-surface-muted transition-colors text-left"
                aria-expanded={showCohort}
              >
                <span className="flex items-baseline gap-2">
                  <span className="text-[10px] font-black text-ink-faint uppercase tracking-widest">
                    Демо-акаунти
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    пароль <code className="font-mono text-ink-muted">{DEMO_PASSWORD}</code>
                  </span>
                </span>
                <span className="text-[11px] text-ink-faint font-black">
                  {showCohort ? '▲' : '▼'}
                </span>
              </button>

              {showCohort && (
                <div className="flex flex-col gap-3 pt-1">
                  {([
                    { title: 'Вчителі', tone: 'bg-secondary text-white', items: COHORT_TEACHERS },
                    { title: 'Діти',    tone: 'bg-primary text-white',   items: COHORT_KIDS },
                    { title: 'Дорослі', tone: 'bg-warning text-white',   items: COHORT_ADULTS },
                    { title: 'Батьки',  tone: 'bg-purple text-white',    items: COHORT_PARENTS },
                  ] as const).map(group => (
                    <div key={group.title} className="flex flex-col gap-1">
                      <p className="text-[10px] font-black text-ink-faint uppercase tracking-widest px-1">
                        {group.title} <span className="text-ink-faint/70">· {group.items.length}</span>
                      </p>
                      <div className="flex flex-col">
                        {group.items.map(acc => (
                          <button
                            key={acc.email}
                            type="button"
                            onClick={() => handleUseCohort(acc)}
                            className="group flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-muted transition-colors text-left"
                          >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] flex-shrink-0 ${group.tone}`}>
                              {acc.name.charAt(0)}
                            </span>
                            <span className="flex-1 min-w-0 flex items-baseline gap-1.5 truncate">
                              <span className="font-black text-ink text-[12px] truncate">{acc.name}</span>
                              <span className="text-[10px] text-ink-muted truncate">· {acc.detail}</span>
                            </span>
                            <span className="text-[10px] text-ink-faint group-hover:text-primary-dark font-black transition-colors flex-shrink-0">
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 text-center">
              <p className="text-[11px] text-ink-faint">
                Продовжуючи, ви погоджуєтесь з{' '}
                <Link href="#" className="font-black text-ink-muted hover:text-ink transition-colors">
                  умовами використання
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
