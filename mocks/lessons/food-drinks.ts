import type { LessonData } from './types';

const lesson: LessonData = {
  slug: 'food-drinks',
  courseSlug: 'elementary-kids',
  title: 'Food & Drinks',
  xp: 20,
  steps: [
    /* ── 1. Теорія ─────────────────────────────── */
    {
      id: 'theory-1',
      type: 'theory',
      title: 'Їжа та напої по-англійськи 🍎',
      body: 'Сьогодні вивчаємо слова про їжу та напої. Запам\'ятай ці слова — вони потрібні щодня!',
      examples: [
        { en: 'apple',  ua: 'яблуко' },
        { en: 'bread',  ua: 'хліб' },
        { en: 'milk',   ua: 'молоко' },
        { en: 'water',  ua: 'вода' },
        { en: 'juice',  ua: 'сік' },
        { en: 'cake',   ua: 'торт' },
      ],
      tip: '💡 Щоб запам\'ятати слово — уяви його смак!',
    },

    /* ── 2. Multiple choice ─────────────────────── */
    {
      id: 'mc-1',
      type: 'multiple-choice',
      question: 'Що означає слово "apple"?',
      options: ['банан', 'яблуко', 'груша', 'апельсин'],
      correctIndex: 1,
      explanation: '"Apple" — це яблуко. "Banana" — банан, "pear" — груша.',
    },

    /* ── 3. Fill blank ──────────────────────────── */
    {
      id: 'fill-1',
      type: 'fill-blank',
      before: 'I drink a glass of',
      after: 'every morning.',
      answer: 'milk',
      hint: 'Молоко по-англійськи…',
    },

    /* ── 4. Multiple choice ─────────────────────── */
    {
      id: 'mc-2',
      type: 'multiple-choice',
      question: 'Як сказати "сік" по-англійськи?',
      options: ['water', 'milk', 'juice', 'tea'],
      correctIndex: 2,
    },

    /* ── 5. Word order ──────────────────────────── */
    {
      id: 'wo-1',
      type: 'word-order',
      prompt: 'Склади речення:',
      translation: 'Мені подобається їсти хліб з маслом.',
      words: ['I', 'like', 'to', 'eat', 'bread', 'with', 'butter'],
      answer: ['I', 'like', 'to', 'eat', 'bread', 'with', 'butter'],
    },

    /* ── 6. Match pairs ─────────────────────────── */
    {
      id: 'match-1',
      type: 'match-pairs',
      prompt: 'З\'єднай слово з перекладом:',
      pairs: [
        { left: 'cake',  right: 'торт' },
        { left: 'water', right: 'вода' },
        { left: 'juice', right: 'сік' },
        { left: 'bread', right: 'хліб' },
      ],
    },

    /* ── 7. Translate ───────────────────────────── */
    {
      id: 'tr-1',
      type: 'translate',
      prompt: 'Перекладіть речення англійською:',
      sentence: 'Я хочу яблучний сік.',
      answer: 'I want apple juice.',
      acceptedAnswers: ['I want apple juice.', 'I want apple juice', 'i want apple juice'],
    },
  ],
};

export default lesson;
