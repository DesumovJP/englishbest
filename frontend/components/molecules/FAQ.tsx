'use client';
import { useState } from 'react';

const questions = [
  {
    q: 'Скільки часу потрібно дитині, щоб почати говорити англійською?',
    a: 'Вже після 8–12 занять більшість дітей починають розуміти просту мову та відповідати на базові запитання. Перші помітні результати — активний словниковий запас 200+ слів — зʼявляються через 2–3 місяці регулярних занять.',
  },
  {
    q: 'Яка тривалість одного уроку?',
    a: 'Для дітей 5–8 років — 30 хвилин (оптимально для концентрації). Для дітей 9–12 років — 45 хвилин. Для підлітків і дорослих — 60 хвилин. Тривалість можна скоригувати індивідуально.',
  },
  {
    q: 'Що входить у безкоштовний пробний урок?',
    a: 'Перший урок повністю безкоштовний: вчитель визначає рівень дитини, знайомиться, проводить міні-урок у форматі гри. Після заняття ви отримаєте рекомендацію щодо програми та розкладу.',
  },
  {
    q: 'Що, якщо вчитель не підійде дитині?',
    a: 'Таке буває, і це нормально — хімія між людьми важлива. Напишіть нам, і ми підберемо іншого вчителя. Це безкоштовно і займає максимум день.',
  },
  {
    q: 'Як проходять заняття технічно? Які потрібні пристрої?',
    a: 'Заняття проходять у нашому власному онлайн-класі — нічого встановлювати не потрібно. Достатньо браузера (Chrome/Safari) на будь-якому пристрої: компʼютер, планшет або смартфон.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {questions.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border border-purple/20 overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-purple/5 transition-colors"
          >
            <span className="font-semibold text-ink text-base leading-snug">
              {item.q}
            </span>
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-full bg-purple/10 flex items-center justify-center text-purple-dark font-bold text-lg transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}
              aria-hidden
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 bg-white text-ink-muted leading-relaxed text-sm">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
