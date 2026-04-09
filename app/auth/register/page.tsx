'use client';
import { useState } from 'react';
import Link from 'next/link';

const AGE_GROUPS = [
  { value: '',        label: 'Вік дитини' },
  { value: '4-6',     label: '4–6 років' },
  { value: '7-9',     label: '7–9 років' },
  { value: '10-12',   label: '10–12 років' },
  { value: '13-15',   label: '13–15 років' },
  { value: '16+',     label: '16+ / дорослий' },
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState<1 | 2>(1);
  const [form, setForm]       = useState({ name: '', email: '', password: '', age: '', phone: '' });
  const [agree, setAgree]     = useState(false);

  function update(field: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    // TODO: replace with Strapi auth endpoint POST /api/auth/local/register
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    window.location.href = '/dashboard';
  }

  const inputCls = 'w-full h-11 px-4 rounded-xl border border-border text-sm text-ink bg-white focus:outline-none focus:border-primary transition-colors placeholder:text-ink-muted';
  const labelCls = 'text-xs font-black text-ink-muted uppercase tracking-wide mb-1.5 block';

  return (
    <div className="min-h-screen flex bg-surface-muted">

      {/* Ліва брендова панель */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-primary to-primary-dark px-10 py-12">
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-black text-white">EnglishBest</span>
        </Link>

        <div className="flex flex-col gap-6">
          <div className="text-5xl">🦉</div>
          <p className="text-4xl font-black text-white leading-snug">
            Перший урок —<br/>безкоштовно!
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            Зареєструйтесь за 2 хвилини. Наш менеджер зателефонує та підбере вчителя для вашої дитини.
          </p>
          <div className="flex flex-col gap-3 mt-2">
            {[
              '✓ Жодних прихованих платежів',
              '✓ Скасування в один клік',
              '✓ Вчитель підбирається індивідуально',
            ].map(t => (
              <p key={t} className="text-white/80 text-sm">{t}</p>
            ))}
          </div>
        </div>

        {/* Відгук */}
        <div className="bg-white/10 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-accent text-sm">★</span>)}
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            &ldquo;Записались на пробний урок і залишились на рік. Дитина тепер сама просить англійську!&rdquo;
          </p>
          <p className="text-white/50 text-xs">— Олена К., мама Аліси</p>
        </div>
      </div>

      {/* Права форма */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm flex flex-col gap-6">

          {/* Mobile logo */}
          <Link href="/home" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-black text-ink">English<span className="text-primary">Best</span></span>
          </Link>

          {/* Прогрес кроків */}
          <div className="flex items-center gap-3">
            {([1, 2] as const).map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0 transition-colors ${
                  step >= s ? 'bg-primary text-white' : 'bg-border text-ink-muted'
                }`}>{s}</div>
                <div className={`h-1 flex-1 rounded-full transition-colors ${step > s ? 'bg-primary' : 'bg-border'}`} />
              </div>
            ))}
          </div>

          <div>
            <h1 className="text-2xl font-black text-ink">
              {step === 1 ? 'Безкоштовна реєстрація' : 'Майже готово!'}
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              {step === 1
                ? 'Крок 1 з 2 — ваші дані'
                : 'Крок 2 з 2 — вік дитини та телефон'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {step === 1 ? (
              <>
                <div>
                  <label className={labelCls}>Ваше ім&apos;я</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Олена"
                    required
                    autoComplete="given-name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="ваш@email.com"
                    required
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Пароль</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="мінімум 8 символів"
                    required
                    autoComplete="new-password"
                    minLength={8}
                    className={inputCls}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelCls}>Вік дитини</label>
                  <select
                    value={form.age}
                    onChange={e => update('age', e.target.value)}
                    required
                    className={inputCls}
                  >
                    {AGE_GROUPS.map(g => (
                      <option key={g.value} value={g.value} disabled={g.value === ''}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Ваш телефон</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+38 050 000 00 00"
                    autoComplete="tel"
                    className={inputCls}
                  />
                  <p className="text-xs text-ink-muted mt-1">Зателефонуємо протягом 10 хвилин</p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={e => setAgree(e.target.checked)}
                    className="mt-0.5 accent-primary"
                  />
                  <span className="text-xs text-ink-muted leading-relaxed">
                    Погоджуюсь з{' '}
                    <Link href="#" className="text-primary hover:underline">умовами використання</Link>
                    {' '}та{' '}
                    <Link href="#" className="text-primary hover:underline">політикою конфіденційності</Link>
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (step === 2 && !agree)}
              className="w-full h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Реєстрація…' : step === 1 ? 'Далі →' : 'Створити акаунт →'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Вже є акаунт?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
