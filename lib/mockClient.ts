// Thin wrapper for reading mock JSON on the server side (used by API routes)
import coursesData from '@/mocks/courses.json';
import lessonsData from '@/mocks/lessons.json';
import usersData from '@/mocks/users.json';
import calendarData from '@/mocks/calendar.json';
import quizData from '@/mocks/quizSamples.json';

export const mockCourses = coursesData as Course[];
export const mockLessons = lessonsData as Lesson[];
export const mockUsers = usersData as User[];
export const mockCalendar = calendarData as CalendarSession[];
export const mockQuiz = quizData;

export interface Course {
  documentId: string;
  slug: string;
  title: string;
  level: string;
  price: number;
  teacherSlug: string;
  teacherName: string;
  thumbnail: string;
  description: string;
  sections: { slug: string; title: string; lessons: string[] }[];
  tags: string[];
  rating: number;
  reviewCount: number;
  status: 'available' | 'soldOut' | 'comingSoon';
}

export interface Lesson {
  documentId: string;
  lessonSlug: string;
  courseSlug: string;
  title: string;
  type: string;
  durationMin: number;
  content: {
    videoUrl: string;
    transcript?: string;
    exercises: Exercise[];
  };
}

export interface Exercise {
  documentId: string;
  type: 'mcq';
  question: string;
  options: string[];
  answer: number;
}

export interface User {
  documentId: string;
  userSlug: string;
  name: string;
  email: string;
  role: string;
  level: string;
  avatar: string;
  enrolledCourses: string[];
  progress: Record<string, string>;
  achievements: string[];
  preferences: { studyDays: string[]; format: string };
}

export interface CalendarSession {
  documentId: string;
  title: string;
  courseSlug: string;
  date: string;
  time: string;
  duration: number;
  type: 'group' | 'one-to-one';
  teacherSlug: string;
  status: 'upcoming' | 'completed';
  joinUrl?: string;
  grade?: number;
}
