/**
 * B · Real-World English 🌐 — B2 course.
 *
 * Formal vs informal, news, present perfect, passive voice, idioms.
 *
 * STATUS: shell — 1 sample lesson written. Lessons 2–8 still pending
 * a content-authoring pass. The course slug renders end-to-end and the
 * existing lesson is a real ~12-step exercise.
 *
 * Sections (3 units, planned):
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
  ],
};
