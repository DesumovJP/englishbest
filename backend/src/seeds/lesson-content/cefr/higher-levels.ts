import type { CourseSeed, LessonStep } from '../types';

/**
 * A2..C2 catalog — course shells.
 *
 * Each course has 2 sample lessons (high-quality content) so that the
 * course appears in the kids school listing and a curious learner can
 * try it. The remaining 1–3 lessons per course are intentionally
 * deferred to future content sessions; teachers can also extend any
 * course via the `/dashboard/teacher-library` editor without touching
 * seeds. See `COURSES.md` for the per-course brief.
 */

// Helper for translate-step accepted-answers boilerplate so we don't
// hand-roll 5 variants every time. Lower-case + with/without trailing
// punctuation + the original.
function accepted(answer: string, extras: string[] = []): string[] {
  const noPunct = answer.replace(/[.!?]$/, '');
  const lc = answer.toLowerCase();
  const lcNoPunct = noPunct.toLowerCase();
  return Array.from(new Set([answer, noPunct, lc, lcNoPunct, ...extras]));
}

// Helper for the standard 2-sample-lesson course so we don't repeat the
// boilerplate. Real content per course is in the `lessons` arg.
function shellCourse(
  course: Omit<CourseSeed, 'lessons'>,
  lessons: CourseSeed['lessons'],
): CourseSeed {
  return { ...course, lessons };
}

// ═══════════════════════════════════════════════════════════════════════
// A2 — Pre-Intermediate (2 courses)
// ═══════════════════════════════════════════════════════════════════════

export const a2FoodAndDrinks = shellCourse(
  {
    slug: 'a2-food-and-drinks',
    createIfMissing: {
      title: 'Food & Drinks',
      titleUa: 'Їжа і напої',
      subtitle: 'A2 · 5 уроків · долучаємось 2 з 5',
      description:
        'Здорове й смачне, прийоми їжі, ресторан, кулінарні дієслова, кухні світу. Працюємо з present simple і дієсловами стану «like / love / hate».',
      descriptionShort: 'Лексика їжі, ресторан, кулінарні дієслова.',
      level: 'A2',
      audience: 'kids',
      kind: 'course',
      iconEmoji: '🍎',
      tags: ['kids', 'a2', 'food'],
    },
  },
  [
    {
      slug: 'a2-healthy-tasty',
      title: 'Healthy & Tasty',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 9,
      xp: 15,
      sectionSlug: 'a2-food',
      sectionTitle: 'Юніт 1 · Кухня',
      sectionOrder: 0,
      isFree: true,
      topic: 'food-vocab',
      steps: [
        {
          id: 'a2-ht-theory',
          type: 'theory',
          title: 'Smачно і корисно 🥦',
          body: 'Овочі, фрукти, солодке. «Healthy» — корисно, «tasty» — смачно. Ставимо ці слова перед іменником: «a tasty cake».',
          examples: [
            { en: 'fruit', ua: 'фрукт' },
            { en: 'vegetable', ua: 'овоч' },
            { en: 'sweet', ua: 'солодощі' },
            { en: 'healthy', ua: 'здоровий, корисний' },
            { en: 'tasty', ua: 'смачний' },
          ],
        },
        {
          id: 'a2-ht-mc1',
          type: 'multiple-choice',
          question: 'Який варіант — фрукт?',
          options: ['carrot', 'apple', 'broccoli', 'tomato'],
          correctIndex: 1,
        } as LessonStep,
        {
          id: 'a2-ht-mc2',
          type: 'multiple-choice',
          question: '«Tasty» — це…',
          options: ['здоровий', 'смачний', 'солодкий', 'дорогий'],
          correctIndex: 1,
        },
        {
          id: 'a2-ht-fill',
          type: 'fill-blank',
          before: 'Carrots are',
          after: '.',
          answer: 'healthy',
          hint: 'Морква — корисна.',
        },
        {
          id: 'a2-ht-match',
          type: 'match-pairs',
          prompt: 'Зʼєднай:',
          pairs: [
            { left: 'fruit', right: 'фрукт' },
            { left: 'vegetable', right: 'овоч' },
            { left: 'sweet', right: 'солодощі' },
            { left: 'healthy', right: 'корисний' },
          ],
        },
        {
          id: 'a2-ht-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Овочі дуже корисні.',
          answer: 'Vegetables are very healthy.',
          acceptedAnswers: accepted('Vegetables are very healthy.', [
            'vegetables are healthy',
            'Vegetables are healthy',
          ]),
        },
      ],
    },
    {
      slug: 'a2-restaurant',
      title: 'In the Restaurant',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 10,
      xp: 15,
      sectionSlug: 'a2-food',
      sectionTitle: 'Юніт 1 · Кухня',
      sectionOrder: 0,
      topic: 'ordering',
      steps: [
        {
          id: 'a2-rt-theory',
          type: 'theory',
          title: 'Замовляємо 🍽️',
          body: 'Ввічливо просити їжу: «Can I have…», «I\'d like…». «I\'d» = «I would» — більш формальне.',
          examples: [
            { en: 'Can I have a pizza, please?', ua: 'Можна піцу, будь ласка?' },
            { en: "I'd like some water.", ua: 'Я б хотів води.' },
            { en: 'How much is it?', ua: 'Скільки коштує?' },
            { en: "Here's your order.", ua: 'Ось ваше замовлення.' },
          ],
          tip: '💡 «Some» — для незліченних і кількості: «some water», «some bread».',
        },
        {
          id: 'a2-rt-mc1',
          type: 'multiple-choice',
          question: 'Як ввічливо попросити води?',
          options: [
            'Give me water',
            "I'd like some water, please",
            'I want water now',
            'Water!',
          ],
          correctIndex: 1,
        },
        {
          id: 'a2-rt-fill',
          type: 'fill-blank',
          before: 'Can I',
          after: ' a pizza?',
          answer: 'have',
          hint: 'Що ми «маємо» в ресторані?',
        },
        {
          id: 'a2-rt-match',
          type: 'match-pairs',
          prompt: 'Зʼєднай:',
          pairs: [
            { left: 'order', right: 'замовлення' },
            { left: 'menu', right: 'меню' },
            { left: 'waiter', right: 'офіціант' },
            { left: 'bill', right: 'рахунок' },
          ],
        },
        {
          id: 'a2-rt-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Я хотів би сік, будь ласка.',
          answer: "I'd like some juice, please.",
          acceptedAnswers: accepted("I'd like some juice, please.", [
            'i would like some juice please',
            'i want some juice please',
          ]),
        },
      ],
    },
  ],
);

export const a2MyDay = shellCourse(
  {
    slug: 'a2-my-day',
    createIfMissing: {
      title: 'My Daily Routine',
      titleUa: 'Мій день',
      subtitle: 'A2 · 5 уроків · долучаємось 2 з 5',
      description:
        'Котра година, ранкова рутина, після школи, хобі, плани на вихідні. Граматика: present simple + frequency adverbs, present continuous для планів.',
      descriptionShort: 'Час, рутина, плани на вихідні.',
      level: 'A2',
      audience: 'kids',
      kind: 'course',
      iconEmoji: '🕐',
      tags: ['kids', 'a2', 'routine'],
    },
  },
  [
    {
      slug: 'a2-telling-time',
      title: 'Telling Time',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 9,
      xp: 15,
      sectionSlug: 'a2-routine',
      sectionTitle: 'Юніт 1 · Час',
      sectionOrder: 0,
      isFree: true,
      topic: 'time',
      steps: [
        {
          id: 'a2-tt-theory',
          type: 'theory',
          title: 'Котра година? ⏰',
          body: '«It\'s seven o\'clock» = рівно 7. «Half past seven» = пів на 8 (тобто 7:30). «Quarter past» = 15 хв після, «quarter to» = 15 хв до.',
          examples: [
            { en: "It's seven o'clock.", ua: '7:00 рівно.' },
            { en: "It's half past seven.", ua: '7:30.' },
            { en: "It's quarter past nine.", ua: '9:15.' },
            { en: "It's quarter to ten.", ua: '9:45.' },
          ],
        },
        {
          id: 'a2-tt-mc1',
          type: 'multiple-choice',
          question: '7:30 англійською — це…',
          options: [
            'half past seven',
            'quarter past seven',
            'quarter to seven',
            'seven thirty past',
          ],
          correctIndex: 0,
        },
        {
          id: 'a2-tt-mc2',
          type: 'multiple-choice',
          question: 'А 9:45?',
          options: [
            'quarter past nine',
            'quarter to ten',
            'half past nine',
            'ten quarter',
          ],
          correctIndex: 1,
        },
        {
          id: 'a2-tt-fill',
          type: 'fill-blank',
          before: "It's",
          after: ' past eight.',
          answer: 'half',
          hint: '8:30 = пів на 9 = "half past 8".',
        },
        {
          id: 'a2-tt-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Зараз чверть на третю.',
          answer: "It's quarter past two.",
          acceptedAnswers: accepted("It's quarter past two.", [
            "it is quarter past two",
            "it's a quarter past two",
          ]),
        },
      ],
    },
    {
      slug: 'a2-morning-routine',
      title: 'Morning Routine',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 9,
      xp: 15,
      sectionSlug: 'a2-routine',
      sectionTitle: 'Юніт 1 · Час',
      sectionOrder: 0,
      topic: 'routine',
      steps: [
        {
          id: 'a2-mr-theory',
          type: 'theory',
          title: 'Ранкова рутина ☀️',
          body: 'Дієслова, які показують послідовність: «get up» (вставати), «brush teeth» (чистити зуби), «have breakfast» (снідати).',
          examples: [
            { en: 'I get up at 7.', ua: 'Я встаю о 7-й.' },
            { en: 'I brush my teeth.', ua: 'Я чищу зуби.' },
            { en: 'I have breakfast.', ua: 'Я снідаю.' },
            { en: 'I go to school.', ua: 'Я йду до школи.' },
          ],
          tip: '💡 «Have breakfast / lunch / dinner» — без «a / the».',
        },
        {
          id: 'a2-mr-mc1',
          type: 'multiple-choice',
          question: '«Get up» — це…',
          options: ['прокидатись', 'вставати з ліжка', 'снідати', 'мити обличчя'],
          correctIndex: 1,
        },
        {
          id: 'a2-mr-fill',
          type: 'fill-blank',
          before: 'I',
          after: ' my teeth at 7:15.',
          answer: 'brush',
          hint: 'Дієслово для зубів.',
        },
        {
          id: 'a2-mr-order',
          type: 'word-order',
          prompt: 'Склади речення:',
          translation: 'Я снідаю о восьмій.',
          words: ['breakfast', 'I', 'eight', 'have', 'at'],
          answer: ['I', 'have', 'breakfast', 'at', 'eight'],
        },
        {
          id: 'a2-mr-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Я встаю о сьомій.',
          answer: 'I get up at seven.',
          acceptedAnswers: accepted('I get up at seven.', [
            'i wake up at 7',
            'i get up at 7',
          ]),
        },
      ],
    },
  ],
);

// ═══════════════════════════════════════════════════════════════════════
// B1 — Intermediate (2 courses)
// ═══════════════════════════════════════════════════════════════════════

export const b1TravelStories = shellCourse(
  {
    slug: 'b1-travel-stories',
    createIfMissing: {
      title: 'Travel Stories',
      titleUa: 'Подорожі',
      subtitle: 'B1 · 4 уроки · долучаємось 2 з 4',
      description:
        'Минулі пригоди, аеропорт, твоя найкраща поїздка, культурні відмінності. Past simple regular/irregular, comparative adjectives, «would» для гіпотез.',
      descriptionShort: 'Past simple, аеропорт, культури світу.',
      level: 'B1',
      audience: 'kids',
      kind: 'course',
      iconEmoji: '✈️',
      tags: ['kids', 'b1', 'travel', 'past-simple'],
    },
  },
  [
    {
      slug: 'b1-past-adventures',
      title: 'Past Adventures',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 10,
      xp: 15,
      sectionSlug: 'b1-travel',
      sectionTitle: 'Юніт 1 · Подорожі',
      sectionOrder: 0,
      isFree: true,
      topic: 'past-simple',
      steps: [
        {
          id: 'b1-pa-theory',
          type: 'theory',
          title: 'Минулий час ⏪',
          body: 'Регулярні дієслова: додаємо «-ed» (play → played, walk → walked). Нерегулярні треба запамʼятати: go → went, see → saw, eat → ate.',
          examples: [
            { en: 'I played football yesterday.', ua: 'Я грав у футбол учора.' },
            { en: 'We went to the beach.', ua: 'Ми ходили на пляж.' },
            { en: 'She saw a movie.', ua: 'Вона дивилася фільм.' },
            { en: 'They ate ice cream.', ua: 'Вони їли морозиво.' },
          ],
          tip: '💡 Заперечення: «I didn\'t go» (не ходив).',
        },
        {
          id: 'b1-pa-mc1',
          type: 'multiple-choice',
          question: 'Past simple від «go» — це…',
          options: ['goed', 'went', 'going', 'go-ed'],
          correctIndex: 1,
        },
        {
          id: 'b1-pa-mc2',
          type: 'multiple-choice',
          question: 'А від «play»?',
          options: ['plaied', 'played', 'plaed', 'played-ed'],
          correctIndex: 1,
        },
        {
          id: 'b1-pa-fill',
          type: 'fill-blank',
          before: 'Last summer we',
          after: ' to Spain.',
          answer: 'went',
          hint: 'Past simple від «go».',
        },
        {
          id: 'b1-pa-match',
          type: 'match-pairs',
          prompt: 'Зʼєднай дієслово з його past simple формою:',
          pairs: [
            { left: 'go', right: 'went' },
            { left: 'see', right: 'saw' },
            { left: 'eat', right: 'ate' },
            { left: 'play', right: 'played' },
          ],
        },
        {
          id: 'b1-pa-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Учора я бачив свого друга.',
          answer: 'Yesterday I saw my friend.',
          acceptedAnswers: accepted('Yesterday I saw my friend.', [
            'i saw my friend yesterday',
            'I saw my friend yesterday',
          ]),
        },
      ],
    },
    {
      slug: 'b1-airport',
      title: 'At the Airport',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 10,
      xp: 15,
      sectionSlug: 'b1-travel',
      sectionTitle: 'Юніт 1 · Подорожі',
      sectionOrder: 0,
      topic: 'airport',
      steps: [
        {
          id: 'b1-ap-theory',
          type: 'theory',
          title: 'В аеропорту 🛫',
          body: 'Найкорисніші слова в аеропорту: gate (вихід), boarding (посадка), passport, luggage (багаж), delayed (затримано).',
          examples: [
            { en: 'gate', ua: 'вихід на посадку' },
            { en: 'boarding pass', ua: 'посадковий талон' },
            { en: 'luggage', ua: 'багаж' },
            { en: 'delayed', ua: 'затримано' },
            { en: 'on time', ua: 'вчасно' },
          ],
        },
        {
          id: 'b1-ap-mc1',
          type: 'multiple-choice',
          question: '«Luggage» — це…',
          options: ['літак', 'квиток', 'багаж', 'паспорт'],
          correctIndex: 2,
        },
        {
          id: 'b1-ap-mc2',
          type: 'multiple-choice',
          question: '«Delayed» означає…',
          options: ['скасовано', 'вчасно', 'затримано', 'прибуло'],
          correctIndex: 2,
        },
        {
          id: 'b1-ap-fill',
          type: 'fill-blank',
          before: 'Where is the boarding',
          after: '?',
          answer: 'pass',
          hint: 'Документ, який показуємо при посадці.',
        },
        {
          id: 'b1-ap-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Наш літак затримано.',
          answer: 'Our flight is delayed.',
          acceptedAnswers: accepted('Our flight is delayed.', [
            'our plane is delayed',
            'the flight is delayed',
          ]),
        },
      ],
    },
  ],
);

export const b1TechAroundUs = shellCourse(
  {
    slug: 'b1-tech-around-us',
    createIfMissing: {
      title: 'Technology Around Us',
      titleUa: 'Технології довкола',
      subtitle: 'B1 · 4 уроки · долучаємось 2 з 4',
      description:
        'Сучасна техніка: смартфони, інтернет, штучний інтелект. Модальні дієслова should/must, плюси й мінуси, прогнози майбутнього.',
      descriptionShort: 'Девайси, безпека в інтернеті, прогнози.',
      level: 'B1',
      audience: 'kids',
      kind: 'course',
      iconEmoji: '💻',
      tags: ['kids', 'b1', 'tech', 'modals'],
    },
  },
  [
    {
      slug: 'b1-devices',
      title: 'Devices We Use',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 10,
      xp: 15,
      sectionSlug: 'b1-tech',
      sectionTitle: 'Юніт 1 · Технології',
      sectionOrder: 0,
      isFree: true,
      topic: 'tech-vocab',
      steps: [
        {
          id: 'b1-dv-theory',
          type: 'theory',
          title: 'Девайси 📱',
          body: 'Сучасний словник: phone, tablet, laptop, headphones, charger.',
          examples: [
            { en: 'smartphone', ua: 'смартфон' },
            { en: 'tablet', ua: 'планшет' },
            { en: 'laptop', ua: 'ноутбук' },
            { en: 'headphones', ua: 'навушники' },
            { en: 'charger', ua: 'зарядний пристрій' },
          ],
        },
        {
          id: 'b1-dv-mc1',
          type: 'multiple-choice',
          question: '«Charger» — це…',
          options: ['ноутбук', 'зарядка', 'клавіатура', 'миша'],
          correctIndex: 1,
        },
        {
          id: 'b1-dv-fill',
          type: 'fill-blank',
          before: 'I listen to music with my',
          after: '.',
          answer: 'headphones',
          hint: 'Слухаємо ___ музику.',
        },
        {
          id: 'b1-dv-match',
          type: 'match-pairs',
          prompt: 'Зʼєднай:',
          pairs: [
            { left: 'tablet', right: 'планшет' },
            { left: 'laptop', right: 'ноутбук' },
            { left: 'headphones', right: 'навушники' },
            { left: 'charger', right: 'зарядка' },
          ],
        },
        {
          id: 'b1-dv-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Мій ноутбук швидкий.',
          answer: 'My laptop is fast.',
          acceptedAnswers: accepted('My laptop is fast.'),
        },
      ],
    },
    {
      slug: 'b1-internet-safety',
      title: 'Internet Safely',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 10,
      xp: 15,
      sectionSlug: 'b1-tech',
      sectionTitle: 'Юніт 1 · Технології',
      sectionOrder: 0,
      topic: 'modals',
      steps: [
        {
          id: 'b1-is-theory',
          type: 'theory',
          title: 'Модальні дієслова 🔒',
          body: '«Should» — варто, краще; «must» — мусиш, обовʼязково; «mustn\'t» — не можна.',
          examples: [
            { en: 'You should use a strong password.', ua: 'Тобі варто використовувати надійний пароль.' },
            { en: 'You must protect your data.', ua: 'Ти мусиш захищати свої дані.' },
            { en: "You mustn't share your password.", ua: 'Не можна ділитись паролем.' },
          ],
          tip: '💡 «Should» — порада, «must» — правило / закон.',
        },
        {
          id: 'b1-is-mc1',
          type: 'multiple-choice',
          question: 'Що сильніше — порада чи заборона?',
          options: ['Should', 'Must / mustn\'t', 'Однакові', 'Ні те, ні те'],
          correctIndex: 1,
        },
        {
          id: 'b1-is-fill',
          type: 'fill-blank',
          before: 'You',
          after: " share your password with anyone!",
          answer: "mustn't",
          hint: 'Жорстка заборона.',
        },
        {
          id: 'b1-is-match',
          type: 'match-pairs',
          prompt: 'Зʼєднай:',
          pairs: [
            { left: 'should', right: 'варто' },
            { left: 'must', right: 'мусиш' },
            { left: "mustn't", right: 'не можна' },
            { left: "shouldn't", right: 'краще не' },
          ],
        },
        {
          id: 'b1-is-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Тобі варто бути обережним онлайн.',
          answer: 'You should be careful online.',
          acceptedAnswers: accepted('You should be careful online.'),
        },
      ],
    },
  ],
);

// ═══════════════════════════════════════════════════════════════════════
// B2 — Upper-Intermediate (2 courses)
// ═══════════════════════════════════════════════════════════════════════

export const b2NewsAndSociety = shellCourse(
  {
    slug: 'b2-news-society',
    createIfMissing: {
      title: 'News & Society',
      titleUa: 'Новини та суспільство',
      subtitle: 'B2 · 3 уроки · долучаємось 2 з 3',
      description:
        'Заголовки новин, клімат, волонтерство. Present perfect, passive voice, conditionals — складніша граматика на знайомих темах.',
      descriptionShort: 'Заголовки, клімат, волонтерство.',
      level: 'B2',
      audience: 'kids',
      kind: 'course',
      iconEmoji: '📰',
      tags: ['kids', 'b2', 'news', 'present-perfect'],
    },
  },
  [
    {
      slug: 'b2-news-headlines',
      title: 'Reading News Headlines',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'b2-news',
      sectionTitle: 'Юніт 1 · Сучасність',
      sectionOrder: 0,
      isFree: true,
      topic: 'present-perfect',
      steps: [
        {
          id: 'b2-nh-theory',
          type: 'theory',
          title: 'Present Perfect 🗞️',
          body: '«Have / has + V3» — для подій, які щойно сталися або мають вплив на тепер. Заголовки новин люблять цей час.',
          examples: [
            { en: 'Scientists have discovered a new planet.', ua: 'Вчені відкрили нову планету.' },
            { en: 'The team has won the championship.', ua: 'Команда виграла чемпіонат.' },
            { en: 'I have just finished my homework.', ua: 'Я щойно закінчив домашку.' },
          ],
          tip: '💡 «Just», «already», «yet» — типові слова для present perfect.',
        },
        {
          id: 'b2-nh-mc1',
          type: 'multiple-choice',
          question: 'Виправ помилку: She ___ already finished.',
          options: ['have', 'has', 'is', 'was'],
          correctIndex: 1,
        },
        {
          id: 'b2-nh-fill',
          type: 'fill-blank',
          before: 'They have',
          after: ' a new app.',
          answer: 'launched',
          hint: 'Past participle від «launch» — запустили.',
        },
        {
          id: 'b2-nh-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Я щойно прочитав цю новину.',
          answer: "I have just read this news.",
          acceptedAnswers: accepted("I have just read this news.", [
            "i've just read this news",
            "I've just read the news",
          ]),
        },
      ],
    },
    {
      slug: 'b2-climate',
      title: 'Climate & Environment',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'b2-news',
      sectionTitle: 'Юніт 1 · Сучасність',
      sectionOrder: 0,
      topic: 'passive',
      steps: [
        {
          id: 'b2-cl-theory',
          type: 'theory',
          title: 'Пасивний стан 🌍',
          body: '«Trees are planted» — дерева висаджуються. Пасив фокусує увагу на ОБʼЄКТІ дії, а не на тому, хто діє.',
          examples: [
            { en: 'Trees are planted every spring.', ua: 'Дерева висаджуються щовесни.' },
            { en: 'Plastic is recycled in many countries.', ua: 'Пластик переробляється у багатьох країнах.' },
            { en: 'The Earth must be protected.', ua: 'Землю треба захищати.' },
          ],
        },
        {
          id: 'b2-cl-mc1',
          type: 'multiple-choice',
          question: 'Активний → пасивний: «We plant trees»',
          options: [
            'Trees are planted',
            'Trees plant',
            'Trees were planting',
            'Trees plants',
          ],
          correctIndex: 0,
        },
        {
          id: 'b2-cl-fill',
          type: 'fill-blank',
          before: 'Plastic ',
          after: ' recycled in our city.',
          answer: 'is',
          hint: 'Допоміжне «be» в present passive.',
        },
        {
          id: 'b2-cl-match',
          type: 'match-pairs',
          prompt: 'Зʼєднай:',
          pairs: [
            { left: 'recycle', right: 'переробляти' },
            { left: 'pollute', right: 'забруднювати' },
            { left: 'protect', right: 'захищати' },
            { left: 'reduce', right: 'зменшувати' },
          ],
        },
        {
          id: 'b2-cl-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Папір перероблюється тут.',
          answer: 'Paper is recycled here.',
          acceptedAnswers: accepted('Paper is recycled here.'),
        },
      ],
    },
  ],
);

export const b2BooksMovies = shellCourse(
  {
    slug: 'b2-books-movies',
    createIfMissing: {
      title: 'Books & Movies',
      titleUa: 'Книги і фільми',
      subtitle: 'B2 · 3 уроки · долучаємось 2 з 3',
      description:
        'Розповідаємо історії, рецензуємо фільми, фантазуємо у умовних реченнях. Narrative tenses + conditionals.',
      descriptionShort: 'Narrative tenses, рецензії, conditionals.',
      level: 'B2',
      audience: 'kids',
      kind: 'course',
      iconEmoji: '📚',
      tags: ['kids', 'b2', 'narrative'],
    },
  },
  [
    {
      slug: 'b2-telling-stories',
      title: 'Telling Stories',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'b2-stories',
      sectionTitle: 'Юніт 1 · Розповідь',
      sectionOrder: 0,
      isFree: true,
      topic: 'narrative',
      steps: [
        {
          id: 'b2-ts-theory',
          type: 'theory',
          title: 'Розповідаємо історію 📖',
          body: 'Past simple — основна дія, past continuous — фон («I was reading when…»), past perfect — раніше за минуле («I had finished before…»).',
          examples: [
            { en: 'I was reading when the phone rang.', ua: 'Я читав, коли задзвонив телефон.' },
            { en: 'She had already left when I arrived.', ua: 'Вона вже пішла, коли я прийшов.' },
          ],
        },
        {
          id: 'b2-ts-mc1',
          type: 'multiple-choice',
          question: 'Який час — для тривалої дії в минулому?',
          options: ['past simple', 'past continuous', 'past perfect', 'present perfect'],
          correctIndex: 1,
        },
        {
          id: 'b2-ts-fill',
          type: 'fill-blank',
          before: 'I',
          after: ' a book when she called.',
          answer: 'was reading',
          hint: 'Past continuous: was + V-ing.',
        },
        {
          id: 'b2-ts-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Я обідав, коли він прийшов.',
          answer: 'I was having lunch when he came.',
          acceptedAnswers: accepted('I was having lunch when he came.'),
        },
      ],
    },
    {
      slug: 'b2-what-if',
      title: 'What If…?',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'b2-stories',
      sectionTitle: 'Юніт 1 · Розповідь',
      sectionOrder: 0,
      topic: 'conditionals',
      steps: [
        {
          id: 'b2-wi-theory',
          type: 'theory',
          title: 'Умовні речення 💭',
          body: '2nd conditional — нереальна теперішня ситуація: «If I had wings, I would fly». 3rd conditional — нереальне минуле: «If I had studied, I would have passed».',
          examples: [
            { en: 'If I had wings, I would fly.', ua: 'Якби я мав крила, я б літав.' },
            { en: 'If she were here, she would help.', ua: 'Якби вона була тут, вона б допомогла.' },
          ],
        },
        {
          id: 'b2-wi-mc1',
          type: 'multiple-choice',
          question: 'Виправ: If I ___ rich, I would travel a lot.',
          options: ['am', 'were', 'will be', 'be'],
          correctIndex: 1,
        },
        {
          id: 'b2-wi-fill',
          type: 'fill-blank',
          before: 'If I had time, I',
          after: ' learn the piano.',
          answer: 'would',
          hint: '2nd conditional: would + base form.',
        },
        {
          id: 'b2-wi-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Якби я був твоїм другом, я б тобі допоміг.',
          answer: 'If I were your friend, I would help you.',
          acceptedAnswers: accepted('If I were your friend, I would help you.'),
        },
      ],
    },
  ],
);

// ═══════════════════════════════════════════════════════════════════════
// C1 — Advanced (1 course)
// ═══════════════════════════════════════════════════════════════════════

export const c1CriticalThinking = shellCourse(
  {
    slug: 'c1-critical-thinking',
    createIfMissing: {
      title: 'Critical Thinking',
      titleUa: 'Критичне мислення',
      subtitle: 'C1 · 3 уроки · долучаємось 2 з 3',
      description:
        'Як розрізняти факти й думки, помічати логічні помилки, писати переконливі тексти. Hedging language, formal register.',
      descriptionShort: 'Факт vs думка, логічні помилки.',
      level: 'C1',
      audience: 'kids',
      kind: 'course',
      iconEmoji: '🧠',
      tags: ['kids', 'c1', 'critical-thinking'],
    },
  },
  [
    {
      slug: 'c1-fact-vs-opinion',
      title: 'Fact vs Opinion',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 14,
      xp: 15,
      sectionSlug: 'c1-think',
      sectionTitle: 'Юніт 1 · Думати уважно',
      sectionOrder: 0,
      isFree: true,
      topic: 'fact-opinion',
      steps: [
        {
          id: 'c1-fo-theory',
          type: 'theory',
          title: 'Факт чи думка? 🧠',
          body: 'Факт можна перевірити. Думка — особиста оцінка. «Water boils at 100°C» — факт. «This song is the best» — думка. Слова hedging («I think», «it seems», «probably») сигналізують про думку.',
          examples: [
            { en: 'The Earth orbits the Sun.', ua: 'Земля обертається навколо Сонця. (факт)' },
            { en: 'Pizza is the best food.', ua: 'Піца — найкраща їжа. (думка)' },
            { en: 'It seems that…', ua: 'Здається, що…' },
            { en: 'In my opinion…', ua: 'На мою думку…' },
          ],
        },
        {
          id: 'c1-fo-mc1',
          type: 'multiple-choice',
          question: 'Що з цього — факт?',
          options: [
            'Coffee is delicious',
            'Coffee contains caffeine',
            'Coffee is the best drink',
            'Coffee should be free',
          ],
          correctIndex: 1,
        },
        {
          id: 'c1-fo-fill',
          type: 'fill-blank',
          before: 'In my',
          after: ', online learning is effective.',
          answer: 'opinion',
          hint: 'Сигнал думки.',
        },
        {
          id: 'c1-fo-match',
          type: 'match-pairs',
          prompt: 'Зʼєднай із значенням:',
          pairs: [
            { left: 'It seems', right: 'Здається' },
            { left: 'I believe', right: 'Я вважаю' },
            { left: 'In fact', right: 'Насправді' },
            { left: 'Apparently', right: 'Очевидно' },
          ],
        },
        {
          id: 'c1-fo-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'На мою думку, це найкраща книга.',
          answer: 'In my opinion, this is the best book.',
          acceptedAnswers: accepted('In my opinion, this is the best book.'),
        },
      ],
    },
    {
      slug: 'c1-fallacies',
      title: 'Logical Fallacies',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 14,
      xp: 15,
      sectionSlug: 'c1-think',
      sectionTitle: 'Юніт 1 · Думати уважно',
      sectionOrder: 0,
      topic: 'fallacies',
      steps: [
        {
          id: 'c1-fl-theory',
          type: 'theory',
          title: 'Помилки в думанні ⚠️',
          body: 'Розглянемо 3 типи: ad hominem (атака на людину, не на аргумент), straw man (спрощення позиції опонента), slippery slope (ланцюгова реакція без доказів).',
          examples: [
            { en: "You can't trust him because he is young. (ad hominem)", ua: 'Йому не можна довіряти, бо він молодий.' },
            { en: 'If we let kids use phones, soon they will forget how to read! (slippery slope)', ua: 'Якщо дозволимо телефони, скоро діти забудуть, як читати!' },
          ],
        },
        {
          id: 'c1-fl-mc1',
          type: 'multiple-choice',
          question: 'Яка це помилка: «Він не може мати рацію — він новачок»?',
          options: ['ad hominem', 'straw man', 'slippery slope', 'правильний аргумент'],
          correctIndex: 0,
        },
        {
          id: 'c1-fl-fill',
          type: 'fill-blank',
          before: 'When someone attacks you instead of your idea, it is called ad',
          after: '.',
          answer: 'hominem',
          hint: 'Латинський термін.',
        },
        {
          id: 'c1-fl-translate',
          type: 'translate',
          prompt: 'Переклади:',
          sentence: 'Це не аргумент, це особиста атака.',
          answer: 'This is not an argument, it is a personal attack.',
          acceptedAnswers: accepted('This is not an argument, it is a personal attack.'),
        },
      ],
    },
  ],
);

// ═══════════════════════════════════════════════════════════════════════
// C2 — Proficient (1 course)
// ═══════════════════════════════════════════════════════════════════════

export const c2IdiomsAndNuance = shellCourse(
  {
    slug: 'c2-idioms-nuance',
    createIfMissing: {
      title: 'Idioms & Nuance',
      titleUa: 'Ідіоми і нюанси',
      subtitle: 'C2 · 2 уроки · долучаємось 2 з 2',
      description:
        'Найпоширеніші англійські ідіоми та тонкі відтінки значення. Майже-синоніми, реєстр, іронія.',
      descriptionShort: 'Ідіоми, реєстр, синоніми.',
      level: 'C2',
      audience: 'kids',
      kind: 'course',
      iconEmoji: '✨',
      tags: ['kids', 'c2', 'idioms'],
    },
  },
  [
    {
      slug: 'c2-everyday-idioms',
      title: 'Everyday Idioms',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 14,
      xp: 15,
      sectionSlug: 'c2-nuance',
      sectionTitle: 'Юніт 1 · Тонкощі мови',
      sectionOrder: 0,
      isFree: true,
      topic: 'idioms',
      steps: [
        {
          id: 'c2-ei-theory',
          type: 'theory',
          title: 'Ідіоми у щоденному житті 🎭',
          body: 'Ідіома — фраза, де загальне значення не дорівнює сумі слів. «Break a leg!» = «Удачі!» (актори вірять, що бажати удачі — погана прикмета).',
          examples: [
            { en: 'Break a leg!', ua: 'Удачі! (буквально: «Зламай ногу!»)' },
            { en: "It's a piece of cake.", ua: 'Це елементарно. (буквально: «шматок торту»)' },
            { en: 'Once in a blue moon.', ua: 'Раз на сто років. (буквально: «у блакитному місяці»)' },
            { en: "Bite the bullet.", ua: 'Стиснути зуби й зробити.' },
          ],
        },
        {
          id: 'c2-ei-mc1',
          type: 'multiple-choice',
          question: '«It\'s a piece of cake» означає…',
          options: ['Це смачно', 'Це елементарно', 'Це дорого', 'Це торт'],
          correctIndex: 1,
        },
        {
          id: 'c2-ei-mc2',
          type: 'multiple-choice',
          question: 'А «break a leg»?',
          options: ['Вибач', 'Втікай!', 'Удачі!', 'Зламав'],
          correctIndex: 2,
        },
        {
          id: 'c2-ei-match',
          type: 'match-pairs',
          prompt: 'Зʼєднай ідіому зі значенням:',
          pairs: [
            { left: 'Break a leg!', right: 'Удачі!' },
            { left: 'Piece of cake', right: 'Легко' },
            { left: 'Once in a blue moon', right: 'Дуже рідко' },
            { left: 'Bite the bullet', right: 'Стиснути зуби' },
          ],
        },
        {
          id: 'c2-ei-translate',
          type: 'translate',
          prompt: 'Переклади (англ. ідіомою):',
          sentence: 'Це було дуже легко.',
          answer: 'It was a piece of cake.',
          acceptedAnswers: accepted('It was a piece of cake.'),
        },
      ],
    },
    {
      slug: 'c2-subtle-differences',
      title: 'Subtle Differences',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 14,
      xp: 15,
      sectionSlug: 'c2-nuance',
      sectionTitle: 'Юніт 1 · Тонкощі мови',
      sectionOrder: 0,
      topic: 'register',
      steps: [
        {
          id: 'c2-sd-theory',
          type: 'theory',
          title: 'Майже-синоніми 🎯',
          body: '«Slim» і «skinny» обидва означають «худий», але slim — компліментарне, skinny — нейтрально-негативне. Реєстр (formal/informal) важить.',
          examples: [
            { en: 'slim (positive) / skinny (neutral-negative)', ua: 'стрункий / худющий' },
            { en: 'home (warm) / house (neutral building)', ua: 'дім / будинок' },
            { en: 'tell (neutral) / inform (formal)', ua: 'сказати / повідомити' },
          ],
        },
        {
          id: 'c2-sd-mc1',
          type: 'multiple-choice',
          question: 'Який варіант — комплімент?',
          options: ['skinny', 'slim', 'thin', 'bony'],
          correctIndex: 1,
        },
        {
          id: 'c2-sd-mc2',
          type: 'multiple-choice',
          question: 'У офіційному листі краще:',
          options: ['Hey, just letting you know…', 'I would like to inform you…', 'Hi, just so you know…', 'FYI…'],
          correctIndex: 1,
        },
        {
          id: 'c2-sd-fill',
          type: 'fill-blank',
          before: 'In a formal letter we say "I would like to',
          after: ' you" instead of "tell".',
          answer: 'inform',
          hint: 'Більш офіційно.',
        },
        {
          id: 'c2-sd-translate',
          type: 'translate',
          prompt: 'Переклади (формально):',
          sentence: 'Я хотів би повідомити вам про зміни.',
          answer: 'I would like to inform you about the changes.',
          acceptedAnswers: accepted('I would like to inform you about the changes.'),
        },
      ],
    },
  ],
);
