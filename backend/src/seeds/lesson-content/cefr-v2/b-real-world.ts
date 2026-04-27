/**
 * B · Real-World English 🌐 — 8-lesson B2 course.
 *
 * Formal vs informal, news, present perfect, passive voice, idioms.
 * Closes the A→B path with practical conversational scenarios.
 *
 * Sections (3 units):
 *   Юніт 1 · Present Perfect (L1, L2, L3)
 *   Юніт 2 · Пасивний стан    (L4, L5)
 *   Юніт 3 · Реальні розмови (L6, L7, L8)
 */
import type { CourseSeed } from '../types';

function accepted(answer: string, extras: string[] = []): string[] {
  const noPunct = answer.replace(/[.!?]$/, '');
  const lc = answer.toLowerCase();
  const lcNoPunct = noPunct.toLowerCase();
  return Array.from(new Set([answer, noPunct, lc, lcNoPunct, ...extras]));
}

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
    // ═══════════════════════════════════════════════════════════════════
    // LESSON 1 · Have You Ever…? (Юніт 1) — Present Perfect (experience)
    // ═══════════════════════════════════════════════════════════════════
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
        { id: 'l1-mcq-pp1', type: 'multiple-choice', question: 'Choose the correct Present Perfect.', options: ['I have saw that film.', 'I have seen that film.', 'I has see that film.', 'I am seen that film.'], correctIndex: 1, explanation: 'have + V3 (seen).' },
        { id: 'l1-mcq-pp2', type: 'multiple-choice', question: 'Which sentence is WRONG?', options: ["I've never been to Italy.", "She's tried sushi twice.", 'I have visited Rome in 2019.', 'Have you ever flown a plane?'], correctIndex: 2, explanation: '"in 2019" — точний час → треба Past Simple.' },
        { id: 'l1-mcq-pp3', type: 'multiple-choice', question: 'Past participle of "be" is...', options: ['was', 'were', 'been', 'being'], correctIndex: 2 },
        { id: 'l1-mcq-pp4', type: 'multiple-choice', question: '_____ you ever eaten Japanese food?', options: ['Did', 'Have', 'Are', 'Do'], correctIndex: 1 },
        { id: 'l1-fill-pp1', type: 'fill-blank', before: 'I have ', after: ' to many countries.', answer: 'been', hint: 'be → was/were → ?' },
        { id: 'l1-fill-pp2', type: 'fill-blank', before: 'She ', after: ' tried Korean food before.', answer: 'has', hint: 'She → has' },
        { id: 'l1-match-pp', type: 'match-pairs', prompt: 'Зʼєднай дієслово з його past participle (V3).', pairs: [{ left: 'go', right: 'gone' }, { left: 'see', right: 'seen' }, { left: 'eat', right: 'eaten' }, { left: 'be', right: 'been' }, { left: 'do', right: 'done' }] },
        { id: 'l1-wordorder-pp', type: 'word-order', prompt: 'Склади речення.', translation: 'Чи ти коли-небудь куштував суші?', words: ['Have', 'you', 'ever', 'tried', 'sushi'], answer: ['Have', 'you', 'ever', 'tried', 'sushi'] },
        { id: 'l1-translate-pp1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я ніколи не був у Лондоні.', answer: "I've never been to London.", acceptedAnswers: accepted("I've never been to London.", ['I have never been to London.']) },
        { id: 'l1-translate-pp2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Вона бачила цей фільм двічі.', answer: 'She has seen this film twice.', acceptedAnswers: accepted('She has seen this film twice.', ["She's seen this film twice."]) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 2 · Just / Already / Yet (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-real-world-2-just-already-yet',
      title: 'Just / Already / Yet',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-real-world-perfect',
      sectionTitle: 'Юніт 1 · Present Perfect',
      sectionOrder: 0,
      topic: 'present-perfect-markers',
      steps: [
        {
          id: 'l2-theory-just',
          type: 'theory',
          title: '"just" — щойно',
          body: '"just" + Present Perfect показує, що дія сталась ДУЖЕ НЕДАВНО, хвилину тому. Стоїть МІЖ have/has та V3.\n\n"I have just finished" = "Я щойно закінчив".',
          examples: [
            { en: 'I have just eaten.', ua: 'Я щойно поїв.' },
            { en: "She's just arrived.", ua: 'Вона щойно прибула.' },
            { en: 'They have just left.', ua: 'Вони щойно пішли.' },
          ],
          tip: '💡 Не плутай "just" (щойно) і "just" (просто). Контекст підкаже.',
        },
        {
          id: 'l2-theory-already-yet',
          type: 'theory',
          title: '"already" та "yet"',
          body: '"already" — ВЖЕ (раніше ніж очікувалось). У ствердженні. Між have/has та V3.\n\n"yet" — ще (поки що). У запереченнях і питаннях. У КІНЦІ речення.\n\n"I have already finished" vs "Have you finished yet?" / "I haven\'t finished yet".',
          examples: [
            { en: 'I have already done my homework.', ua: 'Я вже зробив домашку.' },
            { en: "She hasn't called yet.", ua: 'Вона ще не подзвонила.' },
            { en: 'Have you eaten yet?', ua: 'Ти вже поїв?' },
            { en: 'They have already left.', ua: 'Вони вже пішли.' },
          ],
          tip: '💡 "already" — позитив. "yet" — питання/заперечення.',
        },
        { id: 'l2-mcq-1', type: 'multiple-choice', question: 'Where does "just" go?', options: ['I just have arrived.', 'I have just arrived.', 'Just I have arrived.', 'I have arrived just.'], correctIndex: 1 },
        { id: 'l2-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I have already finished.', 'I have yet finished.', 'I have finished already?', 'I yet have finished.'], correctIndex: 0 },
        { id: 'l2-mcq-3', type: 'multiple-choice', question: '"Have you eaten _____?"', options: ['already', 'just', 'yet', 'now'], correctIndex: 2 },
        { id: 'l2-mcq-4', type: 'multiple-choice', question: 'Choose the correct word: "She _____ left — you missed her by a minute."', options: ['yet', 'already', 'has just', 'have just'], correctIndex: 2 },
        { id: 'l2-fill-1', type: 'fill-blank', before: 'I have ', after: ' had lunch — I am full!', answer: 'just' },
        { id: 'l2-fill-2', type: 'fill-blank', before: "Haven't you finished ", after: '?', answer: 'yet' },
        { id: 'l2-match-marker', type: 'match-pairs', prompt: 'Зʼєднай маркер з типовою конструкцією.', pairs: [{ left: 'just', right: 'between have/has and V3' }, { left: 'already', right: 'positive sentence' }, { left: 'yet', right: 'questions / negatives' }, { left: 'never', right: 'experience denial' }] },
        { id: 'l2-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я щойно закінчив домашку.', words: ['I', 'have', 'just', 'finished', 'my', 'homework'], answer: ['I', 'have', 'just', 'finished', 'my', 'homework'] },
        { id: 'l2-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я вже бачив цей фільм.', answer: 'I have already seen this film.', acceptedAnswers: accepted('I have already seen this film.', ["I've already seen this film.", 'I have already seen this movie.']) },
        { id: 'l2-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Вона ще не подзвонила.', answer: "She hasn't called yet.", acceptedAnswers: accepted("She hasn't called yet.", ['She has not called yet.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 3 · News Headlines (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-real-world-3-news-headlines',
      title: 'News Headlines',
      orderIndex: 2,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-real-world-perfect',
      sectionTitle: 'Юніт 1 · Present Perfect',
      sectionOrder: 0,
      topic: 'present-perfect-news',
      steps: [
        {
          id: 'l3-theory-news',
          type: 'theory',
          title: 'Present Perfect у новинах',
          body: 'У новинах часто перша згадка події — Present Perfect ("сталося, ось результат"), а далі деталі — Past Simple. Це звучить актуально, "новина свіжа".',
          examples: [
            { en: 'Scientists have discovered a new planet.', ua: 'Вчені відкрили нову планету.' },
            { en: 'The company has launched a new product.', ua: 'Компанія запустила новий продукт.' },
            { en: 'A storm has hit the coast.', ua: 'Буря ударила по узбережжі.' },
          ],
          tip: '💡 Заголовки часто опускають "have/has": "Scientists discover new planet" — телеграфний стиль.',
        },
        {
          id: 'l3-theory-news-vocab',
          type: 'theory',
          title: 'Лексика новин',
          body: 'Корисні дієслова: announce (оголошувати), launch (запускати), discover (відкривати), warn (попереджати), confirm (підтверджувати), reveal (розкривати), hit (вдарити). Ці дієслова — основа коротких новин.',
          examples: [
            { en: 'The president has announced new measures.', ua: 'Президент оголосив нові заходи.' },
            { en: 'They have confirmed the meeting.', ua: 'Вони підтвердили зустріч.' },
            { en: 'Police have warned drivers about ice on the roads.', ua: 'Поліція попередила водіїв про лід на дорогах.' },
          ],
        },
        { id: 'l3-mcq-1', type: 'multiple-choice', question: 'Choose the news-style sentence.', options: ['Scientists discovered a new planet last year.', 'Scientists have discovered a new planet.', 'Scientists discover new planet last year.', 'Scientists are discovering a new planet.'], correctIndex: 1 },
        { id: 'l3-mcq-2', type: 'multiple-choice', question: 'Past participle of "announce" is...', options: ['announce', 'announces', 'announced', 'announcing'], correctIndex: 2 },
        { id: 'l3-mcq-3', type: 'multiple-choice', question: 'Which word means "оголошувати"?', options: ['confirm', 'announce', 'reveal', 'launch'], correctIndex: 1 },
        { id: 'l3-mcq-4', type: 'multiple-choice', question: 'Past participle of "hit" is...', options: ['hit', 'hitted', 'hitten', 'hits'], correctIndex: 0, explanation: 'hit → hit → hit (всі три форми однакові).' },
        { id: 'l3-fill-1', type: 'fill-blank', before: 'The company ', after: ' a new app today.', answer: 'has launched' },
        { id: 'l3-fill-2', type: 'fill-blank', before: 'Police ', after: ' a public warning.', answer: 'have issued' },
        { id: 'l3-match-news', type: 'match-pairs', prompt: 'Зʼєднай дієслово з перекладом.', pairs: [{ left: 'announce', right: 'оголосити' }, { left: 'launch', right: 'запустити' }, { left: 'discover', right: 'відкрити' }, { left: 'warn', right: 'попередити' }] },
        { id: 'l3-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Вчені відкрили нову планету.', words: ['Scientists', 'have', 'discovered', 'a', 'new', 'planet'], answer: ['Scientists', 'have', 'discovered', 'a', 'new', 'planet'] },
        { id: 'l3-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Президент оголосив нові заходи.', answer: 'The president has announced new measures.', acceptedAnswers: accepted('The president has announced new measures.', ['The president has announced new measures']) },
        { id: 'l3-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Буря вдарила по узбережжі.', answer: 'A storm has hit the coast.', acceptedAnswers: accepted('A storm has hit the coast.', ['The storm has hit the coast.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 4 · Things Get Done (Юніт 2) — Passive Present
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-real-world-4-passive-present',
      title: 'Things Get Done',
      orderIndex: 3,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-real-world-passive',
      sectionTitle: 'Юніт 2 · Пасивний стан',
      sectionOrder: 1,
      topic: 'passive-present',
      steps: [
        {
          id: 'l4-theory-passive',
          type: 'theory',
          title: 'Пасивний стан — фокус на дії, не на виконавцеві',
          body: 'Пасив (passive voice) використовуємо, коли важливіше ЩО сталось, а не ХТО зробив. Формула Present Simple Passive: am/is/are + V3.\n\nАктив: "They produce cars in Germany."\nПасив: "Cars are produced in Germany."',
          examples: [
            { en: 'English is spoken all over the world.', ua: 'Англійською розмовляють у всьому світі.' },
            { en: 'Many books are read every day.', ua: 'Багато книг читаються щодня.' },
            { en: 'This song is loved by everyone.', ua: 'Цю пісню всі люблять.' },
            { en: 'Letters are delivered every morning.', ua: 'Листи доставляють щоранку.' },
          ],
          tip: '💡 Якщо хочеш ВКАЗАТИ виконавця — використай "by + agent": "The book was written BY a famous author."',
        },
        {
          id: 'l4-theory-when',
          type: 'theory',
          title: 'Коли використовувати пасив',
          body: 'Пасив зручний, коли:\n• Ми НЕ ЗНАЄМО, хто зробив дію.\n• Це НЕ ВАЖЛИВО, хто зробив.\n• Хочемо звучати ОФІЦІЙНО (новини, інструкції).\n• Виконавець очевидний з контексту.',
          examples: [
            { en: 'My phone was stolen!', ua: 'Мій телефон вкрали!' },
            { en: 'The room is cleaned every day.', ua: 'Кімнату прибирають щодня.' },
            { en: 'These cars are made in Japan.', ua: 'Ці машини виробляють у Японії.' },
          ],
        },
        { id: 'l4-mcq-1', type: 'multiple-choice', question: 'Choose the passive form.', options: ['They speak English here.', 'English is spoken here.', 'English speaks here.', 'English are spoken here.'], correctIndex: 1 },
        { id: 'l4-mcq-2', type: 'multiple-choice', question: 'Choose the correct passive.', options: ['These cars made in Germany.', 'These cars are make in Germany.', 'These cars are made in Germany.', 'These cars makes in Germany.'], correctIndex: 2 },
        { id: 'l4-mcq-3', type: 'multiple-choice', question: 'Past participle of "write" is...', options: ['wrote', 'writed', 'written', 'writing'], correctIndex: 2 },
        { id: 'l4-mcq-4', type: 'multiple-choice', question: 'Which preposition introduces the agent?', options: ['from', 'by', 'with', 'of'], correctIndex: 1 },
        { id: 'l4-fill-1', type: 'fill-blank', before: 'This room ', after: ' cleaned every day.', answer: 'is' },
        { id: 'l4-fill-2', type: 'fill-blank', before: 'Many books ', after: ' read in the library.', answer: 'are' },
        { id: 'l4-match-passive', type: 'match-pairs', prompt: 'Зʼєднай дієслово з його past participle (V3).', pairs: [{ left: 'write', right: 'written' }, { left: 'speak', right: 'spoken' }, { left: 'make', right: 'made' }, { left: 'read', right: 'read' }] },
        { id: 'l4-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Англійською розмовляють у всьому світі.', words: ['English', 'is', 'spoken', 'all', 'over', 'the', 'world'], answer: ['English', 'is', 'spoken', 'all', 'over', 'the', 'world'] },
        { id: 'l4-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Цей сайт оновлюється щодня.', answer: 'This website is updated every day.', acceptedAnswers: accepted('This website is updated every day.', ['This site is updated every day.']) },
        { id: 'l4-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Ці машини виробляють у Японії.', answer: 'These cars are made in Japan.', acceptedAnswers: accepted('These cars are made in Japan.', ['These cars are produced in Japan.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 5 · Things That Were Built (Юніт 2) — Passive Past
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-real-world-5-passive-past',
      title: 'Things That Were Built',
      orderIndex: 4,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-real-world-passive',
      sectionTitle: 'Юніт 2 · Пасивний стан',
      sectionOrder: 1,
      topic: 'passive-past',
      steps: [
        {
          id: 'l5-theory-pp',
          type: 'theory',
          title: 'Past Simple Passive',
          body: 'Якщо подія сталась у минулому, а виконавець не важливий — Past Simple Passive: was/were + V3.\n\n"The bridge was built in 1900" (Міст збудували у 1900). "Many houses were destroyed" (Багато будинків було зруйновано).',
          examples: [
            { en: 'The Mona Lisa was painted by Leonardo da Vinci.', ua: 'Мону Лізу намалював Леонардо да Вінчі.' },
            { en: 'These pyramids were built thousands of years ago.', ua: 'Ці піраміди збудували тисячі років тому.' },
            { en: 'My bike was stolen yesterday.', ua: 'Мій велосипед вчора вкрали.' },
            { en: 'The letter was sent on Monday.', ua: 'Лист надіслали в понеділок.' },
          ],
        },
        {
          id: 'l5-theory-history',
          type: 'theory',
          title: 'Пасив у історії',
          body: 'У історичних оповідях пасив дуже зручний — ми знаємо ЩО і КОЛИ, але не завжди ХТО.',
          examples: [
            { en: 'The book was written in 1860.', ua: 'Книгу написали у 1860.' },
            { en: 'The castle was destroyed in a war.', ua: 'Замок був зруйнований у війні.' },
            { en: 'The treaty was signed by both sides.', ua: 'Угоду підписали обидві сторони.' },
          ],
        },
        { id: 'l5-mcq-1', type: 'multiple-choice', question: 'Choose the Past Simple Passive.', options: ['The book was written.', 'The book was wrote.', 'The book wrote.', 'The book is written.'], correctIndex: 0 },
        { id: 'l5-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['The pyramids was built thousands of years ago.', 'The pyramids were built thousands of years ago.', 'The pyramids built thousands of years ago.', 'The pyramids are built thousands of years ago.'], correctIndex: 1 },
        { id: 'l5-mcq-3', type: 'multiple-choice', question: 'Past participle of "build" is...', options: ['built', 'builded', 'building', 'builds'], correctIndex: 0 },
        { id: 'l5-mcq-4', type: 'multiple-choice', question: '"My bike _____ stolen yesterday."', options: ['was', 'were', 'is', 'are'], correctIndex: 0 },
        { id: 'l5-fill-1', type: 'fill-blank', before: 'The Mona Lisa ', after: ' painted by Leonardo.', answer: 'was' },
        { id: 'l5-fill-2', type: 'fill-blank', before: 'These houses ', after: ' built in 1900.', answer: 'were' },
        { id: 'l5-match-v3', type: 'match-pairs', prompt: 'Зʼєднай дієслово з V3.', pairs: [{ left: 'build', right: 'built' }, { left: 'sing', right: 'sung' }, { left: 'send', right: 'sent' }, { left: 'paint', right: 'painted' }] },
        { id: 'l5-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Цей міст збудували у 1900 році.', words: ['This', 'bridge', 'was', 'built', 'in', '1900'], answer: ['This', 'bridge', 'was', 'built', 'in', '1900'] },
        { id: 'l5-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Цю пісню заспівала Тейлор Свіфт.', answer: 'This song was sung by Taylor Swift.', acceptedAnswers: accepted('This song was sung by Taylor Swift.', ['This song was performed by Taylor Swift.']) },
        { id: 'l5-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Лист надіслали в понеділок.', answer: 'The letter was sent on Monday.', acceptedAnswers: accepted('The letter was sent on Monday.', ['The letter was sent on Monday']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 6 · Saying It Politely (Юніт 3)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-real-world-6-politely',
      title: 'Saying It Politely',
      orderIndex: 5,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-real-world-real',
      sectionTitle: 'Юніт 3 · Реальні розмови',
      sectionOrder: 2,
      topic: 'register-polite',
      steps: [
        {
          id: 'l6-theory-register',
          type: 'theory',
          title: 'Формальний vs неформальний регістр',
          body: 'Англійська має два головні регістри:\n• ФОРМАЛЬНИЙ — у роботі, листах, з незнайомцями.\n• НЕФОРМАЛЬНИЙ — з друзями, у чаті.\n\nПриклади переходу:\n"I want" → "I would like"\n"Give me" → "Could you please give me"\n"Yeah" → "Yes"\n"Hi" → "Good morning".',
          examples: [
            { en: 'Could you open the door, please?', ua: 'Не могли б ви відчинити двері, будь ласка?' },
            { en: 'I would appreciate your help.', ua: 'Я б оцінив вашу допомогу.' },
            { en: 'Would you mind closing the window?', ua: 'Чи не закриєте вікно?' },
          ],
          tip: '💡 "Could you" і "Would you" — золотий стандарт ввічливих прохань.',
        },
        {
          id: 'l6-theory-softeners',
          type: 'theory',
          title: 'Слова-помʼякшувачі',
          body: 'Щоб не звучати грубо, додай "softeners":\n• "Sorry to bother you, but..."\n• "I was wondering if..."\n• "Would it be possible to..."\n• "Just a quick question..."',
          examples: [
            { en: 'Sorry to bother you, but could I ask a question?', ua: 'Перепрошую, що турбую — можна запитати?' },
            { en: 'I was wondering if you could help me.', ua: 'Я хотів запитати, чи могли б ви допомогти.' },
            { en: 'Would it be possible to reschedule?', ua: 'Чи можна перенести зустріч?' },
          ],
        },
        { id: 'l6-mcq-1', type: 'multiple-choice', question: 'Which is the most POLITE?', options: ['Give me water.', 'Water!', 'Could I have some water, please?', 'I want water now.'], correctIndex: 2 },
        { id: 'l6-mcq-2', type: 'multiple-choice', question: 'Formal version of "I want" is...', options: ['I wants', 'I would like', 'I will', 'I have'], correctIndex: 1 },
        { id: 'l6-mcq-3', type: 'multiple-choice', question: 'Which is INFORMAL?', options: ['Good morning, sir.', 'I would appreciate it.', "Hey, what's up?", 'Excuse me, please.'], correctIndex: 2 },
        { id: 'l6-mcq-4', type: 'multiple-choice', question: 'Choose the polite question.', options: ['Open the window.', 'Open window!', 'Would you mind opening the window?', 'You open the window.'], correctIndex: 2 },
        { id: 'l6-fill-1', type: 'fill-blank', before: 'I was ', after: ' if you could help me.', answer: 'wondering' },
        { id: 'l6-fill-2', type: 'fill-blank', before: 'Would you ', after: ' closing the door?', answer: 'mind' },
        { id: 'l6-match-register', type: 'match-pairs', prompt: 'Зʼєднай неформальне з формальним.', pairs: [{ left: 'I want', right: 'I would like' }, { left: 'Give me', right: 'Could I have' }, { left: 'Yeah', right: 'Yes' }, { left: 'Hi', right: 'Good morning' }] },
        { id: 'l6-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Чи не могли б ви відчинити двері, будь ласка?', words: ['Could', 'you', 'open', 'the', 'door', 'please'], answer: ['Could', 'you', 'open', 'the', 'door', 'please'] },
        { id: 'l6-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я б оцінив вашу допомогу.', answer: 'I would appreciate your help.', acceptedAnswers: accepted('I would appreciate your help.', ["I'd appreciate your help."]) },
        { id: 'l6-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Перепрошую, що турбую вас.', answer: 'Sorry to bother you.', acceptedAnswers: accepted('Sorry to bother you.', ['I am sorry to bother you.', "I'm sorry to bother you."]) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 7 · Idioms in Use (Юніт 3)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-real-world-7-idioms',
      title: 'Idioms in Use',
      orderIndex: 6,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-real-world-real',
      sectionTitle: 'Юніт 3 · Реальні розмови',
      sectionOrder: 2,
      topic: 'idioms',
      steps: [
        {
          id: 'l7-theory-idioms',
          type: 'theory',
          title: 'Що таке ідіома',
          body: 'Ідіома — фраза зі значенням, відмінним від буквального. "It\'s raining cats and dogs" не означає, що з неба падають коти, а що ллє ЯК ІЗ ВІДРА.\n\nПопулярні:\n• "piece of cake" — легко\n• "break the ice" — почати знайомство\n• "hit the books" — взятися за навчання\n• "under the weather" — нездужати\n• "spill the beans" — видати секрет.',
          examples: [
            { en: "The exam was a piece of cake.", ua: 'Іспит був легким, як пиріг.' },
            { en: 'I need to hit the books tonight.', ua: 'Сьогодні ввечері маю взятися за книжки.' },
            { en: "She's under the weather today.", ua: 'Вона сьогодні нездужає.' },
            { en: "Don't spill the beans about the party!", ua: 'Не розкажи про вечірку!' },
          ],
        },
        {
          id: 'l7-theory-more',
          type: 'theory',
          title: 'Ще 5 корисних ідіом',
          body: '• "once in a blue moon" — дуже рідко\n• "bite the bullet" — взяти себе в руки і зробити неприємне\n• "cost an arm and a leg" — коштувати дуже дорого\n• "let the cat out of the bag" — проговоритись\n• "keep your fingers crossed" — тримати кулаки.',
          examples: [
            { en: 'I see her once in a blue moon.', ua: 'Я бачу її дуже рідко.' },
            { en: 'That dress cost an arm and a leg.', ua: 'Це плаття коштувало шалені гроші.' },
            { en: "Keep your fingers crossed for me!", ua: 'Тримай за мене кулаки!' },
          ],
        },
        { id: 'l7-mcq-1', type: 'multiple-choice', question: '"Piece of cake" means...', options: ['delicious', 'easy', 'sweet', 'small'], correctIndex: 1 },
        { id: 'l7-mcq-2', type: 'multiple-choice', question: '"Under the weather" means...', options: ['outside in rain', 'feeling sick', 'cold', 'tired'], correctIndex: 1 },
        { id: 'l7-mcq-3', type: 'multiple-choice', question: '"Cost an arm and a leg" means...', options: ['very dangerous', 'very expensive', 'medical bill', 'painful'], correctIndex: 1 },
        { id: 'l7-mcq-4', type: 'multiple-choice', question: '"Spill the beans" means...', options: ['drop food', 'reveal a secret', 'cook beans', 'be clumsy'], correctIndex: 1 },
        { id: 'l7-fill-1', type: 'fill-blank', before: 'The test was a piece of ', after: '.', answer: 'cake' },
        { id: 'l7-fill-2', type: 'fill-blank', before: 'I need to hit the ', after: ' tonight — exam tomorrow.', answer: 'books' },
        { id: 'l7-match-idiom', type: 'match-pairs', prompt: 'Зʼєднай ідіому зі значенням.', pairs: [{ left: 'piece of cake', right: 'easy' }, { left: 'under the weather', right: 'feeling sick' }, { left: 'spill the beans', right: 'reveal a secret' }, { left: 'once in a blue moon', right: 'very rarely' }] },
        { id: 'l7-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Тримай за мене кулаки на іспиті!', words: ['Keep', 'your', 'fingers', 'crossed', 'for', 'me'], answer: ['Keep', 'your', 'fingers', 'crossed', 'for', 'me'] },
        { id: 'l7-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я бачу його дуже рідко.', answer: 'I see him once in a blue moon.', acceptedAnswers: accepted('I see him once in a blue moon.', ['I rarely see him.']) },
        { id: 'l7-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Цей телефон коштував шалені гроші.', answer: 'This phone cost an arm and a leg.', acceptedAnswers: accepted('This phone cost an arm and a leg.', ['This phone was very expensive.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 8 · Real Conversations (Юніт 3) — recap scenarios
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-real-world-8-conversations',
      title: 'Real Conversations',
      orderIndex: 7,
      type: 'interactive',
      durationMin: 14,
      xp: 22,
      sectionSlug: 'b-real-world-real',
      sectionTitle: 'Юніт 3 · Реальні розмови',
      sectionOrder: 2,
      topic: 'real-conversations',
      steps: [
        {
          id: 'l8-theory-restaurant',
          type: 'theory',
          title: 'Ресторан і замовлення',
          body: 'Корисні фрази:\n• "Could I see the menu, please?"\n• "I would like the chicken, please."\n• "Could we have the bill, please?"\n• "Is service included?"',
          examples: [
            { en: 'Could I have a glass of water?', ua: 'Можна склянку води?' },
            { en: 'I will have the soup, please.', ua: 'Я буду суп, будь ласка.' },
            { en: 'Can we get the check?', ua: 'Можна рахунок?' },
          ],
          tip: '💡 У UK кажуть "the bill", у US — "the check".',
        },
        {
          id: 'l8-theory-directions',
          type: 'theory',
          title: 'Запитуємо напрямок',
          body: 'Як спитати дорогу:\n• "Excuse me, how do I get to the station?"\n• "Is it far from here?"\n• "Could you tell me where the bank is?"\n\nЯк відповісти:\n• "Go straight" (прямо)\n• "Turn left / right"\n• "It is on the corner."',
          examples: [
            { en: 'Excuse me, where is the metro?', ua: 'Перепрошую, де метро?' },
            { en: 'Go straight and turn right.', ua: 'Йдіть прямо і поверніть праворуч.' },
            { en: 'It is on the corner of Main Street.', ua: 'Це на розі Мейн-стріт.' },
          ],
        },
        { id: 'l8-mcq-1', type: 'multiple-choice', question: 'Which is the most polite at a restaurant?', options: ['Bring me water.', 'Water!', 'Could I have some water, please?', 'I need water.'], correctIndex: 2 },
        { id: 'l8-mcq-2', type: 'multiple-choice', question: 'How do you ask for the bill in UK?', options: ['Can I see the receipt?', 'Could we have the bill, please?', 'I want the money paper.', 'Pay now?'], correctIndex: 1 },
        { id: 'l8-mcq-3', type: 'multiple-choice', question: 'Which means "поверніть праворуч"?', options: ['Go straight.', 'Turn left.', 'Turn right.', 'Stop here.'], correctIndex: 2 },
        { id: 'l8-mcq-4', type: 'multiple-choice', question: 'Choose the best polite request to a stranger.', options: ['Where is the bank?', 'Excuse me, could you tell me where the bank is?', 'Tell me bank!', 'Bank?'], correctIndex: 1 },
        { id: 'l8-fill-1', type: 'fill-blank', before: 'Could we have the ', after: ', please?', answer: 'bill' },
        { id: 'l8-fill-2', type: 'fill-blank', before: 'Go straight and ', after: ' left at the corner.', answer: 'turn' },
        { id: 'l8-match-conv', type: 'match-pairs', prompt: 'Зʼєднай ситуацію з фразою.', pairs: [{ left: 'ordering food', right: 'I would like the soup, please.' }, { left: 'asking directions', right: 'Excuse me, how do I get to...?' }, { left: 'paying', right: 'Could we have the bill, please?' }, { left: 'leaving a message', right: 'Could you tell her I called?' }] },
        { id: 'l8-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Перепрошую, як мені пройти до станції?', words: ['Excuse', 'me', 'how', 'do', 'I', 'get', 'to', 'the', 'station'], answer: ['Excuse', 'me', 'how', 'do', 'I', 'get', 'to', 'the', 'station'] },
        { id: 'l8-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Можна меню, будь ласка?', answer: 'Could I have the menu, please?', acceptedAnswers: accepted('Could I have the menu, please?', ['Could I see the menu, please?']) },
        { id: 'l8-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Чи не передасте їй, що я дзвонив?', answer: 'Could you tell her I called?', acceptedAnswers: accepted('Could you tell her I called?', ['Could you tell her that I called?']) },
      ],
    },
  ],
};
