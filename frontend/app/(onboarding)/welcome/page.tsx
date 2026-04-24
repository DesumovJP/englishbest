"use client";

import { useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/atoms/ProgressBar";

type StepId = "age" | "level" | "goal" | "time";

interface QuizStep {
  id: StepId;
  question: string;
  options: { label: string; icon: string }[];
}

const STEPS: QuizStep[] = [
  {
    id: "age",
    question: "Скільки років учню?",
    options: [
      { label: "4 – 6 років",     icon: "🐣" },
      { label: "7 – 10 років",    icon: "🎒" },
      { label: "11 – 14 років",   icon: "🎧" },
      { label: "14+ / для себе",  icon: "🎓" },
    ],
  },
  {
    id: "level",
    question: "Який зараз рівень англійської?",
    options: [
      { label: "Зовсім нульовий",       icon: "🌱" },
      { label: "Знає кілька слів",      icon: "💬" },
      { label: "Може говорити просто",  icon: "🗣️" },
      { label: "Читає та розуміє",      icon: "📖" },
    ],
  },
  {
    id: "goal",
    question: "Яка головна ціль навчання?",
    options: [
      { label: "Шкільна програма",        icon: "🏫" },
      { label: "Розмовна англійська",     icon: "✈️" },
      { label: "Підготовка до іспитів",   icon: "📝" },
      { label: "Для задоволення",         icon: "🎮" },
    ],
  },
  {
    id: "time",
    question: "Коли зручніше займатись?",
    options: [
      { label: "Вранці (до 12:00)",       icon: "🌅" },
      { label: "Вдень (12:00 – 17:00)",   icon: "☀️" },
      { label: "Ввечері (після 17:00)",   icon: "🌙" },
      { label: "Будь-коли",               icon: "🔄" },
    ],
  },
];

type Phase = "intro" | "quiz" | "contact" | "thanks";

const TOTAL = STEPS.length + 1; // +1 for contact step

export default function WelcomePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [, setAnswers] = useState<Record<StepId, string>>({} as Record<StepId, string>);
  const [selected, setSelected] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [noCall, setNoCall] = useState(false);
  const [messenger, setMessenger] = useState<"viber" | "telegram" | "">("");

  const current = STEPS[step];
  const completedSteps = phase === "intro" ? 0 : phase === "thanks" ? TOTAL : phase === "contact" ? STEPS.length : step;
  const progress = Math.round((completedSteps / TOTAL) * 100);

  function pickOption(label: string) {
    if (!current) return;
    setSelected(label);
    setTimeout(() => {
      setAnswers(prev => ({ ...prev, [current.id]: label }));
      setSelected(null);
      if (step + 1 < STEPS.length) setStep(s => s + 1);
      else setPhase("contact");
    }, 220);
  }

  function back() {
    if (phase === "contact") {
      setPhase("quiz");
      setStep(STEPS.length - 1);
      return;
    }
    if (phase === "quiz" && step > 0) {
      setStep(s => s - 1);
      return;
    }
    if (phase === "quiz" && step === 0) {
      setPhase("intro");
      return;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Lead submission wiring lives in Phase E (PROJECT.md §2). Accept client-side for now.
    setPhase("thanks");
  }

  return (
    <div className="min-h-dvh bg-surface-muted/60 flex flex-col">
      {/* Top bar with fox + progress */}
      <header className="bg-surface border-b border-border flex items-center gap-4 px-4 sm:px-6 h-16">
        <Link href="/home" className="flex items-center gap-2.5 flex-shrink-0">
          <span className="relative w-9 h-9 rounded-2xl bg-primary/10 ring-1 ring-primary/20 overflow-hidden flex items-center justify-center">
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

        {phase !== "intro" && (
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-md mx-auto">
            <ProgressBar
              value={progress}
              size="md"
              track="bg-surface-muted"
              label="Прогрес опитування"
              className="flex-1"
            />
            <span className="text-[12px] font-black text-ink-muted tabular-nums w-12 text-right">
              {phase === "thanks" ? "✓" : `${completedSteps}/${TOTAL}`}
            </span>
          </div>
        )}

        {phase !== "intro" && phase !== "thanks" ? (
          <button
            onClick={back}
            aria-label="Назад"
            className="w-10 h-10 rounded-xl bg-surface-muted hover:bg-border text-ink-muted hover:text-ink flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <Link
            href="/home"
            className="text-[12px] font-semibold text-ink-muted hover:text-ink px-3 h-9 rounded-lg hover:bg-surface-muted inline-flex items-center transition-colors ml-auto"
          >
            ← На головну
          </Link>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* ── INTRO ── fox greeting */}
          {phase === "intro" && (
            <div className="flex flex-col items-center text-center gap-6 animate-fade-in-up">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full bg-primary/20 blur-2xl" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/characters/fox/hi.png"
                  alt="Лисеня вітається"
                  className="relative w-44 h-44 object-contain animate-float drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                />
              </div>

              <div className="relative bg-surface rounded-3xl px-6 py-5 shadow-card-md border border-border w-full">
                <div
                  aria-hidden
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-l border-t border-border rotate-45"
                />
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Привіт!</p>
                <h1 className="text-3xl font-black text-ink tracking-tight">Я — Лисеня</h1>
                <p className="text-[14px] text-ink-muted mt-2 leading-relaxed">
                  Підберу ідеального вчителя англійської та програму під вік і рівень.
                  Відповісти на 4 запитання — <span className="font-black text-ink">займе хвилинку</span>.
                </p>
              </div>

              <button
                onClick={() => setPhase("quiz")}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black text-[15px] shadow-press-primary active:translate-y-1 active:shadow-none transition-transform"
              >
                Розпочати опитування →
              </button>

              <p className="text-[11px] text-ink-faint">
                Вже маєте акаунт?{" "}
                <Link href="/login" className="font-black text-ink-muted hover:text-ink transition-colors">
                  Увійти
                </Link>
              </p>
            </div>
          )}

          {/* ── QUIZ step ── */}
          {phase === "quiz" && current && (
            <div className="flex flex-col gap-6 animate-fade-in-up">
              <div className="flex flex-col items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-primary/10 text-primary-dark text-[10px] font-black uppercase tracking-widest">
                  Крок {step + 1} з {TOTAL}
                </span>
                <h2 className="text-2xl sm:text-[26px] font-black text-ink text-center tracking-tight leading-snug">
                  {current.question}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {current.options.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => pickOption(opt.label)}
                    className={[
                      "flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 font-black",
                      selected === opt.label
                        ? "border-primary bg-primary text-white scale-[0.98]"
                        : "border-border bg-surface text-ink hover:border-primary/50 hover:bg-primary/5",
                    ].join(" ")}
                  >
                    <span className="text-2xl w-8 flex-shrink-0" aria-hidden>{opt.icon}</span>
                    <span className="text-[15px]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── CONTACT ── */}
          {phase === "contact" && (
            <div className="flex flex-col gap-6 animate-fade-in-up">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-2 rounded-full bg-primary/20 blur-xl" aria-hidden />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/characters/fox/hi.png"
                    alt=""
                    aria-hidden
                    className="relative w-24 h-24 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-ink tracking-tight">Майже готово!</h2>
                  <p className="text-[13px] text-ink-muted mt-2 leading-relaxed max-w-sm">
                    Залиште контакти — ми підберемо вчителя і зателефонуємо у зручний час.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="w-name" className="text-[11px] font-black text-ink-muted uppercase tracking-wider">
                    Ім&apos;я
                  </label>
                  <input
                    id="w-name"
                    type="text"
                    placeholder="Як вас звати?"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="h-12 px-4 rounded-2xl border border-border bg-surface text-ink text-sm font-medium placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="w-phone" className="text-[11px] font-black text-ink-muted uppercase tracking-wider">
                    Телефон
                  </label>
                  <input
                    id="w-phone"
                    type="tel"
                    placeholder="+380 XX XXX XX XX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required={!noCall}
                    autoComplete="tel"
                    disabled={noCall}
                    className="h-12 px-4 rounded-2xl border border-border bg-surface text-ink text-sm font-medium placeholder:text-ink-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-50"
                  />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={noCall}
                    onChange={e => { setNoCall(e.target.checked); setMessenger(""); }}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-[13px] text-ink-muted">Не телефонуйте — напишіть у месенджер</span>
                </label>

                {noCall && (
                  <div className="flex gap-2">
                    {(["viber", "telegram"] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMessenger(m)}
                        className={[
                          "flex-1 h-11 rounded-2xl text-[13px] font-black transition-all border-2",
                          messenger === m
                            ? "bg-primary/10 border-primary text-primary-dark"
                            : "bg-surface border-border text-ink-muted hover:border-primary/40",
                        ].join(" ")}
                      >
                        {m === "viber" ? "💜 Viber" : "✈️ Telegram"}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!name || (!noCall ? !phone : !messenger)}
                  className="h-14 rounded-2xl bg-primary text-white font-black text-[15px] shadow-press-primary active:translate-y-1 active:shadow-none transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:translate-y-0 mt-2"
                >
                  Отримати підбір вчителя →
                </button>

                <p className="text-[11px] text-ink-faint text-center">
                  Натискаючи кнопку, ви погоджуєтесь з{" "}
                  <Link href="#" className="font-black text-ink-muted hover:text-ink transition-colors">
                    умовами використання
                  </Link>
                  .
                </p>
              </form>
            </div>
          )}

          {/* ── THANKS ── */}
          {phase === "thanks" && (
            <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-2 rounded-full bg-primary/25 blur-2xl" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/characters/fox/hi.png"
                  alt=""
                  aria-hidden
                  className="relative w-32 h-32 object-contain animate-float drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                />
                <div className="absolute -top-1 -right-1 text-3xl animate-bounce" aria-hidden>🎉</div>
              </div>

              <h2 className="text-3xl font-black text-ink tracking-tight">Дякуємо, {name}!</h2>

              <div className="w-full rounded-3xl border border-primary/20 bg-primary/5 p-5 flex flex-col gap-2">
                <p className="text-primary-dark font-black text-[15px]">✅ Заявку прийнято</p>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  {noCall && messenger
                    ? `Адміністратор напише у ${messenger === "telegram" ? "Telegram" : "Viber"} найближчим часом.`
                    : "Зателефонуємо у зручний для вас час і підберемо вчителя під відповіді з анкети."}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-[12px] text-ink-muted">
                <p>📞 Дзвінок з номера <strong className="text-ink">+380 44 XXX XX XX</strong></p>
                <p>📩 Або напишіть нам у Telegram</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <Link
                  href="/home"
                  className="flex-1 h-12 rounded-2xl border-2 border-border bg-surface text-ink font-black text-[13px] inline-flex items-center justify-center hover:border-primary/40 transition-colors"
                >
                  На головну
                </Link>
                <Link
                  href="/login"
                  className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-[13px] shadow-press-primary active:translate-y-1 active:shadow-none inline-flex items-center justify-center transition-transform"
                >
                  Перейти до кабінету →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
