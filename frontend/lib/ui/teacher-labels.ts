/**
 * Display dictionaries for the teacher module — labels, status chip styles,
 * kind → icon maps. Pure UI constants, no backend dependency.
 *
 * Types come from `lib/types/teacher.ts`.
 */

import type {
  BlockKind,
  HomeworkKind,
  HomeworkStatus,
  LessonSource,
  LessonStatus,
  Level,
  MiniTaskKind,
} from '@/lib/types/teacher';

export const LEVEL_STYLES: Record<Level, string> = {
  A0: 'bg-surface-muted text-ink',
  A1: 'bg-surface-muted text-ink',
  A2: 'bg-surface-muted text-ink',
  B1: 'bg-surface-muted text-ink',
  B2: 'bg-surface-muted text-ink',
  C1: 'bg-surface-muted text-ink',
  C2: 'bg-surface-muted text-ink',
};

export const LESSON_STATUS_STYLES: Record<LessonStatus, { label: string; cls: string; dot: string }> = {
  scheduled:     { label: 'Заплановано', cls: 'bg-surface-muted text-ink-muted', dot: 'bg-ink-faint' },
  'in-progress': { label: 'Зараз',       cls: 'bg-primary text-white',           dot: 'bg-success animate-pulse' },
  done:          { label: 'Проведено',   cls: 'bg-surface-muted text-ink-muted', dot: 'bg-success' },
  cancelled:     { label: 'Скасовано',   cls: 'bg-surface-muted text-ink-faint', dot: 'bg-border' },
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
