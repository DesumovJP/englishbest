/**
 * Seed: vocabulary sets.
 *
 * Three layers of vocabulary, all idempotent by slug:
 *   1. STANDALONE topical sets (no course/lesson relation) — Family Words,
 *      Verbs of Motion, Numbers & Time. Browseable on their own.
 *   2. PER-COURSE sets (linked via `course` relation) — one anchor set per
 *      v2 course summarizing its core vocabulary. 6 courses → 6 sets.
 *   3. PER-LESSON sets (linked via `lesson` relation) — for the
 *      `a-foundation` exemplar course only (8 lessons → 8 sets). The
 *      shell courses get their per-lesson sets when their lessons are
 *      fully written in a future session.
 *
 * Authors / admins can extend the catalog via the Strapi admin panel
 * without touching this file.
 */
const VOCAB_UID = 'api::vocabulary-set.vocabulary-set';
const COURSE_UID = 'api::course.course';
const LESSON_UID = 'api::lesson.lesson';

interface VocabWord {
  word: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'pronoun' | 'phrase';
}

type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface VocabSet {
  slug: string;
  title: string;
  titleUa: string;
  description: string;
  level: Level;
  topic: string;
  iconEmoji: string;
  words: VocabWord[];
  /** Slug of a course in the v2 catalog. The seeder resolves it to a documentId. */
  courseSlug?: string;
  /** Slug of a lesson within `courseSlug`. Resolved to a documentId. */
  lessonSlug?: string;
}

const STANDALONE: VocabSet[] = [
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

// ─── Per-course anchor sets ──────────────────────────────────────────
const PER_COURSE: VocabSet[] = [
  {
    slug: 'a-foundation-core',
    title: 'A-Foundation · Core',
    titleUa: 'Основа A · Ключові слова',
    description: 'Основний словник першого курсу: привітання, родина, числа, кольори, дієслова повсякдення.',
    level: 'A1',
    topic: 'foundation-core',
    iconEmoji: '🌱',
    courseSlug: 'a-foundation',
    words: [
      { word: 'hello', translation: 'привіт', example: 'Hello, my name is Anna.', exampleTranslation: 'Привіт, мене звати Анна.', partOfSpeech: 'phrase' },
      { word: 'goodbye', translation: 'до побачення', example: 'Goodbye, see you tomorrow!', exampleTranslation: 'До побачення, до завтра!', partOfSpeech: 'phrase' },
      { word: 'name', translation: "імʼя", example: "What's your name?", exampleTranslation: 'Як тебе звати?', partOfSpeech: 'noun' },
      { word: 'age', translation: 'вік', example: 'How old are you?', exampleTranslation: 'Скільки тобі років?', partOfSpeech: 'noun' },
      { word: 'country', translation: 'країна', example: 'I am from Ukraine.', exampleTranslation: 'Я з України.', partOfSpeech: 'noun' },
      { word: 'family', translation: 'родина', example: 'My family is small.', exampleTranslation: 'Моя родина невелика.', partOfSpeech: 'noun' },
      { word: 'red', translation: 'червоний', example: 'I like red apples.', exampleTranslation: 'Я люблю червоні яблука.', partOfSpeech: 'adjective' },
      { word: 'blue', translation: 'синій', example: 'The sky is blue.', exampleTranslation: 'Небо синє.', partOfSpeech: 'adjective' },
      { word: 'big', translation: 'великий', example: 'This is a big house.', exampleTranslation: 'Це великий будинок.', partOfSpeech: 'adjective' },
      { word: 'small', translation: 'маленький', example: 'I have a small cat.', exampleTranslation: 'У мене маленький кіт.', partOfSpeech: 'adjective' },
      { word: 'eat', translation: 'їсти', example: 'I eat breakfast every day.', exampleTranslation: 'Я снідаю щодня.', partOfSpeech: 'verb' },
      { word: 'sleep', translation: 'спати', example: 'Cats sleep a lot.', exampleTranslation: 'Коти багато сплять.', partOfSpeech: 'verb' },
      { word: 'play', translation: 'грати / гратись', example: 'Kids play in the park.', exampleTranslation: 'Діти граються в парку.', partOfSpeech: 'verb' },
      { word: 'go', translation: 'іти / їхати', example: 'I go to school by bus.', exampleTranslation: 'Я їжджу до школи автобусом.', partOfSpeech: 'verb' },
      { word: 'like', translation: 'подобатись', example: 'I like pizza.', exampleTranslation: 'Мені подобається піца.', partOfSpeech: 'verb' },
    ],
  },
  {
    slug: 'a-my-world-core',
    title: 'My World · Core',
    titleUa: 'Мій світ · Ключові слова',
    description: 'Будинок, школа, їжа, час — слова, які описують щоденне життя.',
    level: 'A1',
    topic: 'daily-life',
    iconEmoji: '🏠',
    courseSlug: 'a-my-world',
    words: [
      { word: 'kitchen', translation: 'кухня', example: 'Mom is in the kitchen.', exampleTranslation: 'Мама на кухні.', partOfSpeech: 'noun' },
      { word: 'bedroom', translation: 'спальня', example: 'My bedroom is small.', exampleTranslation: 'Моя спальня маленька.', partOfSpeech: 'noun' },
      { word: 'school', translation: 'школа', example: 'I go to school at eight.', exampleTranslation: 'Я йду до школи о восьмій.', partOfSpeech: 'noun' },
      { word: 'teacher', translation: 'вчитель / вчителька', example: 'Our teacher is funny.', exampleTranslation: 'Наша вчителька смішна.', partOfSpeech: 'noun' },
      { word: 'classroom', translation: 'клас (кімната)', example: 'The classroom is bright.', exampleTranslation: 'Клас світлий.', partOfSpeech: 'noun' },
      { word: 'breakfast', translation: 'сніданок', example: 'I have toast for breakfast.', exampleTranslation: 'Я їм тости на сніданок.', partOfSpeech: 'noun' },
      { word: 'lunch', translation: 'обід', example: 'Lunch is at noon.', exampleTranslation: 'Обід опівдні.', partOfSpeech: 'noun' },
      { word: 'dinner', translation: 'вечеря', example: "We have dinner together.", exampleTranslation: 'Ми вечеряємо разом.', partOfSpeech: 'noun' },
      { word: 'hobby', translation: 'хобі', example: 'My hobby is drawing.', exampleTranslation: 'Моє хобі — малювання.', partOfSpeech: 'noun' },
      { word: 'always', translation: 'завжди', example: 'I always brush my teeth.', exampleTranslation: 'Я завжди чищу зуби.', partOfSpeech: 'adverb' },
      { word: 'usually', translation: 'зазвичай', example: 'I usually read at night.', exampleTranslation: 'Я зазвичай читаю вночі.', partOfSpeech: 'adverb' },
      { word: 'never', translation: 'ніколи', example: 'I never drink coffee.', exampleTranslation: 'Я ніколи не пʼю каву.', partOfSpeech: 'adverb' },
    ],
  },
  {
    slug: 'a-people-places-core',
    title: 'People & Places · Core',
    titleUa: 'Люди та місця · Ключові слова',
    description: 'Опис людей, порівняння, минуле — словник для розповіді про минулий день.',
    level: 'A2',
    topic: 'description-past',
    iconEmoji: '🌍',
    courseSlug: 'a-people-places',
    words: [
      { word: 'tall', translation: 'високий', example: 'My brother is tall.', exampleTranslation: 'Мій брат високий.', partOfSpeech: 'adjective' },
      { word: 'short', translation: 'низький / короткий', example: 'She has short hair.', exampleTranslation: 'У неї коротке волосся.', partOfSpeech: 'adjective' },
      { word: 'kind', translation: 'добрий', example: 'My grandma is very kind.', exampleTranslation: 'Моя бабуся дуже добра.', partOfSpeech: 'adjective' },
      { word: 'funny', translation: 'смішний', example: 'That joke was funny!', exampleTranslation: 'Той жарт був смішний!', partOfSpeech: 'adjective' },
      { word: 'better', translation: 'кращий', example: 'This book is better than that one.', exampleTranslation: 'Ця книга краща за ту.', partOfSpeech: 'adjective' },
      { word: 'best', translation: 'найкращий', example: 'She is my best friend.', exampleTranslation: 'Вона моя найкраща подруга.', partOfSpeech: 'adjective' },
      { word: 'yesterday', translation: 'вчора', example: 'I went to the park yesterday.', exampleTranslation: 'Учора я ходив у парк.', partOfSpeech: 'adverb' },
      { word: 'went', translation: 'пішов / пішла (минуле від go)', example: 'We went to Italy last summer.', exampleTranslation: 'Ми їздили в Італію минулого літа.', partOfSpeech: 'verb' },
      { word: 'saw', translation: 'бачив (минуле від see)', example: 'I saw a great film.', exampleTranslation: 'Я бачив чудовий фільм.', partOfSpeech: 'verb' },
      { word: 'ate', translation: 'зʼїв (минуле від eat)', example: 'He ate two pizzas!', exampleTranslation: 'Він зʼїв дві піци!', partOfSpeech: 'verb' },
      { word: 'town', translation: 'місто (мале)', example: 'I live in a small town.', exampleTranslation: 'Я живу в маленькому місті.', partOfSpeech: 'noun' },
      { word: 'city', translation: 'місто (велике)', example: 'Lviv is a beautiful city.', exampleTranslation: 'Львів — гарне місто.', partOfSpeech: 'noun' },
    ],
  },
  {
    slug: 'b-stories-core',
    title: 'Stories · Core',
    titleUa: 'Історії · Ключові слова',
    description: 'Лексика для оповіді про минуле: транспорт, маркери часу, події.',
    level: 'B1',
    topic: 'narrative',
    iconEmoji: '📚',
    courseSlug: 'b-stories',
    words: [
      { word: 'travel', translation: 'подорожувати', example: 'We travel by train.', exampleTranslation: 'Ми подорожуємо потягом.', partOfSpeech: 'verb' },
      { word: 'journey', translation: 'подорож', example: 'The journey took two days.', exampleTranslation: 'Подорож тривала два дні.', partOfSpeech: 'noun' },
      { word: 'airport', translation: 'аеропорт', example: 'We arrived at the airport early.', exampleTranslation: 'Ми приїхали в аеропорт рано.', partOfSpeech: 'noun' },
      { word: 'while', translation: 'поки / у той час', example: 'While I was reading, it rained.', exampleTranslation: 'Поки я читав, ішов дощ.', partOfSpeech: 'preposition' },
      { word: 'before', translation: 'перед / раніше', example: 'Wash your hands before lunch.', exampleTranslation: 'Помий руки перед обідом.', partOfSpeech: 'preposition' },
      { word: 'after', translation: 'після', example: 'After school we play.', exampleTranslation: 'Після школи ми граємось.', partOfSpeech: 'preposition' },
      { word: 'suddenly', translation: 'раптово', example: 'Suddenly the lights went out.', exampleTranslation: 'Раптово вимкнулось світло.', partOfSpeech: 'adverb' },
      { word: 'remember', translation: 'памʼятати', example: "I remember that day.", exampleTranslation: 'Я памʼятаю той день.', partOfSpeech: 'verb' },
      { word: 'finally', translation: 'нарешті', example: 'Finally, we arrived.', exampleTranslation: 'Нарешті ми прибули.', partOfSpeech: 'adverb' },
      { word: 'because', translation: 'тому що', example: 'I was tired because I worked late.', exampleTranslation: 'Я був втомлений, бо працював допізна.', partOfSpeech: 'preposition' },
      { word: 'long ago', translation: 'давно', example: 'Long ago, dinosaurs lived here.', exampleTranslation: 'Давно тут жили динозаври.', partOfSpeech: 'phrase' },
      { word: 'culture', translation: 'культура', example: 'I love Japanese culture.', exampleTranslation: 'Я люблю японську культуру.', partOfSpeech: 'noun' },
    ],
  },
  {
    slug: 'b-ideas-core',
    title: 'Ideas · Core',
    titleUa: 'Ідеї · Ключові слова',
    description: 'Висловлюємо думку, обовʼязок, гіпотези. Слова для дискусії й планів на майбутнє.',
    level: 'B1',
    topic: 'opinion-modal',
    iconEmoji: '💡',
    courseSlug: 'b-ideas',
    words: [
      { word: 'opinion', translation: 'думка', example: 'In my opinion, English is fun.', exampleTranslation: 'На мою думку, англійська цікава.', partOfSpeech: 'noun' },
      { word: 'agree', translation: 'погоджуватись', example: 'I agree with you.', exampleTranslation: 'Я з тобою згоден.', partOfSpeech: 'verb' },
      { word: 'disagree', translation: 'не погоджуватись', example: 'I disagree completely.', exampleTranslation: 'Я повністю не згоден.', partOfSpeech: 'verb' },
      { word: 'should', translation: 'слід', example: 'You should drink more water.', exampleTranslation: 'Тобі слід пити більше води.', partOfSpeech: 'verb' },
      { word: 'must', translation: 'мусиш', example: 'You must wear a helmet.', exampleTranslation: 'Ти мусиш носити шолом.', partOfSpeech: 'verb' },
      { word: 'have to', translation: 'мати (зробити)', example: 'I have to study tonight.', exampleTranslation: 'Я мушу вчитись сьогодні ввечері.', partOfSpeech: 'phrase' },
      { word: 'pros', translation: 'переваги', example: 'There are many pros to learning English.', exampleTranslation: 'Є багато переваг у вивченні англійської.', partOfSpeech: 'noun' },
      { word: 'cons', translation: 'недоліки', example: 'Every choice has cons.', exampleTranslation: 'У кожного вибору є недоліки.', partOfSpeech: 'noun' },
      { word: 'however', translation: 'однак', example: 'It rained; however, we went out.', exampleTranslation: 'Ішов дощ; однак ми пішли.', partOfSpeech: 'adverb' },
      { word: 'although', translation: 'хоча', example: 'Although tired, she kept working.', exampleTranslation: 'Хоча була втомлена, вона продовжувала працювати.', partOfSpeech: 'preposition' },
      { word: 'device', translation: 'пристрій', example: 'My phone is a useful device.', exampleTranslation: 'Мій телефон — корисний пристрій.', partOfSpeech: 'noun' },
      { word: 'safe', translation: 'безпечний', example: 'Stay safe online.', exampleTranslation: 'Будь безпечним онлайн.', partOfSpeech: 'adjective' },
    ],
  },
  {
    slug: 'b-real-world-core',
    title: 'Real-World · Core',
    titleUa: 'Реальний світ · Ключові слова',
    description: 'Present Perfect, пасив, ідіоми, формальний vs неформальний регістр.',
    level: 'B2',
    topic: 'real-world',
    iconEmoji: '🌐',
    courseSlug: 'b-real-world',
    words: [
      { word: 'ever', translation: 'коли-небудь', example: 'Have you ever been to Paris?', exampleTranslation: 'Чи ти коли-небудь був у Парижі?', partOfSpeech: 'adverb' },
      { word: 'never', translation: 'ніколи', example: 'I have never tried sushi.', exampleTranslation: 'Я ніколи не куштував суші.', partOfSpeech: 'adverb' },
      { word: 'already', translation: 'вже', example: 'I have already finished.', exampleTranslation: 'Я вже закінчив.', partOfSpeech: 'adverb' },
      { word: 'yet', translation: 'ще / поки що', example: "I haven't done it yet.", exampleTranslation: 'Я ще цього не зробив.', partOfSpeech: 'adverb' },
      { word: 'just', translation: 'щойно', example: 'I have just arrived.', exampleTranslation: 'Я щойно прибув.', partOfSpeech: 'adverb' },
      { word: 'experience', translation: 'досвід', example: 'I have a lot of experience.', exampleTranslation: 'У мене багато досвіду.', partOfSpeech: 'noun' },
      { word: 'built', translation: 'побудований', example: 'This bridge was built in 1900.', exampleTranslation: 'Цей міст побудовано у 1900 році.', partOfSpeech: 'verb' },
      { word: 'made', translation: 'зроблений', example: 'These shoes are made in Italy.', exampleTranslation: 'Це взуття зроблене в Італії.', partOfSpeech: 'verb' },
      { word: 'polite', translation: 'ввічливий', example: 'Please be polite to elders.', exampleTranslation: 'Будь ласка, будь ввічливим зі старшими.', partOfSpeech: 'adjective' },
      { word: 'formal', translation: 'формальний', example: 'Wear a formal suit to the meeting.', exampleTranslation: 'Одягни формальний костюм на зустріч.', partOfSpeech: 'adjective' },
      { word: 'idiom', translation: 'ідіома', example: '"Break a leg" is a common idiom.', exampleTranslation: '"Break a leg" — поширена ідіома.', partOfSpeech: 'noun' },
      { word: 'order', translation: 'замовляти / замовлення', example: 'I order pizza online.', exampleTranslation: 'Я замовляю піцу онлайн.', partOfSpeech: 'verb' },
    ],
  },
];

// ─── Per-lesson sets for the a-foundation exemplar ───────────────────
const PER_LESSON: VocabSet[] = [
  {
    slug: 'a-foundation-l1-greetings',
    title: 'Lesson 1 · Greetings',
    titleUa: 'Урок 1 · Привітання',
    description: 'Привіт, до побачення, представлення. Основа першої зустрічі.',
    level: 'A1',
    topic: 'greetings',
    iconEmoji: '👋',
    courseSlug: 'a-foundation',
    lessonSlug: 'a-foundation-1-hello-names',
    words: [
      { word: 'hello', translation: 'привіт', example: 'Hello, how are you?', exampleTranslation: 'Привіт, як справи?', partOfSpeech: 'phrase' },
      { word: 'hi', translation: 'привіт (дружньо)', example: "Hi, I'm Tom!", exampleTranslation: 'Привіт, я Том!', partOfSpeech: 'phrase' },
      { word: 'good morning', translation: 'доброго ранку', example: 'Good morning, class!', exampleTranslation: 'Доброго ранку, класе!', partOfSpeech: 'phrase' },
      { word: 'good afternoon', translation: 'добрий день', example: 'Good afternoon, sir.', exampleTranslation: 'Добрий день, пане.', partOfSpeech: 'phrase' },
      { word: 'good evening', translation: 'доброго вечора', example: 'Good evening, everyone.', exampleTranslation: 'Доброго вечора всім.', partOfSpeech: 'phrase' },
      { word: 'goodbye', translation: 'до побачення', example: 'Goodbye, see you tomorrow!', exampleTranslation: 'До побачення, до завтра!', partOfSpeech: 'phrase' },
      { word: 'see you', translation: 'до зустрічі', example: 'See you later!', exampleTranslation: 'До зустрічі!', partOfSpeech: 'phrase' },
      { word: 'name', translation: "імʼя", example: "My name is Anna.", exampleTranslation: 'Мене звати Анна.', partOfSpeech: 'noun' },
      { word: 'nice to meet you', translation: 'приємно познайомитись', example: 'Nice to meet you!', exampleTranslation: 'Приємно познайомитись!', partOfSpeech: 'phrase' },
      { word: 'how are you', translation: 'як справи', example: "How are you today?", exampleTranslation: 'Як ти сьогодні?', partOfSpeech: 'phrase' },
    ],
  },
  {
    slug: 'a-foundation-l2-countries',
    title: 'Lesson 2 · Countries',
    titleUa: 'Урок 2 · Країни',
    description: 'Країни і національності. "I am from..." та "I am Ukrainian".',
    level: 'A1',
    topic: 'countries',
    iconEmoji: '🌍',
    courseSlug: 'a-foundation',
    lessonSlug: 'a-foundation-2-where-from',
    words: [
      { word: 'Ukraine', translation: 'Україна', example: 'I am from Ukraine.', exampleTranslation: 'Я з України.', partOfSpeech: 'noun' },
      { word: 'Ukrainian', translation: 'українець / українка', example: "I am Ukrainian.", exampleTranslation: 'Я українець.', partOfSpeech: 'adjective' },
      { word: 'Poland', translation: 'Польща', example: 'My friend is from Poland.', exampleTranslation: 'Мій друг з Польщі.', partOfSpeech: 'noun' },
      { word: 'Polish', translation: 'польський', example: 'She speaks Polish.', exampleTranslation: 'Вона розмовляє польською.', partOfSpeech: 'adjective' },
      { word: 'Britain', translation: 'Британія', example: 'Britain is an island.', exampleTranslation: 'Британія — острів.', partOfSpeech: 'noun' },
      { word: 'British', translation: 'британський', example: 'British tea is famous.', exampleTranslation: 'Британський чай відомий.', partOfSpeech: 'adjective' },
      { word: 'America', translation: 'Америка', example: 'America is far away.', exampleTranslation: 'Америка далеко.', partOfSpeech: 'noun' },
      { word: 'American', translation: 'американець', example: 'My teacher is American.', exampleTranslation: 'Мій вчитель — американець.', partOfSpeech: 'adjective' },
      { word: 'Germany', translation: 'Німеччина', example: 'Germany is in Europe.', exampleTranslation: 'Німеччина у Європі.', partOfSpeech: 'noun' },
      { word: 'German', translation: 'німецький / німець', example: 'German cars are good.', exampleTranslation: 'Німецькі машини хороші.', partOfSpeech: 'adjective' },
    ],
  },
  {
    slug: 'a-foundation-l3-numbers',
    title: 'Lesson 3 · Numbers & Age',
    titleUa: 'Урок 3 · Числа і вік',
    description: 'Числа 1-20 та запитання про вік.',
    level: 'A1',
    topic: 'numbers-age',
    iconEmoji: '🔢',
    courseSlug: 'a-foundation',
    lessonSlug: 'a-foundation-3-numbers-age',
    words: [
      { word: 'one', translation: '1', example: 'I have one brother.', exampleTranslation: 'У мене один брат.' },
      { word: 'two', translation: '2', example: 'I see two cats.', exampleTranslation: 'Я бачу двох котів.' },
      { word: 'three', translation: '3', example: 'I am three years older.', exampleTranslation: 'Я на три роки старша.' },
      { word: 'four', translation: '4', example: 'A table has four legs.', exampleTranslation: 'Стіл має чотири ніжки.' },
      { word: 'five', translation: '5', example: 'Five fingers on a hand.', exampleTranslation: "Пʼять пальців на руці." },
      { word: 'ten', translation: '10', example: "I'm ten years old.", exampleTranslation: 'Мені десять років.' },
      { word: 'fifteen', translation: '15', example: 'My sister is fifteen.', exampleTranslation: 'Моїй сестрі пʼятнадцять.' },
      { word: 'twenty', translation: '20', example: 'There are twenty kids in class.', exampleTranslation: 'У класі двадцять дітей.' },
      { word: 'how old', translation: 'скільки років', example: 'How old are you?', exampleTranslation: 'Скільки тобі років?', partOfSpeech: 'phrase' },
      { word: 'years old', translation: 'років', example: "I'm eight years old.", exampleTranslation: 'Мені вісім років.', partOfSpeech: 'phrase' },
    ],
  },
  {
    slug: 'a-foundation-l4-family',
    title: 'Lesson 4 · Family',
    titleUa: 'Урок 4 · Родина',
    description: 'Родина і присвійні займенники.',
    level: 'A1',
    topic: 'family',
    iconEmoji: '👨‍👩‍👧',
    courseSlug: 'a-foundation',
    lessonSlug: 'a-foundation-4-my-family',
    words: [
      { word: 'mother', translation: 'мати', example: 'My mother loves me.', exampleTranslation: 'Моя мати мене любить.', partOfSpeech: 'noun' },
      { word: 'father', translation: 'батько', example: 'My father works hard.', exampleTranslation: 'Мій батько багато працює.', partOfSpeech: 'noun' },
      { word: 'sister', translation: 'сестра', example: 'My sister is kind.', exampleTranslation: 'Моя сестра добра.', partOfSpeech: 'noun' },
      { word: 'brother', translation: 'брат', example: 'My brother plays football.', exampleTranslation: 'Мій брат грає у футбол.', partOfSpeech: 'noun' },
      { word: 'grandmother', translation: 'бабуся', example: 'My grandmother bakes pies.', exampleTranslation: 'Моя бабуся пече пироги.', partOfSpeech: 'noun' },
      { word: 'grandfather', translation: 'дідусь', example: 'My grandfather tells stories.', exampleTranslation: 'Мій дідусь розповідає історії.', partOfSpeech: 'noun' },
      { word: 'my', translation: 'мій / моя', example: 'This is my book.', exampleTranslation: 'Це моя книга.', partOfSpeech: 'pronoun' },
      { word: 'his', translation: 'його', example: 'His name is Tom.', exampleTranslation: 'Його звати Том.', partOfSpeech: 'pronoun' },
      { word: 'her', translation: 'її', example: 'Her dog is small.', exampleTranslation: 'Її собака маленький.', partOfSpeech: 'pronoun' },
      { word: 'our', translation: 'наш / наша', example: 'Our school is big.', exampleTranslation: 'Наша школа велика.', partOfSpeech: 'pronoun' },
    ],
  },
  {
    slug: 'a-foundation-l5-objects',
    title: 'Lesson 5 · Objects',
    titleUa: 'Урок 5 · Предмети',
    description: 'Звичайні предмети та артиклі a/an/the.',
    level: 'A1',
    topic: 'objects-articles',
    iconEmoji: '✏️',
    courseSlug: 'a-foundation',
    lessonSlug: 'a-foundation-5-whats-this',
    words: [
      { word: 'book', translation: 'книга', example: 'This is a good book.', exampleTranslation: 'Це гарна книга.', partOfSpeech: 'noun' },
      { word: 'pen', translation: 'ручка', example: 'I need a pen.', exampleTranslation: 'Мені потрібна ручка.', partOfSpeech: 'noun' },
      { word: 'pencil', translation: 'олівець', example: 'My pencil is red.', exampleTranslation: 'Мій олівець червоний.', partOfSpeech: 'noun' },
      { word: 'bag', translation: 'сумка / рюкзак', example: 'My bag is heavy.', exampleTranslation: 'Моя сумка важка.', partOfSpeech: 'noun' },
      { word: 'desk', translation: 'парта / стіл', example: 'The desk is wooden.', exampleTranslation: 'Стіл деревʼяний.', partOfSpeech: 'noun' },
      { word: 'chair', translation: 'стілець', example: 'Sit on the chair, please.', exampleTranslation: 'Сядь на стілець, будь ласка.', partOfSpeech: 'noun' },
      { word: 'window', translation: 'вікно', example: 'The window is open.', exampleTranslation: 'Вікно відчинене.', partOfSpeech: 'noun' },
      { word: 'door', translation: 'двері', example: 'Close the door.', exampleTranslation: 'Зачини двері.', partOfSpeech: 'noun' },
      { word: 'a / an', translation: 'неозначений артикль', example: 'a cat / an apple', exampleTranslation: 'кіт / яблуко (один з багатьох)', partOfSpeech: 'phrase' },
      { word: 'the', translation: 'означений артикль', example: 'the cat in the garden', exampleTranslation: 'кіт у садку (конкретний)', partOfSpeech: 'phrase' },
    ],
  },
  {
    slug: 'a-foundation-l6-colors-sizes',
    title: 'Lesson 6 · Colors & Sizes',
    titleUa: 'Урок 6 · Кольори і розміри',
    description: 'Прикметники для опису.',
    level: 'A1',
    topic: 'colors-sizes',
    iconEmoji: '🎨',
    courseSlug: 'a-foundation',
    lessonSlug: 'a-foundation-6-colors-sizes',
    words: [
      { word: 'red', translation: 'червоний', example: 'A red rose.', exampleTranslation: 'Червона троянда.', partOfSpeech: 'adjective' },
      { word: 'blue', translation: 'синій', example: 'A blue sky.', exampleTranslation: 'Синє небо.', partOfSpeech: 'adjective' },
      { word: 'green', translation: 'зелений', example: 'Green grass.', exampleTranslation: 'Зелена трава.', partOfSpeech: 'adjective' },
      { word: 'yellow', translation: 'жовтий', example: 'A yellow lemon.', exampleTranslation: 'Жовтий лимон.', partOfSpeech: 'adjective' },
      { word: 'black', translation: 'чорний', example: 'A black cat.', exampleTranslation: 'Чорний кіт.', partOfSpeech: 'adjective' },
      { word: 'white', translation: 'білий', example: 'White snow.', exampleTranslation: 'Білий сніг.', partOfSpeech: 'adjective' },
      { word: 'big', translation: 'великий', example: 'A big house.', exampleTranslation: 'Великий будинок.', partOfSpeech: 'adjective' },
      { word: 'small', translation: 'маленький', example: 'A small mouse.', exampleTranslation: 'Маленька мишка.', partOfSpeech: 'adjective' },
      { word: 'tall', translation: 'високий', example: 'A tall tree.', exampleTranslation: 'Високе дерево.', partOfSpeech: 'adjective' },
      { word: 'long', translation: 'довгий', example: 'A long road.', exampleTranslation: 'Довга дорога.', partOfSpeech: 'adjective' },
    ],
  },
  {
    slug: 'a-foundation-l7-likes',
    title: 'Lesson 7 · Likes & Dislikes',
    titleUa: 'Урок 7 · Що подобається',
    description: 'Виражаємо вподобання.',
    level: 'A1',
    topic: 'likes',
    iconEmoji: '❤️',
    courseSlug: 'a-foundation',
    lessonSlug: 'a-foundation-7-i-like',
    words: [
      { word: 'like', translation: 'подобається', example: 'I like ice cream.', exampleTranslation: 'Мені подобається морозиво.', partOfSpeech: 'verb' },
      { word: "don't like", translation: 'не подобається', example: "I don't like spinach.", exampleTranslation: 'Мені не подобається шпинат.', partOfSpeech: 'phrase' },
      { word: 'love', translation: 'обожнювати', example: 'I love pizza!', exampleTranslation: 'Я обожнюю піцу!', partOfSpeech: 'verb' },
      { word: 'hate', translation: 'ненавидіти', example: 'I hate Mondays.', exampleTranslation: 'Я ненавиджу понеділки.', partOfSpeech: 'verb' },
      { word: 'favourite', translation: 'улюблений', example: 'My favourite colour is blue.', exampleTranslation: 'Мій улюблений колір — синій.', partOfSpeech: 'adjective' },
      { word: 'food', translation: 'їжа', example: 'I love Italian food.', exampleTranslation: 'Я люблю італійську їжу.', partOfSpeech: 'noun' },
      { word: 'animal', translation: 'тварина', example: 'A dog is a friendly animal.', exampleTranslation: 'Собака — дружня тварина.', partOfSpeech: 'noun' },
      { word: 'sport', translation: 'спорт', example: 'My favourite sport is football.', exampleTranslation: 'Мій улюблений спорт — футбол.', partOfSpeech: 'noun' },
      { word: 'music', translation: 'музика', example: 'I listen to music every day.', exampleTranslation: 'Я слухаю музику щодня.', partOfSpeech: 'noun' },
      { word: 'do you like', translation: 'тобі подобається?', example: 'Do you like cats?', exampleTranslation: 'Тобі подобаються коти?', partOfSpeech: 'phrase' },
    ],
  },
  {
    slug: 'a-foundation-l8-my-day',
    title: 'Lesson 8 · My Day',
    titleUa: 'Урок 8 · Мій день',
    description: 'Дієслова повсякдення в Present Simple.',
    level: 'A1',
    topic: 'daily-routine',
    iconEmoji: '🌅',
    courseSlug: 'a-foundation',
    lessonSlug: 'a-foundation-8-my-day',
    words: [
      { word: 'wake up', translation: 'прокидатись', example: 'I wake up at seven.', exampleTranslation: 'Я прокидаюсь о сьомій.', partOfSpeech: 'verb' },
      { word: 'get up', translation: 'вставати', example: 'I get up quickly.', exampleTranslation: 'Я швидко встаю.', partOfSpeech: 'verb' },
      { word: 'have breakfast', translation: 'снідати', example: 'I have breakfast at home.', exampleTranslation: 'Я снідаю вдома.', partOfSpeech: 'phrase' },
      { word: 'go to school', translation: 'іти до школи', example: 'I go to school by bus.', exampleTranslation: 'Я їжджу до школи автобусом.', partOfSpeech: 'phrase' },
      { word: 'do homework', translation: 'робити уроки', example: 'I do homework after dinner.', exampleTranslation: 'Я роблю уроки після вечері.', partOfSpeech: 'phrase' },
      { word: 'play', translation: 'грати', example: 'I play with my dog.', exampleTranslation: 'Я граюсь зі своїм собакою.', partOfSpeech: 'verb' },
      { word: 'watch TV', translation: 'дивитись телевізор', example: 'We watch TV at six.', exampleTranslation: 'Ми дивимось телевізор о шостій.', partOfSpeech: 'phrase' },
      { word: 'read', translation: 'читати', example: 'I read before bed.', exampleTranslation: 'Я читаю перед сном.', partOfSpeech: 'verb' },
      { word: 'go to bed', translation: 'лягати спати', example: 'I go to bed at ten.', exampleTranslation: 'Я лягаю спати о десятій.', partOfSpeech: 'phrase' },
      { word: 'every day', translation: 'щодня', example: 'I brush my teeth every day.', exampleTranslation: 'Я чищу зуби щодня.', partOfSpeech: 'phrase' },
    ],
  },
];

const ALL_SETS: VocabSet[] = [...STANDALONE, ...PER_COURSE, ...PER_LESSON];

async function findCourseId(strapi: any, slug: string): Promise<string | null> {
  if (!slug) return null;
  const [c] = await strapi.documents(COURSE_UID).findMany({
    filters: { slug },
    fields: ['documentId'],
    limit: 1,
  });
  return c?.documentId ?? null;
}

async function findLessonId(strapi: any, slug: string): Promise<string | null> {
  if (!slug) return null;
  const [l] = await strapi.documents(LESSON_UID).findMany({
    filters: { slug },
    fields: ['documentId'],
    limit: 1,
  });
  return l?.documentId ?? null;
}

export async function up(strapi: any): Promise<void> {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const set of ALL_SETS) {
    const courseId = set.courseSlug ? await findCourseId(strapi, set.courseSlug) : null;
    const lessonId = set.lessonSlug ? await findLessonId(strapi, set.lessonSlug) : null;

    if (set.courseSlug && !courseId) {
      strapi.log.warn(
        `[seed] vocabulary: course '${set.courseSlug}' missing — set '${set.slug}' will be created without course link`,
      );
    }
    if (set.lessonSlug && !lessonId) {
      strapi.log.warn(
        `[seed] vocabulary: lesson '${set.lessonSlug}' missing — set '${set.slug}' will be created without lesson link`,
      );
    }

    const data: Record<string, unknown> = {
      slug: set.slug,
      title: set.title,
      titleUa: set.titleUa,
      description: set.description,
      level: set.level,
      topic: set.topic,
      iconEmoji: set.iconEmoji,
      words: set.words,
    };
    if (courseId) data.course = courseId;
    if (lessonId) data.lesson = lessonId;

    // Look up the published version first; fall back to draft. Mirrors
    // the upsert pattern in 11-real-lessons.
    const [published] = await strapi.documents(VOCAB_UID).findMany({
      filters: { slug: set.slug },
      limit: 1,
      status: 'published',
    });
    const [draft] = published
      ? [published]
      : await strapi.documents(VOCAB_UID).findMany({
          filters: { slug: set.slug },
          limit: 1,
        });
    const existing = draft;

    if (existing) {
      try {
        await strapi.documents(VOCAB_UID).update({
          documentId: (existing as any).documentId,
          data: data as any,
          status: 'published',
        });
        // Belt-and-braces: ensure a published version exists. If the row
        // had only a draft revision (older seed without `status:'published'`),
        // publish() promotes it; if a published version is already there
        // it's a no-op.
        try {
          await strapi.documents(VOCAB_UID).publish({
            documentId: (existing as any).documentId,
          });
        } catch {
          /* publish() throws if already published — ignore. */
        }
        updated += 1;
      } catch (err) {
        strapi.log.warn(
          `[seed] vocabulary: failed to update set '${set.slug}': ${(err as Error).message}`,
        );
        skipped += 1;
      }
      continue;
    }

    try {
      await strapi.documents(VOCAB_UID).create({
        data: { ...data, publishedAt: new Date().toISOString() } as any,
        status: 'published',
      });
      created += 1;
    } catch (err) {
      strapi.log.warn(
        `[seed] vocabulary: failed to create set '${set.slug}': ${(err as Error).message}`,
      );
      skipped += 1;
    }
  }

  strapi.log.info(
    `[seed] vocabulary-sets: created=${created}, updated=${updated}, skipped=${skipped}, total=${ALL_SETS.length}`,
  );
}
