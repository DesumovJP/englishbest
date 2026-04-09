'use client';
import { useState, useEffect } from 'react';
import { ProgressBar } from '@/components/atoms/ProgressBar';

/* ── типи ─────────────────────────────────────── */
type StepId = 'age' | 'level' | 'goal' | 'time' | 'contact' | 'thanks';

interface Step {
  id: StepId;
  question: string;
  emoji: string;
  options?: { label: string; icon: string }[];
}

/* ── кроки квізу ──────────────────────────────── */
const STEPS: Step[] = [
  {
    id: 'age',
    question: 'Скільки років вашій дитині?',
    emoji: '👧',
    options: [
      { label: '4 – 6 років', icon: '🐣' },
      { label: '7 – 10 років', icon: '🎒' },
      { label: '11 – 14 років', icon: '🎧' },
      { label: '14+ / для себе', icon: '🎓' },
    ],
  },
  {
    id: 'level',
    question: 'Який зараз рівень англійської?',
    emoji: '📚',
    options: [
      { label: 'Зовсім нульовий', icon: '🌱' },
      { label: 'Знає кілька слів', icon: '💬' },
      { label: 'Може говорити просто', icon: '🗣️' },
      { label: 'Читає та розуміє', icon: '📖' },
    ],
  },
  {
    id: 'goal',
    question: 'Яка головна ціль навчання?',
    emoji: '🎯',
    options: [
      { label: 'Шкільна програма', icon: '🏫' },
      { label: 'Розмовна англійська', icon: '✈️' },
      { label: 'Підготовка до іспитів', icon: '📝' },
      { label: 'Для задоволення', icon: '🎮' },
    ],
  },
  {
    id: 'time',
    question: 'Коли зручніше займатись?',
    emoji: '⏰',
    options: [
      { label: 'Вранці (до 12:00)', icon: '🌅' },
      { label: 'Вдень (12:00–17:00)', icon: '☀️' },
      { label: 'Ввечері (після 17:00)', icon: '🌙' },
      { label: 'Будь-коли', icon: '🔄' },
    ],
  },
];

const TOTAL_STEPS = STEPS.length + 1; // +1 для форми контактів

/* ── компонент ────────────────────────────────── */
export function QuizWidget({ variant = 'outline' }: { variant?: 'outline' | 'primary' | 'white' }) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [noCall, setNoCall] = useState(false);
  const [messenger, setMessenger] = useState<'viber' | 'telegram' | ''>('');
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  /* Блокуємо скрол body при відкритому модалі */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* Клавіша Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleOpen = () => {
    setCurrentStep(0);
    setAnswers([]);
    setName('');
    setPhone('');
    setNoCall(false);
    setMessenger('');
    setSubmitted(false);
    setSelected(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleOption = (label: string) => {
    setSelected(label);
    setTimeout(() => {
      setAnswers(prev => [...prev, label]);
      setSelected(null);
      setCurrentStep(s => s + 1);
    }, 260);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST до Strapi або CRM
    setSubmitted(true);
  };

  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);
  const step = STEPS[currentStep];
  const isContactStep = currentStep === STEPS.length;

  return (
    <>
      {/* Кнопка-тригер */}
      <button
        onClick={handleOpen}
        className={`inline-flex items-center justify-center gap-2 font-black text-lg px-8 py-4 rounded-2xl transition-opacity ${
          variant === 'primary'
            ? 'bg-gradient-to-br from-primary to-primary-dark hover:opacity-90 text-white shadow-lg shadow-primary/30'
            : variant === 'white'
            ? 'bg-white hover:bg-white/90 text-primary-dark shadow-lg shadow-black/10'
            : 'border-2 border-primary text-primary hover:bg-primary/5'
        }`}
      >
        {variant === 'outline' ? '🎯 Підібрати вчителя' : 'Підібрати вчителя безкоштовно →'}
      </button>

      {/* Full-screen modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-white flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Підбір вчителя"
        >
          {/* Хедер з прогресом */}
          <div className="flex items-center gap-4 px-5 pt-5 pb-4">
            <button
              onClick={handleClose}
              aria-label="Закрити"
              className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-ink-muted hover:bg-border transition-colors flex-shrink-0"
            >
              ✕
            </button>
            <ProgressBar value={progress} size="md" track="bg-surface-muted" label="Прогрес опитування" className="flex-1" />
            <span className="text-sm font-bold text-ink-muted w-12 text-right">
              {submitted ? '🎉' : `${currentStep}/${TOTAL_STEPS}`}
            </span>
          </div>

          {/* Контент */}
          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10 max-w-lg mx-auto w-full">

            {/* Кроки вибору */}
            {!submitted && step && (
              <div className="flex flex-col items-center gap-8 w-full">
                <div className="text-6xl">{step.emoji}</div>
                <h2 className="text-2xl md:text-3xl font-black text-ink text-center leading-snug">
                  {step.question}
                </h2>
                <div className="grid grid-cols-1 gap-3 w-full">
                  {step.options?.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleOption(opt.label)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 font-bold text-left transition-all duration-150 ${
                        selected === opt.label
                          ? 'border-primary bg-primary text-white scale-[0.98]'
                          : 'border-border bg-white text-ink hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      <span className="text-2xl w-8 flex-shrink-0">{opt.icon}</span>
                      <span className="text-base">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Крок контакту */}
            {!submitted && isContactStep && (
              <div className="flex flex-col items-center gap-8 w-full">
                <div className="text-6xl">📞</div>
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-black text-ink">
                    Майже готово!
                  </h2>
                  <p className="text-ink-muted mt-2">
                    Залиште контакти — ми підберемо вчителя і зателефонуємо у зручний для вас час
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                  <input
                    type="text"
                    placeholder="Ваше ім'я"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="h-14 px-5 rounded-2xl border-2 border-border text-ink text-lg font-medium focus:outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="+380 XX XXX XX XX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required={!noCall}
                    autoComplete="tel"
                    className="h-14 px-5 rounded-2xl border-2 border-border text-ink text-lg font-medium focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    disabled={noCall}
                  />

                  {/* "Не телефонуйте" чекбокс */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noCall}
                      onChange={e => { setNoCall(e.target.checked); setMessenger(''); }}
                      className="w-5 h-5 rounded border-border accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-ink-muted">Не телефонуйте мені</span>
                  </label>

                  {/* Вибір месенджера */}
                  {noCall && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-black text-ink-muted uppercase tracking-wide">Напишіть у месенджер:</p>
                      <div className="flex gap-3">
                        {(['viber', 'telegram'] as const).map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMessenger(m)}
                            className={[
                              'flex-1 py-3 rounded-2xl border-2 text-base font-bold transition-all',
                              messenger === m
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-ink-muted hover:border-primary/40',
                            ].join(' ')}
                          >
                            {m === 'viber' ? '💜 Viber' : '✈️ Telegram'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!name || (!noCall ? !phone : !messenger)}
                    className="h-14 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl transition-colors mt-2"
                  >
                    Отримати підбір вчителя →
                  </button>
                  <p className="text-xs text-ink-muted text-center">
                    Натискаючи кнопку, ви погоджуєтесь з{' '}
                    <span className="underline cursor-pointer">умовами використання</span>
                  </p>
                </form>
              </div>
            )}

            {/* Дякуємо */}
            {submitted && (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                  <div className="text-8xl">🦉</div>
                  <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🎉</div>
                </div>
                <h2 className="text-3xl font-black text-ink">Дякуємо, {name}!</h2>
                <div className="bg-primary/10 rounded-3xl px-8 py-6 flex flex-col gap-2">
                  <p className="text-primary font-black text-xl">✅ Заявку прийнято!</p>
                  <p className="text-ink-muted">
                    {noCall && messenger
                      ? `Адміністратор напише вам у ${messenger === 'telegram' ? 'Telegram' : 'Viber'} найближчим часом.`
                      : 'Зателефонуємо у зручний для вас час і підберемо вчителя.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-sm text-ink-muted">
                  <p>📞 Дзвінок з номера <strong>+380 44 XXX XX XX</strong></p>
                  <p>📩 Або напишіть нам у Telegram</p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-4 border-2 border-border text-ink-muted font-semibold px-8 py-3 rounded-2xl hover:bg-surface-muted transition-colors"
                >
                  Закрити
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
