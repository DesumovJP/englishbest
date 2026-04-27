/**
 * Seed: vocabulary sets.
 *
 * Three starter sets to validate the new content type. Each set is
 * 15–25 words with translation + example + exampleTranslation. Topics:
 *   - Family Words (A0/A1)
 *   - Verbs of Motion (A1/A2)
 *   - Numbers & Time (A0/A1)
 *
 * Idempotent by slug. Authors / admins can extend the catalog via the
 * Strapi admin panel without touching this file.
 */
const VOCAB_UID = 'api::vocabulary-set.vocabulary-set';

interface VocabWord {
  word: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'pronoun' | 'phrase';
}

interface VocabSet {
  slug: string;
  title: string;
  titleUa: string;
  description: string;
  level: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  iconEmoji: string;
  words: VocabWord[];
}

const SETS: VocabSet[] = [
  {
    slug: 'family-words',
    title: 'Family Words',
    titleUa: 'Слова про родину',
    description:
      "Найважливіші слова для розповіді про родину: батьки, брати-сестри, бабуся й дідусь, кузени. Кожне слово з прикладом у живому реченні.",
    level: 'A1',
    topic: 'family',
    iconEmoji: '👨‍👩‍👧',
    words: [
      { word: 'mom', translation: 'мама', example: 'My mom is a teacher.', exampleTranslation: 'Моя мама — вчителька.', partOfSpeech: 'noun' },
      { word: 'dad', translation: 'тато', example: 'My dad cooks dinner.', exampleTranslation: 'Мій тато готує вечерю.', partOfSpeech: 'noun' },
      { word: 'sister', translation: 'сестра', example: "I have one sister.", exampleTranslation: 'У мене одна сестра.', partOfSpeech: 'noun' },
      { word: 'brother', translation: 'брат', example: 'My brother is older than me.', exampleTranslation: 'Мій брат старший за мене.', partOfSpeech: 'noun' },
      { word: 'grandma', translation: 'бабуся', example: 'My grandma bakes the best cookies.', exampleTranslation: 'Моя бабуся пече найкращі печива.', partOfSpeech: 'noun' },
      { word: 'grandpa', translation: 'дідусь', example: 'My grandpa tells funny stories.', exampleTranslation: 'Мій дідусь розповідає смішні історії.', partOfSpeech: 'noun' },
      { word: 'aunt', translation: 'тіточка', example: "My aunt is my mom's sister.", exampleTranslation: 'Моя тіточка — сестра моєї мами.', partOfSpeech: 'noun' },
      { word: 'uncle', translation: 'дядько', example: 'My uncle plays the guitar.', exampleTranslation: 'Мій дядько грає на гітарі.', partOfSpeech: 'noun' },
      { word: 'cousin', translation: 'кузен / кузина', example: 'My cousin lives in Lviv.', exampleTranslation: 'Мій кузен живе у Львові.', partOfSpeech: 'noun' },
      { word: 'parents', translation: 'батьки', example: 'My parents are at work.', exampleTranslation: 'Мої батьки на роботі.', partOfSpeech: 'noun' },
      { word: 'baby', translation: 'малюк', example: 'The baby is sleeping.', exampleTranslation: 'Малюк спить.', partOfSpeech: 'noun' },
      { word: 'family', translation: 'родина', example: 'I love my family very much.', exampleTranslation: 'Я дуже люблю свою родину.', partOfSpeech: 'noun' },
      { word: 'twins', translation: 'близнюки', example: 'My friends are twins.', exampleTranslation: 'Мої друзі — близнюки.', partOfSpeech: 'noun' },
      { word: 'son', translation: 'син', example: 'He is the son of my teacher.', exampleTranslation: 'Він син моєї вчительки.', partOfSpeech: 'noun' },
      { word: 'daughter', translation: 'донька', example: 'Their daughter is six years old.', exampleTranslation: 'Їхній доньці шість років.', partOfSpeech: 'noun' },
    ],
  },
  {
    slug: 'verbs-of-motion',
    title: 'Verbs of Motion',
    titleUa: 'Дієслова руху',
    description:
      'Як показати рух у мові: ходити, бігати, стрибати, плавати. Кожне дієслово в кількох формах + приклад використання.',
    level: 'A2',
    topic: 'verbs',
    iconEmoji: '🏃',
    words: [
      { word: 'walk', translation: 'іти / ходити', example: 'I walk to school every day.', exampleTranslation: 'Я ходжу до школи щодня.', partOfSpeech: 'verb' },
      { word: 'run', translation: 'бігти / бігати', example: 'Cats run fast.', exampleTranslation: 'Коти бігають швидко.', partOfSpeech: 'verb' },
      { word: 'jump', translation: 'стрибати', example: 'Frogs can jump high.', exampleTranslation: 'Жаби можуть стрибати високо.', partOfSpeech: 'verb' },
      { word: 'swim', translation: 'плавати', example: 'I swim in the lake every summer.', exampleTranslation: 'Я плаваю в озері щоліта.', partOfSpeech: 'verb' },
      { word: 'fly', translation: 'літати', example: 'Birds fly south in autumn.', exampleTranslation: 'Птахи летять на південь восени.', partOfSpeech: 'verb' },
      { word: 'climb', translation: 'лізти, дертися', example: 'Monkeys climb trees easily.', exampleTranslation: 'Мавпи легко лазять по деревах.', partOfSpeech: 'verb' },
      { word: 'crawl', translation: 'повзти', example: 'Babies crawl before they walk.', exampleTranslation: 'Малюки повзають перш ніж ходити.', partOfSpeech: 'verb' },
      { word: 'dance', translation: 'танцювати', example: 'My sister loves to dance.', exampleTranslation: 'Моя сестра любить танцювати.', partOfSpeech: 'verb' },
      { word: 'ride', translation: 'їздити (на чомусь)', example: 'I ride my bike to school.', exampleTranslation: 'Я їжджу до школи на велосипеді.', partOfSpeech: 'verb' },
      { word: 'drive', translation: 'кермувати', example: 'My dad drives a blue car.', exampleTranslation: 'Мій тато водить синю машину.', partOfSpeech: 'verb' },
      { word: 'sail', translation: 'плисти (під вітрилом)', example: 'They sail across the sea.', exampleTranslation: 'Вони пливуть через море.', partOfSpeech: 'verb' },
      { word: 'march', translation: 'марширувати', example: 'Soldiers march in line.', exampleTranslation: 'Солдати марширують в шерензі.', partOfSpeech: 'verb' },
      { word: 'tiptoe', translation: 'іти навшпиньках', example: 'I tiptoe past the sleeping baby.', exampleTranslation: 'Я йду навшпиньках повз сплячого малюка.', partOfSpeech: 'verb' },
      { word: 'race', translation: 'мчати, гнатись', example: 'We race to the finish line.', exampleTranslation: 'Ми мчимо до фінішу.', partOfSpeech: 'verb' },
      { word: 'wander', translation: 'блукати', example: 'I love to wander in the forest.', exampleTranslation: 'Я люблю блукати в лісі.', partOfSpeech: 'verb' },
    ],
  },
  {
    slug: 'numbers-and-time',
    title: 'Numbers & Time',
    titleUa: 'Числа і час',
    description:
      'Цифри від 1 до 30, дні тижня, частини дня, місяці. Базовий набір для розкладу та віку.',
    level: 'A1',
    topic: 'numbers-time',
    iconEmoji: '🕐',
    words: [
      { word: 'one', translation: '1', example: 'I have one cat.', exampleTranslation: 'У мене один кіт.' },
      { word: 'two', translation: '2', example: 'My family has two cars.', exampleTranslation: 'У моєї родини дві машини.' },
      { word: 'five', translation: '5', example: 'Class starts at five.', exampleTranslation: 'Урок починається о пʼятій.' },
      { word: 'ten', translation: '10', example: "I'm ten years old.", exampleTranslation: 'Мені десять років.' },
      { word: 'twelve', translation: '12', example: 'The clock shows twelve.', exampleTranslation: 'Годинник показує дванадцять.' },
      { word: 'twenty', translation: '20', example: 'There are twenty students.', exampleTranslation: 'Є двадцять учнів.' },
      { word: 'Monday', translation: 'понеділок', example: 'On Monday I have Maths.', exampleTranslation: 'У понеділок у мене математика.', partOfSpeech: 'noun' },
      { word: 'Friday', translation: 'пʼятниця', example: 'Friday is my favourite day.', exampleTranslation: 'Пʼятниця — мій улюблений день.', partOfSpeech: 'noun' },
      { word: 'Sunday', translation: 'неділя', example: 'On Sunday we visit grandma.', exampleTranslation: 'У неділю ми відвідуємо бабусю.', partOfSpeech: 'noun' },
      { word: 'morning', translation: 'ранок', example: 'In the morning I have breakfast.', exampleTranslation: 'Вранці я снідаю.', partOfSpeech: 'noun' },
      { word: 'afternoon', translation: 'після обіду', example: 'I play football in the afternoon.', exampleTranslation: 'Після обіду я граю у футбол.', partOfSpeech: 'noun' },
      { word: 'evening', translation: 'вечір', example: 'In the evening I read books.', exampleTranslation: 'Увечері я читаю книжки.', partOfSpeech: 'noun' },
      { word: 'night', translation: 'ніч', example: 'I sleep at night.', exampleTranslation: 'Я сплю вночі.', partOfSpeech: 'noun' },
      { word: 'minute', translation: 'хвилина', example: 'Wait a minute, please.', exampleTranslation: 'Хвилинку, будь ласка.', partOfSpeech: 'noun' },
      { word: 'hour', translation: 'година', example: 'The trip takes an hour.', exampleTranslation: 'Подорож триває годину.', partOfSpeech: 'noun' },
      { word: 'today', translation: 'сьогодні', example: 'Today is a great day!', exampleTranslation: 'Сьогодні чудовий день!', partOfSpeech: 'adverb' },
      { word: 'tomorrow', translation: 'завтра', example: 'See you tomorrow!', exampleTranslation: 'Побачимось завтра!', partOfSpeech: 'adverb' },
      { word: 'yesterday', translation: 'вчора', example: 'I saw my friend yesterday.', exampleTranslation: 'Я бачив свого друга вчора.', partOfSpeech: 'adverb' },
    ],
  },
];

export async function up(strapi: any): Promise<void> {
  let created = 0;
  let skipped = 0;

  for (const set of SETS) {
    const existing = await strapi.documents(VOCAB_UID).findMany({
      filters: { slug: set.slug },
      limit: 1,
    });
    if (existing?.[0]) {
      skipped += 1;
      continue;
    }

    await strapi.documents(VOCAB_UID).create({
      data: {
        slug: set.slug,
        title: set.title,
        titleUa: set.titleUa,
        description: set.description,
        level: set.level,
        topic: set.topic,
        iconEmoji: set.iconEmoji,
        words: set.words,
      } as any,
      status: 'published',
    });
    created += 1;
  }

  strapi.log.info(
    `[seed] vocabulary-sets: created=${created}, skipped=${skipped}, total=${SETS.length}`,
  );
}
