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
  A1: { name: "Початківець",       color: "text-ink",       bg: "bg-surface-muted", description: "Вивчаєш перші слова та базові фрази. Відмінне місце для старту!" },
  A2: { name: "Елементарний",      color: "text-secondary", bg: "bg-secondary/10",  description: "Розумієш прості речення та можеш спілкуватись у звичних ситуаціях." },
  B1: { name: "Середній",          color: "text-accent",    bg: "bg-accent/10",     description: "Справляєшся з більшістю ситуацій під час подорожей та роботи." },
  B2: { name: "Вище середнього",   color: "text-primary",   bg: "bg-primary/10",    description: "Вільно спілкуєшся з носіями мови на широке коло тем." },
  C1: { name: "Просунутий",        color: "text-danger",    bg: "bg-danger/10",     description: "Використовуєш мову гнучко та ефективно для соціальних і професійних цілей." },
};

// -1 = "не знаю"
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
    }, 300);
  }

  function handleNext() {
    if (selected === null) return;
    advance(selected);
  }

  // "Поки не знаю" — якщо A1 питання, завершує тест з A1
  function handleSkip() {
    if (step === 0) {
      setSkippedEarly(true);
    } else {
      advance(-1);
    }
  }

  const progressPct = (step / QUESTIONS.length) * 100;

  if (isResult && level) {
    const info = LEVEL_LABELS[level];
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5 py-16 text-center">
        <div className="animate-bounce-in text-7xl mb-6">🎉</div>

        <div className="animate-fade-in-up anim-delay-200">
          <p className="type-label text-ink-muted mb-4">
            Ваш рівень
          </p>
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${info.bg} mb-4`}>
            <span className={`type-h1 ${info.color}`}>{level}</span>
            <span className={`type-h3 ${info.color}`}>{info.name}</span>
          </div>
          <p className="text-ink-muted text-sm max-w-xs mx-auto leading-relaxed mb-10">
            {info.description}
          </p>
        </div>

        <div className="animate-fade-in-up anim-delay-400">
          <button
            onClick={() => router.push("/companion")}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-black text-base px-10 py-4 rounded-2xl transition-colors"
          >
            Продовжити →
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];

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
        <span className="text-xs font-semibold text-ink-muted">
          {step + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-border">
        <div
          className="h-2 bg-primary rounded-r-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">
          <div className={`transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-surface-muted text-ink-muted uppercase tracking-wide">
                Рівень {q.level}
              </span>
            </div>

            <h2 className="type-h3 text-ink mb-8 break-words">{q.question}</h2>

            <div className="flex flex-col gap-3 mb-8">
              {q.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => { if (selected === null && !animating) setSelected(idx); }}
                  className={[
                    "w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-150",
                    selected === idx
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface hover:border-primary/40 hover:bg-surface-muted text-ink",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className={[
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black flex-shrink-0",
                      selected === idx ? "border-primary bg-primary text-white" : "border-border text-ink-muted",
                    ].join(" ")}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-4 rounded-2xl border-2 border-border text-ink-muted font-black text-sm hover:border-ink-muted hover:text-ink transition-colors"
              >
                Поки не знаю
              </button>
              <button
                onClick={handleNext}
                disabled={selected === null}
                className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step < QUESTIONS.length - 1 ? "Далі →" : "Завершити →"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
