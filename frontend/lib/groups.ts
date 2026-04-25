/**
 * Groups loader / mutator.
 *
 * Hits the `/api/groups` proxy which forwards auth cookie → Strapi. Backend
 * controller scopes by role (teacher sees own, student/parent sees members-of,
 * admin sees all).
 *
 * SWR layer (`fetchGroupsCached` + `peekGroups`) keeps tab-back navigation
 * instant. Mutations call `resetGroupsCache()` so create/update/delete are
 * visible on the next read. 30s TTL covers stale-while-revalidate refresh
 * for changes made elsewhere.
 */

import { createCachedFetcher } from "./data-cache";

export type GroupLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface GroupMember {
  documentId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  level: GroupLevel | null;
  avatarUrl: string | null;
}

export interface GroupTeacher {
  documentId: string;
  displayName: string;
}

export interface Group {
  documentId: string;
  name: string;
  level: GroupLevel;
  scheduleRrule: string | null;
  activeFrom: string | null;
  activeTo: string | null;
  meetUrl: string | null;
  avgAttendance: number;
  avgHomework: number;
  teacher: GroupTeacher | null;
  members: GroupMember[];
}

const LEVELS = new Set<GroupLevel>(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]);

function pickLevel(v: unknown): GroupLevel {
  return typeof v === "string" && LEVELS.has(v as GroupLevel)
    ? (v as GroupLevel)
    : "A1";
}

function pickLevelOrNull(v: unknown): GroupLevel | null {
  return typeof v === "string" && LEVELS.has(v as GroupLevel)
    ? (v as GroupLevel)
    : null;
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return 0;
}

function nullableStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function mediaUrl(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const url = (media as { url?: unknown }).url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

function memberName(raw: any): string {
  if (typeof raw?.displayName === "string" && raw.displayName) return raw.displayName;
  const first = typeof raw?.firstName === "string" ? raw.firstName : "";
  const last = typeof raw?.lastName === "string" ? raw.lastName : "";
  const joined = `${first} ${last}`.trim();
  return joined || "—";
}

function normalizeMember(raw: any): GroupMember | null {
  if (!raw?.documentId) return null;
  return {
    documentId: String(raw.documentId),
    firstName: typeof raw.firstName === "string" ? raw.firstName : "",
    lastName: typeof raw.lastName === "string" ? raw.lastName : "",
    displayName: memberName(raw),
    level: pickLevelOrNull(raw.level),
    avatarUrl: mediaUrl(raw.avatar),
  };
}

function normalizeTeacher(raw: any): GroupTeacher | null {
  if (!raw?.documentId) return null;
  // teacher-profile has no display fields — they live on the linked user-profile.
  const u = raw.user ?? {};
  const display =
    typeof u.displayName === "string" && u.displayName
      ? u.displayName
      : `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—";
  return { documentId: String(raw.documentId), displayName: display };
}

function normalize(raw: any): Group | null {
  if (!raw?.documentId) return null;
  const members: GroupMember[] = Array.isArray(raw.members)
    ? raw.members.map(normalizeMember).filter((m: GroupMember | null): m is GroupMember => m !== null)
    : [];
  return {
    documentId: String(raw.documentId),
    name: typeof raw.name === "string" ? raw.name : "",
    level: pickLevel(raw.level),
    scheduleRrule: nullableStr(raw.scheduleRrule),
    activeFrom: nullableStr(raw.activeFrom),
    activeTo: nullableStr(raw.activeTo),
    meetUrl: nullableStr(raw.meetUrl),
    avgAttendance: toNum(raw.avgAttendance),
    avgHomework: toNum(raw.avgHomework),
    teacher: normalizeTeacher(raw.teacher),
    members,
  };
}

const LIST_QUERY =
  // teacher → teacher-profile; display fields are on its nested user (user-profile).
  "populate[teacher][fields][0]=documentId" +
  "&populate[teacher][populate][user][fields][0]=displayName" +
  "&populate[teacher][populate][user][fields][1]=firstName" +
  "&populate[teacher][populate][user][fields][2]=lastName" +
  // members → user-profile directly, so display fields are top-level.
  "&populate[members][fields][0]=firstName" +
  "&populate[members][fields][1]=lastName" +
  "&populate[members][fields][2]=displayName" +
  "&populate[members][fields][3]=level" +
  "&populate[members][populate][avatar][fields][0]=url" +
  "&pagination[pageSize]=100" +
  "&sort=name:asc";

export async function fetchGroups(): Promise<Group[]> {
  const res = await fetch(`/api/groups?${LIST_QUERY}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchGroups ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  return rows.map(normalize).filter((g): g is Group => g !== null);
}

const groupsCache = createCachedFetcher<Group[]>({
  key: "groups",
  ttlMs: 30 * 1000,
  fetch: fetchGroups,
});

export const fetchGroupsCached = groupsCache.get;
export const peekGroups = groupsCache.peek;
export const resetGroupsCache = groupsCache.reset;

export async function fetchGroup(documentId: string): Promise<Group | null> {
  const res = await fetch(`/api/groups/${documentId}?${LIST_QUERY}`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`fetchGroup ${res.status}`);
  }
  const json = await res.json().catch(() => ({}));
  return normalize(json?.data);
}

export interface GroupInput {
  name: string;
  level: GroupLevel;
  scheduleRrule?: string | null;
  activeFrom?: string | null;
  activeTo?: string | null;
  meetUrl?: string | null;
  memberIds?: string[];
}

export async function createGroup(input: GroupInput): Promise<Group> {
  const res = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: toPayload(input) }),
  });
  if (!res.ok) throw new Error(`createGroup ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const normalized = normalize(json?.data);
  if (!normalized) throw new Error("createGroup: malformed response");
  resetGroupsCache();
  return normalized;
}

export async function updateGroup(
  documentId: string,
  input: Partial<GroupInput>,
): Promise<Group> {
  const res = await fetch(`/api/groups/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: toPayload(input) }),
  });
  if (!res.ok) throw new Error(`updateGroup ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const normalized = normalize(json?.data);
  if (!normalized) throw new Error("updateGroup: malformed response");
  resetGroupsCache();
  return normalized;
}

export async function deleteGroup(documentId: string): Promise<void> {
  const res = await fetch(`/api/groups/${documentId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`deleteGroup ${res.status}`);
  resetGroupsCache();
}

function toPayload(input: Partial<GroupInput>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (input.name !== undefined) out.name = input.name;
  if (input.level !== undefined) out.level = input.level;
  if (input.scheduleRrule !== undefined) out.scheduleRrule = input.scheduleRrule;
  if (input.activeFrom !== undefined) out.activeFrom = input.activeFrom;
  if (input.activeTo !== undefined) out.activeTo = input.activeTo;
  if (input.meetUrl !== undefined) out.meetUrl = input.meetUrl;
  if (input.memberIds !== undefined) out.members = input.memberIds;
  return out;
}
