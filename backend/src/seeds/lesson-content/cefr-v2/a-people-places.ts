/**
 * A · People & Places 🌍 — 8-lesson A2 course.
 *
 * Description and comparison. Past simple intro. By the end: comparing
 * places, telling what you did yesterday, putting it together into a
 * personal "My Town" piece.
 *
 * Sections (3 units):
 *   Юніт 1 · Опис              (L1, L2)
 *   Юніт 2 · Порівняння        (L3, L4)
 *   Юніт 3 · Минуле і підсумок (L5, L6, L7, L8)
 */
import type { CourseSeed } from '../types';

function accepted(answer: string, extras: string[] = []): string[] {
  const noPunct = answer.replace(/[.!?]$/, '');
  const lc = answer.toLowerCase();
  const lcNoPunct = noPunct.toLowerCase();
  return Array.from(new Set([answer, noPunct, lc, lcNoPunct, ...extras]));
}

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
    // ═══════════════════════════════════════════════════════════════════
    // LESSON 1 · Describing People (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-people-places-1-describing',
      title: 'Describing People',
      orderIndex: 0,
      type: 'interactive',
      durationMin: 13,
      xp: 15,
      sectionSlug: 'a-people-places-people',
      sectionTitle: 'Юніт 1 · Опис',
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
        { id: 'l1-mcq-adj1', type: 'multiple-choice', question: 'Choose the OPPOSITE of "tall".', options: ['young', 'short', 'old', 'kind'], correctIndex: 1 },
        { id: 'l1-mcq-adj2', type: 'multiple-choice', question: 'My sister _____ long hair.', options: ['have', 'has', 'is', 'are'], correctIndex: 1, explanation: 'She/He → has.' },
        { id: 'l1-mcq-adj3', type: 'multiple-choice', question: 'Which sentence is correct?', options: ['He is a boy tall.', 'He is a tall boy.', 'He tall is a boy.', 'He boy tall is.'], correctIndex: 1, explanation: 'Прикметник стоїть перед іменником.' },
        { id: 'l1-mcq-adj4', type: 'multiple-choice', question: 'A person who likes to help others is...', options: ['shy', 'old', 'kind', 'tall'], correctIndex: 2 },
        { id: 'l1-fill-adj1', type: 'fill-blank', before: 'My grandmother ', after: ' grey hair.', answer: 'has' },
        { id: 'l1-fill-adj2', type: 'fill-blank', before: 'Tom is very ', after: ' — he tells funny jokes.', answer: 'funny' },
        { id: 'l1-match-adj', type: 'match-pairs', prompt: 'Зʼєднай протилежності.', pairs: [{ left: 'tall', right: 'short' }, { left: 'young', right: 'old' }, { left: 'brave', right: 'shy' }, { left: 'happy', right: 'sad' }] },
        { id: 'l1-wordorder-adj', type: 'word-order', prompt: 'Склади речення.', translation: 'У моєї сестри коротке темне волосся.', words: ['My', 'sister', 'has', 'short', 'dark', 'hair'], answer: ['My', 'sister', 'has', 'short', 'dark', 'hair'] },
        { id: 'l1-translate-adj1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Мій тато високий і добрий.', answer: 'My dad is tall and kind.', acceptedAnswers: accepted('My dad is tall and kind.', ['My father is tall and kind.', 'my dad is tall and kind']) },
        { id: 'l1-translate-adj2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'У неї блакитні очі.', answer: 'She has blue eyes.', acceptedAnswers: accepted('She has blue eyes.', ['she has blue eyes']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 2 · Describing Places (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-people-places-2-describing-places',
      title: 'Describing Places',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 12,
      xp: 15,
      sectionSlug: 'a-people-places-people',
      sectionTitle: 'Юніт 1 · Опис',
      sectionOrder: 0,
      topic: 'describing-places',
      steps: [
        {
          id: 'l2-theory-places',
          type: 'theory',
          title: 'Місця і їх ознаки',
          body: 'Місця у місті: a park (парк), a shop (магазин), a school (школа), a museum (музей), a café (кафе), a library (бібліотека), a station (вокзал/станція). Описуємо прикметниками: big, small, beautiful, busy, quiet, modern, old.',
          examples: [
            { en: 'My city is big and modern.', ua: 'Моє місто велике й сучасне.' },
            { en: 'The park is quiet.', ua: 'У парку тихо.' },
            { en: 'There is a beautiful old library here.', ua: 'Тут є красива стара бібліотека.' },
          ],
          tip: '💡 Кілька прикметників разом ідуть у порядку: думка → розмір → вік → колір. «A beautiful big old castle».',
        },
        {
          id: 'l2-theory-prepositions',
          type: 'theory',
          title: 'Прийменники місця',
          body: 'Щоб сказати, ДЕ щось є, англійська має кілька маленьких слів. "in" — всередині (in the room). "on" — на поверхні (on the table). "near" — поруч (near the school). "next to" — впритул (next to me). "between" — між (between the bank and the café).',
          examples: [
            { en: 'The cat is on the sofa.', ua: 'Кіт на дивані.' },
            { en: 'My house is near the park.', ua: 'Мій дім біля парку.' },
            { en: 'The shop is between the bank and the café.', ua: 'Магазин між банком і кафе.' },
          ],
        },
        { id: 'l2-mcq-1', type: 'multiple-choice', question: 'Where do you borrow books?', options: ['a museum', 'a library', 'a station', 'a park'], correctIndex: 1 },
        { id: 'l2-mcq-2', type: 'multiple-choice', question: 'Choose the correct preposition. The cup is _____ the table.', options: ['in', 'on', 'between', 'near'], correctIndex: 1 },
        { id: 'l2-mcq-3', type: 'multiple-choice', question: 'Which adjective describes a CALM place?', options: ['busy', 'modern', 'quiet', 'big'], correctIndex: 2 },
        { id: 'l2-mcq-4', type: 'multiple-choice', question: 'Choose the correct order.', options: ['a small old house', 'an old small house', 'a house small old', 'a house old small'], correctIndex: 0, explanation: 'Розмір (small) перед віком (old).' },
        { id: 'l2-fill-1', type: 'fill-blank', before: 'The bakery is ', after: ' to the school.', answer: 'next' },
        { id: 'l2-fill-2', type: 'fill-blank', before: 'My city is ', after: ' and beautiful.', answer: 'big' },
        { id: 'l2-match-place', type: 'match-pairs', prompt: 'Зʼєднай місце з тим, що там роблять.', pairs: [{ left: 'library', right: 'read books' }, { left: 'museum', right: 'see art' }, { left: 'café', right: 'drink coffee' }, { left: 'park', right: 'walk' }] },
        { id: 'l2-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Парк знаходиться між школою та кафе.', words: ['The', 'park', 'is', 'between', 'the', 'school', 'and', 'the', 'café'], answer: ['The', 'park', 'is', 'between', 'the', 'school', 'and', 'the', 'café'] },
        { id: 'l2-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Біля моєї школи є великий парк.', answer: 'There is a big park near my school.', acceptedAnswers: accepted('There is a big park near my school.', ['There is a big park near my school', 'A big park is near my school.']) },
        { id: 'l2-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Музей дуже старий, але красивий.', answer: 'The museum is very old but beautiful.', acceptedAnswers: accepted('The museum is very old but beautiful.', ['The museum is very old but beautiful']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 3 · Comparing Things (Юніт 2) — Comparative
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-people-places-3-comparing',
      title: 'Comparing Things',
      orderIndex: 2,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'a-people-places-compare',
      sectionTitle: 'Юніт 2 · Порівняння',
      sectionOrder: 1,
      topic: 'comparative',
      steps: [
        {
          id: 'l3-theory-comp',
          type: 'theory',
          title: 'Comparative — порівнюємо двоє',
          body: 'Щоб сказати, що щось БІЛЬШЕ/КРАЩЕ за щось інше, англійська має дві формули:\n• короткі прикметники (1 склад): + "-er + than" → tall → taller than.\n• довгі (2+ склади): "more + ... + than" → beautiful → more beautiful than.\n\nДеякі неправильні: good → better, bad → worse, far → farther.',
          examples: [
            { en: 'Kyiv is bigger than Lviv.', ua: 'Київ більший за Львів.' },
            { en: 'This book is more interesting than that one.', ua: 'Ця книга цікавіша за ту.' },
            { en: 'My phone is better than yours.', ua: 'Мій телефон кращий за твій.' },
            { en: 'Today is colder than yesterday.', ua: 'Сьогодні холодніше, ніж учора.' },
          ],
          tip: '💡 Якщо прикметник закінчується на "y" — "y" → "ier": happy → happier, easy → easier.',
        },
        {
          id: 'l3-theory-doubling',
          type: 'theory',
          title: 'Подвоєння кінцевої приголосної',
          body: 'Якщо коротке слово закінчується на "приголосна-голосна-приголосна", остання літера ПОДВОЮЄТЬСЯ перед "-er": big → bigger, hot → hotter, fat → fatter, thin → thinner.',
          examples: [
            { en: 'big → bigger', ua: 'більший' },
            { en: 'hot → hotter', ua: 'гарячіший' },
            { en: 'thin → thinner', ua: 'тонший' },
            { en: 'Africa is hotter than Europe.', ua: 'Африка гарячіша за Європу.' },
          ],
        },
        { id: 'l3-mcq-1', type: 'multiple-choice', question: 'Choose the comparative of "tall".', options: ['taller', 'more tall', 'most tall', 'taller than'], correctIndex: 0 },
        { id: 'l3-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['Cats are smaller dogs.', 'Cats are smaller than dogs.', 'Cats are more small than dogs.', 'Cats are most small than dogs.'], correctIndex: 1 },
        { id: 'l3-mcq-3', type: 'multiple-choice', question: 'My exam was _____ I expected.', options: ['easier than', 'more easy than', 'easier from', 'more easier than'], correctIndex: 0 },
        { id: 'l3-mcq-4', type: 'multiple-choice', question: 'Comparative of "good" is...', options: ['gooder', 'more good', 'better', 'best'], correctIndex: 2 },
        { id: 'l3-fill-1', type: 'fill-blank', before: 'This bag is ', after: ' than that one.', answer: 'cheaper', hint: 'cheap → ?' },
        { id: 'l3-fill-2', type: 'fill-blank', before: 'A train is ', after: ' interesting than a car.', answer: 'more' },
        { id: 'l3-match-comp', type: 'match-pairs', prompt: 'Зʼєднай прикметник з його comparative.', pairs: [{ left: 'big', right: 'bigger' }, { left: 'good', right: 'better' }, { left: 'happy', right: 'happier' }, { left: 'expensive', right: 'more expensive' }] },
        { id: 'l3-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Цей фільм гірший за книгу.', words: ['This', 'film', 'is', 'worse', 'than', 'the', 'book'], answer: ['This', 'film', 'is', 'worse', 'than', 'the', 'book'] },
        { id: 'l3-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Київ більший за Львів.', answer: 'Kyiv is bigger than Lviv.', acceptedAnswers: accepted('Kyiv is bigger than Lviv.', ['kyiv is bigger than lviv']) },
        { id: 'l3-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Сьогодні тепліше, ніж учора.', answer: 'Today is warmer than yesterday.', acceptedAnswers: accepted('Today is warmer than yesterday.', ['it is warmer today than yesterday']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 4 · The Best of All (Юніт 2) — Superlative
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-people-places-4-best',
      title: 'The Best of All',
      orderIndex: 3,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'a-people-places-compare',
      sectionTitle: 'Юніт 2 · Порівняння',
      sectionOrder: 1,
      topic: 'superlative',
      steps: [
        {
          id: 'l4-theory-sup',
          type: 'theory',
          title: 'Superlative — найкращий, найбільший',
          body: 'Superlative — це коли щось НАЙ-щось у групі. Формула: "the + -est" для коротких прикметників, "the most + ..." для довгих.\n• tall → the tallest\n• beautiful → the most beautiful\n\nНеправильні: good → the best, bad → the worst, far → the farthest.',
          examples: [
            { en: 'Mount Everest is the highest mountain.', ua: 'Еверест — найвища гора.' },
            { en: 'This is the most interesting book in the library.', ua: 'Це найцікавіша книга в бібліотеці.' },
            { en: 'You are my best friend.', ua: 'Ти мій найкращий друг.' },
          ],
          tip: '💡 «The» обовʼязковий: «my best friend», «the tallest building».',
        },
        {
          id: 'l4-theory-of-in',
          type: 'theory',
          title: '"of" vs "in" у superlative',
          body: 'Після superlative часто йде "of" (зі списку) або "in" (всередині місця/групи). "the best of all" (найкращий з усіх). "the tallest building in the city" (найвища будівля у місті).',
          examples: [
            { en: 'She is the smartest of my friends.', ua: 'Вона найрозумніша з моїх друзів.' },
            { en: 'This is the oldest church in the town.', ua: 'Це найстаріша церква у місті.' },
            { en: 'It was the best day of my life.', ua: 'Це був найкращий день у моєму житті.' },
          ],
        },
        { id: 'l4-mcq-1', type: 'multiple-choice', question: 'Choose the superlative of "happy".', options: ['happier', 'happiest', 'the happiest', 'the most happy'], correctIndex: 2 },
        { id: 'l4-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['He is the most tall in his class.', 'He is tallest in his class.', 'He is the tallest in his class.', 'He is more tall in his class.'], correctIndex: 2 },
        { id: 'l4-mcq-3', type: 'multiple-choice', question: '"Найгірший" англійською — це...', options: ['worse', 'worst', 'the worse', 'the worst'], correctIndex: 3 },
        { id: 'l4-mcq-4', type: 'multiple-choice', question: 'This is the most beautiful park _____ the city.', options: ['of', 'in', 'on', 'at'], correctIndex: 1 },
        { id: 'l4-fill-1', type: 'fill-blank', before: 'It is ', after: ' day of the year.', answer: 'the longest', hint: 'long → ?' },
        { id: 'l4-fill-2', type: 'fill-blank', before: 'You are the ', after: ' friend in the world!', answer: 'best' },
        { id: 'l4-match-sup', type: 'match-pairs', prompt: 'Зʼєднай прикметник з superlative.', pairs: [{ left: 'big', right: 'biggest' }, { left: 'good', right: 'best' }, { left: 'happy', right: 'happiest' }, { left: 'expensive', right: 'most expensive' }] },
        { id: 'l4-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Це найкращий день у моєму житті.', words: ['This', 'is', 'the', 'best', 'day', 'of', 'my', 'life'], answer: ['This', 'is', 'the', 'best', 'day', 'of', 'my', 'life'] },
        { id: 'l4-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Він найвищий у своєму класі.', answer: 'He is the tallest in his class.', acceptedAnswers: accepted('He is the tallest in his class.', ['he is the tallest in his class']) },
        { id: 'l4-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Це був найгірший фільм у моєму житті.', answer: 'It was the worst film of my life.', acceptedAnswers: accepted('It was the worst film of my life.', ['It was the worst movie of my life.', 'It was the worst film in my life.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 5 · Yesterday I… (Юніт 3) — Past Simple regular
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-people-places-5-yesterday',
      title: 'Yesterday I…',
      orderIndex: 4,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'a-people-places-past',
      sectionTitle: 'Юніт 3 · Минуле і підсумок',
      sectionOrder: 2,
      topic: 'past-simple-regular',
      steps: [
        {
          id: 'l5-theory-past',
          type: 'theory',
          title: 'Past Simple — правильні дієслова',
          body: 'Past Simple описує закінчену дію в минулому. Правильні дієслова отримують закінчення "-ed": walk → walked, visit → visited, watch → watched. Якщо слово закінчується на "-e", додаємо тільки "-d": dance → danced.',
          examples: [
            { en: 'I walked to school yesterday.', ua: 'Я вчора йшов до школи пішки.' },
            { en: 'She visited her granny last weekend.', ua: 'Вона відвідала бабусю минулих вихідних.' },
            { en: 'We watched a film at home.', ua: 'Ми вдома дивились фільм.' },
            { en: 'They played football in the park.', ua: 'Вони грали у футбол у парку.' },
          ],
          tip: '💡 Якщо слово закінчується на "y" після приголосної: study → studied, try → tried.',
        },
        {
          id: 'l5-theory-did',
          type: 'theory',
          title: '"did" — питання й заперечення',
          body: 'У питаннях і запереченнях Past Simple допоміжне дієслово "did" (для всіх осіб!). Основне дієслово повертається до інфінітива (без -ed).',
          examples: [
            { en: 'Did you watch the film?', ua: 'Ти дивився фільм?' },
            { en: "I didn't visit my granny.", ua: 'Я не відвідував бабусю.' },
            { en: 'Did she play football?', ua: 'Вона грала у футбол?' },
            { en: "We didn't walk to school today.", ua: 'Ми сьогодні не йшли до школи пішки.' },
          ],
          tip: '💡 «Did you walked?» — НЕПРАВИЛЬНО. Тільки «Did you walk?» — без -ed.',
        },
        { id: 'l5-mcq-1', type: 'multiple-choice', question: 'Choose the Past Simple of "play".', options: ['plays', 'played', 'playing', 'play'], correctIndex: 1 },
        { id: 'l5-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['She didn\'t watched the film.', "She didn't watch the film.", 'She not watched the film.', "She doesn't watched the film."], correctIndex: 1 },
        { id: 'l5-mcq-3', type: 'multiple-choice', question: '_____ you visit your friend yesterday?', options: ['Do', 'Does', 'Did', 'Are'], correctIndex: 2 },
        { id: 'l5-mcq-4', type: 'multiple-choice', question: 'Past Simple of "study" is...', options: ['studyed', 'studied', 'studyd', 'study'], correctIndex: 1 },
        { id: 'l5-fill-1', type: 'fill-blank', before: 'Last weekend we ', after: ' a museum.', answer: 'visited' },
        { id: 'l5-fill-2', type: 'fill-blank', before: 'I ', after: ' play tennis last week.', answer: "didn't" },
        { id: 'l5-match-past', type: 'match-pairs', prompt: 'Зʼєднай інфінітив з Past Simple формою.', pairs: [{ left: 'walk', right: 'walked' }, { left: 'study', right: 'studied' }, { left: 'play', right: 'played' }, { left: 'watch', right: 'watched' }] },
        { id: 'l5-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Вчора я грав у футбол з друзями.', words: ['Yesterday', 'I', 'played', 'football', 'with', 'my', 'friends'], answer: ['Yesterday', 'I', 'played', 'football', 'with', 'my', 'friends'] },
        { id: 'l5-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Вчора ми дивились фільм удома.', answer: 'Yesterday we watched a film at home.', acceptedAnswers: accepted('Yesterday we watched a film at home.', ['We watched a film at home yesterday.']) },
        { id: 'l5-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Вона не вчилась у бібліотеці.', answer: "She didn't study at the library.", acceptedAnswers: accepted("She didn't study at the library.", ['She did not study at the library.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 6 · Past Simple — Irregular Verbs (Юніт 3)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-people-places-6-irregular',
      title: 'Past Simple — Irregular Verbs',
      orderIndex: 5,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'a-people-places-past',
      sectionTitle: 'Юніт 3 · Минуле і підсумок',
      sectionOrder: 2,
      topic: 'past-simple-irregular',
      steps: [
        {
          id: 'l6-theory-irreg',
          type: 'theory',
          title: 'Неправильні дієслова — топ-10',
          body: 'У англійській багато дієслів НЕ дотримуються правила "-ed". Їх просто треба запамʼятати. Топ-10 для початку:\n\ngo → went, see → saw, eat → ate, drink → drank, take → took, come → came, give → gave, get → got, have → had, make → made.',
          examples: [
            { en: 'I went to the cinema.', ua: 'Я пішов у кіно.' },
            { en: 'She saw a beautiful bird.', ua: 'Вона побачила гарну пташку.' },
            { en: 'We ate pizza for dinner.', ua: 'Ми їли піцу на вечерю.' },
            { en: 'They had a great time.', ua: 'Їм було чудово.' },
          ],
          tip: '💡 Список неправильних дієслів варто завчити списком — це маст-хев A2-рівня.',
        },
        {
          id: 'l6-theory-was-were',
          type: 'theory',
          title: '"was / were" — минула форма "to be"',
          body: '"Was" — для I/he/she/it. "Were" — для you/we/they. Заперечення — "wasn\'t / weren\'t". Питання — "Was/Were + підмет".',
          examples: [
            { en: 'I was happy yesterday.', ua: 'Я був щасливий учора.' },
            { en: 'They were at the cinema.', ua: 'Вони були в кіно.' },
            { en: "She wasn't tired.", ua: 'Вона не була втомлена.' },
            { en: 'Were you at school?', ua: 'Ти був у школі?' },
          ],
        },
        { id: 'l6-mcq-1', type: 'multiple-choice', question: 'Choose the Past Simple of "go".', options: ['goed', 'went', 'gone', 'going'], correctIndex: 1 },
        { id: 'l6-mcq-2', type: 'multiple-choice', question: 'Past Simple of "eat" is...', options: ['eated', 'ate', 'eaten', 'eats'], correctIndex: 1 },
        { id: 'l6-mcq-3', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I were tired.', 'I was tired.', 'I wasn\'t tired yesterday.', 'I am tired yesterday.'], correctIndex: 1 },
        { id: 'l6-mcq-4', type: 'multiple-choice', question: 'They _____ at home last night.', options: ['was', 'were', 'are', 'is'], correctIndex: 1 },
        { id: 'l6-fill-1', type: 'fill-blank', before: 'She ', after: ' a beautiful film yesterday.', answer: 'saw', hint: 'see → ?' },
        { id: 'l6-fill-2', type: 'fill-blank', before: 'We ', after: ' fish for dinner last night.', answer: 'had', hint: 'have → ?' },
        { id: 'l6-match-irreg', type: 'match-pairs', prompt: 'Зʼєднай дієслово з минулою формою.', pairs: [{ left: 'go', right: 'went' }, { left: 'see', right: 'saw' }, { left: 'eat', right: 'ate' }, { left: 'have', right: 'had' }, { left: 'take', right: 'took' }] },
        { id: 'l6-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Минулого літа ми поїхали до моря.', words: ['Last', 'summer', 'we', 'went', 'to', 'the', 'sea'], answer: ['Last', 'summer', 'we', 'went', 'to', 'the', 'sea'] },
        { id: 'l6-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я вчора побачив старого друга.', answer: 'I saw an old friend yesterday.', acceptedAnswers: accepted('I saw an old friend yesterday.', ['Yesterday I saw an old friend.']) },
        { id: 'l6-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Ми мали чудовий час на вечірці.', answer: 'We had a great time at the party.', acceptedAnswers: accepted('We had a great time at the party.', ['we had a great time at the party']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 7 · A Day to Remember (Юніт 3)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-people-places-7-day-to-remember',
      title: 'A Day to Remember',
      orderIndex: 6,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'a-people-places-past',
      sectionTitle: 'Юніт 3 · Минуле і підсумок',
      sectionOrder: 2,
      topic: 'past-narration',
      steps: [
        {
          id: 'l7-theory-when',
          type: 'theory',
          title: 'Звʼязки в розповіді: when, then, after',
          body: 'Щоб історія звучала зв\'язно, англійська вживає маленькі слова-звʼязки.\n• "when" — коли (звʼязує дві дії)\n• "then" — потім\n• "after that" — після того\n• "first" — спочатку, "next" — далі, "finally" — нарешті.',
          examples: [
            { en: 'First I had breakfast, then I went to school.', ua: 'Спочатку я поснідав, потім пішов до школи.' },
            { en: 'When she opened the door, she saw a cat.', ua: 'Коли вона відчинила двері, побачила кота.' },
            { en: 'After that, we played in the garden.', ua: 'Після цього ми гралися у саду.' },
            { en: 'Finally, we came back home.', ua: 'Нарешті ми повернулись додому.' },
          ],
          tip: '💡 «When» поєднує дві події: коли одна сталась, інша теж.',
        },
        {
          id: 'l7-theory-time-markers',
          type: 'theory',
          title: 'Маркери часу для минулого',
          body: 'Past Simple часто супроводжується вказівкою на конкретний час: yesterday (вчора), last week / month / year, two days ago, in 2020, on Monday.',
          examples: [
            { en: 'I visited her two days ago.', ua: 'Я її відвідав два дні тому.' },
            { en: 'We moved in 2020.', ua: 'Ми переїхали у 2020.' },
            { en: 'She went to Paris last summer.', ua: 'Вона їздила в Париж минулого літа.' },
          ],
        },
        { id: 'l7-mcq-1', type: 'multiple-choice', question: 'Choose the correct word.', options: ['First I went home, _____ I had dinner.', '_____ — then', '_____ — after', '_____ — when'], correctIndex: 0, explanation: 'Після "first" логічно — "then".' },
        { id: 'l7-mcq-2', type: 'multiple-choice', question: 'I called him _____ ago.', options: ['three minutes', 'three minute', 'in three minutes', 'on three minutes'], correctIndex: 0 },
        { id: 'l7-mcq-3', type: 'multiple-choice', question: '"When she _____ the door, she saw a dog."', options: ['open', 'opens', 'opened', 'opening'], correctIndex: 2 },
        { id: 'l7-mcq-4', type: 'multiple-choice', question: 'Which marker DOESN\'T fit Past Simple?', options: ['yesterday', 'last week', 'now', 'in 2018'], correctIndex: 2 },
        { id: 'l7-fill-1', type: 'fill-blank', before: 'I called him three days ', after: '.', answer: 'ago' },
        { id: 'l7-fill-2', type: 'fill-blank', before: 'First we had breakfast, ', after: ' we went to the park.', answer: 'then' },
        { id: 'l7-match-time', type: 'match-pairs', prompt: 'Зʼєднай маркер часу з типовим контекстом.', pairs: [{ left: 'yesterday', right: '1 day ago' }, { left: 'last week', right: '7 days ago' }, { left: 'in 2020', right: 'years ago' }, { left: 'two days ago', right: '2 days back' }] },
        { id: 'l7-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Минулого літа ми поїхали до моря, а потім відвідали бабусю.', words: ['Last', 'summer', 'we', 'went', 'to', 'the', 'sea', 'and', 'then', 'visited', 'granny'], answer: ['Last', 'summer', 'we', 'went', 'to', 'the', 'sea', 'and', 'then', 'visited', 'granny'] },
        { id: 'l7-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Спочатку я поснідав, потім пішов до школи.', answer: 'First I had breakfast, then I went to school.', acceptedAnswers: accepted('First I had breakfast, then I went to school.', ['First, I had breakfast, then I went to school.']) },
        { id: 'l7-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Коли вона відчинила двері, вона побачила кота.', answer: 'When she opened the door, she saw a cat.', acceptedAnswers: accepted('When she opened the door, she saw a cat.', ['When she opened the door she saw a cat.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 8 · My Town (Юніт 3) — recap
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'a-people-places-8-my-town',
      title: 'My Town',
      orderIndex: 7,
      type: 'interactive',
      durationMin: 14,
      xp: 22,
      sectionSlug: 'a-people-places-past',
      sectionTitle: 'Юніт 3 · Минуле і підсумок',
      sectionOrder: 2,
      topic: 'recap-personal-description',
      steps: [
        {
          id: 'l8-theory-recap',
          type: 'theory',
          title: 'Описуємо своє місто',
          body: 'Тепер ти можеш зібрати все: назвати місце, описати прикметниками, порівняти з іншими і розповісти про вчора. Корисні фрази:\n• "I live in..." (Я живу в...)\n• "My town is bigger / smaller than..."\n• "There is / There are..."\n• "Yesterday I visited / went / saw..."',
          examples: [
            { en: 'I live in Lviv. It is an old beautiful city.', ua: 'Я живу у Львові. Це старе красиве місто.' },
            { en: 'My town is smaller than Kyiv but very cosy.', ua: 'Моє місто менше за Київ, але дуже затишне.' },
            { en: 'Yesterday I went to the central park with my mum.', ua: 'Вчора я ходив у центральний парк з мамою.' },
          ],
        },
        {
          id: 'l8-theory-cohesion',
          type: 'theory',
          title: 'Структура опису-міні-есе',
          body: 'Для розповіді з 5 речень — структура: 1) де живеш, 2) яке місто (прикметники), 3) одна перевага (порівняння), 4) одне минуле враження, 5) висновок-почуття. Це базова структура для відповіді на тест на A2.',
          examples: [
            { en: '1. I live in Odesa.', ua: 'Я живу в Одесі.' },
            { en: '2. It is a big and sunny city by the sea.', ua: 'Це велике сонячне місто біля моря.' },
            { en: '3. It is more beautiful than many other towns.', ua: 'Воно красивіше за багато інших.' },
            { en: '4. Last summer I went to the beach every day.', ua: 'Минулого літа я щодня ходив на пляж.' },
            { en: '5. I love my town!', ua: 'Я обожнюю своє місто!' },
          ],
        },
        { id: 'l8-mcq-1', type: 'multiple-choice', question: 'Which sentence opens a description best?', options: ['I went home.', 'I live in Kyiv.', 'I love it!', 'It was sunny.'], correctIndex: 1 },
        { id: 'l8-mcq-2', type: 'multiple-choice', question: 'Choose the correct comparative.', options: ['My town is more big than yours.', 'My town is bigger than yours.', 'My town is biggest than yours.', 'My town is the bigger than yours.'], correctIndex: 1 },
        { id: 'l8-mcq-3', type: 'multiple-choice', question: 'Past Simple of "see" is...', options: ['saw', 'seen', 'sees', 'seed'], correctIndex: 0 },
        { id: 'l8-mcq-4', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['Yesterday I am going to the park.', 'Yesterday I goed to the park.', 'Yesterday I went to the park.', 'Yesterday I go to the park.'], correctIndex: 2 },
        { id: 'l8-fill-1', type: 'fill-blank', before: 'My town ', after: ' smaller than Kyiv.', answer: 'is' },
        { id: 'l8-fill-2', type: 'fill-blank', before: 'Last summer we ', after: ' to the sea.', answer: 'went' },
        { id: 'l8-match-recap', type: 'match-pairs', prompt: 'Зʼєднай українську фразу з англійською.', pairs: [{ left: 'я живу в...', right: 'I live in...' }, { left: 'красивіший за...', right: 'more beautiful than...' }, { left: 'минулого літа', right: 'last summer' }, { left: 'найкращий у місті', right: 'the best in town' }] },
        { id: 'l8-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я живу у Львові — це красиве старе місто.', words: ['I', 'live', 'in', 'Lviv', '—', 'a', 'beautiful', 'old', 'city'], answer: ['I', 'live', 'in', 'Lviv', '—', 'a', 'beautiful', 'old', 'city'] },
        { id: 'l8-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Моє місто менше за Київ, але дуже гарне.', answer: 'My town is smaller than Kyiv but very beautiful.', acceptedAnswers: accepted('My town is smaller than Kyiv but very beautiful.', ['My city is smaller than Kyiv but very beautiful.']) },
        { id: 'l8-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Минулого літа я кожного дня ходив у парк.', answer: 'Last summer I went to the park every day.', acceptedAnswers: accepted('Last summer I went to the park every day.', ['Last summer, I went to the park every day.']) },
      ],
    },
  ],
};
