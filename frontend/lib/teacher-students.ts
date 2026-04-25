/**
 * Teacher /me aggregation: own students.
 *
 * Hits `/api/teacher/me/students` (proxied to backend `api::teacher.teacher.students`)
 * which returns distinct students across the teacher's sessions, with
 * last/next session + homework stats.
 *
 * SWR layer (`fetchMyStudentsCached` + `peekMyStudents`) keeps tab-back
 * navigation instant. The roster shifts when sessions or homework change,
 * so the 60s TTL drives a stale-while-revalidate refresh — visible on the
 * next render without blocking the cached one.
 */

import type { GroupLevel } from "@/lib/groups";
import { createCachedFetcher } from "./data-cache";

export type TeacherStudentStatus = "active" | "paused" | "expired" | "trial";

export interface TeacherStudent {
  documentId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  level: GroupLevel | null;
  avatarUrl: string | null;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  pendingHomework: number;
  totalHomework: number;
  completedHomework: number;
  status: TeacherStudentStatus;
}

const LEVELS = new Set<GroupLevel>(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]);

function pickLevel(v: unknown): GroupLevel | null {
  return typeof v === "string" && LEVELS.has(v as GroupLevel)
    ? (v as GroupLevel)
    : null;
}

function toNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) return Number(v);
  return 0;
}

function nullableStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function deriveStatus(raw: any): TeacherStudentStatus {
  const last = nullableStr(raw.lastSessionAt);
  const next = nullableStr(raw.nextSessionAt);
  const total = toNum(raw.totalHomework);
  if (!last && !next) return "trial";
  if (!next && last) {
    const lastMs = new Date(last).getTime();
    const ageDays = (Date.now() - lastMs) / 86_400_000;
    if (ageDays > 45) return "expired";
    if (ageDays > 21) return "paused";
  }
  if (total === 0 && !last) return "trial";
  return "active";
}

function normalize(raw: any): TeacherStudent | null {
  if (!raw?.documentId) return null;
  const first = typeof raw.firstName === "string" ? raw.firstName : "";
  const last = typeof raw.lastName === "string" ? raw.lastName : "";
  const display =
    typeof raw.displayName === "string" && raw.displayName
      ? raw.displayName
      : `${first} ${last}`.trim() || "—";
  return {
    documentId: String(raw.documentId),
    firstName: first,
    lastName: last,
    displayName: display,
    level: pickLevel(raw.level),
    avatarUrl: nullableStr(raw.avatarUrl),
    lastSessionAt: nullableStr(raw.lastSessionAt),
    nextSessionAt: nullableStr(raw.nextSessionAt),
    pendingHomework: toNum(raw.pendingHomework),
    totalHomework: toNum(raw.totalHomework),
    completedHomework: toNum(raw.completedHomework),
    status: deriveStatus(raw),
  };
}

export async function fetchMyStudents(): Promise<TeacherStudent[]> {
  const res = await fetch("/api/teacher/me/students", { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchMyStudents ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows
    .map(normalize)
    .filter((s): s is TeacherStudent => s !== null);
}

const myStudentsCache = createCachedFetcher<TeacherStudent[]>({
  key: "my-students",
  ttlMs: 60 * 1000,
  fetch: fetchMyStudents,
});

export const fetchMyStudentsCached = myStudentsCache.get;
export const peekMyStudents = myStudentsCache.peek;
export const resetMyStudentsCache = myStudentsCache.reset;
