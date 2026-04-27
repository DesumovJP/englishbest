import type { CourseSeed } from '../types';

/**
 * v2 SHELLS — `a-my-world`, `a-people-places`, `b-stories`, `b-ideas`,
 * `b-real-world`.
 *
 * Each course is metadata + ONE fully-written sample lesson (~12 steps)
 * so the catalog renders end-to-end and the next session can extend each
 * shell to the full 8-lesson plan documented in COURSES.md.
 *
 * The `a-foundation` course is the EXEMPLAR — see `./a-foundation.ts`.
 */

function accepted(answer: string, extras: string[] = []): string[] {
  const noPunct = answer.replace(/[.!?]$/, '');
  const lc = answer.toLowerCase();
  const lcNoPunct = noPunct.toLowerCase();
  return Array.from(new Set([answer, noPunct, lc, lcNoPunct, ...extras]));
}

// ═════════════════════════════════════════════════════════════════════
// A · My World 🏠
// ═════════════════════════════════════════════════════════════════════
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
            { en: 'There isn\'t a bath in my flat.', ua: 'У моїй квартирі немає ванни.' },
          ],
          tip: '💡 Скорочуємо: there is → there\'s, there is not → there isn\'t.',
        },
        {
          id: 'l1-mcq-room1',
          type: 'multiple-choice',
          question: 'Where do you usually cook food?',
          options: ['in the bedroom', 'in the kitchen', 'in the bathroom', 'in the hall'],
          correctIndex: 1,
          explanation: 'Готують їжу на кухні (kitchen).',
        },
        {
          id: 'l1-mcq-room2',
          type: 'multiple-choice',
          question: 'Choose the correct sentence.',
          options: [
            'There is two chairs.',
            'There are two chairs.',
            'There am two chairs.',
            'It is two chairs.',
          ],
          correctIndex: 1,
          explanation: 'Два стільці — це множина, тому "there are".',
        },
        {
          id: 'l1-mcq-room3',
          type: 'multiple-choice',
          question: 'Where do you sleep?',
          options: ['kitchen', 'bedroom', 'living room', 'hall'],
          correctIndex: 1,
        },
        {
          id: 'l1-mcq-room4',
          type: 'multiple-choice',
          question: 'How do you ask "Is there a window in the bathroom?"',
          options: [
            'Is a window in the bathroom?',
            'Are there window in the bathroom?',
            'Is there a window in the bathroom?',
            'There is a window in the bathroom?',
          ],
          correctIndex: 2,
          explanation: 'Питання: "Is there..." з артиклем "a" перед предметом.',
        },
        {
          id: 'l1-fill-room1',
          type: 'fill-blank',
          before: 'There ',
          after: ' three pictures on the wall.',
          answer: 'are',
          hint: 'Three pictures = множина',
        },
        {
          id: 'l1-fill-room2',
          type: 'fill-blank',
          before: 'I sleep in the ',
          after: '.',
          answer: 'bedroom',
        },
        {
          id: 'l1-match-rooms',
          type: 'match-pairs',
          prompt: 'Зʼєднай кімнату з предметом, який там зазвичай знаходиться.',
          pairs: [
            { left: 'kitchen', right: 'fridge' },
            { left: 'bedroom', right: 'bed' },
            { left: 'bathroom', right: 'shower' },
            { left: 'living room', right: 'sofa' },
          ],
        },
        {
          id: 'l1-wordorder-room',
          type: 'word-order',
          prompt: 'Склади речення.',
          translation: 'У вітальні є великий телевізор.',
          words: ['There', 'is', 'a', 'big', 'TV', 'in', 'the', 'living', 'room'],
          answer: ['There', 'is', 'a', 'big', 'TV', 'in', 'the', 'living', 'room'],
        },
        {
          id: 'l1-translate-room1',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'У спальні два ліжка.',
          answer: 'There are two beds in the bedroom.',
          acceptedAnswers: accepted('There are two beds in the bedroom.', [
            'there are 2 beds in the bedroom',
            'There are two beds in my bedroom.',
          ]),
        },
        {
          id: 'l1-translate-room2',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'На кухні немає вікна.',
          answer: "There isn't a window in the kitchen.",
          acceptedAnswers: accepted("There isn't a window in the kitchen.", [
            'There is no window in the kitchen.',
            'there is not a window in the kitchen',
          ]),
        },
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════
// A · People & Places 🌍
// ═════════════════════════════════════════════════════════════════════
export const aPeoplePlaces: CourseSeed = {
  slug: 'a-people-places',
  createIfMissing: {
    title: 'People & Places',
    titleUa: 'Люди та місця',
    subtitle: 'A-рівень · 8 уроків · опис і порівняння',
    description:
      'Курс №3 для рівня A. Описуємо людей і місця, порівнюємо за допомогою прикметників, знайомимось із Past Simple — і вчимось розповідати про вчора.',
    descriptionShort: 'Опис, порівняння, найкраще, минуле — Past Simple.',
    level: 'A2',
    audience: 'kids',
    kind: 'course',
    iconEmoji: '🌍',
    tags: ['a-band', 'description', 'past-simple'],
  },
  lessons: [
    {
      slug: 'a-people-places-1-describing',
      title: 'Describing People',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 13,
      xp: 15,
      sectionSlug: 'a-people-places-people',
      sectionTitle: 'Юніт 1 · Люди',
      sectionOrder: 0,
      isFree: true,
      topic: 'describing-people',
      steps: [
        {
          id: 'l1-theory-adjectives',
          type: 'theory',
          title: 'Прикметники для людей',
          body: 'Щоб описати людину, ми використовуємо прикметники (adjectives). Зовнішність: tall (високий), short (низький), young (молодий), old (старий). Характер: kind (добрий), funny (смішний), shy (соромʼязливий), brave (сміливий).',
          examples: [
            { en: 'My brother is tall.', ua: 'Мій брат високий.' },
            { en: 'She is very kind.', ua: 'Вона дуже добра.' },
            { en: 'They are young.', ua: 'Вони молоді.' },
            { en: 'My grandfather is old but funny.', ua: 'Мій дідусь старий, але смішний.' },
          ],
          tip: '💡 У англійській прикметник стоїть ПЕРЕД іменником: "a tall boy", не "a boy tall".',
        },
        {
          id: 'l1-theory-has',
          type: 'theory',
          title: 'He has / She has — риси людини',
          body: 'Коли описуємо частини тіла чи риси (волосся, очі), вживаємо дієслово "have / has". "I/you/we/they have", "he/she/it has". Часто з прикметниками-кольорами: blue eyes, brown hair.',
          examples: [
            { en: 'She has long hair.', ua: 'У неї довге волосся.' },
            { en: 'He has blue eyes.', ua: 'У нього блакитні очі.' },
            { en: 'I have short brown hair.', ua: 'У мене коротке коричневе волосся.' },
            { en: 'They have green eyes.', ua: 'У них зелені очі.' },
          ],
        },
        {
          id: 'l1-mcq-adj1',
          type: 'multiple-choice',
          question: 'Choose the OPPOSITE of "tall".',
          options: ['young', 'short', 'old', 'kind'],
          correctIndex: 1,
        },
        {
          id: 'l1-mcq-adj2',
          type: 'multiple-choice',
          question: 'My sister _____ long hair.',
          options: ['have', 'has', 'is', 'are'],
          correctIndex: 1,
          explanation: 'She/He → has.',
        },
        {
          id: 'l1-mcq-adj3',
          type: 'multiple-choice',
          question: 'Which sentence is correct?',
          options: [
            'He is a boy tall.',
            'He is a tall boy.',
            'He tall is a boy.',
            'He boy tall is.',
          ],
          correctIndex: 1,
          explanation: 'Прикметник стоїть перед іменником.',
        },
        {
          id: 'l1-mcq-adj4',
          type: 'multiple-choice',
          question: 'A person who likes to help others is...',
          options: ['shy', 'old', 'kind', 'tall'],
          correctIndex: 2,
        },
        {
          id: 'l1-fill-adj1',
          type: 'fill-blank',
          before: 'My grandmother ',
          after: ' grey hair.',
          answer: 'has',
        },
        {
          id: 'l1-fill-adj2',
          type: 'fill-blank',
          before: 'Tom is very ',
          after: ' — he tells funny jokes.',
          answer: 'funny',
        },
        {
          id: 'l1-match-adj',
          type: 'match-pairs',
          prompt: 'Зʼєднай протилежності.',
          pairs: [
            { left: 'tall', right: 'short' },
            { left: 'young', right: 'old' },
            { left: 'brave', right: 'shy' },
            { left: 'happy', right: 'sad' },
          ],
        },
        {
          id: 'l1-wordorder-adj',
          type: 'word-order',
          prompt: 'Склади речення.',
          translation: 'У моєї сестри коротке темне волосся.',
          words: ['My', 'sister', 'has', 'short', 'dark', 'hair'],
          answer: ['My', 'sister', 'has', 'short', 'dark', 'hair'],
        },
        {
          id: 'l1-translate-adj1',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'Мій тато високий і добрий.',
          answer: 'My dad is tall and kind.',
          acceptedAnswers: accepted('My dad is tall and kind.', [
            'My father is tall and kind.',
            'my dad is tall and kind',
          ]),
        },
        {
          id: 'l1-translate-adj2',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'У неї блакитні очі.',
          answer: 'She has blue eyes.',
          acceptedAnswers: accepted('She has blue eyes.', ['she has blue eyes']),
        },
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════
// B · Stories Worth Telling 📚
// ═════════════════════════════════════════════════════════════════════
export const bStories: CourseSeed = {
  slug: 'b-stories',
  createIfMissing: {
    title: 'Stories Worth Telling',
    titleUa: 'Історії, які варто розповідати',
    subtitle: 'B-рівень · 8 уроків · оповідь і часи минулого',
    description:
      'Курс для рівня B1. Past Simple, Past Continuous, Past Perfect — у звʼязці з реальними сюжетами про подорожі, школу, родину. Наприкінці курсу учень може скласти оповідання з 5–7 речень.',
    descriptionShort: 'Past Simple/Continuous/Perfect через історії.',
    level: 'B1',
    audience: 'kids',
    kind: 'course',
    iconEmoji: '📚',
    tags: ['b-band', 'narrative', 'past-tenses'],
  },
  lessons: [
    {
      slug: 'b-stories-1-travel-past',
      title: 'Travel Past',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 14,
      xp: 18,
      sectionSlug: 'b-stories-narrative',
      sectionTitle: 'Юніт 1 · Розповідаємо минуле',
      sectionOrder: 0,
      isFree: true,
      topic: 'travel-past-simple',
      steps: [
        {
          id: 'l1-theory-pastsimple',
          type: 'theory',
          title: 'Past Simple — швидке нагадування',
          body: 'Past Simple описує закінчену дію в минулому. Правильні дієслова отримують закінчення -ed: walk → walked, visit → visited. Неправильні треба запамʼятати: go → went, see → saw, take → took, fly → flew.',
          examples: [
            { en: 'Last summer I visited Italy.', ua: 'Минулого літа я відвідав Італію.' },
            { en: 'We went to the beach every day.', ua: 'Ми ходили на пляж щодня.' },
            { en: 'She took many photos.', ua: 'Вона зробила багато фото.' },
            { en: 'I didn\'t see the Colosseum.', ua: 'Я не побачив Колізей.' },
          ],
          tip: '💡 У запитанні й запереченні допоміжне дієслово — "did" / "didn\'t", а основне дієслово повертається у форму без -ed.',
        },
        {
          id: 'l1-theory-transport',
          type: 'theory',
          title: 'Транспорт і "by + транспорт"',
          body: 'Коли говоримо ЯК ми подорожували, англійська вживає "by + transport" БЕЗ артикля: by car, by bus, by train, by plane. Виняток: on foot — пішки.',
          examples: [
            { en: 'We travelled by train.', ua: 'Ми подорожували потягом.' },
            { en: 'They went to Paris by plane.', ua: 'Вони полетіли до Парижа літаком.' },
            { en: 'I came home on foot.', ua: 'Я прийшов додому пішки.' },
          ],
        },
        {
          id: 'l1-mcq-past1',
          type: 'multiple-choice',
          question: 'Choose the Past Simple form of "go".',
          options: ['goed', 'went', 'gone', 'going'],
          correctIndex: 1,
          explanation: '"go" — неправильне дієслово, минула форма "went".',
        },
        {
          id: 'l1-mcq-past2',
          type: 'multiple-choice',
          question: 'I _____ to the cinema yesterday.',
          options: ['go', 'went', 'gone', 'goes'],
          correctIndex: 1,
        },
        {
          id: 'l1-mcq-past3',
          type: 'multiple-choice',
          question: 'How do you say "Я не бачив його"?',
          options: [
            "I didn't saw him.",
            "I didn't see him.",
            "I don't see him.",
            "I not saw him.",
          ],
          correctIndex: 1,
          explanation: 'Після "didn\'t" — інфінітив без -ed: see, не saw.',
        },
        {
          id: 'l1-mcq-past4',
          type: 'multiple-choice',
          question: 'We travelled to Berlin _____ train.',
          options: ['on', 'by', 'in', 'with'],
          correctIndex: 1,
        },
        {
          id: 'l1-fill-past1',
          type: 'fill-blank',
          before: 'Last weekend we ',
          after: ' our grandparents.',
          answer: 'visited',
          hint: 'visit → правильне дієслово',
        },
        {
          id: 'l1-fill-past2',
          type: 'fill-blank',
          before: 'They ',
          after: ' to Spain by plane.',
          answer: 'flew',
          hint: 'fly → flew',
        },
        {
          id: 'l1-match-past',
          type: 'match-pairs',
          prompt: 'Зʼєднай дієслово з його Past Simple формою.',
          pairs: [
            { left: 'go', right: 'went' },
            { left: 'see', right: 'saw' },
            { left: 'take', right: 'took' },
            { left: 'eat', right: 'ate' },
            { left: 'have', right: 'had' },
          ],
        },
        {
          id: 'l1-wordorder-past',
          type: 'word-order',
          prompt: 'Склади речення.',
          translation: 'Минулого літа ми поїхали до Італії потягом.',
          words: ['Last', 'summer', 'we', 'went', 'to', 'Italy', 'by', 'train'],
          answer: ['Last', 'summer', 'we', 'went', 'to', 'Italy', 'by', 'train'],
        },
        {
          id: 'l1-translate-past1',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'Я відвідав свою бабусю минулих вихідних.',
          answer: 'I visited my grandmother last weekend.',
          acceptedAnswers: accepted('I visited my grandmother last weekend.', [
            'I visited my grandma last weekend.',
            'last weekend i visited my grandmother',
          ]),
        },
        {
          id: 'l1-translate-past2',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'Вона не бачила цей фільм учора.',
          answer: "She didn't see that film yesterday.",
          acceptedAnswers: accepted("She didn't see that film yesterday.", [
            "She didn't watch that film yesterday.",
            "She didn't see this film yesterday.",
          ]),
        },
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════
// B · Ideas & Opinions 💡
// ═════════════════════════════════════════════════════════════════════
export const bIdeas: CourseSeed = {
  slug: 'b-ideas',
  createIfMissing: {
    title: 'Ideas & Opinions',
    titleUa: 'Ідеї та думки',
    subtitle: 'B-рівень · 8 уроків · модальні дієслова + умовні',
    description:
      'Курс для рівня B1. Висловлюємо думки, користуємось модальними дієсловами (should/must/have to), будуємо умовні речення (1-й і 2-й тип), говоримо про технології та майбутнє.',
    descriptionShort: 'Думки, модальні, умовні, технології, майбутнє.',
    level: 'B1',
    audience: 'teens',
    kind: 'course',
    iconEmoji: '💡',
    tags: ['b-band', 'modal-verbs', 'conditionals'],
  },
  lessons: [
    {
      slug: 'b-ideas-1-what-i-think',
      title: 'What I Think',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-ideas-opinions',
      sectionTitle: 'Юніт 1 · Висловлюємо думку',
      sectionOrder: 0,
      isFree: true,
      topic: 'opinion-language',
      steps: [
        {
          id: 'l1-theory-opinion',
          type: 'theory',
          title: 'Як висловити думку',
          body: 'Найбезпечніші стартери для думки: "I think..." (я думаю), "I believe..." (я вірю / переконаний), "In my opinion..." (на мою думку). Додаючи "because", ти аргументуєш.',
          examples: [
            { en: 'I think English is useful.', ua: 'Я думаю, англійська корисна.' },
            { en: 'I believe sport is important.', ua: 'Я переконаний, що спорт важливий.' },
            { en: 'In my opinion, books are better than films.', ua: 'На мою думку, книги краще за фільми.' },
            { en: 'I think so, because it helps us travel.', ua: 'Так, тому що це допомагає подорожувати.' },
          ],
          tip: '💡 "I think so" / "I don\'t think so" — швидкі відповіді на питання-думку.',
        },
        {
          id: 'l1-theory-agree',
          type: 'theory',
          title: 'Згода / незгода',
          body: 'Щоб погодитись: "I agree" (згоден), "That\'s true" (це правда), "Exactly" (саме так). Щоб не погодитись ввічливо: "I disagree" (я не згоден), "I\'m not sure" (я не впевнений), "I see your point, but..." (я розумію вас, але...).',
          examples: [
            { en: 'I agree with you.', ua: 'Я з тобою згоден.' },
            { en: "I don't agree, sorry.", ua: 'Не погоджуюсь, вибач.' },
            { en: "I'm not sure about that.", ua: 'Я в цьому не впевнений.' },
            { en: 'I see your point, but I think differently.', ua: 'Я розумію тебе, але думаю інакше.' },
          ],
        },
        {
          id: 'l1-mcq-op1',
          type: 'multiple-choice',
          question: 'Which phrase introduces an OPINION?',
          options: ['It is raining.', 'I think English is fun.', 'She lives in Kyiv.', 'They have two cats.'],
          correctIndex: 1,
        },
        {
          id: 'l1-mcq-op2',
          type: 'multiple-choice',
          question: 'You want to politely DISAGREE. Which is best?',
          options: [
            'You are wrong!',
            'I see your point, but I think differently.',
            'No way.',
            'Stop talking.',
          ],
          correctIndex: 1,
          explanation: 'Інші варіанти грубі. "I see your point, but..." — ввічливо.',
        },
        {
          id: 'l1-mcq-op3',
          type: 'multiple-choice',
          question: 'Choose the correct sentence.',
          options: [
            'In my opinion is English important.',
            'In my opinion, English is important.',
            "I'm opinion English is important.",
            'My opinion English is important.',
          ],
          correctIndex: 1,
        },
        {
          id: 'l1-mcq-op4',
          type: 'multiple-choice',
          question: '"Exactly!" means...',
          options: ['I disagree.', 'I strongly agree.', "I'm not sure.", 'Maybe.'],
          correctIndex: 1,
        },
        {
          id: 'l1-fill-op1',
          type: 'fill-blank',
          before: 'I ',
          after: ' that English is useful.',
          answer: 'think',
        },
        {
          id: 'l1-fill-op2',
          type: 'fill-blank',
          before: 'I ',
          after: ' with you completely.',
          answer: 'agree',
        },
        {
          id: 'l1-match-op',
          type: 'match-pairs',
          prompt: 'Зʼєднай українську фразу з англійською.',
          pairs: [
            { left: 'на мою думку', right: 'in my opinion' },
            { left: 'я згоден', right: 'I agree' },
            { left: 'я не впевнений', right: "I'm not sure" },
            { left: 'саме так', right: 'exactly' },
          ],
        },
        {
          id: 'l1-wordorder-op',
          type: 'word-order',
          prompt: 'Склади речення.',
          translation: 'Я думаю, що книги краще, ніж фільми.',
          words: ['I', 'think', 'books', 'are', 'better', 'than', 'films'],
          answer: ['I', 'think', 'books', 'are', 'better', 'than', 'films'],
        },
        {
          id: 'l1-translate-op1',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'На мою думку, спорт важливий.',
          answer: 'In my opinion, sport is important.',
          acceptedAnswers: accepted('In my opinion, sport is important.', [
            'In my opinion sport is important.',
            'In my opinion, sports are important.',
          ]),
        },
        {
          id: 'l1-translate-op2',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'Я з тобою не згоден.',
          answer: "I don't agree with you.",
          acceptedAnswers: accepted("I don't agree with you.", [
            'I disagree with you.',
            "i don't agree with you",
          ]),
        },
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════
// B · Real-World English 🌐
// ═════════════════════════════════════════════════════════════════════
export const bRealWorld: CourseSeed = {
  slug: 'b-real-world',
  createIfMissing: {
    title: 'Real-World English',
    titleUa: 'Англійська у реальному житті',
    subtitle: 'B-рівень · 8 уроків · Present Perfect, пасив, ідіоми',
    description:
      'Курс для рівня B2. Present Perfect, пасивний стан, формальний vs неформальний регістр, ідіоми, реальні розмовні сценарії. Завершальна вершина А-Б шляху.',
    descriptionShort: 'Present Perfect, пасив, регістр, ідіоми.',
    level: 'B2',
    audience: 'teens',
    kind: 'course',
    iconEmoji: '🌐',
    tags: ['b-band', 'present-perfect', 'passive-voice'],
  },
  lessons: [
    {
      slug: 'b-real-world-1-have-you-ever',
      title: 'Have You Ever…?',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 14,
      xp: 18,
      sectionSlug: 'b-real-world-perfect',
      sectionTitle: 'Юніт 1 · Present Perfect',
      sectionOrder: 0,
      isFree: true,
      topic: 'present-perfect-experience',
      steps: [
        {
          id: 'l1-theory-pp',
          type: 'theory',
          title: 'Present Perfect — досвід',
          body: 'Present Perfect показує ДОСВІД — щось, що сталось у твоєму житті будь-коли (без вказівки точно коли). Формула: have / has + past participle (V3). Часто використовується "ever" (коли-небудь) і "never" (ніколи).',
          examples: [
            { en: 'I have visited London.', ua: 'Я бував у Лондоні.' },
            { en: 'She has tried sushi.', ua: 'Вона куштувала суші.' },
            { en: 'Have you ever been to Paris?', ua: 'Ти коли-небудь був у Парижі?' },
            { en: 'I have never seen snow.', ua: 'Я ніколи не бачив снігу.' },
          ],
          tip: '💡 НЕ використовуй Present Perfect із точним часом ("yesterday", "in 2020") — там тільки Past Simple.',
        },
        {
          id: 'l1-theory-v3',
          type: 'theory',
          title: 'Past participle (V3)',
          body: 'Past participle (V3) — третя форма дієслова. Для правильних дієслів збігається з Past Simple: visit → visited → visited. Для неправильних треба запамʼятати: go → went → GONE, see → saw → SEEN, eat → ate → EATEN, be → was/were → BEEN.',
          examples: [
            { en: 'go → went → gone', ua: 'йти/ходив/був' },
            { en: 'see → saw → seen', ua: 'бачити' },
            { en: 'eat → ate → eaten', ua: 'їсти' },
            { en: 'be → was/were → been', ua: 'бути' },
          ],
        },
        {
          id: 'l1-mcq-pp1',
          type: 'multiple-choice',
          question: 'Choose the correct Present Perfect.',
          options: [
            'I have saw that film.',
            'I have seen that film.',
            'I has see that film.',
            'I am seen that film.',
          ],
          correctIndex: 1,
          explanation: 'have + V3 (seen).',
        },
        {
          id: 'l1-mcq-pp2',
          type: 'multiple-choice',
          question: 'Which sentence is WRONG?',
          options: [
            "I've never been to Italy.",
            "She's tried sushi twice.",
            'I have visited Rome in 2019.',
            'Have you ever flown a plane?',
          ],
          correctIndex: 2,
          explanation: '"in 2019" — точний час → треба Past Simple: I visited Rome in 2019.',
        },
        {
          id: 'l1-mcq-pp3',
          type: 'multiple-choice',
          question: 'Past participle of "be" is...',
          options: ['was', 'were', 'been', 'being'],
          correctIndex: 2,
        },
        {
          id: 'l1-mcq-pp4',
          type: 'multiple-choice',
          question: '_____ you ever eaten Japanese food?',
          options: ['Did', 'Have', 'Are', 'Do'],
          correctIndex: 1,
        },
        {
          id: 'l1-fill-pp1',
          type: 'fill-blank',
          before: 'I have ',
          after: ' to many countries.',
          answer: 'been',
          hint: 'be → was/were → ?',
        },
        {
          id: 'l1-fill-pp2',
          type: 'fill-blank',
          before: 'She ',
          after: ' tried Korean food before.',
          answer: 'has',
          hint: 'She → has',
        },
        {
          id: 'l1-match-pp',
          type: 'match-pairs',
          prompt: 'Зʼєднай дієслово з його past participle (V3).',
          pairs: [
            { left: 'go', right: 'gone' },
            { left: 'see', right: 'seen' },
            { left: 'eat', right: 'eaten' },
            { left: 'be', right: 'been' },
            { left: 'do', right: 'done' },
          ],
        },
        {
          id: 'l1-wordorder-pp',
          type: 'word-order',
          prompt: 'Склади речення.',
          translation: 'Чи ти коли-небудь куштував суші?',
          words: ['Have', 'you', 'ever', 'tried', 'sushi'],
          answer: ['Have', 'you', 'ever', 'tried', 'sushi'],
        },
        {
          id: 'l1-translate-pp1',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'Я ніколи не був у Лондоні.',
          answer: "I've never been to London.",
          acceptedAnswers: accepted("I've never been to London.", [
            'I have never been to London.',
            "i've never been to london",
          ]),
        },
        {
          id: 'l1-translate-pp2',
          type: 'translate',
          prompt: 'Переклади англійською:',
          sentence: 'Вона бачила цей фільм двічі.',
          answer: 'She has seen this film twice.',
          acceptedAnswers: accepted('She has seen this film twice.', [
            "She's seen this film twice.",
            'She has watched this film twice.',
          ]),
        },
      ],
    },
  ],
};
