/**
 * Teacher-module domain types.
 *
 * These interfaces describe the entities the teacher dashboard manipulates
 * (students, groups, scheduled lessons, library lessons, homework, mini-tasks,
 * chat threads). Consumed by teacher-side components and live data fetchers
 * under `lib/teacher-*` and `lib/*.ts`.
 */

import type { Level } from '@/lib/types';

export type { Level };

/* ───── Primitives ─────────────────────────────────────────────── */

export type LessonStatus =
  | 'scheduled'
  | 'in-progress'
  | 'done'
  | 'cancelled';

export type HomeworkStatus =
  | 'not-started'
  | 'in-progress'
  | 'submitted'
  | 'reviewed'
  | 'returned'
  | 'overdue';

export type LessonSource = 'platform' | 'copy' | 'own' | 'template';
export type LessonFormat = 'class' | 'homework';
export type LessonMode = 'individual' | 'pair' | 'group' | 'speaking-club';

export type BlockKind =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'exercise-multiple-choice'
  | 'exercise-text-input'
  | 'exercise-matching'
  | 'exercise-word-order'
  | 'exercise-fill-gap'
  | 'flashcards'
  | 'link'
  | 'teacher-note';

export type HomeworkKind =
  | 'library-lesson'
  | 'written'
  | 'file'
  | 'audio'
  | 'video'
  | 'link'
  | 'test';

export type MiniTaskKind =
  | 'level-quiz'
  | 'quiz'
  | 'daily-challenge'
  | 'word-of-day'
  | 'listening'
  | 'sentence-builder';

/* ───── Entities ───────────────────────────────────────────────── */

export interface TeacherNote {
  id: string;
  authoredAt: string;  // ISO
  body: string;
  lessonRef?: string;
}

export interface Student {
  id: string;
  name: string;
  photo: string;
  level: Level;
  lessonsLeft: number;
  lessonsTotal: number;
  homeworkCompletionRate: number;
  missedHomeworkStreak: number;
  status: 'active' | 'paused' | 'trial' | 'blocked';
  joinedAt: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  groupId?: string;
  privateNotes?: TeacherNote[];
}

export interface Group {
  id: string;
  name: string;
  level: Level;
  studentIds: string[];
  avgAttendance: number;
  avgHomework: number;
}

export interface ScheduledLesson {
  id: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  duration: number;    // minutes
  studentId?: string;
  groupId?: string;
  level: Level;
  topic: string;
  status: LessonStatus;
  mode: LessonMode;
  lessonRef?: string;  // id from library
  notes?: string;
  recurrence?: 'none' | 'weekly' | 'custom';
  cancelReason?: string;
}

export interface LibraryLesson {
  id: string;
  slug: string;
  title: string;
  level: Level;
  topic: string;
  durationMin: number;
  source: LessonSource;
  updatedAt: string;
  blocksCount: number;
  ownerId?: string;
  originalId?: string;
  hasUpdateFromOriginal?: boolean;
  tags?: string[];
  published?: boolean;
  /** Parent course (relation), if any. */
  courseDocumentId?: string | null;
  courseSlug?: string | null;
  courseTitle?: string | null;
  /** Slug of the course section this lesson sits in (matches course.sections[].slug). */
  sectionSlug?: string | null;
}

export interface LessonBlock {
  id: string;
  kind: BlockKind;
  title?: string;
  body?: string;
  mediaUrl?: string;
  items?: Array<{ left: string; right: string }>;
  options?: Array<{ text: string; correct: boolean }>;
  correctAnswer?: string;
  words?: string[];
  cards?: Array<{ front: string; back: string }>;
  linkUrl?: string;
  linkDescription?: string;
}

export interface HomeworkTask {
  id: string;
  title: string;
  description: string;
  kind: HomeworkKind;
  assignedTo: { type: 'student' | 'group'; id: string };
  assignedAt: string;
  deadline: string;
  coins: number;
  bonusCoins?: number;
  status: HomeworkStatus;
  submissionPreview?: string;
  grade?: string;
  comment?: string;
  attachments?: Array<{ type: string; url: string; name: string }>;
}

export interface MiniTask {
  id: string;
  kind: MiniTaskKind;
  title: string;
  level: Level;
  topic: string;
  durationMin: number;
  coins: number;
  questionsCount: number;
  createdAt: string;
  assignedCount: number;
  avgScore?: number;
}

export interface ChatThread {
  id: string;
  kind: 'student' | 'parent' | 'group';
  title: string;
  photo?: string;
  unread: number;
  lastMessage: string;
  lastMessageAt: string;
  pinned?: boolean;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorRole: 'teacher' | 'student' | 'parent';
  body: string;
  sentAt: string;
  replyTo?: string;
  attachments?: Array<{ type: string; name: string; url: string }>;
  status: 'sent' | 'delivered' | 'read';
}
