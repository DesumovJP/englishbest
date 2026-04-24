/**
 * Shared types for lesson-content seeds.
 *
 * Mirrors `frontend/mocks/lessons/types.ts` so the Strapi `lesson.steps`
 * JSON column stays compatible with the block-based lesson renderer
 * (`components/lesson/LessonEngine.tsx`).
 */

export interface StepTheory {
  id: string;
  type: 'theory';
  title: string;
  body: string;
  examples: { en: string; ua: string }[];
  tip?: string;
}

export interface StepMultipleChoice {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface StepFillBlank {
  id: string;
  type: 'fill-blank';
  before: string;
  after: string;
  answer: string;
  hint?: string;
}

export interface StepWordOrder {
  id: string;
  type: 'word-order';
  prompt: string;
  translation: string;
  words: string[];
  answer: string[];
}

export interface StepMatchPairs {
  id: string;
  type: 'match-pairs';
  prompt: string;
  pairs: { left: string; right: string }[];
}

export interface StepTranslate {
  id: string;
  type: 'translate';
  prompt: string;
  sentence: string;
  answer: string;
  acceptedAnswers: string[];
}

export interface StepImage {
  id: string;
  type: 'image';
  title: string;
  url: string;
  caption?: string;
}

export interface StepVideo {
  id: string;
  type: 'video';
  title: string;
  url: string;
  caption?: string;
}

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface StepReading {
  id: string;
  type: 'reading';
  title: string;
  text: string;
  vocabulary: { word: string; translation: string }[];
  questions: ReadingQuestion[];
}

export type LessonStep =
  | StepTheory
  | StepMultipleChoice
  | StepFillBlank
  | StepWordOrder
  | StepMatchPairs
  | StepTranslate
  | StepImage
  | StepVideo
  | StepReading;

export type LessonKind = 'video' | 'quiz' | 'reading' | 'interactive';

export interface LessonSeed {
  slug: string;
  title: string;
  orderIndex: number;
  type: LessonKind;
  durationMin: number;
  xp: number;
  sectionSlug: string;
  sectionTitle: string;
  sectionOrder: number;
  topic?: string;
  videoUrl?: string;
  transcript?: string;
  isFree?: boolean;
  steps: LessonStep[];
}

export interface CourseSeed {
  slug: string;
  /**
   * If the course already exists (e.g. seeded by library-items), this flag
   * tells the orchestrator to leave its metadata alone and only attach lessons.
   */
  createIfMissing?: {
    title: string;
    titleUa?: string;
    subtitle?: string;
    description?: string;
    descriptionShort?: string;
    level: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    audience?: 'kids' | 'teens' | 'adults' | 'any';
    kind?: 'course' | 'book' | 'video' | 'game';
    iconEmoji?: string;
    tags?: string[];
  };
  lessons: LessonSeed[];
}
