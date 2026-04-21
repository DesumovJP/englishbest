import type { LessonData } from './types';

const lesson: LessonData = {
  slug: 'numbers-colors',
  courseSlug: 'elementary-kids',
  title: 'Numbers & Colors',
  xp: 20,
  steps: [
    {
      id: 'theory-1',
      type: 'theory',
      title: 'Числа та кольори 🎨',
      body: 'Числа і кольори — базова лексика. Без них не обійтись у будь-якій розмові!',
      examples: [
        { en: 'one / two / three', ua: 'один / два / три' },
        { en: 'four / five / six',  ua: 'чотири / п\'ять / шість' },
        { en: 'red',    ua: 'червоний' },
        { en: 'blue',   ua: 'синій' },
        { en: 'green',  ua: 'зелений' },
        { en: 'yellow', ua: 'жовтий' },
      ],
      tip: '💡 Запам\'ятай: "green" схожий на "грін" — зелений!',
    },
    {
      id: 'mc-1',
      type: 'multiple-choice',
      question: 'Що означає "yellow"?',
      options: ['синій', 'червоний', 'зелений', 'жовтий'],
      correctIndex: 3,
    },
    {
      id: 'match-1',
      type: 'match-pairs',
      prompt: "З'єднай число з перекладом:",
      pairs: [
        { left: 'one',   right: 'один' },
        { left: 'three', right: 'три' },
        { left: 'five',  right: 'п\'ять' },
        { left: 'six',   right: 'шість' },
      ],
    },
    {
      id: 'fill-1',
      type: 'fill-blank',
      before: 'The sky is',
      after: '.',
      answer: 'blue',
      hint: 'Яким кольором є небо?',
    },
    {
      id: 'mc-2',
      type: 'multiple-choice',
      question: 'Як сказати "чотири" по-англійськи?',
      options: ['three', 'five', 'four', 'six'],
      correctIndex: 2,
    },
    {
      id: 'wo-1',
      type: 'word-order',
      prompt: 'Склади речення:',
      translation: 'У мене є три зелені яблука.',
      words: ['I', 'have', 'three', 'green', 'apples'],
      answer: ['I', 'have', 'three', 'green', 'apples'],
    },
    {
      id: 'tr-1',
      type: 'translate',
      prompt: 'Перекладіть англійською:',
      sentence: 'Моя кішка червона і біла.',
      answer: 'My cat is red and white.',
      acceptedAnswers: [
        'My cat is red and white.',
        'My cat is red and white',
        'my cat is red and white.',
      ],
    },
  ],
};

export default lesson;
