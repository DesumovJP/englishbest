"use client";

import Link from "next/link";
import { useKidsIdentity } from "@/lib/use-kids-identity";

export default function WelcomePage() {
  const { name } = useKidsIdentity();
  return (
    <div className="min-h-dvh bg-gradient-to-b from-surface via-surface to-primary/5 flex flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-6">

        {/* Fox hero */}
        <div className="relative w-44 h-44 flex items-center justify-center animate-fade-in-up">
          <div className="absolute inset-4 rounded-full bg-primary/20 blur-2xl" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/characters/fox/hi.png"
            alt="Лисеня вітається"
            className="relative w-40 h-40 object-contain animate-float drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* Speech bubble greeting */}
        <div className="relative bg-white rounded-3xl px-6 py-5 shadow-card-md border border-border animate-fade-in-up anim-delay-150 w-full">
          <div
            aria-hidden
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-border rotate-45"
          />
          <p className="text-ink-muted type-label mb-1">Привіт!</p>
          <h1 className="type-h1 text-ink">Я — Лисеня</h1>
          <p className="text-sm text-ink-muted mt-2 leading-relaxed">
            Радий бачити тебе, <span className="font-black text-ink">{name}</span>! Зараз навчимося англійської разом — через ігри та живі уроки.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/onboarding"
          className="w-full h-14 rounded-2xl bg-primary shadow-press-primary text-white font-black text-base flex items-center justify-center active:translate-y-1 active:shadow-none transition-transform animate-fade-in-up anim-delay-300"
        >
          Розпочати →
        </Link>
      </div>
    </div>
  );
}
