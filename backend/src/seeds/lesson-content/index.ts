// v2 — 6 deep courses (3 A-band + 3 B-band) with 8+ lessons each. Every
// lesson has 10–15 substantive steps; vocabulary lives in a separate
// `vocabulary-set` CT (see seeds/14-vocabulary.ts). See COURSES.md.
//
// v1 (deprecated) — the 14-course CEFR ladder (A0..C2) lived under
// `lesson-content/cefr/`. All v1 slugs are listed in
// `LEGACY_COURSE_SLUGS` and archived on next seed run. Original Strapi
// records remain in DB (preserving user-progress integrity); the v1
// `cefr/` source files are kept for reference but no longer imported
// into `COURSE_SEEDS`.
import { aFoundation } from './cefr-v2/a-foundation';
import { aMyWorld } from './cefr-v2/a-my-world';
import { aPeoplePlaces } from './cefr-v2/a-people-places';
import { bStories } from './cefr-v2/b-stories';
import { bIdeas } from './cefr-v2/b-ideas';
import { bRealWorld } from './cefr-v2/b-real-world';

import type { CourseSeed } from './types';

/**
 * Slugs of legacy seeds that the orchestrator must mark as
 * `status='archived'` so they vanish from the kids school listing
 * without nuking user-progress rows that already point at them.
 */
export const LEGACY_COURSE_SLUGS: ReadonlyArray<string> = [
  // v0 — original themed kids catalog (also seeded as library `book/video/game`
  // placeholders by 10-library-items; archive both flavours).
  'english-kids-starter',
  'caterpillar',
  'oxford-1',
  'natgeo',
  'peppa',
  'bluey',
  'simple-songs',
  'word-puzzle',
  // Promotional library placeholders that never had real content backing
  // them (no lessons, no externalUrl). The FE was rendering them with a
  // disabled "Доступ — в розробці" button → archive so kids see only real,
  // accessible content.
  'charlotte',
  'harry',
  'little-prince',
  'ted-ed',
  'spelling-bee',
  'grammar-quest',
  'story-builder',
  // v1 — first CEFR rebuild (14 thin courses, "three pathetic questions"
  // problem); replaced by v2 below.
  'a0-first-words',
  'a0-my-body',
  'a0-at-home',
  'a1-my-family',
  'a1-around-the-house',
  'a1-at-school',
  'a2-food-and-drinks',
  'a2-my-day',
  'b1-travel-stories',
  'b1-tech-around-us',
  'b2-news-society',
  'b2-books-movies',
  'c1-critical-thinking',
  'c2-idioms-nuance',
];

export const COURSE_SEEDS: CourseSeed[] = [
  // ─── A-band (3 courses, 24 lessons total) ───────────────────────────
  aFoundation,    // 8 deep lessons — production exemplar
  aMyWorld,       // 8 lessons — Дім, школа, їжа, час, плани
  aPeoplePlaces,  // 8 lessons — опис, порівняння, минуле
  // ─── B-band (3 courses, target 24 lessons) ──────────────────────────
  bStories,       // 8 lessons — Past tenses + narrative
  bIdeas,         // 8 lessons — Modal verbs + conditionals + tech
  bRealWorld,     // shell — 1 sample lesson; lessons 2–8 pending
];

export type { CourseSeed, LessonSeed } from './types';
