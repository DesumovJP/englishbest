import type { LessonData } from './types';

const lesson: LessonData = {
  slug: 'my-name-is',
  courseSlug: 'english-kids-starter',
  title: 'My name is...',
  xp: 15,
  steps: [
    {
      id: 'theory-1',
      type: 'theory',
      title: 'Як представитись по-англійськи 🙋',
      body: 'Навчимось розповідати про себе: ім\'я, вік, звідки ти. Ці фрази потрібні при знайомстві!',
      examples: [
        { en: 'My name is...',  ua: 'Мене звати...' },
        { en: 'I am ... years old', ua: 'Мені ... років' },
        { en: 'I am from Ukraine', ua: 'Я з України' },
        { en: 'Nice to meet you', ua: 'Приємно познайомитись' },
        { en: 'What is your name?', ua: 'Як тебе звати?' },
      ],
      tip: '💡 "I am" часто скорочують до "I\'m" у розмові',
    },
    {
      id: 'mc-1',
      type: 'multiple-choice',
      question: 'Як запитати ім\'я по-англійськи?',
      options: [
        'How are you?',
        'Where are you from?',
        'What is your name?',
        'How old are you?',
      ],
      correctIndex: 2,
      explanation: '"What is your name?" = "Як тебе звати?"',
    },
    {
      id: 'wo-1',
      type: 'word-order',
      prompt: 'Склади речення:',
      translation: 'Мене звати Марія.',
      words: ['My', 'name', 'is', 'Maria'],
      answer: ['My', 'name', 'is', 'Maria'],
    },
    {
      id: 'fill-1',
      type: 'fill-blank',
      before: 'I am',
      after: 'years old.',
      answer: 'ten',
      hint: 'Вік по-англійськи словами: ten = 10',
    },
    {
      id: 'mc-2',
      type: 'multiple-choice',
      question: 'Що означає "Nice to meet you"?',
      options: ['До побачення', 'Як справи?', 'Приємно познайомитись', 'Дякую'],
      correctIndex: 2,
    },
    {
      id: 'tr-1',
      type: 'translate',
      prompt: 'Перекладіть англійською:',
      sentence: 'Мене звати Олексій. Я з України.',
      answer: 'My name is Oleksii. I am from Ukraine.',
      acceptedAnswers: [
        'My name is Oleksii. I am from Ukraine.',
        'My name is Oleksii. I\'m from Ukraine.',
        'my name is oleksii. i am from ukraine.',
        'My name is Oleksiy. I am from Ukraine.',
      ],
    },
  ],
};

export default lesson;
