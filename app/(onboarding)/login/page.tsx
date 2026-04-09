"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const error = "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/welcome");
  }

  const inputCls =
    "w-full h-12 px-4 rounded-xl border border-border text-sm text-ink bg-surface focus:outline-none focus:border-primary transition-colors placeholder:text-ink-muted";

  return (
    <div className="min-h-screen flex bg-surface-muted">

      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 bg-gradient-to-br from-primary to-primary-dark px-10 py-12">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-xl">🦉</span>
          </div>
          <span className="text-xl font-black text-white tracking-tight">EnglishBest</span>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <p className="text-5xl font-black text-white leading-tight mb-4">
              З поверненням!<br />
              <span className="text-white/60">👋</span>
            </p>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Продовжуйте своє навчання — ваші досягнення чекають на вас.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: "🔥", text: "Підтримуйте щоденну серію" },
              { icon: "⭐", text: "Збирайте XP та монетки" },
              { icon: "💬", text: "Спілкуйтесь з вчителем напряму" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{item.icon}</span>
                <span className="text-white/80 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2026 EnglishBest</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🦉</span>
            <span className="font-black text-ink text-lg">
              English<span className="text-primary">Best</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-ink mb-2">Увійти</h1>
            <p className="text-ink-muted text-sm">
              Введіть номер телефону та пароль
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

            {/* Phone field */}
            <div>
              <label className="text-xs font-black text-ink-muted uppercase tracking-widest mb-2 block">
                Номер телефону
              </label>
              <div className="flex gap-2">
                <div className="flex items-center h-12 px-3 rounded-xl border border-border bg-surface text-sm font-semibold text-ink-muted whitespace-nowrap select-none">
                  🇺🇦 +38
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(0XX) XXX-XX-XX"
                  required
                  autoComplete="tel"
                  className={inputCls + " flex-1"}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-ink-muted uppercase tracking-widest">
                  Пароль
                </label>
                <Link
                  href="#"
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Забули пароль?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={inputCls}
              />
            </div>

            {error && (
              <div className="text-xs text-danger font-semibold bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Вхід…" : "Увійти →"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-8">
            Немає акаунту?{" "}
            <Link href="#" className="font-bold text-primary hover:underline">
              Зверніться до адміністратора
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
