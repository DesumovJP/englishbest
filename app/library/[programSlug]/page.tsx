'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

/* ─── Мок-дані ───────────────────────────────── */
const PROGRAMS = [
  {
    slug: 'starter-kids',
    title: 'Стартер для малюків',
    description: 'Перші слова через ігри, пісні та малюнки. Ідеально для дітей 4–7 років.',
    fullDescription: 'Програма побудована на ігровому підході: кожне заняття — це маленька пригода. Дитина вивчає перші слова через пісні, картинки та рухливі ігри. Ніякого тиску, тільки радість від навчання.',
    level: 'A0',
    headerGradient: 'from-primary to-primary-dark',
    teacher: { name: 'Olga K.', photo: 'https://randomuser.me/api/portraits/women/44.jpg', bio: 'Спеціаліст з дитячої освіти, 8 років досвіду з дітьми 4–8 років.' },
    tags: ['Діти 4–7', 'Ігри', 'Пісні'],
    rating: 4.9, reviews: 124,
    totalLessons: 24, durationWeeks: 12, pricePerLesson: 150,
    sections: [
      { title: 'Модуль 1 — Привітання та знайомство', lessons: ['Hello & Goodbye', 'My name is...', 'How are you?'] },
      { title: 'Модуль 2 — Кольори та числа',         lessons: ['Colors', 'Numbers 1–10', 'Shapes'] },
      { title: 'Модуль 3 — Тварини',                  lessons: ['Farm Animals', 'Wild Animals', 'My Pet'] },
      { title: 'Модуль 4 — Їжа та напої',             lessons: ['Food I Like', 'Drinks', 'At the Table'] },
    ],
    outcomes: ['Знає 150+ слів', 'Розуміє прості команди', 'Вміє представитись', 'Не боїться говорити'],
  },
  {
    slug: 'elementary-kids',
    title: 'Базовий рівень',
    description: 'Розмовна англійська, шкільна програма та улюблені теми дитини.',
    fullDescription: 'Програма охоплює шкільну програму та виходить за її межі — дитина вчиться не лише читати й писати, але й вільно спілкуватись на теми, які їй цікаві.',
    level: 'A1',
    headerGradient: 'from-secondary to-secondary-dark',
    teacher: { name: 'Maria S.', photo: 'https://randomuser.me/api/portraits/women/65.jpg', bio: 'CELTA-сертифікований вчитель, експерт програми A1–A2 для дітей 7–11 років.' },
    tags: ['Діти 7–11', 'Граматика', 'Розмова'],
    rating: 4.8, reviews: 89,
    totalLessons: 32, durationWeeks: 16, pricePerLesson: 150,
    sections: [
      { title: 'Модуль 1 — Present Simple',    lessons: ['Стверджувальні речення', 'Питання', 'Заперечення', 'Практика'] },
      { title: 'Модуль 2 — Повсякденне життя', lessons: ['My Day', 'School', 'Hobbies', 'Weekend'] },
      { title: 'Модуль 3 — Читання та письмо', lessons: ['Reading Short Texts', 'Writing Sentences', 'My Story'] },
    ],
    outcomes: ['Впевнена розмова на побутові теми', 'Present Simple без помилок', 'Читає прості тексти', 'Пише прості листи'],
  },
  {
    slug: 'pre-intermediate',
    title: 'Передсередній рівень',
    description: 'Поглиблена граматика, читання та перші навички письма.',
    fullDescription: 'На цьому рівні дитина переходить від базових фраз до повноцінних діалогів. Розширюється словниковий запас, граматика стає складнішою, зʼявляється письмо.',
    level: 'A2',
    headerGradient: 'from-secondary-dark to-secondary',
    teacher: { name: 'Maria S.', photo: 'https://randomuser.me/api/portraits/women/65.jpg', bio: 'CELTA-сертифікований вчитель, 6 років досвіду.' },
    tags: ['Діти 9–12', 'Письмо', 'Читання'],
    rating: 4.7, reviews: 61,
    totalLessons: 36, durationWeeks: 18, pricePerLesson: 160,
    sections: [
      { title: 'Модуль 1 — Past Simple',  lessons: ['Regular Verbs', 'Irregular Verbs', 'Questions & Negatives'] },
      { title: 'Модуль 2 — Читання',      lessons: ['Short Stories', 'Articles', 'Comprehension'] },
      { title: 'Модуль 3 — Письмо',       lessons: ['Email Writing', 'Describing People', 'My Essay'] },
    ],
    outcomes: ['Past Simple без помилок', 'Читає автентичні тексти', 'Пише короткі есе', 'Розширений словниковий запас'],
  },
  {
    slug: 'intermediate-teens',
    title: 'Середній рівень',
    description: 'Підготовка до шкільних тестів, складна граматика та вимова.',
    fullDescription: 'Програма для підлітків, які хочуть реально підтягнути англійську. Особлива увага — вимові, граматиці B1 та підготовці до шкільних контрольних.',
    level: 'B1',
    headerGradient: 'from-success to-success-dark',
    teacher: { name: 'Dmytro P.', photo: 'https://randomuser.me/api/portraits/men/32.jpg', bio: 'Кандидат філологічних наук, 10 років викладання підліткам.' },
    tags: ['Підлітки', 'Іспити', 'Вимова'],
    rating: 4.8, reviews: 203,
    totalLessons: 40, durationWeeks: 20, pricePerLesson: 170,
    sections: [
      { title: 'Модуль 1 — Граматика B1',         lessons: ['Perfect Tenses', 'Passive Voice', 'Conditionals'] },
      { title: 'Модуль 2 — Вимова',               lessons: ['Sounds & Stress', 'Intonation', 'Connected Speech'] },
      { title: 'Модуль 3 — Підготовка до тестів', lessons: ['Reading Strategies', 'Listening Tasks', 'Mock Test'] },
    ],
    outcomes: ['Складна граматика B1', 'Впевнена вимова', 'Готовність до шкільних тестів', 'Автентичне аудіювання'],
  },
  {
    slug: 'upper-intermediate',
    title: 'Впевнений рівень',
    description: 'Вільна розмова, бізнес-англійська та міжнародні сертифікати.',
    fullDescription: 'Для тих, хто хоче вийти на рівень вільного спілкування. Програма охоплює бізнес-лексику, академічне письмо та підготовку до міжнародних іспитів.',
    level: 'B2',
    headerGradient: 'from-purple to-purple-dark',
    teacher: { name: 'Anna V.', photo: 'https://randomuser.me/api/portraits/women/23.jpg', bio: 'DELTA-сертифікований вчитель, підготувала 200+ студентів до IELTS/FCE.' },
    tags: ['14+', 'Бізнес', 'Сертифікати'],
    rating: 4.9, reviews: 178,
    totalLessons: 48, durationWeeks: 24, pricePerLesson: 185,
    sections: [
      { title: 'Модуль 1 — Вільна розмова',       lessons: ['Debates & Discussions', 'Presentations', 'Storytelling'] },
      { title: 'Модуль 2 — Бізнес англійська',    lessons: ['Emails & Reports', 'Meetings', 'Negotiations'] },
      { title: 'Модуль 3 — Підготовка IELTS/FCE', lessons: ['Reading & Use of English', 'Writing Tasks', 'Speaking Test'] },
    ],
    outcomes: ['Вільна розмова без підготовки', 'Бізнес-листування', 'Готовність до IELTS/FCE', 'C1-рівень розуміння'],
  },
  {
    slug: 'exam-prep',
    title: 'Підготовка до ЗНО / NMT',
    description: 'Цільова підготовка до державних іспитів з максимальним балом.',
    fullDescription: 'Програма повністю побудована на форматі ЗНО/НМТ. Кожне заняття — це тренування реальних завдань з детальним розбором помилок.',
    level: 'B2',
    headerGradient: 'from-ink to-ink/80',
    teacher: { name: 'Anna V.', photo: 'https://randomuser.me/api/portraits/women/23.jpg', bio: 'Досвід підготовки до ЗНО з 2017 року, середній бал учнів — 192/200.' },
    tags: ['Старшокласники', 'ЗНО', 'Тести'],
    rating: 5.0, reviews: 94,
    totalLessons: 40, durationWeeks: 20, pricePerLesson: 185,
    sections: [
      { title: 'Блок 1 — Читання',    lessons: ['Типи завдань', 'Стратегії', 'Тренування'] },
      { title: 'Блок 2 — Граматика',  lessons: ['Типові помилки', 'Use of English', 'Mock Tests'] },
      { title: 'Блок 3 — Аудіювання', lessons: ['Формат ЗНО', 'Тренування', 'Фінальний тест'] },
    ],
    outcomes: ['180+ балів на ЗНО', 'Без граматичних помилок', 'Швидке читання', 'Впевненість на іспиті'],
  },
];

const REVIEWS = [
  { author: 'Тетяна К.', rating: 5, text: 'Дитина обожнює заняття! Вже за місяць почала розуміти мультики англійською.', date: '15 бер 2026' },
  { author: 'Олег П.',   rating: 5, text: 'Вчитель знаходить підхід до кожної дитини. Дуже задоволені результатом.', date: '8 бер 2026' },
  { author: 'Ірина В.',  rating: 4, text: 'Гарна структурована програма. Бачимо реальний прогрес щотижня.', date: '28 лют 2026' },
];

export default function ProgramDetailPage({ params }: { params: Promise<{ programSlug: string }> }) {
  const { programSlug } = use(params);
  const program = PROGRAMS.find(p => p.slug === programSlug);
  if (!program) notFound();

  const [openSection, setOpenSection] = useState<number | null>(0);
  const totalPrice = program.totalLessons * program.pricePerLesson;

  return (
    <div className="flex flex-col gap-5">

      {/* ── iOS-style hero card ──────────────────── */}
      <div className={`rounded-3xl overflow-hidden shadow-lg`}>

        {/* Full-bleed gradient */}
        <div className={`bg-gradient-to-br ${program.headerGradient} px-6 pt-6 pb-14`}>
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/library"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-semibold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Програми
            </Link>
            <span className="text-[11px] font-black tracking-[0.18em] text-white/70 uppercase">{program.level}</span>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight">{program.title}</h1>
          <p className="text-white/65 text-sm mt-2 leading-relaxed max-w-lg">{program.description}</p>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {program.tags.map(t => (
              <span key={t} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/20 text-white/80 border border-white/15">{t}</span>
            ))}
          </div>
        </div>

        {/* White sheet rising */}
        <div className="bg-white rounded-t-3xl -mt-6 px-6 pt-5 pb-5">
          <div className="flex items-center gap-6">
            {[
              { value: program.totalLessons,    label: 'уроків' },
              { value: program.durationWeeks,   label: 'тижнів' },
              { value: `₴\u00a0${program.pricePerLesson}`, label: 'за урок' },
              { value: `★\u00a0${program.rating}`, label: `${program.reviews} відгуків` },
            ].map((m, i, arr) => (
              <div key={i} className={`flex flex-col flex-1 ${i < arr.length - 1 ? 'border-r border-border pr-6' : ''}`}>
                <span className="text-lg font-black text-ink">{m.value}</span>
                <span className="text-[11px] text-ink-muted font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Основний контент ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* Ліво */}
        <div className="flex flex-col gap-4">

          {/* Опис */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-black text-ink mb-2">Про програму</h2>
            <p className="text-sm text-ink-muted leading-relaxed">{program.fullDescription}</p>
          </div>

          {/* Програма занять */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-black text-ink">Програма занять</h2>
            </div>
            <ul className="divide-y divide-border">
              {program.sections.map((sec, i) => (
                <li key={i}>
                  <button
                    onClick={() => setOpenSection(openSection === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-muted/50 transition-colors text-left"
                    aria-expanded={openSection === i}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-surface-muted text-xs font-black text-ink flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <span className="text-sm font-semibold text-ink">{sec.title}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-ink-muted">{sec.lessons.length} уроків</span>
                      <svg className={`w-4 h-4 text-ink-muted transition-transform ${openSection === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>
                  {openSection === i && (
                    <ul className="px-5 pb-3 flex flex-col gap-1">
                      {sec.lessons.map((l, j) => (
                        <li key={j} className="flex items-center gap-3 py-1.5">
                          <span className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 text-[10px] text-ink-muted font-bold">{j + 1}</span>
                          <span className="text-sm text-ink-muted">{l}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Відгуки */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-black text-ink">Відгуки</h2>
              <span className="text-sm text-ink-muted">{program.reviews} відгуків</span>
            </div>
            <ul className="divide-y divide-border">
              {REVIEWS.map((r, i) => (
                <li key={i} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-bold text-ink">{r.author}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-accent text-sm">{'★'.repeat(r.rating)}</span>
                      <span className="text-xs text-ink-muted">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-ink-muted">{r.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Право */}
        <div className="flex flex-col gap-4">

          {/* CTA */}
          <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4">
            <div>
              <p className="text-xs font-black text-ink-muted uppercase tracking-wide mb-1">Вартість</p>
              <p className="text-3xl font-black text-ink">₴&nbsp;{program.pricePerLesson}<span className="text-base text-ink-muted font-normal">/урок</span></p>
              <p className="text-xs text-ink-muted mt-1">Повний курс ≈ ₴&nbsp;{totalPrice.toLocaleString()}</p>
            </div>
            <button className={`w-full py-3 rounded-xl bg-gradient-to-br ${program.headerGradient} text-white font-black text-sm hover:opacity-90 transition-opacity`}>
              Записатись на пробний урок →
            </button>
            <button className="w-full py-2.5 rounded-xl border-2 border-border text-sm font-bold text-ink hover:bg-surface-muted transition-colors">
              Поставити запитання
            </button>
            <p className="text-xs text-ink-muted text-center">Перший урок безкоштовно</p>
          </div>

          {/* Автор */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-3">Автор</p>
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={program.teacher.photo} alt={program.teacher.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" referrerPolicy="no-referrer" />
              <div>
                <p className="font-black text-ink">{program.teacher.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-accent text-sm">★</span>
                  <span className="text-sm font-bold text-ink">{program.rating}</span>
                  <span className="text-xs text-ink-muted">({program.reviews})</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">{program.teacher.bio}</p>
          </div>

          {/* Результати */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-3">Результати після курсу</p>
            <ul className="flex flex-col gap-2">
              {program.outcomes.map(o => (
                <li key={o} className="flex items-start gap-2.5 text-sm text-ink">
                  <span className="text-primary mt-0.5 flex-shrink-0 font-black">✓</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
