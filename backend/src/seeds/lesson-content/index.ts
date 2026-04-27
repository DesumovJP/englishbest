// New CEFR-aligned catalog (A0..C2). See COURSES.md for the strategic
// rationale and per-course briefs. Every course's slug is namespaced with
// its level (`a0-`, `a1-`, …) so the legacy themed slugs
// (`english-kids-starter`, `caterpillar`, `peppa`, etc.) live in their
// own namespace and can be archived without colliding.
import { a0FirstWords } from './cefr/a0-first-words';
import { a0MyBody } from './cefr/a0-my-body';
import { a0AtHome } from './cefr/a0-at-home';
import {
  a1MyFamily,
  a1AroundTheHouse,
  a1AtSchool,
} from './cefr/a1-courses';
import {
  a2FoodAndDrinks,
  a2MyDay,
  b1TravelStories,
  b1TechAroundUs,
  b2NewsAndSociety,
  b2BooksMovies,
  c1CriticalThinking,
  c2IdiomsAndNuance,
} from './cefr/higher-levels';

import type { CourseSeed } from './types';

/**
 * Slugs of legacy seeds that the orchestrator must mark as
 * `status='archived'` so they vanish from the kids school listing
 * without nuking user-progress rows that already point at them.
 */
export const LEGACY_COURSE_SLUGS: ReadonlyArray<string> = [
  'english-kids-starter',
  'caterpillar',
  'oxford-1',
  'natgeo',
  'peppa',
  'bluey',
  'simple-songs',
  'word-puzzle',
];

export const COURSE_SEEDS: CourseSeed[] = [
  // ─── A0 — Pre-A1 (3 courses · 15 lessons fully written) ─────────────
  a0FirstWords,
  a0MyBody,
  a0AtHome,
  // ─── A1 — Elementary (3 courses · 15 lessons fully written) ─────────
  a1MyFamily,
  a1AroundTheHouse,
  a1AtSchool,
  // ─── A2..C2 — shells (course metadata + 2 sample lessons each) ──────
  a2FoodAndDrinks,
  a2MyDay,
  b1TravelStories,
  b1TechAroundUs,
  b2NewsAndSociety,
  b2BooksMovies,
  c1CriticalThinking,
  c2IdiomsAndNuance,
];

export type { CourseSeed, LessonSeed } from './types';
