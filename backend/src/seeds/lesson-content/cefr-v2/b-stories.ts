/**
 * B · Stories Worth Telling 📚 — 8-lesson B1 course.
 *
 * Past tenses + narrative skills. By the end the kid can write a
 * 5-sentence story about travel, school or family using past simple,
 * past continuous and past perfect.
 *
 * Sections (3 units):
 *   Юніт 1 · Минулі часи         (L1, L2, L3)
 *   Юніт 2 · Звʼязки та сценарії (L4, L5, L6)
 *   Юніт 3 · Власна оповідь      (L7, L8)
 */
import type { CourseSeed } from '../types';

function accepted(answer: string, extras: string[] = []): string[] {
  const noPunct = answer.replace(/[.!?]$/, '');
  const lc = answer.toLowerCase();
  const lcNoPunct = noPunct.toLowerCase();
  return Array.from(new Set([answer, noPunct, lc, lcNoPunct, ...extras]));
}

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
    // ═══════════════════════════════════════════════════════════════════
    // LESSON 1 · Travel Past (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-stories-1-travel-past',
      title: 'Travel Past',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 14,
      xp: 18,
      sectionSlug: 'b-stories-narrative',
      sectionTitle: 'Юніт 1 · Минулі часи',
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
            { en: "I didn't see the Colosseum.", ua: 'Я не побачив Колізей.' },
          ],
          tip: "💡 У запитанні й запереченні допоміжне дієслово — \"did\" / \"didn't\", а основне дієслово повертається у форму без -ed.",
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
        { id: 'l1-mcq-past1', type: 'multiple-choice', question: 'Choose the Past Simple form of "go".', options: ['goed', 'went', 'gone', 'going'], correctIndex: 1 },
        { id: 'l1-mcq-past2', type: 'multiple-choice', question: 'I _____ to the cinema yesterday.', options: ['go', 'went', 'gone', 'goes'], correctIndex: 1 },
        { id: 'l1-mcq-past3', type: 'multiple-choice', question: 'How do you say "Я не бачив його"?', options: ["I didn't saw him.", "I didn't see him.", "I don't see him.", "I not saw him."], correctIndex: 1 },
        { id: 'l1-mcq-past4', type: 'multiple-choice', question: 'We travelled to Berlin _____ train.', options: ['on', 'by', 'in', 'with'], correctIndex: 1 },
        { id: 'l1-fill-past1', type: 'fill-blank', before: 'Last weekend we ', after: ' our grandparents.', answer: 'visited', hint: 'visit → правильне дієслово' },
        { id: 'l1-fill-past2', type: 'fill-blank', before: 'They ', after: ' to Spain by plane.', answer: 'flew', hint: 'fly → flew' },
        { id: 'l1-match-past', type: 'match-pairs', prompt: 'Зʼєднай дієслово з його Past Simple формою.', pairs: [{ left: 'go', right: 'went' }, { left: 'see', right: 'saw' }, { left: 'take', right: 'took' }, { left: 'eat', right: 'ate' }, { left: 'have', right: 'had' }] },
        { id: 'l1-wordorder-past', type: 'word-order', prompt: 'Склади речення.', translation: 'Минулого літа ми поїхали до Італії потягом.', words: ['Last', 'summer', 'we', 'went', 'to', 'Italy', 'by', 'train'], answer: ['Last', 'summer', 'we', 'went', 'to', 'Italy', 'by', 'train'] },
        { id: 'l1-translate-past1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я відвідав свою бабусю минулих вихідних.', answer: 'I visited my grandmother last weekend.', acceptedAnswers: accepted('I visited my grandmother last weekend.', ['I visited my grandma last weekend.']) },
        { id: 'l1-translate-past2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Вона не бачила цей фільм учора.', answer: "She didn't see that film yesterday.", acceptedAnswers: accepted("She didn't see that film yesterday.", ["She didn't watch that film yesterday."]) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 2 · While I Was Walking (Юніт 1) — Past Continuous
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-stories-2-while-walking',
      title: 'While I Was Walking…',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-stories-narrative',
      sectionTitle: 'Юніт 1 · Минулі часи',
      sectionOrder: 0,
      topic: 'past-continuous',
      steps: [
        {
          id: 'l2-theory-pc',
          type: 'theory',
          title: 'Past Continuous — дія в процесі',
          body: 'Past Continuous описує дію, яка ВІДБУВАЛАСЬ у певний момент минулого. Формула: was/were + V-ing. "I was reading" — я читав (у певний момент). Часто вживають з "while" (поки) або "when" (коли).',
          examples: [
            { en: 'I was reading at 8 p.m.', ua: 'О 8-й я читав.' },
            { en: 'They were playing in the garden.', ua: 'Вони гралися у саду.' },
            { en: 'It was raining all morning.', ua: 'Дощ лив усе ранку.' },
            { en: "She wasn't sleeping.", ua: 'Вона не спала.' },
          ],
          tip: '💡 «I was reading» ≠ «I read». Перше — процес, друге — факт що прочитав.',
        },
        {
          id: 'l2-theory-while-when',
          type: 'theory',
          title: 'Дві дії: while + when',
          body: 'Часто Past Continuous поєднується з Past Simple. Тривалу дію (фон) ставимо у Past Continuous, коротку (що перервала) — у Past Simple.\n\nФормула: "While I was walking, I saw..." — "Поки я йшов, я побачив...".',
          examples: [
            { en: 'While I was cooking, the phone rang.', ua: 'Поки я готував, задзвонив телефон.' },
            { en: 'When she opened the door, the cat was sleeping.', ua: 'Коли вона відчинила двері, кіт спав.' },
            { en: 'I was studying when my friend called.', ua: 'Я вчився, коли подзвонив друг.' },
          ],
        },
        { id: 'l2-mcq-1', type: 'multiple-choice', question: 'Choose the Past Continuous of "play".', options: ['played', 'was playing', 'plays', 'is playing'], correctIndex: 1 },
        { id: 'l2-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['While I walked, the bird sang.', 'While I was walking, the bird sang.', 'While I am walking, the bird sang.', 'While I walking, the bird sang.'], correctIndex: 1 },
        { id: 'l2-mcq-3', type: 'multiple-choice', question: 'They _____ TV when I came in.', options: ['watched', 'were watching', 'are watching', 'watch'], correctIndex: 1 },
        { id: 'l2-mcq-4', type: 'multiple-choice', question: 'When does Past Continuous fit best?', options: ['a quick one-off action', 'a habit every day', 'a process at a moment in the past', 'a future plan'], correctIndex: 2 },
        { id: 'l2-fill-1', type: 'fill-blank', before: 'I ', after: ' a book when you called.', answer: 'was reading' },
        { id: 'l2-fill-2', type: 'fill-blank', before: 'While we ', after: ' dinner, the lights went off.', answer: 'were having' },
        { id: 'l2-match-pc', type: 'match-pairs', prompt: 'Зʼєднай дієслово з Past Continuous формою (для he/she).', pairs: [{ left: 'cook', right: 'was cooking' }, { left: 'run', right: 'was running' }, { left: 'write', right: 'was writing' }, { left: 'sleep', right: 'was sleeping' }] },
        { id: 'l2-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Поки мама готувала, ми гралися у саду.', words: ['While', 'mum', 'was', 'cooking', 'we', 'were', 'playing', 'in', 'the', 'garden'], answer: ['While', 'mum', 'was', 'cooking', 'we', 'were', 'playing', 'in', 'the', 'garden'] },
        { id: 'l2-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'О 8-й вечора я читав книгу.', answer: 'At 8 p.m. I was reading a book.', acceptedAnswers: accepted('At 8 p.m. I was reading a book.', ['I was reading a book at 8 p.m.', 'At 8 pm I was reading a book.']) },
        { id: 'l2-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Поки я йшов додому, почався дощ.', answer: 'While I was walking home, it started to rain.', acceptedAnswers: accepted('While I was walking home, it started to rain.', ['While I was walking home it started to rain.', 'While I was walking home, it began to rain.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 3 · Long Before That (Юніт 1) — Past Perfect
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-stories-3-long-before',
      title: 'Long Before That',
      orderIndex: 2,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-stories-narrative',
      sectionTitle: 'Юніт 1 · Минулі часи',
      sectionOrder: 0,
      topic: 'past-perfect',
      steps: [
        {
          id: 'l3-theory-pp',
          type: 'theory',
          title: 'Past Perfect — дія до іншої дії',
          body: 'Past Perfect показує, що дія сталась РАНІШЕ за іншу дію в минулому. Формула: had + V3 (past participle). Часто з "by the time", "before", "after", "already".',
          examples: [
            { en: 'When I arrived, the film had already started.', ua: 'Коли я прийшов, фільм уже почався.' },
            { en: 'She had finished her homework before she went to bed.', ua: 'Вона закінчила домашку до того, як пішла спати.' },
            { en: 'They had never seen snow before.', ua: 'Вони ніколи раніше не бачили снігу.' },
          ],
          tip: '💡 Якщо одна дія сталась "раніше" в минулому — вона у Past Perfect, пізніша — у Past Simple.',
        },
        {
          id: 'l3-theory-by-time',
          type: 'theory',
          title: 'Маркери: by, before, after, already',
          body: 'Past Perfect зручно поєднувати з:\n• by the time (на момент коли)\n• before / after (до того / після того)\n• already (вже), never (ніколи)\n• just (щойно).',
          examples: [
            { en: 'By the time we arrived, dinner had ended.', ua: 'Коли ми прийшли, вечеря вже закінчилась.' },
            { en: 'I had just finished when she called.', ua: 'Я щойно закінчив, коли вона подзвонила.' },
            { en: 'Before I went to school, I had eaten breakfast.', ua: 'Перед школою я поснідав.' },
          ],
        },
        { id: 'l3-mcq-1', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['When I came, the film had started.', 'When I came, the film has started.', 'When I came, the film starts.', 'When I came, the film start.'], correctIndex: 0 },
        { id: 'l3-mcq-2', type: 'multiple-choice', question: 'Past Perfect of "see" is...', options: ['had see', 'had saw', 'had seen', 'has seen'], correctIndex: 2 },
        { id: 'l3-mcq-3', type: 'multiple-choice', question: 'She _____ never _____ snow before.', options: ['has, seen', 'had, seen', 'had, saw', 'has, saw'], correctIndex: 1 },
        { id: 'l3-mcq-4', type: 'multiple-choice', question: 'Which marker fits Past Perfect?', options: ['now', 'tomorrow', 'by the time', 'every Sunday'], correctIndex: 2 },
        { id: 'l3-fill-1', type: 'fill-blank', before: 'When we arrived, they ', after: ' already left.', answer: 'had' },
        { id: 'l3-fill-2', type: 'fill-blank', before: 'Before I came to Kyiv, I ', after: ' never lived in a big city.', answer: 'had' },
        { id: 'l3-match-v3', type: 'match-pairs', prompt: 'Зʼєднай дієслово з V3 (past participle).', pairs: [{ left: 'go', right: 'gone' }, { left: 'see', right: 'seen' }, { left: 'do', right: 'done' }, { left: 'eat', right: 'eaten' }] },
        { id: 'l3-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'До того як я прийшов, вечеря вже закінчилася.', words: ['By', 'the', 'time', 'I', 'arrived', 'dinner', 'had', 'ended'], answer: ['By', 'the', 'time', 'I', 'arrived', 'dinner', 'had', 'ended'] },
        { id: 'l3-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Коли я прийшов, фільм вже почався.', answer: 'When I arrived, the film had already started.', acceptedAnswers: accepted('When I arrived, the film had already started.', ['By the time I arrived, the film had already started.']) },
        { id: 'l3-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Вона ніколи раніше не літала літаком.', answer: 'She had never flown by plane before.', acceptedAnswers: accepted('She had never flown by plane before.', ['She had never flown a plane before.', 'She had never flown on a plane before.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 4 · Connectors That Tell a Story (Юніт 2)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-stories-4-connectors',
      title: 'Connectors That Tell a Story',
      orderIndex: 3,
      type: 'interactive',
      durationMin: 12,
      xp: 18,
      sectionSlug: 'b-stories-connect',
      sectionTitle: 'Юніт 2 · Звʼязки та сценарії',
      sectionOrder: 1,
      topic: 'narrative-connectors',
      steps: [
        {
          id: 'l4-theory-connect',
          type: 'theory',
          title: 'Звʼязки часу: when, while, before, after, as soon as',
          body: 'Щоб історія текла, англійська має набір зʼєднувальних слів:\n• when (коли) — точка в часі\n• while (поки) — два процеси одночасно\n• before / after (до / після)\n• as soon as (як тільки)\n• then (потім), suddenly (раптом).',
          examples: [
            { en: 'As soon as I got home, I called her.', ua: 'Як тільки я прийшов додому, я подзвонив їй.' },
            { en: 'While I was eating, the postman knocked.', ua: 'Поки я їв, постукав листоноша.' },
            { en: 'After the rain stopped, we went outside.', ua: 'Після того як дощ перестав, ми вийшли.' },
            { en: 'Suddenly, the lights went out.', ua: 'Раптом світло згасло.' },
          ],
        },
        {
          id: 'l4-theory-but-so',
          type: 'theory',
          title: '"but" та "so" — контраст і причина',
          body: '"but" — але, контраст. "so" — тому, наслідок. Допомагають розповіді не звучати як список фактів.',
          examples: [
            { en: 'I was tired, but I finished my homework.', ua: 'Я був втомлений, але закінчив домашку.' },
            { en: 'It was late, so we went home.', ua: 'Було пізно, тому ми пішли додому.' },
          ],
        },
        { id: 'l4-mcq-1', type: 'multiple-choice', question: '_____ I got home, I made dinner.', options: ['While', 'As soon as', 'Suddenly', 'Before'], correctIndex: 1 },
        { id: 'l4-mcq-2', type: 'multiple-choice', question: '"It was late, _____ we went home."', options: ['but', 'so', 'while', 'when'], correctIndex: 1 },
        { id: 'l4-mcq-3', type: 'multiple-choice', question: 'Which word means "Раптом"?', options: ['suddenly', 'finally', 'usually', 'quickly'], correctIndex: 0 },
        { id: 'l4-mcq-4', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I was happy, so I was tired.', 'I was happy, but I was tired.', 'I was happy, while I was tired.', 'I was happy, as soon as I was tired.'], correctIndex: 1 },
        { id: 'l4-fill-1', type: 'fill-blank', before: 'I love this film, ', after: ' it is too long.', answer: 'but' },
        { id: 'l4-fill-2', type: 'fill-blank', before: '_____ ', after: ' the bus arrived, we got on.', answer: 'When' },
        { id: 'l4-match-conn', type: 'match-pairs', prompt: 'Зʼєднай українське слово з англійським.', pairs: [{ left: 'як тільки', right: 'as soon as' }, { left: 'поки', right: 'while' }, { left: 'але', right: 'but' }, { left: 'тому', right: 'so' }, { left: 'раптом', right: 'suddenly' }] },
        { id: 'l4-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Як тільки я закінчив домашку, я пішов гуляти.', words: ['As', 'soon', 'as', 'I', 'finished', 'my', 'homework', 'I', 'went', 'out'], answer: ['As', 'soon', 'as', 'I', 'finished', 'my', 'homework', 'I', 'went', 'out'] },
        { id: 'l4-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Раптом світло згасло.', answer: 'Suddenly, the lights went out.', acceptedAnswers: accepted('Suddenly, the lights went out.', ['Suddenly the lights went out.', 'Suddenly, the lights went off.']) },
        { id: 'l4-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я був втомлений, але я закінчив книгу.', answer: 'I was tired, but I finished the book.', acceptedAnswers: accepted('I was tired, but I finished the book.', ['I was tired but I finished the book.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 5 · At the Airport (Юніт 2)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-stories-5-airport',
      title: 'At the Airport',
      orderIndex: 4,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-stories-connect',
      sectionTitle: 'Юніт 2 · Звʼязки та сценарії',
      sectionOrder: 1,
      topic: 'travel-airport',
      steps: [
        {
          id: 'l5-theory-airport',
          type: 'theory',
          title: 'Лексика аеропорту',
          body: 'Базова лексика, без якої не подорожувати: a passport (паспорт), a boarding pass (посадковий талон), check-in (реєстрація), security (безпека), gate (вихід), luggage (багаж), departure (виліт), arrival (приліт), to take off (злітати), to land (приземлятись), a flight (рейс).',
          examples: [
            { en: 'Show me your boarding pass, please.', ua: 'Покажіть, будь ласка, посадковий.' },
            { en: 'The flight to Rome takes off at 10:30.', ua: 'Рейс до Рима вилітає о 10:30.' },
            { en: 'We landed in Madrid in the evening.', ua: 'Ми приземлились у Мадриді ввечері.' },
            { en: 'Where is the check-in desk?', ua: 'Де стійка реєстрації?' },
          ],
        },
        {
          id: 'l5-theory-questions',
          type: 'theory',
          title: 'Запитання у поїздці',
          body: 'Корисні питання-фрази:\n• Where is the gate? (Де вихід на посадку?)\n• Is this the right gate for flight LH123?\n• Can I take this on board? (Чи можна це у літак?)\n• How long is the flight? (Скільки триває рейс?)',
          examples: [
            { en: 'How long is the flight to London?', ua: 'Скільки триває рейс до Лондона?' },
            { en: 'Is the flight on time?', ua: 'Чи вчасно рейс?' },
            { en: "I'm sorry, I missed my flight.", ua: 'Перепрошую, я запізнився на рейс.' },
          ],
        },
        { id: 'l5-mcq-1', type: 'multiple-choice', question: 'Where do you check in?', options: ['security', 'check-in desk', 'gate', 'arrival hall'], correctIndex: 1 },
        { id: 'l5-mcq-2', type: 'multiple-choice', question: 'A plane _____ off and _____ at airports.', options: ['takes / lands', 'lands / takes', 'flies / lands', 'takes / takes'], correctIndex: 0 },
        { id: 'l5-mcq-3', type: 'multiple-choice', question: 'Choose the correct word: "I lost my _____ — I cannot board."', options: ['passport', 'gate', 'arrival', 'security'], correctIndex: 0 },
        { id: 'l5-mcq-4', type: 'multiple-choice', question: 'How do you ask about flight length?', options: ['How long is the flight?', 'How long the flight?', 'How long flight is?', 'How is long the flight?'], correctIndex: 0 },
        { id: 'l5-fill-1', type: 'fill-blank', before: 'The plane takes ', after: ' at 8.', answer: 'off' },
        { id: 'l5-fill-2', type: 'fill-blank', before: 'I lost my ', after: ' — I need to print a new one.', answer: 'boarding pass' },
        { id: 'l5-match-airport', type: 'match-pairs', prompt: 'Зʼєднай слово з перекладом.', pairs: [{ left: 'passport', right: 'паспорт' }, { left: 'gate', right: 'вихід' }, { left: 'luggage', right: 'багаж' }, { left: 'flight', right: 'рейс' }] },
        { id: 'l5-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Наш рейс до Парижа вилітає о другій.', words: ['Our', 'flight', 'to', 'Paris', 'takes', 'off', 'at', 'two'], answer: ['Our', 'flight', 'to', 'Paris', 'takes', 'off', 'at', 'two'] },
        { id: 'l5-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Скільки триває рейс до Лондона?', answer: 'How long is the flight to London?', acceptedAnswers: accepted('How long is the flight to London?', ['How long does the flight to London take?']) },
        { id: 'l5-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Ми приземлились у Римі ввечері.', answer: 'We landed in Rome in the evening.', acceptedAnswers: accepted('We landed in Rome in the evening.', ['we landed in rome in the evening']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 6 · Different Cultures (Юніт 2)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-stories-6-cultures',
      title: 'Different Cultures',
      orderIndex: 5,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-stories-connect',
      sectionTitle: 'Юніт 2 · Звʼязки та сценарії',
      sectionOrder: 1,
      topic: 'cultures-would',
      steps: [
        {
          id: 'l6-theory-nations',
          type: 'theory',
          title: 'Країни і національності',
          body: 'Назва країни і прикметник часто відрізняються:\n• Ukraine → Ukrainian\n• Spain → Spanish\n• France → French\n• Italy → Italian\n• Germany → German\n• Japan → Japanese\n• China → Chinese\n• the USA → American.',
          examples: [
            { en: 'I am Ukrainian.', ua: 'Я українець / українка.' },
            { en: 'They speak Spanish in Spain.', ua: 'У Іспанії розмовляють іспанською.' },
            { en: 'Italian food is the best in the world.', ua: 'Італійська їжа — найкраща у світі.' },
          ],
          tip: '💡 Назви мов часто збігаються з прикметниками: Spanish = іспанська (мова) і іспанський (прикметник).',
        },
        {
          id: 'l6-theory-would',
          type: 'theory',
          title: '"would like" — ввічливе бажання',
          body: 'Замість "I want" у формальних / ввічливих ситуаціях кажуть "I would like" (скорочено "I\'d like"). Це звучить мʼякше — особливо у ресторані чи з незнайомцями.',
          examples: [
            { en: "I'd like a cup of coffee, please.", ua: 'Я б хотів каву, будь ласка.' },
            { en: 'Would you like some water?', ua: 'Бажаєте води?' },
            { en: "She'd like to visit Japan.", ua: 'Вона б хотіла відвідати Японію.' },
          ],
        },
        { id: 'l6-mcq-1', type: 'multiple-choice', question: 'Adjective for Ukraine is...', options: ['Ukrainic', 'Ukrainian', 'Ukrainen', 'Ukranian'], correctIndex: 1 },
        { id: 'l6-mcq-2', type: 'multiple-choice', question: 'Choose the polite form.', options: ['I want a tea.', "I'd like a tea, please.", 'Give me tea.', 'I take tea.'], correctIndex: 1 },
        { id: 'l6-mcq-3', type: 'multiple-choice', question: 'Which country goes with "Japanese"?', options: ['Korea', 'China', 'Japan', 'Vietnam'], correctIndex: 2 },
        { id: 'l6-mcq-4', type: 'multiple-choice', question: '"Would you like..." is...', options: ['a polite question', 'a past form', 'a command', 'a future tense'], correctIndex: 0 },
        { id: 'l6-fill-1', type: 'fill-blank', before: "I'd like ", after: ' visit Italy one day.', answer: 'to' },
        { id: 'l6-fill-2', type: 'fill-blank', before: 'They speak ', after: ' in France.', answer: 'French' },
        { id: 'l6-match-nation', type: 'match-pairs', prompt: 'Зʼєднай країну з прикметником.', pairs: [{ left: 'Italy', right: 'Italian' }, { left: 'Germany', right: 'German' }, { left: 'Japan', right: 'Japanese' }, { left: 'Spain', right: 'Spanish' }, { left: 'the USA', right: 'American' }] },
        { id: 'l6-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я б хотів відвідати Японію наступного року.', words: ['I', 'would', 'like', 'to', 'visit', 'Japan', 'next', 'year'], answer: ['I', 'would', 'like', 'to', 'visit', 'Japan', 'next', 'year'] },
        { id: 'l6-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я б хотів каву, будь ласка.', answer: "I'd like a coffee, please.", acceptedAnswers: accepted("I'd like a coffee, please.", ["I would like a coffee, please.", "I'd like a coffee please."]) },
        { id: 'l6-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'У Іспанії розмовляють іспанською.', answer: 'They speak Spanish in Spain.', acceptedAnswers: accepted('They speak Spanish in Spain.', ['In Spain they speak Spanish.', 'People speak Spanish in Spain.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 7 · Stories with a Twist (Юніт 3)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-stories-7-twist',
      title: 'Stories with a Twist',
      orderIndex: 6,
      type: 'interactive',
      durationMin: 14,
      xp: 22,
      sectionSlug: 'b-stories-own',
      sectionTitle: 'Юніт 3 · Власна оповідь',
      sectionOrder: 2,
      topic: 'mixed-narrative',
      steps: [
        {
          id: 'l7-theory-mix',
          type: 'theory',
          title: 'Змішуємо часи минулого',
          body: 'У справжній історії ми вживаємо ВСІ три часи разом:\n• Past Simple — основні події\n• Past Continuous — фон, тривалі дії\n• Past Perfect — щось, що сталось ДО основних подій\n\nПриклад: "I was walking home when I saw a man. He had lost his dog." (Я йшов додому, коли побачив чоловіка. Він загубив свого собаку — ще раніше).',
          examples: [
            { en: 'I was reading a book when she called.', ua: 'Я читав книгу, коли вона подзвонила.' },
            { en: 'She had already left when I arrived.', ua: 'Вона вже пішла, коли я прийшов.' },
            { en: 'It was raining, but we went out anyway.', ua: 'Дощ ішов, але ми все одно вийшли.' },
          ],
        },
        {
          id: 'l7-theory-twist',
          type: 'theory',
          title: 'Несподіваний поворот',
          body: 'Хороша історія має ПОВОРОТ. Маркери, що готують слухача: "and then suddenly..." (і раптом), "but then..." (але потім), "to my surprise..." (на мій подив), "what nobody knew was..." (чого ніхто не знав...).',
          examples: [
            { en: 'And then suddenly, the door opened.', ua: 'І раптом двері відчинились.' },
            { en: 'To my surprise, it was my old friend.', ua: 'На мій подив, це був мій старий друг.' },
            { en: 'But what we didn\'t know was that the bag was empty.', ua: 'Але чого ми не знали — сумка була порожня.' },
          ],
        },
        { id: 'l7-mcq-1', type: 'multiple-choice', question: 'Choose the correct mix.', options: ['I walked when she was calling.', 'I was walking when she called.', 'I walked when she called.', 'I am walking when she called.'], correctIndex: 1 },
        { id: 'l7-mcq-2', type: 'multiple-choice', question: '"She _____ already _____ before I arrived."', options: ['has, gone', 'had, gone', 'was, going', 'is, going'], correctIndex: 1 },
        { id: 'l7-mcq-3', type: 'multiple-choice', question: 'Which marker prepares a TWIST?', options: ['always', 'usually', 'and then suddenly', 'every Sunday'], correctIndex: 2 },
        { id: 'l7-mcq-4', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['It rained, when we went out.', 'It was raining, but we went out.', 'It rains, but we went out.', 'It is raining, when we went out.'], correctIndex: 1 },
        { id: 'l7-fill-1', type: 'fill-blank', before: 'I ', after: ' a film when the lights went out.', answer: 'was watching' },
        { id: 'l7-fill-2', type: 'fill-blank', before: 'They ', after: ' already finished dinner before we arrived.', answer: 'had' },
        { id: 'l7-match-twist', type: 'match-pairs', prompt: 'Зʼєднай зворот з його роллю.', pairs: [{ left: 'and then suddenly', right: 'twist' }, { left: 'before', right: 'earlier action' }, { left: 'while', right: 'background' }, { left: 'finally', right: 'closing' }] },
        { id: 'l7-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я читав, коли раптом задзвонив телефон.', words: ['I', 'was', 'reading', 'when', 'suddenly', 'the', 'phone', 'rang'], answer: ['I', 'was', 'reading', 'when', 'suddenly', 'the', 'phone', 'rang'] },
        { id: 'l7-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Вона вже пішла до того, як я прийшов.', answer: 'She had already left before I arrived.', acceptedAnswers: accepted('She had already left before I arrived.', ['She had already left when I arrived.']) },
        { id: 'l7-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'І раптом ми побачили, що сумка порожня.', answer: 'And then suddenly we saw the bag was empty.', acceptedAnswers: accepted('And then suddenly we saw the bag was empty.', ['Suddenly we saw the bag was empty.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 8 · Tell Me Yours (Юніт 3) — productive
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-stories-8-tell-me-yours',
      title: 'Tell Me Yours',
      orderIndex: 7,
      type: 'interactive',
      durationMin: 14,
      xp: 22,
      sectionSlug: 'b-stories-own',
      sectionTitle: 'Юніт 3 · Власна оповідь',
      sectionOrder: 2,
      topic: 'story-writing',
      steps: [
        {
          id: 'l8-theory-structure',
          type: 'theory',
          title: 'Структура оповідання — 5 речень',
          body: 'Базова історія = 5 речень:\n1. Setting — де і коли (Last summer I was on holiday in Greece...)\n2. Action — основна подія (One day I went to the beach...)\n3. Twist — поворот (Suddenly I saw a small dog...)\n4. Reaction — як реагували (We took it home and gave it food...)\n5. Closure — висновок-почуття (It was the best day of my holiday).',
          examples: [
            { en: '1. Last summer I was in Greece.', ua: 'Минулого літа я був у Греції.' },
            { en: '2. One morning I went to the beach.', ua: 'Одного ранку я пішов на пляж.' },
            { en: '3. Suddenly I saw a small dog alone.', ua: 'Раптом я побачив маленького собаку самого.' },
            { en: '4. We took it home and gave it food.', ua: 'Ми взяли його додому і нагодували.' },
            { en: '5. It was the best day of my holiday.', ua: 'Це був найкращий день відпустки.' },
          ],
        },
        {
          id: 'l8-theory-feelings',
          type: 'theory',
          title: 'Слова почуттів',
          body: 'Щоб історія "оживала", додавай емоції:\n• I was happy / sad / scared / surprised / excited\n• "What a day!" (Що за день!)\n• "I will never forget it." (Я ніколи цього не забуду).',
          examples: [
            { en: 'I was very surprised.', ua: 'Я був дуже здивований.' },
            { en: 'We were excited!', ua: 'Ми були у захваті!' },
            { en: 'I will never forget that day.', ua: 'Я ніколи не забуду той день.' },
          ],
        },
        { id: 'l8-mcq-1', type: 'multiple-choice', question: 'Which sentence sets the SCENE?', options: ['Suddenly we saw a dog.', 'Last summer I was on holiday.', 'It was the best day.', 'We took it home.'], correctIndex: 1 },
        { id: 'l8-mcq-2', type: 'multiple-choice', question: 'Past Simple of "see" is...', options: ['saw', 'seen', 'sees', 'seed'], correctIndex: 0 },
        { id: 'l8-mcq-3', type: 'multiple-choice', question: 'Which is a "feeling" word?', options: ['suddenly', 'excited', 'usually', 'sometimes'], correctIndex: 1 },
        { id: 'l8-mcq-4', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I will never to forget that day.', 'I will never forget that day.', 'I never will forget that day.', 'I never to forget that day.'], correctIndex: 1 },
        { id: 'l8-fill-1', type: 'fill-blank', before: 'It was the best day ', after: ' my life.', answer: 'of' },
        { id: 'l8-fill-2', type: 'fill-blank', before: 'I will never ', after: ' that moment.', answer: 'forget' },
        { id: 'l8-match-story', type: 'match-pairs', prompt: 'Зʼєднай частину історії з її роллю.', pairs: [{ left: 'Last summer I was...', right: 'setting' }, { left: 'One day I saw...', right: 'action' }, { left: 'Suddenly...', right: 'twist' }, { left: 'It was the best day.', right: 'closure' }] },
        { id: 'l8-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я ніколи не забуду той день.', words: ['I', 'will', 'never', 'forget', 'that', 'day'], answer: ['I', 'will', 'never', 'forget', 'that', 'day'] },
        { id: 'l8-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Минулого літа я був у Греції.', answer: 'Last summer I was in Greece.', acceptedAnswers: accepted('Last summer I was in Greece.', ['I was in Greece last summer.']) },
        { id: 'l8-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Це був найкращий день у моєму житті.', answer: 'It was the best day of my life.', acceptedAnswers: accepted('It was the best day of my life.', ['it was the best day of my life']) },
      ],
    },
  ],
};
