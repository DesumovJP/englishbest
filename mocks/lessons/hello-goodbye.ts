import type { LessonData } from './types';

const lesson: LessonData = {
  slug: 'hello-goodbye',
  courseSlug: 'elementary-kids',
  title: 'Hello & Goodbye',
  xp: 15,
  steps: [
    {
      id: 'theory-1',
      type: 'theory',
      title: 'Вітання та прощання 👋',
      body: 'Перший крок у вивченні англійської — навчитись вітатись! Ці слова ти будеш використовувати щодня.',
      examples: [
        { en: 'Hello',      ua: 'Привіт' },
        { en: 'Hi',         ua: 'Привіт (неформально)' },
        { en: 'Goodbye',    ua: 'До побачення' },
        { en: 'Bye',        ua: 'Бувай' },
        { en: 'Good morning', ua: 'Доброго ранку' },
        { en: 'Good night', ua: 'На добраніч' },
      ],
      tip: '💡 "Hi" — коротше та більш неформальне, ніж "Hello"',
    },
    {
      id: 'mc-1',
      type: 'multiple-choice',
      question: 'Як сказати "Привіт" по-англійськи?',
      options: ['Goodbye', 'Hello', 'Good night', 'Please'],
      correctIndex: 1,
      explanation: '"Hello" або "Hi" — це вітання. "Goodbye" — до побачення.',
    },
    {
      id: 'mc-2',
      type: 'multiple-choice',
      question: 'Що означає "Good morning"?',
      options: ['На добраніч', 'До побачення', 'Доброго ранку', 'Дякую'],
      correctIndex: 2,
    },
    {
      id: 'fill-1',
      type: 'fill-blank',
      before: 'A: Hello! B:',
      after: '! Nice to meet you.',
      answer: 'Hi',
      hint: 'Коротке вітання у відповідь…',
    },
    {
      id: 'match-1',
      type: 'match-pairs',
      prompt: "З'єднай слово з перекладом:",
      pairs: [
        { left: 'Hello',       right: 'Привіт' },
        { left: 'Goodbye',     right: 'До побачення' },
        { left: 'Good morning', right: 'Доброго ранку' },
        { left: 'Good night',  right: 'На добраніч' },
      ],
    },
    {
      id: 'tr-1',
      type: 'translate',
      prompt: 'Перекладіть англійською:',
      sentence: 'Доброго ранку! Як справи?',
      answer: 'Good morning! How are you?',
      acceptedAnswers: [
        'Good morning! How are you?',
        'Good morning! How are you',
        'good morning! how are you?',
        'good morning how are you',
      ],
    },
  ],
};

export default lesson;
