'use client';

import { useEffect, useState } from 'react';

const REVIEWS = [
  {
    name: 'Олена Коваль',
    child: 'мама Аліси, 6 років',
    photo: 'https://randomuser.me/api/portraits/women/12.jpg',
    rating: 5,
    text: 'Аліса ходить до Olga K. вже 4 місяці. Спочатку була дуже сором\'язлива і відмовлялась говорити. Зараз сама просить «ще один урок» — і це в шість років! Вчителька знаходить підхід через пісні та малюнки, дитина взагалі не відчуває, що це навчання.',
  },
  {
    name: 'Дмитро Бондаренко',
    child: 'тато Миколи, 10 років',
    photo: 'https://randomuser.me/api/portraits/men/22.jpg',
    rating: 5,
    text: 'Микола займається з Maria S. вже більше року. Здав шкільний тест на 94 з 100 — і це після того, як рік до цього мав трійку. Головне — він перестав боятись говорити. Тепер сам дивиться YouTube в оригіналі без субтитрів.',
  },
  {
    name: 'Ірина Захаренко',
    child: 'мама Катерини, 14 років',
    photo: 'https://randomuser.me/api/portraits/women/45.jpg',
    rating: 5,
    text: 'Готуємось до IELTS з Dmytro P. Він не просто "натаскує" на тести — він пояснює логіку мови. Катя вже отримала 6.5 на пробному іспиті, хоча пів року тому навіть Speaking був б\'ю. Дуже вдячні.',
  },
  {
    name: 'Оксана Петренко',
    child: 'мама Дениса, 8 років',
    photo: 'https://randomuser.me/api/portraits/women/33.jpg',
    rating: 5,
    text: 'Пробували кількох онлайн-вчителів до EnglishBest — і скрізь Денис через 2 тижні відмовлявся. Тут вже 3 місяці і жодного разу не капризував. Anna V. якось дуже влучно відчула, що він любить динозаврів, і тепер увесь словник через них.',
  },
  {
    name: 'Андрій Мельник',
    child: 'тато Соні, 11 років',
    photo: 'https://randomuser.me/api/portraits/men/41.jpg',
    rating: 4,
    text: 'Загалом дуже задоволені. Соня реально підтягнула граматику і вже впевненіше читає. Єдине — іноді хотілось би трохи більше домашніх завдань, але, може, це наш особистий запит. Вчителька чудова, розклад гнучкий.',
  },
  {
    name: 'Наталія Шевченко',
    child: 'мама Артема, 7 років',
    photo: 'https://randomuser.me/api/portraits/women/56.jpg',
    rating: 5,
    text: 'Ми переїхали до Польщі і Артему потрібна була англійська дуже швидко — школа тут переважно англомовна. За 2 місяці він вже розуміє більшість уроків. Менеджер одразу підібрав вчителя, який мав досвід саме з дітьми-емігрантами.',
  },
  {
    name: 'Роман Кравченко',
    child: 'тато Вікторії, 13 років',
    photo: 'https://randomuser.me/api/portraits/men/55.jpg',
    rating: 5,
    text: 'Вікторія сама попросила записатись після того, як побачила рекламу. Думав — забаганка на тиждень. Минуло 5 місяців, жодного пропущеного уроку. Каже, що з Dmytro P. «нескучно», а це від підлітка дуже красномовно.',
  },
  {
    name: 'Марина Савченко',
    child: 'мама близнюків Льоші та Діми, 9 років',
    photo: 'https://randomuser.me/api/portraits/women/67.jpg',
    rating: 5,
    text: 'Записали обох на парний формат — виявилось ідеальним рішенням. Вони змагаються між собою, хто більше запам\'ятав, і це дає неймовірну мотивацію. Ціна теж приємна порівняно з індивідуальним. Рекомендую батькам з кількома дітьми.',
  },
];

function getPerPage(w: number) {
  if (w < 640) return 1;
  if (w < 1024) return 2;
  return 3;
}

export function ReviewsSlider() {
  const [index, setIndex] = useState(0);
  const [perPage, setPerPage] = useState(3);

  useEffect(() => {
    const update = () => setPerPage(getPerPage(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const total = REVIEWS.length;
  const maxIndex = Math.max(0, total - perPage);

  useEffect(() => {
    setIndex(i => Math.min(i, maxIndex));
  }, [maxIndex]);

  function prev() {
    setIndex(i => Math.max(0, i - 1));
  }
  function next() {
    setIndex(i => Math.min(maxIndex, i + 1));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="type-label text-primary mb-3">Відгуки</p>
          <h2 className="type-h1 text-ink">Батьки кажуть про нас</h2>
        </div>
        {/* Стрілки */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label="Попередній"
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-faint disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={index >= maxIndex}
            aria-label="Наступний"
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-faint disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slider track */}
      <div className="overflow-hidden">
        <div
          className="flex gap-5 transition-transform duration-400 ease-in-out"
          style={{ transform: `translateX(calc(-${index} * (100% / ${perPage} + 20px / ${perPage} * (${perPage} - 1))))` }}
        >
          {REVIEWS.map(r => (
            <div
              key={r.name}
              className="bg-surface border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-3 md:gap-4 flex-shrink-0 shadow-card"
              style={{ width: `calc(100% / ${perPage} - ${(perPage - 1) * 20 / perPage}px)` }}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < r.rating ? 'text-accent' : 'text-ink-faint/30'}`}>★</span>
                ))}
              </div>
              <p className="text-sm text-ink-muted leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.photo} alt={r.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-ink">{r.name}</p>
                  <p className="text-xs text-ink-faint">{r.child}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-1.5 justify-center">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Сторінка ${i + 1}`}
            className={`rounded-full transition-all ${i === index ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border hover:bg-ink-faint'}`}
          />
        ))}
      </div>
    </div>
  );
}
