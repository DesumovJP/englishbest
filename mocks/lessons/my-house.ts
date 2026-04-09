import type { LessonData } from './types';

const lesson: LessonData = {
  slug: 'my-house',
  courseSlug: 'elementary-kids',
  title: 'My House',
  xp: 20,
  steps: [
    /* ── 1. Теорія ─────────────────────────────── */
    {
      id: 'theory-1',
      type: 'theory',
      title: 'Кімнати мого будинку 🏠',
      body: 'Сьогодні вивчаємо назви кімнат та предметів у домі. Це допоможе тобі розповідати про своє житло!',
      examples: [
        { en: 'kitchen',   ua: 'кухня' },
        { en: 'bedroom',   ua: 'спальня' },
        { en: 'bathroom',  ua: 'ванна кімната' },
        { en: 'living room', ua: 'вітальня' },
        { en: 'garden',    ua: 'сад' },
        { en: 'window',    ua: 'вікно' },
      ],
      tip: '💡 "Room" означає кімната — bedroom = ліжко + кімната!',
    },

    /* ── 2. Multiple choice ─────────────────────── */
    {
      id: 'mc-1',
      type: 'multiple-choice',
      question: 'Де ми готуємо їжу?',
      options: ['bedroom', 'kitchen', 'bathroom', 'garden'],
      correctIndex: 1,
      explanation: '"Kitchen" — це кухня, місце де готують їжу.',
    },

    /* ── 3. Fill blank ──────────────────────────── */
    {
      id: 'fill-1',
      type: 'fill-blank',
      before: 'I sleep in my',
      after: 'every night.',
      answer: 'bedroom',
      hint: 'Де ми спимо?',
    },

    /* ── 4. Match pairs ─────────────────────────── */
    {
      id: 'match-1',
      type: 'match-pairs',
      prompt: "З'єднай кімнату з описом:",
      pairs: [
        { left: 'kitchen',    right: 'готувати їжу' },
        { left: 'bedroom',    right: 'спати' },
        { left: 'bathroom',   right: 'митись' },
        { left: 'living room', right: 'відпочивати' },
      ],
    },

    /* ── 5. Multiple choice ─────────────────────── */
    {
      id: 'mc-2',
      type: 'multiple-choice',
      question: 'Як перекласти "вікно"?',
      options: ['door', 'floor', 'window', 'wall'],
      correctIndex: 2,
    },

    /* ── 6. Word order ──────────────────────────── */
    {
      id: 'wo-1',
      type: 'word-order',
      prompt: 'Склади речення:',
      translation: 'У мене є великий сад.',
      words: ['I', 'have', 'a', 'big', 'garden'],
      answer: ['I', 'have', 'a', 'big', 'garden'],
    },

    /* ── 7. Translate ───────────────────────────── */
    {
      id: 'tr-1',
      type: 'translate',
      prompt: 'Перекладіть речення англійською:',
      sentence: 'Моя спальня дуже велика.',
      answer: 'My bedroom is very big.',
      acceptedAnswers: [
        'My bedroom is very big.',
        'My bedroom is very big',
        'my bedroom is very big',
        'my bedroom is very big.',
      ],
    },
  ],
};

export default lesson;
