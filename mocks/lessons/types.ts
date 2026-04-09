/* ─── Типи кроків уроку ──────────────────────── */

export interface StepTheory {
  id: string;
  type: 'theory';
  title: string;
  body: string;           // markdown-like text
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
  before: string;         // текст до пропуску
  after: string;          // текст після пропуску
  answer: string;         // правильна відповідь
  hint?: string;
}

export interface StepWordOrder {
  id: string;
  type: 'word-order';
  prompt: string;         // напр. "Склади речення:"
  translation: string;    // переклад для підказки
  words: string[];        // слова для перетягування
  answer: string[];       // правильний порядок
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
  prompt: string;         // "Перекладіть речення:"
  sentence: string;       // речення для перекладу
  answer: string;         // еталонна відповідь
  acceptedAnswers: string[]; // варіанти що вважаються вірними
}

export interface StepImage {
  id: string;
  type: 'image';
  title: string;
  url: string;            // зовнішній URL зображення
  caption?: string;       // підпис під зображенням
}

export interface StepVideo {
  id: string;
  type: 'video';
  title: string;
  url: string;            // YouTube / Vimeo embed URL
  caption?: string;
}

export interface ReadingQuestion {
  id: string;
  question: string;       // питання українською
  options: string[];      // варіанти відповідей українською
  correctIndex: number;
  explanation?: string;
}

export interface StepReading {
  id: string;
  type: 'reading';
  title: string;
  text: string;           // English текст для читання
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

export interface LessonData {
  slug: string;
  courseSlug: string;
  title: string;
  xp: number;
  steps: LessonStep[];
}
