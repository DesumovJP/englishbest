'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    emoji: '👤',
    title: 'Індивідуальний',
    highlight: false,
    price: '₴ 380',
    per: 'за урок',
    packages: [
      '₴ 380 / урок — 1 місяць',
      '₴ 340 / урок — 3 місяці',
      '₴ 300 / урок — повний рівень',
    ],
    cta: 'Записатись',
    desc: 'Повна увага вчителя — прогрес в рази швидший. Ідеально для дітей, яким потрібен індивідуальний темп і підхід.',
    color: 'from-violet-50 to-white',
    tabBg: 'bg-violet-100',
    tabText: 'text-violet-700',
    border: 'border-violet-200',
  },
  {
    emoji: '👫',
    title: 'Парний',
    highlight: true,
    price: '₴ 220',
    per: 'за урок / особа',
    packages: [
      'Вдвічі економніше за індивідуальний',
      'Групи підбираємо ми або приводьте друга',
      'Гнучкий розклад',
    ],
    cta: 'Записатись',
    desc: 'Навчайтесь разом із другом або однокласником. Весело, ефективно та значно дешевше.',
    color: 'from-primary/10 to-white',
    tabBg: 'bg-primary/15',
    tabText: 'text-primary-dark',
    border: 'border-primary/30',
  },
  {
    emoji: '👥',
    title: 'Груповий',
    highlight: false,
    price: '₴ 150',
    per: 'за урок / особа',
    packages: [
      'До 6–8 учнів одного рівня',
      'Фіксований розклад',
      'Фокус на розмовній практиці',
    ],
    cta: 'Записатись',
    desc: 'Жвава атмосфера, живе спілкування та командний дух. Найкращий старт для початківців.',
    color: 'from-sky-50 to-white',
    tabBg: 'bg-sky-100',
    tabText: 'text-sky-700',
    border: 'border-sky-200',
  },
  {
    emoji: '☕',
    title: 'Розмовний клуб',
    highlight: false,
    price: '₴ 120',
    per: 'за заняття',
    packages: [
      'Пакет 4 заняття — ₴ 420',
      'Пакет 8 занять — ₴ 800',
      'Різні теми щотижня',
    ],
    cta: 'Спробувати',
    desc: 'Неформальні зустрічі для тих, хто хоче говорити більше. Нові теми щотижня — жодного нудного повтору.',
    color: 'from-amber-50 to-white',
    tabBg: 'bg-amber-100',
    tabText: 'text-amber-700',
    border: 'border-amber-200',
  },
];

export function PricingSection() {
  const [active, setActive] = useState(1);

  const plan = PLANS[active];
  const leftTabs = PLANS.slice(0, active);
  const rightTabs = PLANS.slice(active + 1);

  return (
    <section id="pricing" className="py-20 px-5 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="type-label text-primary mb-3">Прозорі ціни</p>
            <h2 className="type-h1 text-ink">Оберіть свій план</h2>
          </div>
          <p className="text-ink-muted text-sm max-w-xs leading-relaxed">
            Усі плани включають перший пробний урок безкоштовно. Жодних прихованих платежів.
          </p>
        </div>

        {/* Card stage */}
        <div className="flex items-stretch gap-0 min-h-[380px]">

          {/* Left tabs */}
          <div className="flex items-stretch gap-0">
            {leftTabs.map((p, relIdx) => {
              const absIdx = relIdx;
              return (
                <button
                  key={p.title}
                  onClick={() => setActive(absIdx)}
                  className={[
                    'flex flex-col items-center justify-center gap-3 w-14 md:w-16 cursor-pointer',
                    'border-2 border-r-0 rounded-l-2xl transition-all duration-200 hover:w-20',
                    p.tabBg, p.border,
                    'group',
                  ].join(' ')}
                  title={p.title}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span
                    className={[
                      'text-[11px] font-black tracking-wide whitespace-nowrap',
                      'rotate-[-90deg] origin-center',
                      p.tabText,
                    ].join(' ')}
                  >
                    {p.title}
                  </span>
                  <span className={['text-[11px] font-bold whitespace-nowrap rotate-[-90deg]', p.tabText].join(' ')}>
                    {p.price}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active card */}
          <div
            className={[
              'flex-1 rounded-2xl border-2 overflow-hidden flex flex-col',
              'bg-gradient-to-br',
              plan.color,
              plan.highlight ? 'border-primary shadow-xl shadow-primary/10' : 'border-border shadow-xl',
            ].join(' ')}
          >
            {plan.highlight && (
              <div className="bg-primary text-white text-xs font-black text-center py-2 tracking-widest uppercase">
                Найпопулярніше
              </div>
            )}

            <div className={`flex flex-col flex-1 p-7 gap-6 ${plan.highlight ? 'pt-5' : ''}`}>
              {/* Plan header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{plan.emoji}</span>
                  <div>
                    <h3 className="font-black text-ink text-xl">{plan.title}</h3>
                    <p className="text-sm text-ink-muted mt-0.5">{plan.desc}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-4xl font-black text-ink leading-none">{plan.price}</p>
                  <p className="text-xs text-ink-muted mt-1">{plan.per}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/60" />

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1">
                {plan.packages.map(pkg => (
                  <li key={pkg} className="flex items-start gap-2.5 text-sm text-ink leading-snug">
                    <span className="text-primary font-black mt-0.5 flex-shrink-0 text-base">✓</span>
                    {pkg}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="#"
                className={[
                  'block text-center py-3.5 rounded-xl font-black text-sm transition-colors',
                  plan.highlight
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'border-2 border-primary text-primary hover:bg-primary/5',
                ].join(' ')}
              >
                {plan.cta} →
              </Link>
            </div>
          </div>

          {/* Right tabs */}
          <div className="flex items-stretch gap-0">
            {rightTabs.map((p, relIdx) => {
              const absIdx = active + 1 + relIdx;
              return (
                <button
                  key={p.title}
                  onClick={() => setActive(absIdx)}
                  className={[
                    'flex flex-col items-center justify-center gap-3 w-14 md:w-16 cursor-pointer',
                    'border-2 border-l-0 rounded-r-2xl transition-all duration-200 hover:w-20',
                    p.tabBg, p.border,
                    'group',
                  ].join(' ')}
                  title={p.title}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span
                    className={[
                      'text-[11px] font-black tracking-wide whitespace-nowrap',
                      'rotate-90 origin-center',
                      p.tabText,
                    ].join(' ')}
                  >
                    {p.title}
                  </span>
                  <span className={['text-[11px] font-bold whitespace-nowrap rotate-90', p.tabText].join(' ')}>
                    {p.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-ink-muted">
          Маєте питання щодо цін?{' '}
          <span className="text-primary font-bold cursor-pointer hover:underline">
            Напишіть нам — відповімо за 10 хвилин →
          </span>
        </p>
      </div>
    </section>
  );
}
