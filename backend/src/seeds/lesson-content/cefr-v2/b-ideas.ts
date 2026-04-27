/**
 * B · Ideas & Opinions 💡 — 8-lesson B1 course (teens audience).
 *
 * Modal verbs, conditionals, expressing views, technology, society.
 *
 * Sections (3 units):
 *   Юніт 1 · Висловлюємо думку (L1, L2, L3)
 *   Юніт 2 · Умовні             (L4, L5)
 *   Юніт 3 · Технології + майбутнє (L6, L7, L8)
 */
import type { CourseSeed } from '../types';

function accepted(answer: string, extras: string[] = []): string[] {
  const noPunct = answer.replace(/[.!?]$/, '');
  const lc = answer.toLowerCase();
  const lcNoPunct = noPunct.toLowerCase();
  return Array.from(new Set([answer, noPunct, lc, lcNoPunct, ...extras]));
}

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
    // ═══════════════════════════════════════════════════════════════════
    // LESSON 1 · What I Think (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
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
        { id: 'l1-mcq-op1', type: 'multiple-choice', question: 'Which phrase introduces an OPINION?', options: ['It is raining.', 'I think English is fun.', 'She lives in Kyiv.', 'They have two cats.'], correctIndex: 1 },
        { id: 'l1-mcq-op2', type: 'multiple-choice', question: 'You want to politely DISAGREE. Which is best?', options: ['You are wrong!', 'I see your point, but I think differently.', 'No way.', 'Stop talking.'], correctIndex: 1, explanation: 'Інші варіанти грубі.' },
        { id: 'l1-mcq-op3', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['In my opinion is English important.', 'In my opinion, English is important.', "I'm opinion English is important.", 'My opinion English is important.'], correctIndex: 1 },
        { id: 'l1-mcq-op4', type: 'multiple-choice', question: '"Exactly!" means...', options: ['I disagree.', 'I strongly agree.', "I'm not sure.", 'Maybe.'], correctIndex: 1 },
        { id: 'l1-fill-op1', type: 'fill-blank', before: 'I ', after: ' that English is useful.', answer: 'think' },
        { id: 'l1-fill-op2', type: 'fill-blank', before: 'I ', after: ' with you completely.', answer: 'agree' },
        { id: 'l1-match-op', type: 'match-pairs', prompt: 'Зʼєднай українську фразу з англійською.', pairs: [{ left: 'на мою думку', right: 'in my opinion' }, { left: 'я згоден', right: 'I agree' }, { left: 'я не впевнений', right: "I'm not sure" }, { left: 'саме так', right: 'exactly' }] },
        { id: 'l1-wordorder-op', type: 'word-order', prompt: 'Склади речення.', translation: 'Я думаю, що книги краще, ніж фільми.', words: ['I', 'think', 'books', 'are', 'better', 'than', 'films'], answer: ['I', 'think', 'books', 'are', 'better', 'than', 'films'] },
        { id: 'l1-translate-op1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'На мою думку, спорт важливий.', answer: 'In my opinion, sport is important.', acceptedAnswers: accepted('In my opinion, sport is important.', ['In my opinion sport is important.']) },
        { id: 'l1-translate-op2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я з тобою не згоден.', answer: "I don't agree with you.", acceptedAnswers: accepted("I don't agree with you.", ['I disagree with you.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 2 · Should, Must, Have to (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-ideas-2-should-must',
      title: 'Should, Must, Have to',
      orderIndex: 1,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-ideas-opinions',
      sectionTitle: 'Юніт 1 · Висловлюємо думку',
      sectionOrder: 0,
      topic: 'modal-verbs-obligation',
      steps: [
        {
          id: 'l2-theory-modals',
          type: 'theory',
          title: 'Модальні дієслова обовʼязку',
          body: '"should" — порада ("вартувало б"). "must" — сильний обовʼязок або правило. "have to" — зовнішній обовʼязок (правила, не вирішую сам).\n\nПісля всіх трьох — інфінітив БЕЗ "to" (крім "have TO + V"). Заперечення: shouldn\'t, mustn\'t (ЗАБОРОНЕНО), don\'t have to (НЕ обовʼязково).',
          examples: [
            { en: 'You should drink more water.', ua: 'Тобі варто пити більше води.' },
            { en: 'You must wear a seatbelt.', ua: 'Ти ОБОВʼЯЗКОВО маєш пристебнутись.' },
            { en: 'I have to wake up at 6.', ua: 'Я мушу прокидатись о 6-й.' },
            { en: "You don't have to come.", ua: 'Ти НЕ зобовʼязаний приходити.' },
            { en: "You mustn't smoke here.", ua: 'Тут НЕ МОЖНА палити.' },
          ],
          tip: '💡 "mustn\'t" ≠ "don\'t have to". Перше — заборона, друге — необовʼязковість.',
        },
        {
          id: 'l2-theory-advice',
          type: 'theory',
          title: 'Поради з "should"',
          body: '"should" чудовий для порад. "I think you should..." — "Я вважаю, що тобі варто...". У питанні: "Should I...?" — "Чи варто мені...?".',
          examples: [
            { en: 'Should I take a jacket?', ua: 'Чи варто мені брати куртку?' },
            { en: 'You shouldn\'t eat too much sugar.', ua: 'Тобі не варто їсти забагато цукру.' },
            { en: 'I think you should call her.', ua: 'Я вважаю, тобі варто їй подзвонити.' },
          ],
        },
        { id: 'l2-mcq-1', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['You should to study harder.', 'You should study harder.', 'You should studies harder.', 'You should studied harder.'], correctIndex: 1, explanation: 'Після "should" — інфінітив БЕЗ "to".' },
        { id: 'l2-mcq-2', type: 'multiple-choice', question: '"You _____ smoke here — it is forbidden!"', options: ["don't have to", "shouldn't", "mustn't", 'should'], correctIndex: 2 },
        { id: 'l2-mcq-3', type: 'multiple-choice', question: '"You _____ come, but it would be nice."', options: ['must', "don't have to", "mustn't", 'should'], correctIndex: 1 },
        { id: 'l2-mcq-4', type: 'multiple-choice', question: 'Which one is ADVICE?', options: ['You must wear a seatbelt.', 'You should drink more water.', 'You have to pay tax.', 'You mustn\'t talk loudly.'], correctIndex: 1 },
        { id: 'l2-fill-1', type: 'fill-blank', before: 'You ', after: ' study English every day if you want progress.', answer: 'should' },
        { id: 'l2-fill-2', type: 'fill-blank', before: 'I ', after: ' to wake up early on Mondays.', answer: 'have' },
        { id: 'l2-match-modal', type: 'match-pairs', prompt: 'Зʼєднай вираз з його значенням.', pairs: [{ left: 'should', right: 'порада' }, { left: 'must', right: 'сильний обовʼязок' }, { left: 'have to', right: 'зовнішнє правило' }, { left: "mustn't", right: 'заборона' }] },
        { id: 'l2-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Тобі варто пити більше води.', words: ['You', 'should', 'drink', 'more', 'water'], answer: ['You', 'should', 'drink', 'more', 'water'] },
        { id: 'l2-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Тобі варто більше відпочивати.', answer: 'You should rest more.', acceptedAnswers: accepted('You should rest more.', ['You should take more rest.']) },
        { id: 'l2-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я мушу прокидатись о 6-й щоранку.', answer: 'I have to wake up at 6 every morning.', acceptedAnswers: accepted('I have to wake up at 6 every morning.', ['I must wake up at 6 every morning.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 3 · Pros and Cons (Юніт 1)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-ideas-3-pros-cons',
      title: 'Pros and Cons',
      orderIndex: 2,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-ideas-opinions',
      sectionTitle: 'Юніт 1 · Висловлюємо думку',
      sectionOrder: 0,
      topic: 'pros-cons',
      steps: [
        {
          id: 'l3-theory-pros',
          type: 'theory',
          title: 'Плюси і мінуси',
          body: 'Pros = переваги. Cons = недоліки. Для аналізу теми (телефон, школа, спорт) корисні фрази:\n• "On the one hand..." (з одного боку)\n• "On the other hand..." (з іншого боку)\n• "However" (однак)\n• "Although" (хоча)\n• "Both A and B" (і A, і B).',
          examples: [
            { en: 'On the one hand, phones are useful. On the other hand, they distract us.', ua: 'З одного боку, телефони корисні. З іншого — відволікають.' },
            { en: 'However, social media has its problems.', ua: 'Однак соцмережі мають свої проблеми.' },
            { en: 'Although it is expensive, the trip was great.', ua: 'Хоча це дорого, подорож була чудова.' },
          ],
          tip: '💡 "However" — на початку речення з комою. "Although" — поєднує два речення.',
        },
        {
          id: 'l3-theory-balance',
          type: 'theory',
          title: 'Збалансована позиція',
          body: 'Сильний тип думки — коли визнаєш обидві сторони, а потім обираєш:\n"I see both sides, but in the end I think... because..."',
          examples: [
            { en: 'I see both sides, but in the end I think mobile phones help us more than they hurt us.', ua: 'Я бачу обидва боки, але вважаю, що телефони допомагають нам більше, ніж шкодять.' },
            { en: 'On balance, online classes are useful.', ua: 'У підсумку, онлайн-уроки корисні.' },
          ],
        },
        { id: 'l3-mcq-1', type: 'multiple-choice', question: 'Choose the connector showing CONTRAST.', options: ['because', 'and', 'however', 'so'], correctIndex: 2 },
        { id: 'l3-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['Although it is cold, but I went out.', 'Although it is cold, I went out.', 'However it is cold, I went out.', 'It is cold although, I went out.'], correctIndex: 1 },
        { id: 'l3-mcq-3', type: 'multiple-choice', question: '"On the one hand, ... ; on the other hand, ..." structure shows...', options: ['agreement', 'a list', 'two sides of an argument', 'a question'], correctIndex: 2 },
        { id: 'l3-mcq-4', type: 'multiple-choice', question: 'Which is a CON of mobile phones?', options: ['quick contact', 'distraction', 'access to information', 'navigation'], correctIndex: 1 },
        { id: 'l3-fill-1', type: 'fill-blank', before: 'On the ', after: ' hand, social media keeps us in touch.', answer: 'one' },
        { id: 'l3-fill-2', type: 'fill-blank', before: 'I love this game; ', after: ', it is too long.', answer: 'however' },
        { id: 'l3-match-pros', type: 'match-pairs', prompt: 'Зʼєднай українську фразу з англійською.', pairs: [{ left: 'переваги', right: 'pros' }, { left: 'недоліки', right: 'cons' }, { left: 'хоча', right: 'although' }, { left: 'однак', right: 'however' }] },
        { id: 'l3-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'З одного боку, телефони корисні; з іншого — вони відволікають.', words: ['On', 'the', 'one', 'hand', 'phones', 'are', 'useful', 'on', 'the', 'other', 'they', 'distract'], answer: ['On', 'the', 'one', 'hand', 'phones', 'are', 'useful', 'on', 'the', 'other', 'they', 'distract'] },
        { id: 'l3-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Хоча це дорого, я його куплю.', answer: 'Although it is expensive, I will buy it.', acceptedAnswers: accepted('Although it is expensive, I will buy it.', ["Although it's expensive, I will buy it."]) },
        { id: 'l3-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'У підсумку, онлайн-уроки корисні.', answer: 'On balance, online lessons are useful.', acceptedAnswers: accepted('On balance, online lessons are useful.', ['On balance, online classes are useful.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 4 · If I Have Time (Юніт 2) — 1st conditional
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-ideas-4-first-conditional',
      title: 'If I Have Time…',
      orderIndex: 3,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-ideas-conditionals',
      sectionTitle: 'Юніт 2 · Умовні',
      sectionOrder: 1,
      topic: 'first-conditional',
      steps: [
        {
          id: 'l4-theory-1cond',
          type: 'theory',
          title: '1st Conditional — реальне майбутнє',
          body: 'Перший тип умовних речень описує реальну можливість у майбутньому.\n\nФормула: If + Present Simple, will + V.\n\n"If I have time, I will call you" (Якщо матиму час, я тобі подзвоню).',
          examples: [
            { en: 'If it rains, I will stay home.', ua: 'Якщо буде дощ, я залишусь удома.' },
            { en: "If you study, you'll pass the exam.", ua: 'Якщо вчитимешся — складеш іспит.' },
            { en: "We won't go if it's too cold.", ua: 'Ми не підемо, якщо буде надто холодно.' },
          ],
          tip: '💡 У частині "if" — Present Simple, НЕ "will". "If you will study" — НЕПРАВИЛЬНО.',
        },
        {
          id: 'l4-theory-unless',
          type: 'theory',
          title: '"unless" — крім випадку якщо',
          body: '"unless" = "if not" (якщо НЕ). Часто заміняє неприємні умови.\n\n"I won\'t go unless you come" = "Я не піду, якщо ти не прийдеш".',
          examples: [
            { en: "We won't go unless it stops raining.", ua: 'Ми не підемо, якщо дощ не припиниться.' },
            { en: "Unless you hurry, you'll be late.", ua: 'Якщо не поспішатимеш — запізнишся.' },
          ],
        },
        { id: 'l4-mcq-1', type: 'multiple-choice', question: 'Choose the correct 1st conditional.', options: ['If I will see her, I tell her.', 'If I see her, I will tell her.', 'If I saw her, I will tell her.', 'If I see her, I tell her.'], correctIndex: 1 },
        { id: 'l4-mcq-2', type: 'multiple-choice', question: '"If it _____ tomorrow, we will play indoors."', options: ['will rain', 'rains', 'rained', 'raining'], correctIndex: 1 },
        { id: 'l4-mcq-3', type: 'multiple-choice', question: '"unless" means...', options: ['if', 'if not', 'when', 'because'], correctIndex: 1 },
        { id: 'l4-mcq-4', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['Unless you will hurry, you will be late.', "Unless you hurry, you'll be late.", 'If you will hurry, you will be late.', "If you don't hurry, you'll be late."], correctIndex: 1 },
        { id: 'l4-fill-1', type: 'fill-blank', before: 'If you study hard, you ', after: ' pass.', answer: 'will' },
        { id: 'l4-fill-2', type: 'fill-blank', before: 'If it ', after: ' tomorrow, we will go to the beach.', answer: 'is sunny' },
        { id: 'l4-match-1cond', type: 'match-pairs', prompt: 'Зʼєднай умову з результатом.', pairs: [{ left: 'If it rains', right: 'I will stay home.' }, { left: 'If you study', right: 'you will pass.' }, { left: 'If we hurry', right: "we won't be late." }, { left: 'If she calls', right: 'I will answer.' }] },
        { id: 'l4-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Якщо ти підеш, я піду з тобою.', words: ['If', 'you', 'go', 'I', 'will', 'go', 'with', 'you'], answer: ['If', 'you', 'go', 'I', 'will', 'go', 'with', 'you'] },
        { id: 'l4-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Якщо матиму час, я тобі подзвоню.', answer: 'If I have time, I will call you.', acceptedAnswers: accepted('If I have time, I will call you.', ["If I have time, I'll call you."]) },
        { id: 'l4-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Якщо буде сонячно, ми підемо в парк.', answer: 'If it is sunny, we will go to the park.', acceptedAnswers: accepted('If it is sunny, we will go to the park.', ["If it's sunny, we'll go to the park."]) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 5 · If I Were You… (Юніт 2) — 2nd conditional
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-ideas-5-second-conditional',
      title: 'If I Were You…',
      orderIndex: 4,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-ideas-conditionals',
      sectionTitle: 'Юніт 2 · Умовні',
      sectionOrder: 1,
      topic: 'second-conditional',
      steps: [
        {
          id: 'l5-theory-2cond',
          type: 'theory',
          title: '2nd Conditional — нереальна або уявна ситуація',
          body: 'Другий тип умовних — про те, ЧОГО НЕМАЄ, але цікаво уявити. Формула: If + Past Simple, would + V.\n\n"If I had a dog, I would walk it every day" (якби в мене був собака, я б його вигулював).',
          examples: [
            { en: 'If I were rich, I would travel the world.', ua: 'Якби я був багатий, я б подорожував світом.' },
            { en: "If she had more time, she'd learn Spanish.", ua: 'Якби в неї було більше часу, вона б вчила іспанську.' },
            { en: 'What would you do if you won a million?', ua: 'Що б ти зробив, якби виграв мільйон?' },
          ],
          tip: '💡 "If I were" — традиційна форма (старша граматика). У сучасній мові "If I was" теж можна, але "If I were" звучить освіченіше.',
        },
        {
          id: 'l5-theory-advice',
          type: 'theory',
          title: 'Порада: "If I were you..."',
          body: 'Класичний спосіб дати пораду:\n"If I were you, I would..." (На твоєму місці я б...).',
          examples: [
            { en: "If I were you, I'd talk to her.", ua: 'На твоєму місці я б поговорив з нею.' },
            { en: "If I were you, I wouldn't worry.", ua: 'На твоєму місці я б не хвилювався.' },
          ],
        },
        { id: 'l5-mcq-1', type: 'multiple-choice', question: 'Choose the correct 2nd conditional.', options: ['If I had money, I will buy a car.', 'If I have money, I would buy a car.', 'If I had money, I would buy a car.', 'If I will have money, I would buy a car.'], correctIndex: 2 },
        { id: 'l5-mcq-2', type: 'multiple-choice', question: '"If she _____ here, she would help us."', options: ['is', 'was', 'were', 'will be'], correctIndex: 2, explanation: '"If she were" — формальна 2nd Conditional форма.' },
        { id: 'l5-mcq-3', type: 'multiple-choice', question: 'Which sentence is ADVICE in 2nd conditional?', options: ['I will help you.', 'If I were you, I would talk to her.', 'I help you.', "I'm helping you."], correctIndex: 1 },
        { id: 'l5-mcq-4', type: 'multiple-choice', question: 'What would you do if you _____ a million dollars?', options: ['win', 'won', 'will win', 'have won'], correctIndex: 1 },
        { id: 'l5-fill-1', type: 'fill-blank', before: 'If I ', after: ' you, I would call her.', answer: 'were' },
        { id: 'l5-fill-2', type: 'fill-blank', before: "If she had more time, she ", after: ' read more books.', answer: 'would' },
        { id: 'l5-match-2cond', type: 'match-pairs', prompt: 'Зʼєднай умову з результатом.', pairs: [{ left: 'If I had a dog', right: 'I would walk it every day.' }, { left: 'If I were rich', right: 'I would travel.' }, { left: 'If she had time', right: 'she would learn French.' }, { left: 'If you were here', right: 'we would have fun.' }] },
        { id: 'l5-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Якби в мене було більше часу, я б більше читав.', words: ['If', 'I', 'had', 'more', 'time', 'I', 'would', 'read', 'more'], answer: ['If', 'I', 'had', 'more', 'time', 'I', 'would', 'read', 'more'] },
        { id: 'l5-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'На твоєму місці я б поговорив з нею.', answer: "If I were you, I'd talk to her.", acceptedAnswers: accepted("If I were you, I'd talk to her.", ['If I were you, I would talk to her.', 'If I was you, I would talk to her.']) },
        { id: 'l5-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Що б ти зробив, якби виграв мільйон?', answer: 'What would you do if you won a million?', acceptedAnswers: accepted('What would you do if you won a million?', ['What would you do if you won a million dollars?']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 6 · Tech Around Us (Юніт 3)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-ideas-6-tech',
      title: 'Tech Around Us',
      orderIndex: 5,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-ideas-future',
      sectionTitle: 'Юніт 3 · Технології + майбутнє',
      sectionOrder: 2,
      topic: 'technology',
      steps: [
        {
          id: 'l6-theory-tech',
          type: 'theory',
          title: 'Технологія навколо нас',
          body: 'Цифровий побут: a smartphone, a laptop, a tablet, a screen, an app, the cloud, Wi-Fi, a charger, a password, a battery.\n\nТипові дієслова: download (скачувати), upload (завантажувати), update (оновлювати), install (встановлювати), log in (увійти), log out, restart, charge.',
          examples: [
            { en: 'I need to charge my phone.', ua: 'Мені треба зарядити телефон.' },
            { en: 'She downloaded a new app.', ua: 'Вона скачала новий застосунок.' },
            { en: 'Update your password every month.', ua: 'Оновлюй пароль кожного місяця.' },
          ],
          tip: '💡 «App» = «application». Кажуть просто «app» — коротше і природно.',
        },
        {
          id: 'l6-theory-prepositions',
          type: 'theory',
          title: 'Прийменники з технологіями',
          body: 'Технологічні дієслова люблять конкретні прийменники:\n• log IN to / OUT of an account\n• click ON a link\n• connect TO Wi-Fi\n• plug IN the charger.',
          examples: [
            { en: 'Click on the blue button.', ua: 'Натисни на синю кнопку.' },
            { en: 'She logged in to her account.', ua: 'Вона увійшла в акаунт.' },
            { en: 'I cannot connect to Wi-Fi.', ua: 'Я не можу підʼєднатись до Wi-Fi.' },
          ],
        },
        { id: 'l6-mcq-1', type: 'multiple-choice', question: 'What do we call "a small program on a phone"?', options: ['a website', 'an app', 'a browser', 'a screen'], correctIndex: 1 },
        { id: 'l6-mcq-2', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['I cannot connect on Wi-Fi.', 'I cannot connect to Wi-Fi.', 'I cannot connect Wi-Fi.', 'I cannot connect with Wi-Fi.'], correctIndex: 1 },
        { id: 'l6-mcq-3', type: 'multiple-choice', question: 'Past Simple of "log in" is...', options: ['log in', 'logged in', 'logs in', 'logging in'], correctIndex: 1 },
        { id: 'l6-mcq-4', type: 'multiple-choice', question: 'Which verb means "робити нову версію"?', options: ['download', 'install', 'update', 'log out'], correctIndex: 2 },
        { id: 'l6-fill-1', type: 'fill-blank', before: 'I need to ', after: ' the app — it has a new version.', answer: 'update' },
        { id: 'l6-fill-2', type: 'fill-blank', before: 'Click ', after: ' the green button.', answer: 'on' },
        { id: 'l6-match-tech', type: 'match-pairs', prompt: 'Зʼєднай дію з обʼєктом.', pairs: [{ left: 'charge', right: 'a phone' }, { left: 'install', right: 'an app' }, { left: 'click on', right: 'a link' }, { left: 'log in to', right: 'an account' }] },
        { id: 'l6-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я скачав новий застосунок учора.', words: ['I', 'downloaded', 'a', 'new', 'app', 'yesterday'], answer: ['I', 'downloaded', 'a', 'new', 'app', 'yesterday'] },
        { id: 'l6-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Мені треба зарядити телефон.', answer: 'I need to charge my phone.', acceptedAnswers: accepted('I need to charge my phone.', ['I have to charge my phone.']) },
        { id: 'l6-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я не можу підʼєднатись до Wi-Fi.', answer: 'I cannot connect to Wi-Fi.', acceptedAnswers: accepted('I cannot connect to Wi-Fi.', ["I can't connect to Wi-Fi.", "I can't connect to wifi."]) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 7 · Internet Safely (Юніт 3)
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-ideas-7-internet-safely',
      title: 'Internet Safely',
      orderIndex: 6,
      type: 'interactive',
      durationMin: 13,
      xp: 18,
      sectionSlug: 'b-ideas-future',
      sectionTitle: 'Юніт 3 · Технології + майбутнє',
      sectionOrder: 2,
      topic: 'internet-safety',
      steps: [
        {
          id: 'l7-theory-safety',
          type: 'theory',
          title: 'Безпека в інтернеті',
          body: 'Базові ризики:\n• phishing — обман з підроблених сайтів\n• scam — шахрайство\n• personal data — особисті дані\n• password leak — витік паролю\n• fake news — фейкові новини.\n\nДії безпеки: не клікати підозрілі лінки, не ділитись паролем, перевіряти джерела.',
          examples: [
            { en: 'You must protect your password.', ua: 'Ти маєш захищати свій пароль.' },
            { en: 'Never share personal data online.', ua: 'Ніколи не діліться особистими даними онлайн.' },
            { en: 'You should check the source of the news.', ua: 'Тобі варто перевіряти джерело новин.' },
          ],
        },
        {
          id: 'l7-theory-modal-safety',
          type: 'theory',
          title: 'Модальні в темі безпеки',
          body: 'Модальні дієслова допомагають говорити про правила безпеки:\n• You MUST use a strong password (обовʼязково).\n• You MUSTN\'T share your password (заборонено).\n• You SHOULD update apps (порада).\n• You SHOULDN\'T click suspicious links (порада уникати).',
          examples: [
            { en: 'You must use a long password.', ua: 'Ти мусиш користуватись довгим паролем.' },
            { en: "You mustn't open emails from strangers.", ua: 'Не можна відкривати листи від незнайомців.' },
            { en: "You shouldn't post your address.", ua: 'Не варто публікувати свою адресу.' },
          ],
        },
        { id: 'l7-mcq-1', type: 'multiple-choice', question: 'What is "phishing"?', options: ['a type of fish', 'a way to steal your data with fake sites', 'a sport', 'a programming language'], correctIndex: 1 },
        { id: 'l7-mcq-2', type: 'multiple-choice', question: 'Choose the correct safety advice.', options: ["You must share your password with friends.", "You mustn't share your password with anyone.", "You should share your password with everyone.", "You don't have to keep your password secret."], correctIndex: 1 },
        { id: 'l7-mcq-3', type: 'multiple-choice', question: 'Which is FAKE NEWS?', options: ['news with sources', 'news that confirms facts', 'news that turns out to be made up', 'news from a museum'], correctIndex: 2 },
        { id: 'l7-mcq-4', type: 'multiple-choice', question: 'Choose the correct sentence.', options: ['You should to update your apps.', 'You should update your apps.', 'You shoulds update your apps.', 'You should updating your apps.'], correctIndex: 1 },
        { id: 'l7-fill-1', type: 'fill-blank', before: 'You ', after: ' click on suspicious links.', answer: "shouldn't" },
        { id: 'l7-fill-2', type: 'fill-blank', before: 'A strong password ', after: ' have at least 8 characters.', answer: 'should' },
        { id: 'l7-match-safety', type: 'match-pairs', prompt: 'Зʼєднай поняття з перекладом.', pairs: [{ left: 'phishing', right: 'фішинг' }, { left: 'scam', right: 'шахрайство' }, { left: 'fake news', right: 'фейкові новини' }, { left: 'password', right: 'пароль' }] },
        { id: 'l7-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Тобі не варто ділитись своїм паролем.', words: ['You', "shouldn't", 'share', 'your', 'password'], answer: ['You', "shouldn't", 'share', 'your', 'password'] },
        { id: 'l7-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Ніколи не публікуй свою адресу онлайн.', answer: 'Never post your address online.', acceptedAnswers: accepted('Never post your address online.', ['Never share your address online.']) },
        { id: 'l7-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Ти маєш перевіряти джерело новин.', answer: 'You must check the source of the news.', acceptedAnswers: accepted('You must check the source of the news.', ['You should check the source of the news.']) },
      ],
    },

    // ═══════════════════════════════════════════════════════════════════
    // LESSON 8 · My Future (Юніт 3) — will + going to + might
    // ═══════════════════════════════════════════════════════════════════
    {
      slug: 'b-ideas-8-my-future',
      title: 'My Future',
      orderIndex: 7,
      type: 'interactive',
      durationMin: 14,
      xp: 22,
      sectionSlug: 'b-ideas-future',
      sectionTitle: 'Юніт 3 · Технології + майбутнє',
      sectionOrder: 2,
      topic: 'future-mixed',
      steps: [
        {
          id: 'l8-theory-future',
          type: 'theory',
          title: 'Три способи говорити про майбутнє',
          body: 'Англійська має кілька форм для майбутнього — кожна для своєї ситуації:\n• "will" — спонтанне рішення / прогноз / обіцянка ("I\'ll help you")\n• "going to" — план чи намір ("I\'m going to study tonight")\n• "might" — можливість, не впевнено ("I might come — not sure yet").',
          examples: [
            { en: "I'll call you later.", ua: 'Я тобі пізніше подзвоню.' },
            { en: "I'm going to study medicine.", ua: 'Я планую вивчати медицину.' },
            { en: 'I might travel next summer — not sure yet.', ua: 'Я може й поїду наступного літа — поки не впевнений.' },
          ],
          tip: '💡 "I think it will rain" — прогноз. "I will get an umbrella" — спонтанна реакція.',
        },
        {
          id: 'l8-theory-questions',
          type: 'theory',
          title: 'Питання про майбутнє',
          body: 'Як питати плани:\n• "What will you do?" (Що ти будеш робити?)\n• "What are you going to do this weekend?"\n• "Are you going to be a doctor?"',
          examples: [
            { en: 'What will you study?', ua: 'Що ти будеш вивчати?' },
            { en: 'Are you going to travel this summer?', ua: 'Ти збираєшся подорожувати цього літа?' },
            { en: 'I might be a teacher.', ua: 'Я може стану вчителем.' },
          ],
        },
        { id: 'l8-mcq-1', type: 'multiple-choice', question: 'Choose the right sentence for a SPONTANEOUS decision.', options: ["I'm going to help you.", "I'll help you.", 'I help you.', 'I might help you.'], correctIndex: 1 },
        { id: 'l8-mcq-2', type: 'multiple-choice', question: '"I _____ travel — not sure yet."', options: ['will', 'am going to', 'might', 'must'], correctIndex: 2 },
        { id: 'l8-mcq-3', type: 'multiple-choice', question: '"I _____ study medicine — that\'s my plan."', options: ['will', 'am going to', 'might', 'should'], correctIndex: 1 },
        { id: 'l8-mcq-4', type: 'multiple-choice', question: 'Choose the correct question.', options: ['What you will do tomorrow?', 'What will you do tomorrow?', 'What do you will tomorrow?', 'What will do you tomorrow?'], correctIndex: 1 },
        { id: 'l8-fill-1', type: 'fill-blank', before: 'I think it ', after: ' rain tonight.', answer: 'will' },
        { id: 'l8-fill-2', type: 'fill-blank', before: "I'm ", after: ' to visit my granny on Saturday.', answer: 'going' },
        { id: 'l8-match-future', type: 'match-pairs', prompt: 'Зʼєднай ситуацію з типом майбутнього.', pairs: [{ left: 'spontaneous decision', right: 'will' }, { left: 'planned intention', right: 'going to' }, { left: 'possibility / not sure', right: 'might' }, { left: 'prediction', right: 'will' }] },
        { id: 'l8-wordorder', type: 'word-order', prompt: 'Склади речення.', translation: 'Я можу стати інженером — ще не вирішив.', words: ['I', 'might', 'become', 'an', 'engineer'], answer: ['I', 'might', 'become', 'an', 'engineer'] },
        { id: 'l8-translate-1', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я тобі пізніше подзвоню.', answer: "I'll call you later.", acceptedAnswers: accepted("I'll call you later.", ['I will call you later.']) },
        { id: 'l8-translate-2', type: 'translate', prompt: 'Переклади англійською:', sentence: 'Я планую вивчати медицину.', answer: "I'm going to study medicine.", acceptedAnswers: accepted("I'm going to study medicine.", ['I am going to study medicine.']) },
      ],
    },
  ],
};
