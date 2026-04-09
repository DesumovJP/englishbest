"use client";

import Link from "next/link";
import { mockKidsUser } from "@/mocks/user";

const features = [
  { icon: "🔥", text: "Щоденні уроки зі стріком" },
  { icon: "🎮", text: "Ігровий простір з персонажем" },
  { icon: "⭐", text: "Монетки за кожне досягнення" },
  { icon: "👩‍🏫", text: "Живі уроки з вчителем" },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5 py-16 text-center">

      {/* Owl mascot */}
      <div className="animate-bounce-in mb-6">
        <div className="text-8xl animate-float">🦉</div>
      </div>

      {/* Greeting */}
      <div className="animate-fade-in-up anim-delay-150">
        <h1 className="text-4xl font-black text-ink mb-2">
          Привіт, {mockKidsUser.name}! 👋
        </h1>
        <p className="text-2xl font-black text-primary mb-6">
          Ласкаво просимо до EnglishBest!
        </p>
        <p className="text-ink-muted text-base max-w-sm mx-auto leading-relaxed mb-10">
          Тут ти вивчатимеш англійську через ігри, уроки та власного персонажа-компаньйона.
        </p>
      </div>

      {/* Feature pills */}
      <div className="grid grid-cols-2 gap-3 max-w-xs w-full mb-10 animate-fade-in-up anim-delay-300">
        {features.map((f) => (
          <div
            key={f.text}
            className="flex items-center gap-2 bg-surface-muted rounded-2xl px-4 py-3 text-left"
          >
            <span className="text-xl flex-shrink-0">{f.icon}</span>
            <span className="text-xs font-semibold text-ink leading-tight">{f.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="animate-fade-in-up anim-delay-450">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-black text-base px-10 py-4 rounded-2xl transition-colors"
        >
          Розпочати →
        </Link>
      </div>

    </div>
  );
}
