"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GROUPS = [
  {
    id: "kids",
    emoji: "🧒",
    label: "Дитина",
    age: "6–12 років",
    description: "Ігри, персонаж, монетки та веселі завдання",
    tone: "primary" as const,
  },
  {
    id: "teen",
    emoji: "🧑",
    label: "Підліток",
    age: "13–17 років",
    description: "Розмовна практика, граматика та флешкарти",
    tone: "secondary" as const,
  },
  {
    id: "adult",
    emoji: "👨",
    label: "Дорослий",
    age: "18+ років",
    description: "Бізнес-англійська, Speaking Club та база знань",
    tone: "accent" as const,
  },
];

const TONE: Record<"primary" | "secondary" | "accent", { border: string; bg: string; check: string }> = {
  primary:   { border: "border-primary",   bg: "bg-primary/8",   check: "bg-primary" },
  secondary: { border: "border-secondary", bg: "bg-secondary/8", check: "bg-secondary" },
  accent:    { border: "border-accent",    bg: "bg-accent/8",    check: "bg-accent" },
};

function Header({ current, total }: { current: number; total: number }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/characters/fox/idle.png" alt="" aria-hidden className="w-7 h-7 object-contain" />
        <span className="font-black text-ink">
          English<span className="text-primary">Best</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i <= current - 1 ? "bg-primary w-8" : "bg-border w-2"
            }`}
          />
        ))}
        <span className="text-xs font-semibold text-ink-muted ml-1">{current} / {total}</span>
      </div>
    </header>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  function handleNext() {
    if (!selected) return;
    router.push("/placement");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-primary/5 flex flex-col">
      <Header current={1} total={2} />

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg flex flex-col gap-8">

          <div className="text-center animate-fade-in-up">
            <p className="type-label text-primary mb-2">Крок 1 з 2</p>
            <h1 className="type-h1 text-ink">Хто ти?</h1>
            <p className="text-sm text-ink-muted mt-2">
              Обери свою вікову групу — ми підберемо навчання під тебе
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {GROUPS.map((group, idx) => {
              const tone = TONE[group.tone];
              const isActive = selected === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelected(group.id)}
                  className={[
                    "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left w-full animate-fade-in-up bg-white",
                    isActive
                      ? `${tone.border} ${tone.bg} shadow-card`
                      : "border-border hover:border-ink-muted/40",
                  ].join(" ")}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <span className="text-4xl w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center flex-shrink-0" aria-hidden>
                    {group.emoji}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-black text-ink text-lg">{group.label}</span>
                      <span className="text-xs text-ink-muted font-semibold">{group.age}</span>
                    </div>
                    <p className="text-sm text-ink-muted leading-snug">{group.description}</p>
                  </div>

                  {isActive && (
                    <div className={`w-7 h-7 rounded-full ${tone.check} flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={!selected}
            className="w-full h-14 rounded-2xl bg-primary shadow-press-primary text-white font-black text-base flex items-center justify-center active:translate-y-1 active:shadow-none transition-transform disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Далі →
          </button>
        </div>
      </main>
    </div>
  );
}
