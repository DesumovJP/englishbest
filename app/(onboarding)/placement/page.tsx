"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  {
    level: "A1",
    question: "Як перекласти: «Мене звати Аня»?",
    options: ["My name are Anya", "My name is Anya", "I name is Anya", "Name me Anya"],
    correct: 1,
  },
  {
    level: "A2",
    question: "Оберіть правильне речення:",
    options: [
      "She don't like coffee",
      "She doesn't likes coffee",
      "She doesn't like coffee",
      "She not like coffee",
    ],
    correct: 2,
  },
  {
    level: "B1",
    question: "Що означає фраза «to be on the fence»?",
    options: [
      "Сидіти на паркані",
      "Бути в безпеці",
      "Вагатися, не могти вирішити",
      "Захищати когось",
    ],
    correct: 2,
  },
  {
    level: "B2",
    question: "Виберіть правильну форму: «By the time he arrived, she ___ already.»",
    options: ["has left", "had left", "was leaving", "left"],
    correct: 1,
  },
  {
    level: "C1",
    question: "Яке слово найкраще доповнює: «The report was ___ with minor errors throughout»?",
    options: ["riddled", "filled", "loaded", "covered"],
    correct: 0,
  },
];

const LEVEL_LABELS: Record<string, { name: string; color: string; bg: string; description: string }> = {
  A1: { name: "Початківець",     color: "text-ink",       bg: "bg-surface-muted", description: "Вивчаєш перші слова та базові фрази. Відмінне місце для старту!" },
  A2: { name: "Елементарний",    color: "text-secondary", bg: "bg-secondary/10",  description: "Розумієш прості речення та можеш спілкуватись у звичних ситуаціях." },
  B1: { name: "Середній",        color: "text-accent",    bg: "bg-accent/10",     description: "Справляєшся з більшістю ситуацій під час подорожей та роботи." },
  B2: { name: "Вище середнього", color: "text-primary",   bg: "bg-primary/10",    description: "Вільно спілкуєшся з носіями мови на широке коло тем." },
  C1: { name: "Просунутий",      color: "text-danger",    bg: "bg-danger/10",     description: "Використовуєш мову гнучко та ефективно для соціальних і професійних цілей." },
};

function calcLevel(answers: number[], skippedEarly: boolean): string {
  if (skippedEarly) return "A1";
  let score = 0;
  answers.forEach((ans, idx) => {
    if (QUESTIONS[idx] && ans === QUESTIONS[idx].correct) score++;
  });
  if (score <= 1) return "A1";
  if (score === 2) return "A2";
  if (score === 3) return "B1";
  if (score === 4) return "B2";
  return "C1";
}

function Header({ progressPct, label }: { progressPct: number; label: string }) {
  return (
    <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/characters/fox/thinking.png" alt="" aria-hidden className="w-7 h-7 object-contain" />
          <span className="font-black text-ink">
            English<span className="text-primary">Best</span>
          </span>
        </div>
        <span className="text-xs font-semibold text-ink-muted">{label}</span>
      </div>
      <div className="h-1.5 bg-border/60">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-r-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );
}

export default function PlacementPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [skippedEarly, setSkippedEarly] = useState(false);

  const isResult = step >= QUESTIONS.length || skippedEarly;
  const level = isResult ? calcLevel(answers, skippedEarly) : null;

  function advance(answer: number) {
    const next = [...answers, answer];
    setAnswers(next);
    setAnimating(true);
    setTimeout(() => {
      setSelected(null);
      setStep((s) => s + 1);
      setAnimating(false);
    }, 250);
  }

  function handleNext() {
    if (selected === null) return;
    advance(selected);
  }

  function handleSkip() {
    if (step === 0) setSkippedEarly(true);
    else advance(-1);
  }

  if (isResult && level) {
    const info = LEVEL_LABELS[level];
    return (
      <div className="min-h-screen bg-gradient-to-b from-surface to-primary/5 flex flex-col">
        <Header progressPct={100} label="Готово" />
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center animate-bounce-in">
              <div className="absolute inset-4 rounded-full bg-primary/25 blur-2xl" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/characters/fox/so.png" alt="" aria-hidden className="relative w-32 h-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)]" />
            </div>

            <div className="animate-fade-in-up anim-delay-200">
              <p className="type-label text-ink-muted mb-3">Твій рівень</p>
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${info.bg}`}>
                <span className={`text-4xl font-black tracking-tight ${info.color}`}>{level}</span>
                <span className={`type-h3 ${info.color}`}>{info.name}</span>
              </div>
              <p className="text-ink-muted text-sm max-w-xs mx-auto leading-relaxed mt-4">
                {info.description}
              </p>
            </div>

            <button
              onClick={() => router.push("/kids/dashboard")}
              className="w-full h-14 rounded-2xl bg-primary shadow-press-primary text-white font-black text-base flex items-center justify-center active:translate-y-1 active:shadow-none transition-transform animate-fade-in-up anim-delay-300"
            >
              Почати навчання →
            </button>
          </div>
        </main>
      </div>
    );
  }

  const q = QUESTIONS[step];
  const progressPct = (step / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-primary/5 flex flex-col">
      <Header progressPct={progressPct} label={`${step + 1} / ${QUESTIONS.length}`} />

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">
          <div className={`transition-opacity duration-250 ${animating ? "opacity-0" : "opacity-100"}`}>

            <div className="flex items-center gap-2 mb-5">
              <span className="type-label px-3 py-1 rounded-full bg-primary/10 text-primary-dark">
                Рівень {q.level}
              </span>
            </div>

            <h2 className="type-h2 text-ink mb-8 break-words">{q.question}</h2>

            <div className="flex flex-col gap-3 mb-8">
              {q.options.map((option, idx) => {
                const isActive = selected === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => { if (selected === null && !animating) setSelected(idx); }}
                    className={[
                      "w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all bg-white",
                      isActive
                        ? "border-primary bg-primary/8 text-ink shadow-card"
                        : "border-border hover:border-primary/40",
                    ].join(" ")}
                  >
                    <span className={[
                      "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors",
                      isActive ? "bg-primary text-white" : "bg-surface-muted text-ink-muted",
                    ].join(" ")}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 text-ink">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 h-12 rounded-2xl border-2 border-border text-ink-muted font-black text-sm hover:border-ink-muted hover:text-ink transition-colors"
              >
                Поки не знаю
              </button>
              <button
                onClick={handleNext}
                disabled={selected === null}
                className="flex-1 h-12 rounded-2xl bg-primary shadow-press-primary text-white font-black text-sm flex items-center justify-center active:translate-y-1 active:shadow-none transition-transform disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {step < QUESTIONS.length - 1 ? "Далі →" : "Завершити →"}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
