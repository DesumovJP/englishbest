import type { LessonData } from './types';

const lesson: LessonData = {
  slug: 'daily-routines',
  courseSlug: 'elementary-kids',
  title: 'Daily Routines',
  xp: 20,
  steps: [
    {
      id: 'theory-1',
      type: 'theory',
      title: 'Мій день по-англійськи ⏰',
      body: 'Навчимось розповідати про свій розпорядок дня. Ці фрази допоможуть описати що ти робиш щодня.',
      examples: [
        { en: 'wake up',    ua: 'прокидатись' },
        { en: 'have breakfast', ua: 'снідати' },
        { en: 'go to school',   ua: 'іти до школи' },
        { en: 'do homework',    ua: 'робити домашнє завдання' },
        { en: 'go to bed',      ua: 'лягати спати' },
        { en: 'watch TV',       ua: 'дивитись телевізор' },
      ],
      tip: '💡 "I wake up at 7" = "Я прокидаюсь о 7-й". "At" використовуємо з часом!',
    },
    {
      id: 'mc-1',
      type: 'multiple-choice',
      question: 'Що означає "wake up"?',
      options: ['лягати спати', 'снідати', 'прокидатись', 'іти до школи'],
      correctIndex: 2,
      explanation: '"Wake up" — прокидатись. "Go to bed" — лягати спати.',
    },
    {
      id: 'wo-1',
      type: 'word-order',
      prompt: 'Склади речення:',
      translation: 'Я снідаю о восьмій годині.',
      words: ['I', 'have', 'breakfast', 'at', 'eight'],
      answer: ['I', 'have', 'breakfast', 'at', 'eight'],
    },
    {
      id: 'fill-1',
      type: 'fill-blank',
      before: 'After school I',
      after: 'my homework.',
      answer: 'do',
      hint: '"Робити" домашнє завдання…',
    },
    {
      id: 'match-1',
      type: 'match-pairs',
      prompt: "З'єднай дію з перекладом:",
      pairs: [
        { left: 'wake up',      right: 'прокидатись' },
        { left: 'go to school', right: 'іти до школи' },
        { left: 'watch TV',     right: 'дивитись ТВ' },
        { left: 'go to bed',    right: 'лягати спати' },
      ],
    },
    {
      id: 'tr-1',
      type: 'translate',
      prompt: 'Перекладіть англійською:',
      sentence: 'Я прокидаюсь о сьомій і іду до школи.',
      answer: 'I wake up at seven and go to school.',
      acceptedAnswers: [
        'I wake up at seven and go to school.',
        'I wake up at seven and go to school',
        'i wake up at seven and go to school.',
        'I wake up at 7 and go to school.',
      ],
    },
  ],
};

export default lesson;
