/**
 * A · My World 🏠 — 8-lesson A1 course.
 *
 * Daily life: home, school, food, hobbies, time and plans. Adds Present
 * Continuous contrast and "there is/are", going to, like + V-ing,
 * frequency adverbs.
 *
 * Sections (3 units):
 *   Юніт 1 · Дім та школа         (L1, L2)
 *   Юніт 2 · Їжа і повсякдення    (L3, L4, L5)
 *   Юніт 3 · Інтереси і час       (L6, L7, L8)
 */
import type { CourseSeed } from '../types';

function accepted(answer: string, extras: string[] = []): string[] {
  const noPunct = answer.replace(/[.!?]$/, '');
  const lc = answer.toLowerCase();
  const lcNoPunct = noPunct.toLowerCase();
  return Array.from(new Set([answer, noPunct, lc, lcNoPunct, ...extras]));
}

export const aMyWorld: CourseSeed = {
  slug: 'a-my-world',
  createIfMissing: {
    title: 'My World',
    titleUa: 'Мій світ',
    subtitle: 'A-рівень · 8 уроків · щоденне життя',
    description:
      'Курс №2 для рівня A. Будинок, школа, їжа, хобі, час і плани. Поглиблюємо Present Simple та знайомимось із Present Continuous, "there is/are" і "going to".',
    descriptionShort: 'Будинок, школа, їжа, хобі, плани на вихідні.',
    level: 'A1',
    audience: 'kids',
    kind: 'course',
    iconEmoji: '🏠',
    tags: ['a-band', 'daily-life', 'grammar'],
  },
  lessons: [
    // ═══════════════════════════════════════════════════════════════════
    // LESSON 1 · Rooms in My House (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-my-world-1-rooms',
      title: 'Rooms in My House',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'a-my-world-home',
      sectionTitle: 'Юніт 1 · Дім та школа',
      sectionOrder: 0,
      isFree: true,
      topic: 'home-rooms',
      steps: [
        {
          id: 'l1-theory-rooms',
          type: 'theory',
          title: 'Кімнати в будинку 🛋️',
          body: 'Будинок (a house) і квартира (a flat / an apartment) складаються з кімнат (rooms). Найчастіше використовувані: kitchen — кухня, bedroom — спальня, living room — вітальня, bathroom — ванна, hall — передпокій. Часто кажуть: "I am in the kitchen." (Я на кухні).',
          examples: [
            { en: 'a kitchen', ua: 'кухня' },
            { en: 'a bedroom', ua: 'спальня' },
            { en: 'a living room', ua: 'вітальня' },
            { en: 'a bathroom', ua: 'ванна' },
            { en: 'a hall', ua: 'передпокій' },
            { en: 'I am in the kitchen.', ua: 'Я на кухні.' },
          ],
          tip: '💡 «Living room» пишемо двома словами, але читаємо як одне поняття.',
        },
        {
          id: 'l1-theory-thereis',
          type: 'theory',
          title: '"There is" / "There are"',
          body: 'Щоб сказати, що ЩОСЬ Є у певному місці, англійська вживає конструкцію "there is" (для одного предмета) або "there are" (для багатьох). Відмінність від "I am / She is" — там описуємо людину, а тут — наявність речі.',
          examples: [
            { en: 'There is a sofa in the living room.', ua: 'У вітальні є диван.' },
            { en: 'There are two beds in the bedroom.', ua: 'У спальні два ліжка.' },
            { en: 'Is there a TV in the kitchen?', ua: 'На кухні є телевізор?' },
            { en: "There isn't a bath in my flat.", ua: 'У моїй квартирі немає ванни.' },
          ],
          tip: "💡 Скорочуємо: there is → there's, there is not → there isn't.",
        },
        { id: 'l1-mcq-room1', type: 'multiple-choice', question: 'Where do you usually cook food?', options: ['in the bedroom', 'in the kitchen', 'in the bathroom', 'in the hall'], correctIndex: 1, explanation: 'Готують їжу на кухні (kitchen).' },
        { id: 'l1-mcq-room2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['There is two chairs.', 'There are two chairs.', 'There am two chairs.', 'It is two chairs.'], correctIndex: 1, explanation: 'Два стільці — це множина, тому "there are".' },
        { id: 'l1-mcq-room3', type: 'multiple-choice', question: 'Where do you sleep?', options: ['kitchen', 'bedroom', 'living room', 'hall'], correctIndex: 1 },
        { id: 'l1-mcq-room4', type: 'multiple-choice', question: 'How do you ask "Is there a window in the bathroom?"', options: ['Is a window in the bathroom?', 'Are there window in the bathroom?', 'Is there a window in the bathroom?', 'There is a window in the bathroom?'], correctIndex: 2, explanation: 'Питання: "Is there..." з артиклем "a" перед предметом.' },
        { id: 'l1-fill-room1', type: 'fill-blank', before: 'There ', after: ' three pictures on the wall.', answer: 'are', hint: 'Three pictures = множина' },
        { id: 'l1-fill-room2', type: 'fill-blank', before: 'I sleep in the ', after: '.', answer: 'bedroom' },
        { id: 'l1-match-rooms', type: 'match-pairs', prompt: 'Зʼєднай кімнату з предметом, який там зазвичай знаходиться.', pairs: [{ left: 'kitchen', right: 'fridge' }, { left: 'bedroom', right: 'bed' }, { left: 'bathroom', right: 'shower' }, { left: 'living room', right: 'sofa' }] },
        { id: 'l1-wordorder-room', type: 'word-order', prompt: 'Склади речення.', translation: 'У вітальні є великий телевізор.', words: ['There', 'is', 'a', 'big', 'TV', 'in', 'the', 'living', 'room'], answer: ['There', 'is', 'a', 'big', 'TV', 'in', 'the', 'living', 'room'] },
        { id: 'l1-translate-room1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'У спальні два ліжка.', answer: 'There are two beds in the bedroom.', acceptedAnswers: accepted('There are two beds in the bedroom.', ['there are 2 beds in the bedroom', 'There are two beds in my bedroom.']) },
        { id: 'l1-translate-room2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'На кухні немає вікна.', answer: "There isn't a window in the kitchen.", acceptedAnswers: accepted("There isn't a window in the kitchen.", ['There is no window in the kitchen.', 'there is not a window in the kitchen']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 2 · At School (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-my-world-2-at-school',
      title: 'At School',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'a-my-world-home',
      sectionTitle: 'Юніт 1 · Дім та школа',
      sectionOrder: 0,
      isFree: true,
      topic: 'school-classroom',
      steps: [
        {
          id: 'l2-theory-school',
          type: 'theory',
          title: 'У класі 🎒',
          body: 'Школа (school) — це місце, де ми вчимось. Учень — student, учитель — teacher. Урок — lesson. У класі (in the classroom) є предмети: a desk (парта), a chair (стілець), a board (дошка), a book (книжка), a pen (ручка), a pencil (олівець), a backpack (рюкзак), a notebook (зошит).',
          examples: [
            { en: 'My teacher is Mrs Lee.', ua: 'Моя вчителька — пані Лі.' },
            { en: 'I have a green pencil.', ua: 'У мене зелений олівець.' },
            { en: 'There are 20 students in my class.', ua: 'У моєму класі 20 учнів.' },
            { en: 'Open your notebook, please.', ua: 'Відкрийте зошит, будь ласка.' },
          ],
          tip: '💡 «Class» = сам клас (група людей), «classroom» = кімната, де відбувається урок.',
        },
        {
          id: 'l2-theory-can',
          type: 'theory',
          title: '"Can" — вміння та дозвіл',
          body: 'Дієслово "can" показує, що ти ВМІЄШ щось робити або тобі МОЖНА. Форма однакова для всіх осіб: I can, you can, he can. Після "can" завжди йде дієслово в інфінітиві БЕЗ "to". Заперечення — "can\'t" (cannot).',
          examples: [
            { en: 'I can read.', ua: 'Я вмію читати.' },
            { en: 'She can speak English.', ua: 'Вона вміє говорити англійською.' },
            { en: "I can't draw.", ua: 'Я не вмію малювати.' },
            { en: 'Can I go out?', ua: 'Можна мені вийти?' },
          ],
          tip: '💡 «I can to read» — НЕПРАВИЛЬНО. «to» після can не ставиться.',
        },
        { id: 'l2-mcq-1', type: 'multiple-choice', question: 'What do we write with?', options: ['a desk', 'a pen', 'a board', 'a backpack'], correctIndex: 1 },
        { id: 'l2-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['She can to swim.', 'She can swim.', 'She cans swim.', 'She can swims.'], correctIndex: 1, explanation: 'Після "can" — дієслово без "to" і без -s.' },
        { id: 'l2-mcq-3', type: 'multiple-choice', question: 'Where does the teacher write?', options: ['on the board', 'on the desk', 'on the chair', 'in the backpack'], correctIndex: 0 },
        { id: 'l2-mcq-4', type: 'multiple-choice', question: 'How do you say "Я не вмію плавати"?', options: ["I don't can swim.", "I can't to swim.", "I can't swim.", "I no swim."], correctIndex: 2 },
        { id: 'l2-fill-1', type: 'fill-blank', before: 'I ', after: ' speak two languages.', answer: 'can', hint: 'вмію' },
        { id: 'l2-fill-2', type: 'fill-blank', before: 'My ', after: ' is full of books and pencils.', answer: 'backpack', hint: 'рюкзак' },
        { id: 'l2-match-school', type: 'match-pairs', prompt: 'Зʼєднай шкільний предмет із його значенням.', pairs: [{ left: 'desk', right: 'парта' }, { left: 'pencil', right: 'олівець' }, { left: 'board', right: 'дошка' }, { left: 'notebook', right: 'зошит' }] },
        { id: 'l2-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я вмію читати англійською.', words: ['I', 'can', 'read', 'in', 'English'], answer: ['I', 'can', 'read', 'in', 'English'] },
        { id: 'l2-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'У моєму класі 20 учнів.', answer: 'There are 20 students in my class.', acceptedAnswers: accepted('There are 20 students in my class.', ['There are twenty students in my class.', 'In my class there are 20 students.']) },
        { id: 'l2-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Він не вміє грати в шахи.', answer: "He can't play chess.", acceptedAnswers: accepted("He can't play chess.", ['He cannot play chess.', "he can't play chess"]) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 3 · Food I Eat (Юніт 2)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-my-world-3-food',
      title: 'Food I Eat',
      orderIndex: 2,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'a-my-world-everyday',
      sectionTitle: 'Юніт 2 · Їжа і повсякдення',
      sectionOrder: 1,
      topic: 'food-likes',
      steps: [
        {
          id: 'l3-theory-food',
          type: 'theory',
          title: 'Що я їм 🍎',
          body: 'Їжа = food. Базова лексика: bread (хліб), milk (молоко), water (вода), apple (яблуко), banana (банан), rice (рис), egg (яйце), cheese (сир), juice (сік). Сніданок — breakfast, обід — lunch, вечеря — dinner.',
          examples: [
            { en: 'I eat an apple.', ua: 'Я їм яблуко.' },
            { en: 'She drinks milk for breakfast.', ua: 'Вона пʼє молоко на сніданок.' },
            { en: 'We have rice for lunch.', ua: 'У нас рис на обід.' },
          ],
          tip: '💡 «Eat» — їсти, «drink» — пити. «Have breakfast» = снідати.',
        },
        {
          id: 'l3-theory-count',
          type: 'theory',
          title: 'Злічуване і незлічуване',
          body: 'Англійська ділить іменники на ЗЛІЧУВАНІ (можна порахувати — apple, egg) та НЕЗЛІЧУВАНІ (рідина чи маса — milk, rice, water). Перед злічуваним у однині — артикль "a/an": an apple. Незлічуване не має множини: «two milks» — НЕПРАВИЛЬНО, кажуть «two glasses of milk».',
          examples: [
            { en: 'an apple — apples', ua: 'яблуко — яблука (злічуване)' },
            { en: 'milk (no plural)', ua: 'молоко (незлічуване)' },
            { en: 'a glass of water', ua: 'склянка води' },
            { en: 'I like apples but I don\'t like cheese.', ua: 'Мені подобаються яблука, але не подобається сир.' },
          ],
          tip: '💡 Питаючи кількість незлічуваного — використовуй "How much...?" (How much milk?). Для злічуваного — "How many...?" (How many apples?).',
        },
        { id: 'l3-mcq-1', type: 'multiple-choice', question: 'Which one is UNCOUNTABLE?', options: ['apple', 'banana', 'rice', 'egg'], correctIndex: 2 },
        { id: 'l3-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I eat a milk.', 'I drink milk.', 'I drink a milk.', 'I eats milk.'], correctIndex: 1 },
        { id: 'l3-mcq-3', type: 'multiple-choice', question: '"Сніданок" by English?', options: ['lunch', 'dinner', 'breakfast', 'snack'], correctIndex: 2 },
        { id: 'l3-mcq-4', type: 'multiple-choice', question: '_____ apples do you eat every day?', options: ['How much', 'How many', 'How', 'What much'], correctIndex: 1, explanation: 'Apples — злічувані → How many.' },
        { id: 'l3-fill-1', type: 'fill-blank', before: 'I have ', after: ' egg for breakfast.', answer: 'an', hint: 'an / a — перед голосною?' },
        { id: 'l3-fill-2', type: 'fill-blank', before: 'She doesn\'t ', after: ' coffee in the morning.', answer: 'drink' },
        { id: 'l3-match-food', type: 'match-pairs', prompt: 'Зʼєднай їжу з категорією.', pairs: [{ left: 'apple', right: 'fruit' }, { left: 'rice', right: 'grain' }, { left: 'milk', right: 'drink' }, { left: 'cheese', right: 'dairy' }] },
        { id: 'l3-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'У мене на сніданок банан і молоко.', words: ['I', 'have', 'a', 'banana', 'and', 'milk', 'for', 'breakfast'], answer: ['I', 'have', 'a', 'banana', 'and', 'milk', 'for', 'breakfast'] },
        { id: 'l3-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я їм яблуко щодня.', answer: 'I eat an apple every day.', acceptedAnswers: accepted('I eat an apple every day.', ['I have an apple every day.', 'i eat an apple every day']) },
        { id: 'l3-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Скільки молока ти пʼєш?', answer: 'How much milk do you drink?', acceptedAnswers: accepted('How much milk do you drink?', ['how much milk do you drink']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 4 · What I Do Every Day (Юніт 2) — Present Simple deep
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-my-world-4-every-day',
      title: 'What I Do Every Day',
      orderIndex: 3,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'a-my-world-everyday',
      sectionTitle: 'Юніт 2 · Їжа і повсякдення',
      sectionOrder: 1,
      topic: 'present-simple-deep',
      steps: [
        {
          id: 'l4-theory-ps',
          type: 'theory',
          title: 'Present Simple — звички та регулярні дії',
          body: 'Present Simple описує те, що відбувається ЗАВЖДИ або РЕГУЛЯРНО: щодня, кожного тижня, як правило. Форма для I/you/we/they — без змін: "I work". Для he/she/it — додаємо "-s": "He works".',
          examples: [
            { en: 'I get up at 7.', ua: 'Я встаю о 7-й.' },
            { en: 'She goes to school by bus.', ua: 'Вона їде до школи автобусом.' },
            { en: 'We have lunch at 1.', ua: 'У нас обід о 13:00.' },
            { en: 'He plays football every Sunday.', ua: 'Він грає у футбол щонеділі.' },
          ],
          tip: '💡 Дієслова на -s, -sh, -ch, -x, -o додають -es: he washes, she goes.',
        },
        {
          id: 'l4-theory-do',
          type: 'theory',
          title: 'Питання й заперечення з "do/does"',
          body: 'У питанні й запереченні Present Simple на сцену виходить допоміжне дієслово "do" (для I/you/we/they) або "does" (для he/she/it). Основне дієслово — у формі без -s.',
          examples: [
            { en: 'Do you like tea?', ua: 'Тобі подобається чай?' },
            { en: "I don't like coffee.", ua: 'Мені не подобається кава.' },
            { en: 'Does she play tennis?', ua: 'Вона грає в теніс?' },
            { en: "He doesn't watch TV.", ua: 'Він не дивиться телевізор.' },
          ],
          tip: '💡 Після "does" дієслово втрачає своє "-s": "She watches" → "Does she watch?"',
        },
        { id: 'l4-mcq-1', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['She go to school.', 'She goes to school.', 'She goeses to school.', 'She going to school.'], correctIndex: 1 },
        { id: 'l4-mcq-2', type: 'multiple-choice', question: '_____ they live in Kyiv?', options: ['Do', 'Does', 'Are', 'Is'], correctIndex: 0, explanation: 'They → допоміжне "do".' },
        { id: 'l4-mcq-3', type: 'multiple-choice', question: 'Choose the correct negative.', options: ["She don't like fish.", "She doesn't like fish.", "She not like fish.", "She doesn't likes fish."], correctIndex: 1 },
        { id: 'l4-mcq-4', type: 'multiple-choice', question: 'Tom _____ basketball every Friday.', options: ['play', 'plays', 'playes', 'is play'], correctIndex: 1 },
        { id: 'l4-fill-1', type: 'fill-blank', before: 'My brother ', after: ' a shower every morning.', answer: 'has', hint: 'have → ?' },
        { id: 'l4-fill-2', type: 'fill-blank', before: '_____ you usually have breakfast at home? — Yes, I ', after: '.', answer: 'do' },
        { id: 'l4-match-ps', type: 'match-pairs', prompt: 'Зʼєднай підмет з правильною формою дієслова "watch".', pairs: [{ left: 'I', right: 'watch' }, { left: 'he', right: 'watches' }, { left: 'they', right: 'watch' }, { left: 'she', right: 'watches' }] },
        { id: 'l4-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Вона завжди читає книжку перед сном.', words: ['She', 'always', 'reads', 'a', 'book', 'before', 'bed'], answer: ['She', 'always', 'reads', 'a', 'book', 'before', 'bed'] },
        { id: 'l4-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я встаю о сьомій ранку.', answer: 'I get up at 7 a.m.', acceptedAnswers: accepted('I get up at 7 a.m.', ['I get up at seven.', 'I get up at 7.', 'I get up at 7am']) },
        { id: 'l4-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Він не любить футбол.', answer: "He doesn't like football.", acceptedAnswers: accepted("He doesn't like football.", ['He does not like football.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 5 · What I'm Doing Now (Юніт 2) — Present Continuous
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-my-world-5-doing-now',
      title: "What I'm Doing Now",
      orderIndex: 4,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'a-my-world-everyday',
      sectionTitle: 'Юніт 2 · Їжа і повсякдення',
      sectionOrder: 1,
      topic: 'present-continuous',
      steps: [
        {
          id: 'l5-theory-pc',
          type: 'theory',
          title: 'Present Continuous — зараз, у цю мить',
          body: 'Present Continuous показує дію, яка відбувається ПРЯМО ЗАРАЗ або в поточний період. Формула: am/is/are + V-ing. "I am" → "I\'m", "she is" → "she\'s". Часто з маркерами: now, at the moment, today.',
          examples: [
            { en: "I'm reading a book now.", ua: 'Я зараз читаю книгу.' },
            { en: "She's cooking dinner.", ua: 'Вона готує вечерю.' },
            { en: 'They are playing in the garden.', ua: 'Вони грають у саду.' },
            { en: "He isn't sleeping at the moment.", ua: 'Він зараз не спить.' },
          ],
          tip: '💡 Дієслова, що закінчуються на "-e", втрачають "e" перед "-ing": write → writing, take → taking.',
        },
        {
          id: 'l5-theory-contrast',
          type: 'theory',
          title: 'Present Simple vs Present Continuous',
          body: 'Present Simple — це загальне правило життя (every day, usually). Present Continuous — це КОНКРЕТНА мить ("now", "right now"). Порівняй: "I drink coffee" (взагалі) vs "I\'m drinking coffee" (саме зараз).',
          examples: [
            { en: 'I usually walk to school. Today I\'m taking the bus.', ua: 'Я зазвичай ходжу до школи пішки. Сьогодні я їду автобусом.' },
            { en: 'She works as a teacher.', ua: 'Вона працює вчителькою. (загалом)' },
            { en: 'She\'s working at the desk.', ua: 'Вона працює за столом. (зараз)' },
          ],
        },
        { id: 'l5-mcq-1', type: 'multiple-choice', question: 'Choose the Present Continuous form.', options: ['I read.', "I'm reading.", 'I reads.', 'I am read.'], correctIndex: 1 },
        { id: 'l5-mcq-2', type: 'multiple-choice', question: 'They _____ tennis at the moment.', options: ['play', 'plays', 'are playing', 'is playing'], correctIndex: 2 },
        { id: 'l5-mcq-3', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['She is writeing a letter.', 'She is writing a letter.', 'She writing a letter.', 'She write a letter now.'], correctIndex: 1, explanation: 'write → writing (-e випадає).' },
        { id: 'l5-mcq-4', type: 'multiple-choice', question: 'Which sentence describes a HABIT (Present Simple)?', options: ['I am eating now.', 'I eat breakfast every day.', 'I am working today.', 'They are running.'], correctIndex: 1 },
        { id: 'l5-fill-1', type: 'fill-blank', before: 'Look! The cat ', after: ' on the sofa.', answer: 'is sleeping', hint: 'sleep + ing' },
        { id: 'l5-fill-2', type: 'fill-blank', before: "I usually drink tea, but today I ", after: ' coffee.', answer: 'am drinking' },
        { id: 'l5-match-pc', type: 'match-pairs', prompt: 'Зʼєднай дієслово з його -ing формою.', pairs: [{ left: 'run', right: 'running' }, { left: 'write', right: 'writing' }, { left: 'sit', right: 'sitting' }, { left: 'play', right: 'playing' }] },
        { id: 'l5-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Мама готує вечерю на кухні.', words: ['Mum', 'is', 'cooking', 'dinner', 'in', 'the', 'kitchen'], answer: ['Mum', 'is', 'cooking', 'dinner', 'in', 'the', 'kitchen'] },
        { id: 'l5-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я зараз пишу повідомлення.', answer: "I'm writing a message now.", acceptedAnswers: accepted("I'm writing a message now.", ['I am writing a message now.', "I'm writing a message right now."]) },
        { id: 'l5-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Він не спить зараз.', answer: "He isn't sleeping now.", acceptedAnswers: accepted("He isn't sleeping now.", ['He is not sleeping now.', "He's not sleeping now."]) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 6 · My Hobbies (Юніт 3) — like + V-ing
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-my-world-6-hobbies',
      title: 'My Hobbies',
      orderIndex: 5,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'a-my-world-time',
      sectionTitle: 'Юніт 3 · Інтереси і час',
      sectionOrder: 2,
      topic: 'hobbies-gerunds',
      steps: [
        {
          id: 'l6-theory-hobbies',
          type: 'theory',
          title: 'Хобі та захоплення',
          body: 'Хобі (a hobby) — те, що ти любиш робити у вільний час. Популярні: reading (читання), drawing (малювання), playing football (грати у футбол), dancing (танці), singing (співати), gaming (грати в ігри), cooking (готувати).',
          examples: [
            { en: 'My hobby is reading.', ua: 'Моє хобі — читати.' },
            { en: 'I love drawing.', ua: 'Я люблю малювати.' },
            { en: 'She likes singing.', ua: 'Їй подобається співати.' },
            { en: 'We enjoy playing chess.', ua: 'Нам подобається грати в шахи.' },
          ],
          tip: '💡 «Hobby» у множині — «hobbies» (y → ies).',
        },
        {
          id: 'l6-theory-gerund',
          type: 'theory',
          title: 'like / love / hate + V-ing',
          body: 'Після дієслів like, love, enjoy, hate ставимо ДРУГЕ дієслово у формі "-ing" (gerund). Це звучить як іменник: "I like reading" (Я люблю читання). У англійській НЕ кажуть "I like read".',
          examples: [
            { en: 'I love swimming.', ua: 'Я обожнюю плавання.' },
            { en: "She doesn't like cooking.", ua: 'Їй не подобається готувати.' },
            { en: 'They enjoy travelling.', ua: 'Їм подобається подорожувати.' },
            { en: 'My brother hates running.', ua: 'Мій брат ненавидить бігати.' },
          ],
          tip: '💡 «Travelling» (UK) і «traveling» (US) — обидва правильні. Українська вимова: тревелінг.',
        },
        { id: 'l6-mcq-1', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I like read books.', 'I like reading books.', 'I am like reading books.', 'I likes reading books.'], correctIndex: 1 },
        { id: 'l6-mcq-2', type: 'multiple-choice', question: '"Грати в ігри" — як англійською?', options: ['playing games', 'play games', 'plays games', 'to plays games'], correctIndex: 0 },
        { id: 'l6-mcq-3', type: 'multiple-choice', question: 'She _____ dancing.', options: ['enjoy', 'enjoys', 'enjoys to', 'enjoying'], correctIndex: 1 },
        { id: 'l6-mcq-4', type: 'multiple-choice', question: 'Which is NOT a hobby?', options: ['drawing', 'singing', 'sleeping', 'cooking'], correctIndex: 2, explanation: 'Sleeping — це звичайна потреба, не хобі.' },
        { id: 'l6-fill-1', type: 'fill-blank', before: 'I love ', after: ' photos in the park.', answer: 'taking', hint: 'take → taking' },
        { id: 'l6-fill-2', type: 'fill-blank', before: 'My sister ', after: ' singing in the choir.', answer: 'enjoys' },
        { id: 'l6-match-hobby', type: 'match-pairs', prompt: 'Зʼєднай українське хобі з англійським.', pairs: [{ left: 'малювання', right: 'drawing' }, { left: 'плавання', right: 'swimming' }, { left: 'співати', right: 'singing' }, { left: 'танцювати', right: 'dancing' }] },
        { id: 'l6-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я люблю грати в шахи з татом.', words: ['I', 'love', 'playing', 'chess', 'with', 'my', 'dad'], answer: ['I', 'love', 'playing', 'chess', 'with', 'my', 'dad'] },
        { id: 'l6-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Її хобі — танці.', answer: 'Her hobby is dancing.', acceptedAnswers: accepted('Her hobby is dancing.', ['her hobby is dancing']) },
        { id: 'l6-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Він не любить готувати.', answer: "He doesn't like cooking.", acceptedAnswers: accepted("He doesn't like cooking.", ['He does not like cooking.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 7 · Days, Time, Routines (Юніт 3)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-my-world-7-days-time',
      title: 'Days, Time, Routines',
      orderIndex: 6,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'a-my-world-time',
      sectionTitle: 'Юніт 3 · Інтереси і час',
      sectionOrder: 2,
      topic: 'time-frequency',
      steps: [
        {
          id: 'l7-theory-time',
          type: 'theory',
          title: 'Котра година? 🕐',
          body: 'Запитуємо "What time is it?" або "What\'s the time?". Відповідаємо двома способами:\n• формально: "It\'s seven thirty" (7:30)\n• описово: "It\'s half past seven" (пів на восьму, 7:30), "It\'s a quarter past seven" (7:15), "It\'s a quarter to eight" (7:45).\n\nДні тижня: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Перед днем — "on": on Monday.',
          examples: [
            { en: "It's 8 o'clock.", ua: '8:00 рівно.' },
            { en: "It's half past nine.", ua: '9:30.' },
            { en: 'I have English on Monday.', ua: 'Англійська у мене в понеділок.' },
            { en: "What's the time? — It's 6:15.", ua: 'Котра година? — 6:15.' },
          ],
          tip: '💡 Дні тижня в англійській завжди пишуться з ВЕЛИКОЇ літери.',
        },
        {
          id: 'l7-theory-frequency',
          type: 'theory',
          title: 'Прислівники частоти',
          body: 'Щоб сказати, ЯК часто щось буває, вживаємо: always (завжди), usually (зазвичай), often (часто), sometimes (іноді), rarely (рідко), never (ніколи). У реченні стоять ПЕРЕД основним дієсловом, але ПІСЛЯ "to be".',
          examples: [
            { en: 'I always brush my teeth.', ua: 'Я завжди чищу зуби.' },
            { en: 'She is usually happy.', ua: 'Вона зазвичай весела.' },
            { en: 'We often go to the park.', ua: 'Ми часто ходимо в парк.' },
            { en: 'They never eat sweets.', ua: 'Вони ніколи не їдять солодке.' },
          ],
          tip: '💡 100% always → 80% usually → 60% often → 40% sometimes → 20% rarely → 0% never.',
        },
        { id: 'l7-mcq-1', type: 'multiple-choice', question: 'How do you say 7:30?', options: ["It's half past six.", "It's half past seven.", "It's half to seven.", "It's quarter past seven."], correctIndex: 1 },
        { id: 'l7-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I always am happy.', 'I am always happy.', 'Always I am happy.', 'I always be happy.'], correctIndex: 1, explanation: 'Прислівник частоти — після "be".' },
        { id: 'l7-mcq-3', type: 'multiple-choice', question: 'Which day comes after Wednesday?', options: ['Tuesday', 'Friday', 'Thursday', 'Saturday'], correctIndex: 2 },
        { id: 'l7-mcq-4', type: 'multiple-choice', question: 'I _____ get up at 6 — only on weekends.', options: ['always', 'never', 'rarely', 'usually'], correctIndex: 2 },
        { id: 'l7-fill-1', type: 'fill-blank', before: 'We have lessons ', after: ' Monday to Friday.', answer: 'from' },
        { id: 'l7-fill-2', type: 'fill-blank', before: "She ", after: ' eats fast food — it\'s unhealthy.', answer: 'never' },
        { id: 'l7-match-day', type: 'match-pairs', prompt: 'Зʼєднай день тижня з його скороченням.', pairs: [{ left: 'Monday', right: 'Mon' }, { left: 'Wednesday', right: 'Wed' }, { left: 'Friday', right: 'Fri' }, { left: 'Sunday', right: 'Sun' }] },
        { id: 'l7-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я зазвичай встаю о сьомій ранку.', words: ['I', 'usually', 'get', 'up', 'at', 'seven'], answer: ['I', 'usually', 'get', 'up', 'at', 'seven'] },
        { id: 'l7-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Зараз пів на десяту.', answer: "It's half past nine.", acceptedAnswers: accepted("It's half past nine.", ["It is half past nine.", "It's 9:30.", "It is 9:30."]) },
        { id: 'l7-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'У суботу ми часто ходимо в парк.', answer: 'On Saturday we often go to the park.', acceptedAnswers: accepted('On Saturday we often go to the park.', ['We often go to the park on Saturday.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 8 · Weekend Plans (Юніт 3) — going to
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-my-world-8-weekend-plans',
      title: 'Weekend Plans',
      orderIndex: 7,
      type: 'interactive',
      durationMin: 13,
      xp: 20,
      sectionSlug: 'a-my-world-time',
      sectionTitle: 'Юніт 3 · Інтереси і час',
      sectionOrder: 2,
      topic: 'going-to-future',
      steps: [
        {
          id: 'l8-theory-going',
          type: 'theory',
          title: '"Going to" — плани на майбутнє',
          body: '"Going to" використовуємо, коли вже ЗАПЛАНУВАЛИ дію. Формула: am/is/are + going to + V (інфінітив). Часто з маркерами: tomorrow, next week, this weekend.',
          examples: [
            { en: "I'm going to visit my grandma tomorrow.", ua: 'Я завтра збираюся відвідати бабусю.' },
            { en: 'We are going to play football on Saturday.', ua: 'Ми збираємось грати у футбол у суботу.' },
            { en: 'She is going to read this book.', ua: 'Вона збирається прочитати цю книгу.' },
            { en: "He isn't going to come.", ua: 'Він не збирається приходити.' },
          ],
          tip: '💡 Не плутай "going" (-ing forma від "go") і "going to" (структура майбутнього). У майбутньому "going to" — це не "йти", а "збиратися".',
        },
        {
          id: 'l8-theory-pc-future',
          type: 'theory',
          title: 'Present Continuous для домовленостей',
          body: 'Якщо ти ВЖЕ домовився з кимось чи купив квитки — англійська вживає Present Continuous (am/is/are + V-ing) для майбутнього: "I\'m meeting Sarah at 6". Це звучить ще конкретніше, ніж "going to".',
          examples: [
            { en: "I'm meeting John at 7 p.m.", ua: 'Я зустрічаюсь з Джоном о 7-й вечора.' },
            { en: 'We are flying to London on Friday.', ua: 'Ми летимо до Лондона в пʼятницю.' },
            { en: "She's having dinner with her family tonight.", ua: 'Вона сьогодні вечеряє з родиною.' },
          ],
          tip: '💡 Для домовленостей із чітким часом — Present Continuous. Для просто планів і намірів — going to.',
        },
        { id: 'l8-mcq-1', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I going to visit my friend.', "I'm going to visit my friend.", "I'm going visit my friend.", "I'm going to visiting my friend."], correctIndex: 1 },
        { id: 'l8-mcq-2', type: 'multiple-choice', question: 'They _____ buy a new car next month.', options: ['are go to', 'are going', 'are going to', 'is going to'], correctIndex: 2 },
        { id: 'l8-mcq-3', type: 'multiple-choice', question: '_____ you going to study tonight?', options: ['Are', 'Is', 'Do', 'Does'], correctIndex: 0 },
        { id: 'l8-mcq-4', type: 'multiple-choice', question: 'Which sentence is about a CONFIRMED arrangement?', options: ['I usually meet John on Monday.', "I'm meeting John tomorrow at 6.", 'I meet John often.', 'I will meet John maybe.'], correctIndex: 1 },
        { id: 'l8-fill-1', type: 'fill-blank', before: 'We ', after: ' going to have a picnic on Sunday.', answer: 'are' },
        { id: 'l8-fill-2', type: 'fill-blank', before: "I'm ", after: ' my best friend tonight.', answer: 'meeting', hint: 'Present Continuous для домовленості' },
        { id: 'l8-match-future', type: 'match-pairs', prompt: 'Зʼєднай маркер часу з типовою конструкцією.', pairs: [{ left: 'tomorrow', right: 'going to' }, { left: 'next week', right: 'going to' }, { left: 'tonight at 8', right: 'Present Continuous' }, { left: 'this Friday', right: 'Present Continuous' }] },
        { id: 'l8-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'У суботу ми збираємось у кіно.', words: ['On', 'Saturday', 'we', 'are', 'going', 'to', 'the', 'cinema'], answer: ['On', 'Saturday', 'we', 'are', 'going', 'to', 'the', 'cinema'] },
        { id: 'l8-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я завтра збираюся відвідати бабусю.', answer: "I'm going to visit my grandma tomorrow.", acceptedAnswers: accepted("I'm going to visit my grandma tomorrow.", ['I am going to visit my grandma tomorrow.', "I'm going to visit my grandmother tomorrow."]) },
        { id: 'l8-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Ми сьогодні ввечері вечеряємо з друзями.', answer: 'We are having dinner with friends tonight.', acceptedAnswers: accepted('We are having dinner with friends tonight.', ["We're having dinner with friends tonight.", "We are having dinner with friends this evening."]) },
      ],
    },
  ],
};
