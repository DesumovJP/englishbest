'use client';
import { useState, useEffect } from 'react';

const SLIDES = [
  {
    level: 'A0',
    levelLabel: 'Стартер · 4–6 р.',
    levelColor: 'bg-danger/10 text-danger-dark',
    shadowColor: 'bg-danger/30',
    teacher: { photo: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Olga K.' },
    lesson: 'Урок 3 — Animals & Colors',
    phrase: 'The cat is orange 🐈',
    question: 'Як перекласти?',
    options: ['Кіт помаранчевий', 'Собака жовта', 'Кіт жовтий', 'Миша помаранчева'],
    correct: 0,
    reviewer: { initial: 'О', name: 'Оксана', color: 'bg-danger/10 text-danger-dark' },
    review: 'Донька весь день говорила кольорами англійською 😄',
  },
  {
    level: 'A1',
    levelLabel: 'Початковий · 7–10 р.',
    levelColor: 'bg-accent/10 text-accent-dark',
    shadowColor: 'bg-accent/30',
    teacher: { photo: 'https://randomuser.me/api/portraits/women/65.jpg', name: 'Maria S.' },
    lesson: 'Урок 5 — Daily Routines',
    phrase: 'I ___ breakfast every morning 🍳',
    question: 'Оберіть правильне слово:',
    options: ['eat', 'eats', 'eating', 'ate'],
    correct: 0,
    reviewer: { initial: 'Т', name: 'Тетяна', color: 'bg-accent/10 text-accent-dark' },
    review: 'Син вперше заговорив з іноземцем у магазині 🙌',
  },
  {
    level: 'B1',
    levelLabel: 'Середній · 11–14 р.',
    levelColor: 'bg-success/10 text-success-dark',
    shadowColor: 'bg-success/30',
    teacher: { photo: 'https://randomuser.me/api/portraits/men/32.jpg', name: 'Dmytro P.' },
    lesson: 'Урок 12 — School & Exams',
    phrase: 'She ___ her homework every day 📚',
    question: 'Вставте правильну форму:',
    options: ['does', 'do', 'is doing', 'did'],
    correct: 0,
    reviewer: { initial: 'І', name: 'Ірина', color: 'bg-secondary/10 text-secondary-dark' },
    review: 'Донька склала шкільний тест на відмінно 🎓',
  },
  {
    level: 'B2',
    levelLabel: 'Впевнений · 14+',
    levelColor: 'bg-purple/10 text-purple-dark',
    shadowColor: 'bg-purple/30',
    teacher: { photo: 'https://randomuser.me/api/portraits/women/23.jpg', name: 'Anna V.' },
    lesson: 'Урок 20 — Business English',
    phrase: 'By the time we arrived, they ___ left 🏢',
    question: 'Оберіть правильний час:',
    options: ['had', 'have', 'has', 'were'],
    correct: 0,
    reviewer: { initial: 'М', name: 'Максим', color: 'bg-purple/10 text-purple-dark' },
    review: 'Прийняли на стажування в міжнародну компанію 💼',
  },
];

export function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[active];

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <div className="relative">
        {/* Кольорова тінь під карткою — колір бейджу рівня, ніжна */}
        <div
          className={`absolute -bottom-3 left-6 right-6 h-10 ${slide.shadowColor} rounded-full blur-2xl opacity-40 transition-colors duration-700 pointer-events-none`}
          aria-hidden
        />
      <div className="relative bg-white rounded-2xl shadow-xl border border-primary/10 overflow-hidden">

        {/* Шапка: вчитель + рівень */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.teacher.photo}
                alt={slide.teacher.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-white rounded-full" />
            </div>
            <p className="font-bold text-ink text-sm">{slide.teacher.name}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${slide.levelColor}`}>
            {slide.level} · {slide.levelLabel.split(' · ')[0]}
          </span>
        </div>

        {/* Вправа */}
        <div className="px-6 pb-6">
          {/* Урок — вгорі над фразою */}
          <span className="inline-flex items-center bg-surface-muted text-ink-muted text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {slide.lesson}
          </span>

          {/* Фраза — фіксована висота */}
          <div className="min-h-[3.5rem] flex items-center mb-5">
            <p className="text-2xl font-black text-ink leading-tight">{slide.phrase}</p>
          </div>

          {/* Варіанти — рівномірна сітка */}
          <div className="grid grid-cols-2 gap-2">
            {slide.options.map((opt, i) => (
              <div
                key={opt}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium text-center leading-snug transition-colors ${
                  i === slide.correct
                    ? 'bg-primary/10 text-primary-dark border-2 border-primary/30 font-bold'
                    : 'bg-surface-muted text-ink-muted border-2 border-transparent'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        {/* Відгук — окрема смуга */}
        <div className="bg-surface-muted px-6 py-4 flex items-center gap-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${slide.reviewer.color}`}>
            {slide.reviewer.initial}
          </div>
          <p className="text-sm text-ink-muted leading-snug line-clamp-2">
            <span className="font-semibold text-ink">{slide.reviewer.name}:</span>{' '}
            &ldquo;{slide.review}&rdquo;
          </p>
        </div>

      </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Слайд ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === active ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-border hover:bg-ink-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
