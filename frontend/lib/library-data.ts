import type { Level } from '@/lib/types';

export type LibTabId = 'all' | 'books' | 'courses' | 'videos' | 'games';

export interface LibItem {
  id: string;
  emoji: string;
  titleEn: string;
  titleUa: string;
  subtitle: string;
  type: Exclude<LibTabId, 'all'>;
  level: Level;
  price: number;
  isNew?: boolean;
}

export const LIB_ITEMS: LibItem[] = [
  /* Books */
  { id: 'caterpillar',    emoji: '🐛', titleEn: 'The Very Hungry Caterpillar', titleUa: 'Дуже голодна гусениця',  subtitle: 'Eric Carle',        type: 'books',   level: 'A1', price: 0           },
  { id: 'oxford-1',       emoji: '🌳', titleEn: 'Oxford Reading Tree 1',       titleUa: 'Читаємо разом 1',         subtitle: 'Oxford Press',      type: 'books',   level: 'A1', price: 0           },
  { id: 'natgeo',         emoji: '🦁', titleEn: 'National Geographic Kids',    titleUa: 'Нац. Географік Діти',    subtitle: 'Nat Geo',           type: 'books',   level: 'A1', price: 0           },
  { id: 'charlotte',      emoji: '🕷️', titleEn: "Charlotte's Web",            titleUa: "Павутиння Шарлотти",      subtitle: 'E.B. White',        type: 'books',   level: 'A2', price: 30          },
  { id: 'harry',          emoji: '🪄', titleEn: 'Harry Potter (Simplified)',   titleUa: 'Гаррі Поттер (просто)',   subtitle: 'J.K. Rowling',      type: 'books',   level: 'A2', price: 80, isNew: true },
  { id: 'little-prince',  emoji: '🌹', titleEn: 'The Little Prince',           titleUa: 'Маленький принц',         subtitle: 'A. de Saint-Exupéry', type: 'books', level: 'B1', price: 50, isNew: true },
  /* Courses */
  { id: 'phonics',        emoji: '🔤', titleEn: 'Phonics Starter',             titleUa: 'Фоніка: початок',         subtitle: '12 модулів',        type: 'courses', level: 'A1', price: 0           },
  { id: 'grammar-basics', emoji: '✏️', titleEn: 'Grammar Basics',              titleUa: 'Граматика: основи',       subtitle: '8 модулів',         type: 'courses', level: 'A1', price: 0           },
  { id: 'speaking-club',  emoji: '🗣️', titleEn: 'Speaking Club',               titleUa: 'Клуб мовлення',           subtitle: '10 занять',         type: 'courses', level: 'A2', price: 60, isNew: true },
  { id: 'reading-comp',   emoji: '📖', titleEn: 'Reading Comprehension',       titleUa: 'Читання та розуміння',    subtitle: '6 рівнів',          type: 'courses', level: 'A2', price: 40          },
  { id: 'writing-ws',     emoji: '✍️', titleEn: 'Writing Workshop',            titleUa: 'Майстерня письма',        subtitle: '5 модулів',         type: 'courses', level: 'B1', price: 100         },
  /* Videos */
  { id: 'peppa',          emoji: '🐷', titleEn: 'Peppa Pig',                   titleUa: 'Свинка Пеппа',            subtitle: '52 серії',          type: 'videos',  level: 'A1', price: 0           },
  { id: 'bluey',          emoji: '🐶', titleEn: 'Bluey',                        titleUa: 'Блюї',                    subtitle: '50 серій',          type: 'videos',  level: 'A1', price: 0, isNew: true },
  { id: 'simple-songs',   emoji: '🎵', titleEn: 'Super Simple Songs',          titleUa: 'Прості пісеньки',         subtitle: '30 відео',          type: 'videos',  level: 'A1', price: 0           },
  { id: 'ted-ed',         emoji: '🧪', titleEn: 'TED-Ed Kids',                 titleUa: 'TED для дітей',           subtitle: '20 відео',          type: 'videos',  level: 'B1', price: 40          },
  /* Games */
  { id: 'word-puzzle',    emoji: '🧩', titleEn: 'Word Puzzle',                 titleUa: 'Словесний пазл',          subtitle: '50 рівнів',         type: 'games',   level: 'A1', price: 0           },
  { id: 'spelling-bee',   emoji: '🐝', titleEn: 'Spelling Bee',                titleUa: 'Правопис',                subtitle: 'Щотижня нові слова', type: 'games',  level: 'A2', price: 0           },
  { id: 'grammar-quest',  emoji: '⚔️', titleEn: 'Grammar Quest',               titleUa: 'Граматичний квест',       subtitle: '3 акти',            type: 'games',   level: 'A2', price: 50          },
  { id: 'story-builder',  emoji: '📝', titleEn: 'Story Builder',               titleUa: 'Будівник історій',        subtitle: 'Необмежено',        type: 'games',   level: 'B1', price: 70, isNew: true },
];

export const LIB_DESCRIPTIONS: Record<string, string> = {
  caterpillar:    'Класична дитяча книга про гусеницю, яка їсть усе підряд. Ідеально для перших слів та назв їжі.',
  'oxford-1':     'Перший рівень серії Oxford Reading Tree. Прості речення, яскраві малюнки, ідеально для початківців.',
  natgeo:         'Цікаві статті про тварин та природу від National Geographic для дітей. Розширює словниковий запас.',
  charlotte:      'Зворушлива повість про дружбу між свинкою Вілбуром та павуком Шарлоттою. Рівень A2.',
  harry:          'Спрощена версія першої книги про хлопчика-чарівника. Ідеально підходить для рівня A2.',
  'little-prince': 'Філософська казка для дітей та дорослих. Красива мова, цікаві діалоги, рівень B1.',
  phonics:        '12 модулів з основ фонетики англійської мови. Навчить правильно вимовляти звуки та читати слова.',
  'grammar-basics':'Базова граматика: артиклі, часи, питальні форми. 8 інтерактивних модулів з вправами.',
  'speaking-club': '10 розмовних занять з тематичними діалогами. Тренуй усне мовлення в ігровій формі.',
  'reading-comp':  '6 рівнів читання з текстами та тестами на розуміння. Від простих казок до коротких статей.',
  'writing-ws':    '5 модулів письма: від речень до коротких творів. З шаблонами та перевіркою помилок.',
  peppa:          '52 серії мультфільму про свинку Пеппу з субтитрами. Простий словниковий запас, чітка вимова.',
  bluey:          '50 серій австралійського мультфільму. Природні діалоги, сімейні ситуації, легкий акцент.',
  'simple-songs':  '30 відео з піснями на прості теми: кольори, цифри, тварини. Ритм допомагає запам\'ятовувати слова.',
  'ted-ed':        '20 пізнавальних відео TED-Ed адаптованих для дітей. Наука, природа, технології — рівень B1.',
  'word-puzzle':   '50 рівнів словесних пазлів. Збирай слова з букв, знаходь приховані слова у сітці.',
  'spelling-bee':  'Щотижня нові слова для правопису. Введи слово правильно — отримай монети. Рейтинг гравців.',
  'grammar-quest': 'RPG-квест де граматика — це зброя! 3 акти, фінальний бос, система рівнів персонажа.',
  'story-builder': 'Створюй власні оповідання з підказками та шаблонами. Необмежена кількість сторій.',
};

/* ── Long multi-paragraph descriptions for detail page ─────────────── */
export const LIB_LONG: Record<string, string[]> = {
  caterpillar: [
    'Класична книжка Еріка Карла, яка вже понад 50 років зачаровує дітей у всьому світі. Маленька гусениця вилуплюється з яйця в неділю вранці — і одразу ж починає свою гастрономічну подорож крізь тиждень.',
    'Кожна сторінка — це новий день, нова їжа і нове слово англійською. Дитина легко запамʼятовує назви фруктів, днів тижня і цифр, не помічаючи, що вже вчиться читати.',
    'Яскраві колажі, прості речення з повторами і несподіваний фінал роблять цю книгу ідеальною для першого самостійного читання англійською мовою.',
  ],
  'oxford-1': [
    'Перший рівень найвідомішої британської серії для початкового читання. Діти зустрічають родину Бідделів — Біффа, Чіпа, Кіппера і їхнього собаку Флоппі — та вирушають з ними у маленькі пригоди звичайних днів.',
    'Кожна історія побудована на повторенні ключових слів і містить яскраві ілюстрації, які допомагають зрозуміти зміст без перекладу.',
    'Разом з книгою дитина вивчає перші 50 «sight words» — слова, які треба впізнавати миттєво, без літерування.',
  ],
  natgeo: [
    'Дитяча версія легендарного журналу National Geographic. Справжні фотографії тварин, коротенькі пізнавальні тексти та цікаві факти, які вражають.',
    'Кожна стаття побудована так, щоб утримати увагу дитини: великі зображення, простий текст, виділені ключові слова.',
    'Ідеально підходить для дітей, які цікавляться природою, тваринами і планетою — навіть якщо їм поки складно читати довгі тексти.',
  ],
  charlotte: [
    'Історія про дружбу, турботу і силу слів. Павучиха Шарлотта вирішує врятувати життя свинки Вілбура — і робить це найдивовижнішим способом, на який тільки здатен павук.',
    'Класика американської дитячої літератури, яку варто прочитати хоча б раз у житті. Книга вчить бачити красу у простих речах і цінувати тих, хто поруч.',
    'Адаптована версія рівня A2 з підказками до складних слів і запитаннями після кожного розділу.',
  ],
  harry: [
    'Усі знайомі: Хогвартс, Хагрід, сортувальний капелюх — але мовою, доступною для початківців. Спрощений текст зберігає дух оригіналу, а ключові сцени залишаються недоторканими.',
    'Книга супроводжується глосарієм чарівних слів і культурних приміток, тож дитина дізнається не лише англійську, а й контекст британської школи-інтернату.',
    'Чудовий міст між простими казками і справжніми романами для дорослих читачів.',
  ],
  'little-prince': [
    'Мудра казка Екзюпері про пілота, який зустрічає маленького принца посеред пустелі. Кожна глава — це маленька притча про дорослих і дітей, про серце і розум.',
    'Поетична мова, багата на образи, ідеальна для рівня B1: складні ідеї подано простими словами.',
    'Книга, до якої повертаються все життя — щоразу знаходячи нові смисли.',
  ],
};

export const LIB_PREVIEWS: Record<string, { title: string; text: string }> = {
  caterpillar: {
    title: 'Перші сторінки',
    text:
      'In the light of the moon a little egg lay on a leaf. One Sunday morning the warm sun came up and — pop! — out of the egg came a tiny and very hungry caterpillar. He started to look for some food.\n\nOn Monday he ate through one apple. But he was still hungry. On Tuesday he ate through two pears, but he was still hungry…',
  },
  'oxford-1': {
    title: 'Перші сторінки',
    text:
      'Biff, Chip and Kipper were in the garden. Floppy was there too. "Look!" said Biff. A magic key began to glow. It was a big adventure day.\n\n"Come on, Floppy!" said Chip. The children ran to the old tree, and the key opened a new world…',
  },
  charlotte: {
    title: 'Перші сторінки',
    text:
      '"Where\'s Papa going with that axe?" said Fern to her mother as they were setting the table for breakfast.\n\n"Out to the hoghouse," replied Mrs Arable. "Some pigs were born last night."\n\n"I don\'t see why he needs an axe," continued Fern, who was only eight.',
  },
  harry: {
    title: 'Перші сторінки',
    text:
      'Mr and Mrs Dursley, of number four Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you\'d expect to be involved in anything strange or mysterious, because they just didn\'t hold with such nonsense.',
  },
  'little-prince': {
    title: 'Перші сторінки',
    text:
      'Once when I was six years old I saw a magnificent picture in a book about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal.\n\nI pondered deeply over the adventures of the jungle. And after some work with a coloured pencil I succeeded in making my first drawing.',
  },
  natgeo: {
    title: 'Уривок',
    text:
      'DID YOU KNOW? A cheetah can run as fast as a car on the highway — up to 120 kilometres per hour. But it can only run this fast for short distances. After 30 seconds, it must stop and rest.',
  },
  phonics: {
    title: 'Що всередині',
    text:
      'Модуль 1 — короткі голосні: /a/ cat, /e/ bed, /i/ pig, /o/ dog, /u/ sun.\n\nМодуль 2 — довгі голосні та «магічна e»: cake, bike, rope.\n\nКожен модуль містить 5 відеоуроків, 10 інтерактивних вправ і міні-тест з озвученням.',
  },
  'grammar-basics': {
    title: 'Що всередині',
    text:
      'Урок 1 — To be (am/is/are). Урок 2 — Артиклі a/an/the. Урок 3 — Present Simple. Урок 4 — Present Continuous…\n\nКожен урок — 7-10 хвилин відео + інтерактивні вправи з миттєвою перевіркою.',
  },
  peppa: {
    title: 'Про що серії',
    text:
      'Пеппа, її брат Джордж, мама і тато живуть у маленькому будиночку на пагорбі. Вони стрибають у калюжі, печуть торти, ходять у гості до бабусі й дідуся — і все це простою, чіткою англійською.',
  },
  bluey: {
    title: 'Про що серії',
    text:
      'Блюї — маленька блакитна хілеровка, яка живе в Брисбені з татом Бендітом, мамою Чіллі та сестричкою Бінґо. Кожна серія — це нова гра і нова життєва ситуація, знайома кожній родині.',
  },
};

export const LIB_CATEGORIES: { id: LibTabId; label: string }[] = [
  { id: 'all',     label: 'Все'    },
  { id: 'books',   label: 'Книги'  },
  { id: 'courses', label: 'Курси'  },
  { id: 'videos',  label: 'Відео'  },
  { id: 'games',   label: 'Ігри'   },
];

export const TYPE_ACCENT: Record<Exclude<LibTabId, 'all'>, string> = {
  books:   '#4F9CF9',
  courses: '#22C55E',
  videos:  '#A855F7',
  games:   '#F59E0B',
};

export const TYPE_LABEL: Record<Exclude<LibTabId, 'all'>, string> = {
  books:   'Книга',
  courses: 'Курс',
  videos:  'Відео',
  games:   'Гра',
};

export const TYPE_SECTION: Record<Exclude<LibTabId, 'all'>, string> = {
  books:   'Книги 📚',
  courses: 'Курси 🎓',
  videos:  'Відео 🎬',
  games:   'Ігри 🎮',
};

export const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export function canAccessLevel(userLevel: Level, req: Level): boolean {
  return LEVEL_ORDER.indexOf(userLevel) >= LEVEL_ORDER.indexOf(req);
}
