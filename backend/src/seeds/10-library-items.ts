/**
 * Seed: library items (books / videos / games).
 *
 * Mirrors `frontend/lib/library-data.ts` — seeds the same 20 rows into
 * `course` records with `kind in (book, video, game)`. Idempotent by slug.
 *
 * Proper "courses" (the `phonics`, `grammar-basics`, etc. subset) are
 * intentionally skipped here — they belong to the curriculum content the
 * staff builds in admin, not the discoverable library catalog. Phase F
 * treats course/book/video/game as one collection with a `kind` tag.
 *
 * After seeding, the FE library page reads
 *   /api/courses?filters[kind][$in]=book,video,game&populate=*
 * and no longer needs `lib/library-data.ts`.
 */
const COURSE_UID = 'api::course.course';

type Kind = 'book' | 'video' | 'game';
type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface LibrarySeed {
  slug: string;
  kind: Kind;
  iconEmoji: string;
  title: string;        // English title
  titleUa: string;
  subtitle: string;
  level: Level;
  price: number;
  isNew?: boolean;
  descriptionShort: string;
  descriptionLong?: string[];
  preview?: { title: string; text: string };
  externalUrl?: string;
  provider?: string;
}

const ITEMS: LibrarySeed[] = [
  // Books
  {
    slug: 'caterpillar',
    kind: 'book',
    iconEmoji: '🐛',
    title: 'The Very Hungry Caterpillar',
    titleUa: 'Дуже голодна гусениця',
    subtitle: 'Eric Carle',
    level: 'A1',
    price: 0,
    descriptionShort:
      'Класична дитяча книга про гусеницю, яка їсть усе підряд. Ідеально для перших слів та назв їжі.',
    descriptionLong: [
      'Класична книжка Еріка Карла, яка вже понад 50 років зачаровує дітей у всьому світі. Маленька гусениця вилуплюється з яйця в неділю вранці — і одразу ж починає свою гастрономічну подорож крізь тиждень.',
      'Кожна сторінка — це новий день, нова їжа і нове слово англійською. Дитина легко запамʼятовує назви фруктів, днів тижня і цифр, не помічаючи, що вже вчиться читати.',
      'Яскраві колажі, прості речення з повторами і несподіваний фінал роблять цю книгу ідеальною для першого самостійного читання англійською мовою.',
    ],
    preview: {
      title: 'Перші сторінки',
      text:
        'In the light of the moon a little egg lay on a leaf. One Sunday morning the warm sun came up and — pop! — out of the egg came a tiny and very hungry caterpillar. He started to look for some food.\n\nOn Monday he ate through one apple. But he was still hungry. On Tuesday he ate through two pears, but he was still hungry…',
    },
  },
  {
    slug: 'oxford-1',
    kind: 'book',
    iconEmoji: '🌳',
    title: 'Oxford Reading Tree 1',
    titleUa: 'Читаємо разом 1',
    subtitle: 'Oxford Press',
    level: 'A1',
    price: 0,
    provider: 'Oxford Press',
    descriptionShort:
      'Перший рівень серії Oxford Reading Tree. Прості речення, яскраві малюнки, ідеально для початківців.',
    descriptionLong: [
      'Перший рівень найвідомішої британської серії для початкового читання. Діти зустрічають родину Бідделів — Біффа, Чіпа, Кіппера і їхнього собаку Флоппі — та вирушають з ними у маленькі пригоди звичайних днів.',
      'Кожна історія побудована на повторенні ключових слів і містить яскраві ілюстрації, які допомагають зрозуміти зміст без перекладу.',
      'Разом з книгою дитина вивчає перші 50 «sight words» — слова, які треба впізнавати миттєво, без літерування.',
    ],
    preview: {
      title: 'Перші сторінки',
      text:
        'Biff, Chip and Kipper were in the garden. Floppy was there too. "Look!" said Biff. A magic key began to glow. It was a big adventure day.\n\n"Come on, Floppy!" said Chip. The children ran to the old tree, and the key opened a new world…',
    },
  },
  {
    slug: 'natgeo',
    kind: 'book',
    iconEmoji: '🦁',
    title: 'National Geographic Kids',
    titleUa: 'Нац. Географік Діти',
    subtitle: 'Nat Geo',
    level: 'A1',
    price: 0,
    provider: 'National Geographic',
    descriptionShort:
      'Цікаві статті про тварин та природу від National Geographic для дітей. Розширює словниковий запас.',
    descriptionLong: [
      'Дитяча версія легендарного журналу National Geographic. Справжні фотографії тварин, коротенькі пізнавальні тексти та цікаві факти, які вражають.',
      'Кожна стаття побудована так, щоб утримати увагу дитини: великі зображення, простий текст, виділені ключові слова.',
      'Ідеально підходить для дітей, які цікавляться природою, тваринами і планетою — навіть якщо їм поки складно читати довгі тексти.',
    ],
    preview: {
      title: 'Уривок',
      text:
        'DID YOU KNOW? A cheetah can run as fast as a car on the highway — up to 120 kilometres per hour. But it can only run this fast for short distances. After 30 seconds, it must stop and rest.',
    },
  },
  {
    slug: 'charlotte',
    kind: 'book',
    iconEmoji: '🕷️',
    title: "Charlotte's Web",
    titleUa: 'Павутиння Шарлотти',
    subtitle: 'E.B. White',
    level: 'A2',
    price: 30,
    descriptionShort:
      'Зворушлива повість про дружбу між свинкою Вілбуром та павуком Шарлоттою. Рівень A2.',
    descriptionLong: [
      'Історія про дружбу, турботу і силу слів. Павучиха Шарлотта вирішує врятувати життя свинки Вілбура — і робить це найдивовижнішим способом, на який тільки здатен павук.',
      'Класика американської дитячої літератури, яку варто прочитати хоча б раз у житті. Книга вчить бачити красу у простих речах і цінувати тих, хто поруч.',
      'Адаптована версія рівня A2 з підказками до складних слів і запитаннями після кожного розділу.',
    ],
    preview: {
      title: 'Перші сторінки',
      text:
        '"Where\'s Papa going with that axe?" said Fern to her mother as they were setting the table for breakfast.\n\n"Out to the hoghouse," replied Mrs Arable. "Some pigs were born last night."\n\n"I don\'t see why he needs an axe," continued Fern, who was only eight.',
    },
  },
  {
    slug: 'harry',
    kind: 'book',
    iconEmoji: '🪄',
    title: 'Harry Potter (Simplified)',
    titleUa: 'Гаррі Поттер (просто)',
    subtitle: 'J.K. Rowling',
    level: 'A2',
    price: 80,
    isNew: true,
    descriptionShort:
      'Спрощена версія першої книги про хлопчика-чарівника. Ідеально підходить для рівня A2.',
    descriptionLong: [
      'Усі знайомі: Хогвартс, Хагрід, сортувальний капелюх — але мовою, доступною для початківців. Спрощений текст зберігає дух оригіналу, а ключові сцени залишаються недоторканими.',
      'Книга супроводжується глосарієм чарівних слів і культурних приміток, тож дитина дізнається не лише англійську, а й контекст британської школи-інтернату.',
      'Чудовий міст між простими казками і справжніми романами для дорослих читачів.',
    ],
    preview: {
      title: 'Перші сторінки',
      text:
        "Mr and Mrs Dursley, of number four Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.",
    },
  },
  {
    slug: 'little-prince',
    kind: 'book',
    iconEmoji: '🌹',
    title: 'The Little Prince',
    titleUa: 'Маленький принц',
    subtitle: 'A. de Saint-Exupéry',
    level: 'B1',
    price: 50,
    isNew: true,
    descriptionShort:
      'Філософська казка для дітей та дорослих. Красива мова, цікаві діалоги, рівень B1.',
    descriptionLong: [
      'Мудра казка Екзюпері про пілота, який зустрічає маленького принца посеред пустелі. Кожна глава — це маленька притча про дорослих і дітей, про серце і розум.',
      'Поетична мова, багата на образи, ідеальна для рівня B1: складні ідеї подано простими словами.',
      'Книга, до якої повертаються все життя — щоразу знаходячи нові смисли.',
    ],
    preview: {
      title: 'Перші сторінки',
      text:
        'Once when I was six years old I saw a magnificent picture in a book about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal.\n\nI pondered deeply over the adventures of the jungle. And after some work with a coloured pencil I succeeded in making my first drawing.',
    },
  },

  // Videos
  {
    slug: 'peppa',
    kind: 'video',
    iconEmoji: '🐷',
    title: 'Peppa Pig',
    titleUa: 'Свинка Пеппа',
    subtitle: '52 серії',
    level: 'A1',
    price: 0,
    descriptionShort:
      '52 серії мультфільму про свинку Пеппу з субтитрами. Простий словниковий запас, чітка вимова.',
    preview: {
      title: 'Про що серії',
      text:
        'Пеппа, її брат Джордж, мама і тато живуть у маленькому будиночку на пагорбі. Вони стрибають у калюжі, печуть торти, ходять у гості до бабусі й дідуся — і все це простою, чіткою англійською.',
    },
  },
  {
    slug: 'bluey',
    kind: 'video',
    iconEmoji: '🐶',
    title: 'Bluey',
    titleUa: 'Блюї',
    subtitle: '50 серій',
    level: 'A1',
    price: 0,
    isNew: true,
    descriptionShort:
      '50 серій австралійського мультфільму. Природні діалоги, сімейні ситуації, легкий акцент.',
    preview: {
      title: 'Про що серії',
      text:
        'Блюї — маленька блакитна хілеровка, яка живе в Брисбені з татом Бендітом, мамою Чіллі та сестричкою Бінґо. Кожна серія — це нова гра і нова життєва ситуація, знайома кожній родині.',
    },
  },
  {
    slug: 'simple-songs',
    kind: 'video',
    iconEmoji: '🎵',
    title: 'Super Simple Songs',
    titleUa: 'Прості пісеньки',
    subtitle: '30 відео',
    level: 'A1',
    price: 0,
    descriptionShort:
      "30 відео з піснями на прості теми: кольори, цифри, тварини. Ритм допомагає запам'ятовувати слова.",
  },
  {
    slug: 'ted-ed',
    kind: 'video',
    iconEmoji: '🧪',
    title: 'TED-Ed Kids',
    titleUa: 'TED для дітей',
    subtitle: '20 відео',
    level: 'B1',
    price: 40,
    provider: 'TED',
    descriptionShort:
      '20 пізнавальних відео TED-Ed адаптованих для дітей. Наука, природа, технології — рівень B1.',
  },

  // Games
  {
    slug: 'word-puzzle',
    kind: 'game',
    iconEmoji: '🧩',
    title: 'Word Puzzle',
    titleUa: 'Словесний пазл',
    subtitle: '50 рівнів',
    level: 'A1',
    price: 0,
    descriptionShort:
      '50 рівнів словесних пазлів. Збирай слова з букв, знаходь приховані слова у сітці.',
  },
  {
    slug: 'spelling-bee',
    kind: 'game',
    iconEmoji: '🐝',
    title: 'Spelling Bee',
    titleUa: 'Правопис',
    subtitle: 'Щотижня нові слова',
    level: 'A2',
    price: 0,
    descriptionShort:
      'Щотижня нові слова для правопису. Введи слово правильно — отримай монети. Рейтинг гравців.',
  },
  {
    slug: 'grammar-quest',
    kind: 'game',
    iconEmoji: '⚔️',
    title: 'Grammar Quest',
    titleUa: 'Граматичний квест',
    subtitle: '3 акти',
    level: 'A2',
    price: 50,
    descriptionShort:
      'RPG-квест де граматика — це зброя! 3 акти, фінальний бос, система рівнів персонажа.',
  },
  {
    slug: 'story-builder',
    kind: 'game',
    iconEmoji: '📝',
    title: 'Story Builder',
    titleUa: 'Будівник історій',
    subtitle: 'Необмежено',
    level: 'B1',
    price: 70,
    isNew: true,
    descriptionShort:
      'Створюй власні оповідання з підказками та шаблонами. Необмежена кількість сторій.',
  },
];

export async function up(strapi: any) {
  let created = 0;
  let skipped = 0;

  for (const item of ITEMS) {
    const existing = await strapi.documents(COURSE_UID).findMany({
      filters: { slug: item.slug },
      limit: 1,
    });
    if (existing?.[0]) {
      skipped += 1;
      continue;
    }

    await strapi.documents(COURSE_UID).create({
      data: {
        slug: item.slug,
        title: item.title,
        titleUa: item.titleUa,
        subtitle: item.subtitle,
        kind: item.kind,
        iconEmoji: item.iconEmoji,
        level: item.level,
        price: item.price,
        isNew: item.isNew ?? false,
        provider: item.provider ?? null,
        externalUrl: item.externalUrl ?? null,
        descriptionShort: item.descriptionShort,
        descriptionLong: item.descriptionLong ?? null,
        preview: item.preview ?? null,
        audience: 'kids',
        status: 'available',
        publishedAt: new Date().toISOString(),
      },
      status: 'published',
    });
    created += 1;
  }

  strapi.log.info(
    `[seed] library-items: created=${created}, skipped=${skipped}, total=${ITEMS.length}`,
  );
}
