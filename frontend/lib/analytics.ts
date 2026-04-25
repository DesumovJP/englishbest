/**
 * Analytics dashboard loaders.
 *
 * The backend exposes two read-only endpoints:
 *   GET /api/analytics/teacher — own dashboard (teacher role)
 *   GET /api/analytics/admin   — platform-wide dashboard (admin role)
 *
 * Both are protected server-side; callers without the right role get 403.
 *
 * SWR layer (`fetch*Cached/peek*`) keeps tab-back to admin/teacher dashboards
 * instant. Analytics data is aggregated server-side over a wide window so a
 * 60 s TTL is conservative — the next mount sees fresh-enough numbers.
 */

import { createCachedFetcher } from './data-cache';

export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface TeacherAnalyticsKpis {
  lessonsThisMonth: number;
  pendingHomework: number;
  attendancePct: number | null;
  avgGrade: number | null;
}

export interface TeacherMonthPoint {
  key: string;
  label: string;
  lessons: number;
  homeworkGraded: number;
  avgGrade: number | null;
}

export interface LevelBucket {
  level: Level;
  count: number;
}

export interface HonorRollEntry {
  documentId: string;
  name: string;
  level: Level | null;
  completed: number;
  total: number;
  rate: number;
}

export interface TeacherAnalyticsData {
  kpis: TeacherAnalyticsKpis;
  timeSeries: TeacherMonthPoint[];
  levelBuckets: LevelBucket[];
  honorRoll: HonorRollEntry[];
}

export interface AdminAnalyticsKpis {
  revenueThisMonth: number;
  activeStudents: number;
  lessonsThisMonth: number;
  avgRating: number | null;
  reviewsTotal: number;
  learnersTotal: number;
  teachersTotal: number;
}

export interface AdminMonthPoint {
  key: string;
  label: string;
  revenue: number;
  lessons: number;
  students: number;
}

export interface AdminTopTeacher {
  documentId: string;
  name: string;
  rating: number | null;
  students: number;
  revenue: number;
}

export interface AdminLevelBucket extends LevelBucket {
  pct: number;
}

export interface AdminAnalyticsData {
  kpis: AdminAnalyticsKpis;
  timeSeries: AdminMonthPoint[];
  topTeachers: AdminTopTeacher[];
  levelBuckets: AdminLevelBucket[];
}

export async function fetchTeacherAnalytics(): Promise<TeacherAnalyticsData> {
  const res = await fetch('/api/analytics/teacher', { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchTeacherAnalytics ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return json?.data as TeacherAnalyticsData;
}

export async function fetchAdminAnalytics(): Promise<AdminAnalyticsData> {
  const res = await fetch('/api/analytics/admin', { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchAdminAnalytics ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return json?.data as AdminAnalyticsData;
}

const teacherAnalyticsCache = createCachedFetcher<TeacherAnalyticsData>({
  key: 'teacher-analytics',
  ttlMs: 60 * 1000,
  fetch: fetchTeacherAnalytics,
});

const adminAnalyticsCache = createCachedFetcher<AdminAnalyticsData>({
  key: 'admin-analytics',
  ttlMs: 60 * 1000,
  fetch: fetchAdminAnalytics,
});

export const fetchTeacherAnalyticsCached = teacherAnalyticsCache.get;
export const peekTeacherAnalytics = teacherAnalyticsCache.peek;
export const resetTeacherAnalyticsCache = teacherAnalyticsCache.reset;

export const fetchAdminAnalyticsCached = adminAnalyticsCache.get;
export const peekAdminAnalytics = adminAnalyticsCache.peek;
export const resetAdminAnalyticsCache = adminAnalyticsCache.reset;
