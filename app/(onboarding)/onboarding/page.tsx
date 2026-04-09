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
    bg: "bg-primary/10",
    border: "border-primary",
    check: "bg-primary",
  },
  {
    id: "teen",
    emoji: "🧑",
    label: "Підліток",
    age: "13–17 років",
    description: "Розмовна практика, граматика та флешкарти",
    bg: "bg-secondary/10",
    border: "border-secondary",
    check: "bg-secondary",
  },
  {
    id: "adult",
    emoji: "👨",
    label: "Дорослий",
    age: "18+ років",
    description: "Бізнес-англійська, Speaking Club та база знань",
    bg: "bg-accent/10",
    border: "border-accent",
    check: "bg-accent",
  },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            "h-2 rounded-full transition-all duration-300",
            i < current ? "bg-primary w-8" : i === current - 1 ? "bg-primary w-8" : "bg-border w-2",
          ].join(" ")}
        />
      ))}
      <span className="text-xs text-ink-muted ml-1">
        {current} / {total}
      </span>
    </div>
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
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦉</span>
          <span className="font-black text-ink">
            English<span className="text-primary">Best</span>
          </span>
        </div>
        <StepIndicator current={1} total={3} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">

          <div className="text-center mb-10 animate-fade-in-up">
            <h1 className="text-3xl font-black text-ink mb-2">Хто ти?</h1>
            <p className="text-ink-muted text-sm">
              Обери свою вікову групу — ми підберемо навчання під тебе
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-10">
            {GROUPS.map((group, idx) => (
              <button
                key={group.id}
                onClick={() => setSelected(group.id)}
                className={[
                  "relative flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-200 text-left w-full animate-fade-in-up",
                  selected === group.id
                    ? `${group.border} ${group.bg} shadow-sm`
                    : "border-border bg-surface hover:border-primary/30 hover:bg-surface-muted",
                ].join(" ")}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Emoji */}
                <span className="text-5xl w-14 text-center flex-shrink-0">{group.emoji}</span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-black text-ink text-lg">{group.label}</span>
                    <span className="text-xs text-ink-muted font-semibold">{group.age}</span>
                  </div>
                  <p className="text-sm text-ink-muted leading-snug">{group.description}</p>
                </div>

                {/* Checkmark */}
                {selected === group.id && (
                  <div className={`w-7 h-7 rounded-full ${group.check} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selected}
            className="w-full h-13 py-4 rounded-2xl bg-primary text-white font-black text-base hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Далі →
          </button>
        </div>
      </div>
    </div>
  );
}
