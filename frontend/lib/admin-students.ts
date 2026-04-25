/**
 * Admin platform-wide student list.
 *
 * Hits `/api/admin/students` (proxied to `api::admin.admin.students`). Returns
 * all user-profiles with role in (kids, adult) enriched with last/next session
 * + homework stats + teacher names. Admin-only on BE.
 */

import type { GroupLevel } from '@/lib/groups';
import type { TeacherStudentStatus } from '@/lib/teacher-students';
import { createCachedFetcher } from './data-cache';

export type AdminStudentRole = 'kids' | 'adult';

export interface AdminStudent {
  documentId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: AdminStudentRole;
  level: GroupLevel | null;
  avatarUrl: string | null;
  createdAt: string | null;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  pendingHomework: number;
  totalHomework: number;
  completedHomework: number;
  teacherNames: string[];
  status: TeacherStudentStatus;
}

const LEVELS = new Set<GroupLevel>(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

function pickLevel(v: unknown): GroupLevel | null {
  return typeof v === 'string' && LEVELS.has(v as GroupLevel)
    ? (v as GroupLevel)
    : null;
}

function toNum(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

function nullableStr(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function deriveStatus(raw: any): TeacherStudentStatus {
  const last = nullableStr(raw.lastSessionAt);
  const next = nullableStr(raw.nextSessionAt);
  const total = toNum(raw.totalHomework);
  if (!last && !next) return 'trial';
  if (!next && last) {
    const lastMs = new Date(last).getTime();
    const ageDays = (Date.now() - lastMs) / 86_400_000;
    if (ageDays > 45) return 'expired';
    if (ageDays > 21) return 'paused';
  }
  if (total === 0 && !last) return 'trial';
  return 'active';
}

function normalize(raw: any): AdminStudent | null {
  if (!raw?.documentId) return null;
  const first = typeof raw.firstName === 'string' ? raw.firstName : '';
  const last = typeof raw.lastName === 'string' ? raw.lastName : '';
  const display =
    typeof raw.displayName === 'string' && raw.displayName
      ? raw.displayName
      : `${first} ${last}`.trim() || '—';
  const role: AdminStudentRole = raw.role === 'adult' ? 'adult' : 'kids';
  const teacherNames = Array.isArray(raw.teacherNames)
    ? raw.teacherNames.filter((x: unknown): x is string => typeof x === 'string')
    : [];
  return {
    documentId: String(raw.documentId),
    firstName: first,
    lastName: last,
    displayName: display,
    role,
    level: pickLevel(raw.level),
    avatarUrl: nullableStr(raw.avatarUrl),
    createdAt: nullableStr(raw.createdAt),
    lastSessionAt: nullableStr(raw.lastSessionAt),
    nextSessionAt: nullableStr(raw.nextSessionAt),
    pendingHomework: toNum(raw.pendingHomework),
    totalHomework: toNum(raw.totalHomework),
    completedHomework: toNum(raw.completedHomework),
    teacherNames,
    status: deriveStatus(raw),
  };
}

export async function fetchAdminStudents(): Promise<AdminStudent[]> {
  const res = await fetch('/api/admin/students', { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchAdminStudents ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map(normalize)
    .filter((s): s is AdminStudent => s !== null);
}

const adminStudentsCache = createCachedFetcher<AdminStudent[]>({
  key: 'admin-students',
  ttlMs: 60 * 1000,
  fetch: fetchAdminStudents,
});

export const fetchAdminStudentsCached = adminStudentsCache.get;
export const peekAdminStudents = adminStudentsCache.peek;
export const resetAdminStudentsCache = adminStudentsCache.reset;
