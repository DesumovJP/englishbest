/**
 * Shared types + mock fixtures for the teacher module.
 * Single source of truth — when the backend is ready, the helpers below
 * are swapped with `fetcher<T>()` calls; the types stay as the API contract.
 */

/* ───── Primitives ─────────────────────────────────────────────── */

export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

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

export interface TeacherNote {
  id: string;
  authoredAt: string;  // ISO
  body: string;
  lessonRef?: string;
}

export interface LibraryLesson {
  id: string;
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

/* ───── Helpers for consistent photos ──────────────────────────── */

const p = (kind: 'men' | 'women' | 'girls', n: number) =>
  `https://randomuser.me/api/portraits/${kind}/${n}.jpg`;

/* ───── Mock data ──────────────────────────────────────────────── */

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Аліса Коваль',      photo: p('girls', 44), level: 'A1', lessonsLeft: 12, lessonsTotal: 24, homeworkCompletionRate: 0.92, missedHomeworkStreak: 0, status: 'active', joinedAt: 'Лютий 2026',   parentName: 'Олена Коваль',       parentPhone: '+380501234567', parentEmail: 'olena.koval@gmail.com',     groupId: 'g1' },
  { id: 's2', name: 'Микола Семенченко', photo: p('men',   14), level: 'A1', lessonsLeft: 8,  lessonsTotal: 24, homeworkCompletionRate: 0.75, missedHomeworkStreak: 1, status: 'active', joinedAt: 'Січень 2026',  parentName: 'Ірина Семенченко',   parentPhone: '+380671112233', parentEmail: 'iryna.s@gmail.com',         groupId: 'g1' },
  { id: 's3', name: 'Дарина Петренко',   photo: p('women', 24), level: 'A2', lessonsLeft: 2,  lessonsTotal: 20, homeworkCompletionRate: 0.60, missedHomeworkStreak: 3, status: 'active', joinedAt: 'Вересень 2025', parentName: 'Оксана Петренко',    parentPhone: '+380931234512', parentEmail: 'oksana.p@gmail.com',        groupId: 'g2' },
  { id: 's4', name: 'Іван Бондаренко',   photo: p('men',   22), level: 'B1', lessonsLeft: 0,  lessonsTotal: 16, homeworkCompletionRate: 0.30, missedHomeworkStreak: 5, status: 'paused', joinedAt: 'Жовтень 2025', parentName: 'Тарас Бондаренко',   parentPhone: '+380639876543', parentEmail: 'taras.b@gmail.com' },
  { id: 's5', name: 'Софія Мельник',     photo: p('women', 33), level: 'A1', lessonsLeft: 1,  lessonsTotal: 24, homeworkCompletionRate: 0.85, missedHomeworkStreak: 0, status: 'active', joinedAt: 'Березень 2026', parentName: 'Лариса Мельник',     parentPhone: '+380501112244',                                                groupId: 'g1' },
  { id: 's6', name: 'Юлія Гриценко',     photo: p('women', 52), level: 'A2', lessonsLeft: 9,  lessonsTotal: 24, homeworkCompletionRate: 0.80, missedHomeworkStreak: 0, status: 'active', joinedAt: 'Грудень 2025',                                                                                                              groupId: 'g2' },
  { id: 's7', name: 'Віталій Назаренко', photo: p('men',   55), level: 'A1', lessonsLeft: 6,  lessonsTotal: 16, homeworkCompletionRate: 0.50, missedHomeworkStreak: 4, status: 'active', joinedAt: 'Січень 2026',                                                                                                               groupId: 'g1' },
  { id: 's8', name: 'Катерина Захаренко',photo: p('women', 45), level: 'A0', lessonsLeft: 14, lessonsTotal: 16, homeworkCompletionRate: 1.00, missedHomeworkStreak: 0, status: 'trial',  joinedAt: 'Квітень 2026', parentName: 'Сергій Захаренко',   parentPhone: '+380971234500' },
];

export const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'Group Monday A1',  level: 'A1', studentIds: ['s1', 's2', 's5', 's7'], avgAttendance: 0.92, avgHomework: 0.78 },
  { id: 'g2', name: 'Group Tuesday A2', level: 'A2', studentIds: ['s3', 's6'],             avgAttendance: 0.85, avgHomework: 0.70 },
];

export const MOCK_TODAY = '2026-04-19';

export const MOCK_SCHEDULE: ScheduledLesson[] = [
  { id: 'sl1',  date: '2026-04-19', time: '09:00', duration: 45, studentId: 's1', level: 'A1', topic: 'Food & Drinks',         status: 'done',        mode: 'individual', lessonRef: 'll1' },
  { id: 'sl2',  date: '2026-04-19', time: '11:00', duration: 45, studentId: 's2', level: 'A1', topic: 'Daily Routines',        status: 'done',        mode: 'individual', lessonRef: 'll2' },
  { id: 'sl3',  date: '2026-04-19', time: '14:00', duration: 45, studentId: 's7', level: 'A1', topic: 'Present Simple',        status: 'in-progress', mode: 'individual', lessonRef: 'll3' },
  { id: 'sl4',  date: '2026-04-19', time: '16:00', duration: 45, studentId: 's5', level: 'A1', topic: 'Animals & Nature',      status: 'scheduled',   mode: 'individual', lessonRef: 'll4' },
  { id: 'sl5',  date: '2026-04-19', time: '18:00', duration: 45, studentId: 's6', level: 'A2', topic: 'Reading Comprehension', status: 'scheduled',   mode: 'individual', lessonRef: 'll5' },
  { id: 'sl6',  date: '2026-04-20', time: '10:00', duration: 45, studentId: 's3', level: 'A2', topic: 'Past Simple',            status: 'scheduled',   mode: 'individual' },
  { id: 'sl7',  date: '2026-04-20', time: '14:00', duration: 45, groupId: 'g1',   level: 'A1', topic: 'Review Unit 3',          status: 'scheduled',   mode: 'group' },
  { id: 'sl8',  date: '2026-04-21', time: '09:00', duration: 45, studentId: 's1', level: 'A1', topic: 'Family & Friends',       status: 'scheduled',   mode: 'individual' },
  { id: 'sl9',  date: '2026-04-21', time: '16:00', duration: 45, studentId: 's6', level: 'A2', topic: 'Present Perfect',        status: 'scheduled',   mode: 'individual' },
  { id: 'sl10', date: '2026-04-22', time: '11:00', duration: 60, groupId: 'g2',   level: 'A2', topic: 'Speaking Club',          status: 'scheduled',   mode: 'speaking-club' },
  { id: 'sl11', date: '2026-04-23', time: '15:00', duration: 45, studentId: 's3', level: 'A2', topic: 'Numbers Review',         status: 'cancelled',   mode: 'individual', cancelReason: 'Учениця захворіла' },
];

export const MOCK_LIBRARY: LibraryLesson[] = [
  { id: 'll1', title: 'Food & Drinks — introduction',         level: 'A1', topic: 'Vocabulary',          durationMin: 35, source: 'platform', updatedAt: '2026-03-12', blocksCount: 12, tags: ['A1', 'food'] },
  { id: 'll2', title: 'Daily Routines — base vocabulary',     level: 'A1', topic: 'Vocabulary',          durationMin: 40, source: 'platform', updatedAt: '2026-02-28', blocksCount: 14, tags: ['A1', 'routines'] },
  { id: 'll3', title: 'Present Simple — positive statements', level: 'A1', topic: 'Grammar',             durationMin: 45, source: 'copy',      updatedAt: '2026-04-05', blocksCount: 10, originalId: 'll13', hasUpdateFromOriginal: true, tags: ['A1', 'grammar'] },
  { id: 'll4', title: 'Animals & Nature — my lesson',         level: 'A1', topic: 'Theme lesson',         durationMin: 30, source: 'own',       updatedAt: '2026-04-10', blocksCount: 8,  tags: ['A1', 'animals'] },
  { id: 'll5', title: 'Reading Comprehension — level A2',     level: 'A2', topic: 'Reading',             durationMin: 50, source: 'platform',  updatedAt: '2026-03-18', blocksCount: 16, tags: ['A2', 'reading'] },
  { id: 'll6', title: 'Speaking Warm-up Template',            level: 'B1', topic: 'Speaking',            durationMin: 20, source: 'template',  updatedAt: '2026-04-01', blocksCount: 6,  tags: ['template'] },
  { id: 'll7', title: 'Numbers & Counting for Kids',          level: 'A0', topic: 'Vocabulary',          durationMin: 25, source: 'platform',  updatedAt: '2026-01-22', blocksCount: 10, tags: ['A0', 'numbers'] },
  { id: 'll8', title: 'Past Simple intro',                    level: 'A2', topic: 'Grammar',             durationMin: 45, source: 'platform',  updatedAt: '2026-02-14', blocksCount: 15, tags: ['A2', 'grammar'] },
  { id: 'll9', title: 'Family vocabulary',                    level: 'A1', topic: 'Vocabulary',          durationMin: 30, source: 'own',       updatedAt: '2026-04-08', blocksCount: 9,  tags: ['A1', 'family'] },
  { id: 'll10',title: 'Business email basics',                level: 'B2', topic: 'Writing',             durationMin: 50, source: 'platform',  updatedAt: '2026-03-30', blocksCount: 18, tags: ['B2', 'business'] },
  { id: 'll11',title: 'Conditionals — 0 & 1',                 level: 'B1', topic: 'Grammar',             durationMin: 50, source: 'platform',  updatedAt: '2026-02-05', blocksCount: 14, tags: ['B1', 'grammar'] },
  { id: 'll12',title: 'Listening practice — interviews',      level: 'B2', topic: 'Listening',           durationMin: 40, source: 'platform',  updatedAt: '2026-03-22', blocksCount: 12, tags: ['B2', 'listening'] },
];

export const MOCK_HOMEWORK: HomeworkTask[] = [
  { id: 'hw1', title: 'Exercise 5 — Food vocabulary', description: 'Виконай вправу 5 у робочому зошиті сторінка 34.', kind: 'written',         assignedTo: { type: 'student', id: 's3' }, assignedAt: '2026-04-12', deadline: '2026-04-14', coins: 20, status: 'submitted',    submissionPreview: 'I eat bread for breakfast. I drink orange juice every morning…' },
  { id: 'hw2', title: 'Audio: read the dialogue',     description: 'Запиши аудіо, де ти читаєш діалог із сторінки 22.', kind: 'audio',           assignedTo: { type: 'student', id: 's2' }, assignedAt: '2026-04-13', deadline: '2026-04-16', coins: 30, status: 'submitted',    submissionPreview: 'audio: 1m 14s' },
  { id: 'hw3', title: 'Write 5 sentences — Present Simple', description: '5 позитивних + 5 негативних речень про твій день.', kind: 'written',     assignedTo: { type: 'student', id: 's1' }, assignedAt: '2026-04-15', deadline: '2026-04-18', coins: 25, bonusCoins: 10, status: 'submitted', submissionPreview: 'I wake up at 7. I don\'t drink coffee…' },
  { id: 'hw4', title: 'Video: introduce yourself',    description: 'До 2 хв. Ім\'я, вік, хобі, улюблена страва.',        kind: 'video',           assignedTo: { type: 'student', id: 's6' }, assignedAt: '2026-04-10', deadline: '2026-04-12', coins: 40, status: 'submitted',    submissionPreview: 'video: 1m 52s' },
  { id: 'hw5', title: 'Read page 16 and answer',      description: 'Прочитай текст і дай відповідь на 5 питань.',        kind: 'file',            assignedTo: { type: 'student', id: 's5' }, assignedAt: '2026-04-11', deadline: '2026-04-14', coins: 20, status: 'submitted',    submissionPreview: 'answers.pdf · 1.2 MB' },
  { id: 'hw6', title: 'Daily routines — complete the lesson', description: 'Пройди урок до кінця.',                        kind: 'library-lesson', assignedTo: { type: 'student', id: 's7' }, assignedAt: '2026-04-14', deadline: '2026-04-17', coins: 35, status: 'overdue' },
  { id: 'hw7', title: 'Quick quiz — Food',            description: 'Швидкий тест із 10 питань.',                         kind: 'test',            assignedTo: { type: 'student', id: 's5' }, assignedAt: '2026-04-15', deadline: '2026-04-19', coins: 15, status: 'reviewed', grade: 'Excellent', comment: 'Дуже гарно! 9/10.' },
  { id: 'hw8', title: 'Sentence order',               description: 'Правильний порядок слів у 8 реченнях.',               kind: 'test',            assignedTo: { type: 'group', id: 'g1' },   assignedAt: '2026-04-16', deadline: '2026-04-19', coins: 10, status: 'in-progress' },
  { id: 'hw9', title: 'Record a story (60 sec)',      description: 'Розкажи історію про свої вихідні.',                  kind: 'audio',           assignedTo: { type: 'student', id: 's1' }, assignedAt: '2026-04-17', deadline: '2026-04-20', coins: 25, status: 'not-started' },
];

export const MOCK_MINI_TASKS: MiniTask[] = [
  { id: 'mt1', kind: 'quiz',            title: 'Past Simple quiz',              level: 'A2', topic: 'Grammar',    durationMin: 5, coins: 10, questionsCount: 10, createdAt: '2026-04-14', assignedCount: 6, avgScore: 0.82 },
  { id: 'mt2', kind: 'word-of-day',     title: 'Word of the day — Brilliant',   level: 'B1', topic: 'Vocabulary', durationMin: 3, coins: 5,  questionsCount: 3,  createdAt: '2026-04-18', assignedCount: 12, avgScore: 0.94 },
  { id: 'mt3', kind: 'daily-challenge', title: 'Monday challenge — routines',   level: 'A1', topic: 'Vocabulary', durationMin: 8, coins: 15, questionsCount: 3,  createdAt: '2026-04-15', assignedCount: 4 },
  { id: 'mt4', kind: 'listening',       title: 'Airport announcements',         level: 'B1', topic: 'Listening',  durationMin: 7, coins: 12, questionsCount: 5,  createdAt: '2026-04-10', assignedCount: 3, avgScore: 0.71 },
  { id: 'mt5', kind: 'sentence-builder',title: 'Сorrect order — Present Perfect',level: 'B1', topic: 'Grammar',   durationMin: 6, coins: 10, questionsCount: 8,  createdAt: '2026-04-09', assignedCount: 5, avgScore: 0.78 },
  { id: 'mt6', kind: 'level-quiz',      title: 'Level check A2 → B1',           level: 'A2', topic: 'Mixed',      durationMin: 10, coins: 20, questionsCount: 15, createdAt: '2026-03-28', assignedCount: 8, avgScore: 0.65 },
];

export const MOCK_CHAT_THREADS: ChatThread[] = [
  { id: 'th1', kind: 'student', title: 'Аліса Коваль',        photo: p('girls', 44), unread: 2, lastMessage: 'Дякую, готово!',                 lastMessageAt: '14:32', pinned: true },
  { id: 'th2', kind: 'student', title: 'Микола Семенченко',   photo: p('men',   14), unread: 0, lastMessage: 'До зустрічі завтра',             lastMessageAt: '12:10' },
  { id: 'th3', kind: 'parent',  title: 'Олена Коваль (мама Аліси)', photo: p('women', 62), unread: 1, lastMessage: 'Чи зможе Аліса завтра о 19:00?', lastMessageAt: '10:04' },
  { id: 'th4', kind: 'group',   title: 'Group Monday A1',                          unread: 0, lastMessage: 'Ось ДЗ на четвер',               lastMessageAt: '09:40' },
  { id: 'th5', kind: 'student', title: 'Юлія Гриценко',       photo: p('women', 52), unread: 0, lastMessage: 'Дякую за урок!',                  lastMessageAt: 'Вт' },
  { id: 'th6', kind: 'parent',  title: 'Тарас Бондаренко (тато Івана)', photo: p('men', 76), unread: 0, lastMessage: 'Домовились',               lastMessageAt: 'Пн' },
];

/* ───── Access helpers (replace with fetcher<T>() later) ───────── */

export function getStudent(id: string): Student | undefined {
  return MOCK_STUDENTS.find(s => s.id === id);
}
export function getGroup(id: string): Group | undefined {
  return MOCK_GROUPS.find(g => g.id === id);
}
export function lessonsOnDate(dateStr: string): ScheduledLesson[] {
  return MOCK_SCHEDULE.filter(l => l.date === dateStr);
}
export function upcomingLessons(limit = 5): ScheduledLesson[] {
  return MOCK_SCHEDULE
    .filter(l => l.status === 'scheduled' || l.status === 'in-progress')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, limit);
}
export function pendingHomework(): HomeworkTask[] {
  return MOCK_HOMEWORK
    .filter(h => h.status === 'submitted')
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
}
export function atRiskStudents(): Student[] {
  return MOCK_STUDENTS.filter(
    s => s.status !== 'blocked' && (s.lessonsLeft <= 2 || s.missedHomeworkStreak >= 3),
  );
}

/* ───── Level + status display configs ─────────────────────────── */

export const LEVEL_STYLES: Record<Level, string> = {
  A0: 'bg-surface-muted text-ink',
  A1: 'bg-surface-muted text-ink',
  A2: 'bg-surface-muted text-ink',
  B1: 'bg-surface-muted text-ink',
  B2: 'bg-surface-muted text-ink',
  C1: 'bg-surface-muted text-ink',
};

export const LESSON_STATUS_STYLES: Record<LessonStatus, { label: string; cls: string; dot: string }> = {
  scheduled:     { label: 'Заплановано', cls: 'bg-surface-muted text-ink-muted',     dot: 'bg-ink-faint' },
  'in-progress': { label: 'Зараз',       cls: 'bg-primary text-white',                    dot: 'bg-success animate-pulse' },
  done:          { label: 'Проведено',   cls: 'bg-surface-muted text-ink-muted',     dot: 'bg-success' },
  cancelled:     { label: 'Скасовано',   cls: 'bg-surface-muted text-ink-faint',     dot: 'bg-border' },
};

export const HOMEWORK_STATUS_STYLES: Record<HomeworkStatus, { label: string; cls: string }> = {
  'not-started': { label: 'Не розпочато', cls: 'bg-surface-muted text-ink-muted' },
  'in-progress': { label: 'В процесі',    cls: 'bg-surface-muted text-ink' },
  submitted:     { label: 'На перевірці', cls: 'bg-primary text-white' },
  reviewed:      { label: 'Перевірено',   cls: 'bg-surface-muted text-ink-muted' },
  returned:      { label: 'Повернуто',    cls: 'bg-surface-muted text-danger-dark' },
  overdue:       { label: 'Прострочено',  cls: 'bg-danger/10 text-danger-dark' },
};

export const LESSON_SOURCE_LABELS: Record<LessonSource, string> = {
  platform: 'Платформа',
  copy:     'Копія',
  own:      'Власний',
  template: 'Шаблон',
};

export const HOMEWORK_KIND_LABELS: Record<HomeworkKind, string> = {
  'library-lesson': 'Урок з бібліотеки',
  written:          'Письмове',
  file:             'Файл',
  audio:            'Аудіо',
  video:            'Відео',
  link:             'Посилання',
  test:             'Тест',
};

export const HOMEWORK_KIND_ICONS: Record<HomeworkKind, string> = {
  'library-lesson': '📘',
  written:          '✍️',
  file:             '📎',
  audio:            '🎤',
  video:            '🎬',
  link:             '🔗',
  test:             '✅',
};

export const MINI_TASK_LABELS: Record<MiniTaskKind, string> = {
  'level-quiz':      'Міні-тест по рівню',
  quiz:              'Вікторина',
  'daily-challenge': 'Щоденний виклик',
  'word-of-day':     'Word of the Day',
  listening:         'Listening',
  'sentence-builder':'Sentence builder',
};

export const MINI_TASK_ICONS: Record<MiniTaskKind, string> = {
  'level-quiz':      '🎯',
  quiz:              '❓',
  'daily-challenge': '🗓️',
  'word-of-day':     '📖',
  listening:         '🎧',
  'sentence-builder':'🧩',
};

export const MINI_TASK_DESCRIPTIONS: Record<MiniTaskKind, string> = {
  'level-quiz':      '10–15 змішаних питань для перевірки рівня.',
  quiz:              '5–15 питань із 4 варіантами відповідей.',
  'daily-challenge': '3 завдання щодня — лексика + граматика + speaking.',
  'word-of-day':     'Слово дня: переклад, приклад, вправа.',
  listening:         'Аудіо + питання на розуміння.',
  'sentence-builder':'Збери речення з правильним порядком слів.',
};

export const BLOCK_KIND_LABELS: Record<BlockKind, string> = {
  text:                       'Текстовий блок',
  image:                      'Зображення',
  audio:                      'Аудіо',
  video:                      'Відео',
  'exercise-multiple-choice': 'Вправа: вибір відповіді',
  'exercise-text-input':      'Вправа: введення тексту',
  'exercise-matching':        'Вправа: відповідність',
  'exercise-word-order':      'Вправа: порядок слів',
  'exercise-fill-gap':        'Вправа: заповнення пропусків',
  flashcards:                 'Флеш-картки',
  link:                       'Посилання',
  'teacher-note':             'Нотатка для викладача',
};

export const BLOCK_KIND_ICONS: Record<BlockKind, string> = {
  text:                       '📝',
  image:                      '🖼️',
  audio:                      '🎧',
  video:                      '🎬',
  'exercise-multiple-choice': '☑️',
  'exercise-text-input':      '⌨️',
  'exercise-matching':        '🔗',
  'exercise-word-order':      '🔀',
  'exercise-fill-gap':        '✏️',
  flashcards:                 '🗂️',
  link:                       '🌐',
  'teacher-note':             '📌',
};
