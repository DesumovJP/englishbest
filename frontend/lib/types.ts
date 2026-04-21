/**
 * Canonical domain types — shared between server + client.
 *
 * These track the Strapi v5 schemas (backend/src/api/**) 1:1 AFTER the v5
 * envelope is unwrapped by `lib/normalize.ts`. Everything the UI reads from
 * `lib/api.ts` conforms to shapes declared here.
 *
 * When a schema changes in Strapi, update the matching type here and any
 * normalizer that produces it — this is the single drift boundary.
 */

export type Role = 'kids' | 'adult' | 'teacher' | 'parent' | 'admin';
export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Audience = 'kids' | 'teens' | 'adults' | 'any';
export type Currency = 'UAH' | 'USD' | 'EUR';
export type CourseStatus = 'available' | 'soldOut' | 'comingSoon' | 'archived';
export type LessonType = 'video' | 'quiz' | 'reading' | 'interactive';
export type SessionType = 'group' | 'one-to-one' | 'trial' | 'consultation';
export type SessionStatus =
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled'
  | 'no-show';
export type ProgressStatus = 'notStarted' | 'inProgress' | 'completed' | 'skipped';
export type ExerciseType =
  | 'mcq'
  | 'fill-blank'
  | 'match-pairs'
  | 'translate'
  | 'word-order'
  | 'reading'
  | 'theory'
  | 'frame'
  | 'image'
  | 'video';

// ─── Strapi v5 envelopes ────────────────────────────────────────────────────

export type StrapiMedia = {
  id: number;
  documentId: string;
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string;
};

export type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type StrapiCollection<T> = {
  data: T[];
  meta: { pagination: StrapiPagination };
};

export type StrapiSingle<T> = {
  data: T;
  meta: Record<string, unknown>;
};

// ─── Domain types (post-normalize) ──────────────────────────────────────────

export type CourseSection = {
  slug: string;
  title: string;
  order?: number;
  lessonSlugs: string[];
};

export type Exercise = {
  slug: string;
  type: ExerciseType;
  question: string;
  options?: unknown;
  answer?: unknown;
  explanation?: string;
  meta?: Record<string, unknown>;
  points?: number;
};

export type TeacherSummary = {
  documentId: string;
  publicSlug?: string;
  displayName?: string;
  bio?: string;
  rating?: number;
  avatarUrl?: string;
};

export type Course = {
  documentId: string;
  slug: string;
  title: string;
  description?: string;
  level?: Level;
  price?: number;
  currency?: Currency;
  thumbnailUrl?: string;
  teacher?: TeacherSummary;
  sections: CourseSection[];
  tags?: string[];
  ratingAvg?: number;
  reviewCount?: number;
  status: CourseStatus;
  audience?: Audience;
  durationWeeks?: number;
  maxStudents?: number;

  // Legacy aliases for gradual migration — populated by normalize.ts so mock
  // consumers keep working while Phase 5 chunks land.
  teacherSlug?: string;
  teacherName?: string;
  thumbnail?: string;
  rating?: number;
};

export type Lesson = {
  documentId: string;
  slug: string;
  title: string;
  courseSlug?: string;
  courseDocumentId?: string;
  sectionSlug?: string;
  orderIndex?: number;
  type: LessonType;
  durationMin?: number;
  videoUrl?: string;
  transcript?: string;
  coverUrl?: string;
  exercises: Exercise[];
  isFree?: boolean;

  // Legacy aliases
  lessonSlug?: string;
  content?: {
    videoUrl?: string;
    transcript?: string;
    exercises: Exercise[];
  };
};

export type CalendarSession = {
  documentId: string;
  title: string;
  courseSlug?: string;
  teacherSlug?: string;
  startAt: string;
  durationMin: number;
  type: SessionType;
  status: SessionStatus;
  joinUrl?: string;
  recordingUrl?: string;
  grade?: number;

  // Legacy aliases for existing UI (CalendarView reads `date`+`time`+`duration`)
  date: string;
  time: string;
  duration: number;
};

export type Review = {
  documentId: string;
  rating: number;
  title?: string;
  body?: string;
  verified?: boolean;
  authorName?: string;
  createdAt: string;
};
