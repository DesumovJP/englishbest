"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COMPANIONS = [
  { id: "fox",     emoji: "🦊", ua: "Лисиця",    en: "Fox",     placeholder: "Фокс" },
  { id: "cat",     emoji: "🐱", ua: "Кіт",       en: "Cat",     placeholder: "Мурко" },
  { id: "dragon",  emoji: "🐉", ua: "Дракончик", en: "Dragon",  placeholder: "Дракоша" },
  { id: "rabbit",  emoji: "🐰", ua: "Кролик",    en: "Rabbit",  placeholder: "Сніжок" },
  { id: "raccoon", emoji: "🦝", ua: "Єнот",      en: "Raccoon", placeholder: "Смужка" },
  { id: "frog",    emoji: "🐸", ua: "Жабка",     en: "Frog",    placeholder: "Квакун" },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            "h-2 rounded-full transition-all duration-300",
            i < current ? "bg-primary w-8" : "bg-border w-2",
          ].join(" ")}
        />
      ))}
      <span className="text-xs text-ink-muted ml-1">{current} / {total}</span>
    </div>
  );
}

export default function CompanionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");

  const companion = COMPANIONS.find((c) => c.id === selected);

  function handleStart() {
    if (!selected) return;
    router.push("/kids/dashboard");
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
        <StepIndicator current={3} total={3} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-5 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">

          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-black text-ink mb-2">Обери свого компаньйона!</h1>
            <p className="text-ink-muted text-sm">
              Він навчатиметься разом з тобою і мешкатиме у твоїй кімнаті
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {COMPANIONS.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={[
                  "relative flex flex-col items-center gap-2 py-5 px-2 rounded-2xl border-2 transition-all duration-200 animate-fade-in-up",
                  selected === c.id
                    ? "border-primary bg-primary/8 scale-105 shadow-md"
                    : "border-border bg-surface hover:border-primary/30 hover:bg-surface-muted",
                ].join(" ")}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                {/* Selected checkmark */}
                {selected === c.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-pop-in">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className="text-5xl leading-none">{c.emoji}</span>
                <div className="text-center">
                  <p className="font-black text-ink text-sm">{c.ua}</p>
                  <p className="text-xs text-ink-muted">{c.en}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Name input */}
          <div className="mb-8 animate-fade-in-up anim-delay-400">
            <label className="text-xs font-black text-ink-muted uppercase tracking-widest mb-2 block">
              Як назвеш свого друга?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={companion ? companion.placeholder : "Введи ім'я…"}
              maxLength={20}
              className="w-full h-12 px-4 rounded-xl border border-border text-sm text-ink bg-surface-muted focus:outline-none focus:border-primary transition-colors placeholder:text-ink-muted"
            />
            {companion && !name && (
              <p className="text-xs text-ink-muted mt-1.5">
                Наприклад: «{companion.placeholder}»
              </p>
            )}
          </div>

          {/* Selected preview */}
          {selected && (
            <div className="flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3 mb-8 animate-fade-in-up">
              <span className="text-3xl">{companion?.emoji}</span>
              <div>
                <p className="font-black text-ink text-sm">
                  {name || companion?.placeholder}
                </p>
                <p className="text-xs text-ink-muted">{companion?.ua} · твій компаньйон</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleStart}
            disabled={!selected}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed animate-fade-in-up anim-delay-500"
          >
            {selected ? "Почати навчання! 🚀" : "Обери компаньйона"}
          </button>
        </div>
      </div>
    </div>
  );
}
