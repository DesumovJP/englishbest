import type { LessonData } from './types';

const lesson: LessonData = {
  slug: 'reading-animals',
  courseSlug: 'elementary-kids',
  title: 'Reading: Animals in the Forest',
  xp: 25,
  steps: [
    /* ── 1. Перший текст: Лисиця ──────────────────── */
    {
      id: 'reading-1',
      type: 'reading',
      title: 'The Fox and the Forest',
      text: 'A fox lives in the forest. The fox is orange and has a big bushy tail. Every morning, the fox wakes up early and looks for food. It eats small animals and berries. The fox is very clever and fast. At night, the fox sleeps in its den under a big tree.',
      vocabulary: [
        { word: 'fox',    translation: 'лисиця' },
        { word: 'forest', translation: 'ліс' },
        { word: 'bushy',  translation: 'пухнастий' },
        { word: 'clever', translation: 'розумний' },
        { word: 'den',    translation: 'нора' },
        { word: 'berries', translation: 'ягоди' },
      ],
      questions: [
        {
          id: 'q1',
          question: 'Де живе лисиця?',
          options: ['В морі', 'В лісі', 'В місті', 'В горах'],
          correctIndex: 1,
        },
        {
          id: 'q2',
          question: 'Якого кольору лисиця?',
          options: ['Сіра', 'Біла', 'Оранжева', 'Чорна'],
          correctIndex: 2,
          explanation: 'У тексті: "The fox is orange"',
        },
        {
          id: 'q3',
          question: 'Що означає слово "clever"?',
          options: ['Швидкий', 'Великий', 'Розумний', 'Маленький'],
          correctIndex: 2,
        },
        {
          id: 'q4',
          question: 'Що їсть лисиця?',
          options: ['Рибу та хліб', 'Невеликих тварин та ягоди', 'Тільки траву', 'Фрукти та овочі'],
          correctIndex: 1,
          explanation: 'У тексті: "It eats small animals and berries"',
        },
        {
          id: 'q5',
          question: 'Де лисиця спить вночі?',
          options: ['На гілці дерева', 'В норі під великим деревом', 'В траві', 'Біля річки'],
          correctIndex: 1,
        },
      ],
    },

    /* ── 2. Другий текст: Ведмідь ─────────────────── */
    {
      id: 'reading-2',
      type: 'reading',
      title: 'The Big Brown Bear',
      text: 'A bear is a large and strong animal. Bears live in forests and mountains. They love to eat fish, honey, and berries. Bears are excellent swimmers. In winter, bears sleep in a cave for many months. This long sleep is called hibernation. In spring, the bear wakes up very hungry.',
      vocabulary: [
        { word: 'bear',        translation: 'ведмідь' },
        { word: 'honey',       translation: 'мед' },
        { word: 'cave',        translation: 'печера' },
        { word: 'hibernation', translation: 'зимова сплячка' },
        { word: 'hungry',      translation: 'голодний' },
        { word: 'mountains',   translation: 'гори' },
      ],
      questions: [
        {
          id: 'q6',
          question: 'Що означає слово "honey"?',
          options: ['Риба', 'Мед', 'Ягоди', 'Вода'],
          correctIndex: 1,
        },
        {
          id: 'q7',
          question: 'Де живуть ведмеді?',
          options: ['В пустелі та степу', 'В лісах та горах', 'В океані', 'В тропіках'],
          correctIndex: 1,
          explanation: 'У тексті: "Bears live in forests and mountains"',
        },
        {
          id: 'q8',
          question: 'Що таке "hibernation"?',
          options: ['Полювання взимку', 'Зимова сплячка', 'Весняне пробудження', 'Пошук їжі'],
          correctIndex: 1,
        },
        {
          id: 'q9',
          question: 'Яким ведмідь прокидається навесні?',
          options: ['Щасливим', 'Злим', 'Голодним', 'Сонним'],
          correctIndex: 2,
          explanation: 'У тексті: "the bear wakes up very hungry"',
        },
      ],
    },

    /* ── 3. Множинний вибір (закріплення) ─────────── */
    {
      id: 'mc-review-1',
      type: 'multiple-choice',
      question: 'Як перекласти "The fox is very clever"?',
      options: [
        'Лисиця дуже велика',
        'Лисиця дуже розумна',
        'Лисиця дуже швидка',
        'Лисиця дуже красива',
      ],
      correctIndex: 1,
    },

    {
      id: 'mc-review-2',
      type: 'multiple-choice',
      question: 'Що означає "den"?',
      options: ['Ліс', 'Печера', 'Нора', 'Дерево'],
      correctIndex: 2,
    },

    /* ── 4. Переклад ──────────────────────────────── */
    {
      id: 'tr-review-1',
      type: 'translate',
      prompt: 'Перекладіть речення англійською:',
      sentence: 'Ведмідь живе в лісі.',
      answer: 'The bear lives in the forest.',
      acceptedAnswers: [
        'The bear lives in the forest.',
        'The bear lives in the forest',
        'A bear lives in the forest.',
        'A bear lives in the forest',
      ],
    },
  ],
};

export default lesson;
