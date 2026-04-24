import { englishKidsStarter } from './english-kids-starter';
import { caterpillar } from './caterpillar';
import { oxford1 } from './oxford-1';
import { natgeo } from './natgeo';
import { peppa } from './peppa';
import { bluey } from './bluey';
import { simpleSongs } from './simple-songs';
import { wordPuzzle } from './word-puzzle';

import type { CourseSeed } from './types';

export const COURSE_SEEDS: CourseSeed[] = [
  englishKidsStarter,
  caterpillar,
  oxford1,
  natgeo,
  peppa,
  bluey,
  simpleSongs,
  wordPuzzle,
];

export type { CourseSeed, LessonSeed } from './types';
