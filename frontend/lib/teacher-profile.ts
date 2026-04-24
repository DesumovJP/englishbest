/**
 * Teacher-profile /me loader + self-update mutator.
 *
 * Hits `/api/teacher-profile/me` which backend scopes to the caller's own
 * teacher-profile. Write allow-list mirrors the BE controller's `buildPatch`.
 */

export interface TeacherProfile {
  documentId: string;
  bio: string | null;
  specializations: string[];
  languagesSpoken: string[];
  yearsExperience: number | null;
  hourlyRate: number | null;
  videoMeetUrl: string | null;
  maxStudents: number | null;
  acceptsTrial: boolean;
  publicSlug: string | null;
  verified: boolean;
  rating: number | null;
  ratingCount: number;
}

function nullableStr(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.length > 0);
}

function toIntOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Math.trunc(Number(v));
  return null;
}

function toDecimalOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v !== '' && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function normalize(raw: any): TeacherProfile | null {
  if (!raw?.documentId) return null;
  return {
    documentId: String(raw.documentId),
    bio: nullableStr(raw.bio),
    specializations: toStringArray(raw.specializations),
    languagesSpoken: toStringArray(raw.languagesSpoken),
    yearsExperience: toIntOrNull(raw.yearsExperience),
    hourlyRate: toIntOrNull(raw.hourlyRate),
    videoMeetUrl: nullableStr(raw.videoMeetUrl),
    maxStudents: toIntOrNull(raw.maxStudents),
    acceptsTrial: Boolean(raw.acceptsTrial),
    publicSlug: nullableStr(raw.publicSlug),
    verified: Boolean(raw.verified),
    rating: toDecimalOrNull(raw.rating),
    ratingCount: toIntOrNull(raw.ratingCount) ?? 0,
  };
}

export async function fetchMyTeacherProfile(): Promise<TeacherProfile | null> {
  const res = await fetch('/api/teacher-profile/me', { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchMyTeacherProfile ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return normalize(json?.data ?? json);
}

export interface TeacherProfilePatch {
  bio?: string | null;
  specializations?: string[];
  languagesSpoken?: string[];
  yearsExperience?: number;
  hourlyRate?: number;
  videoMeetUrl?: string | null;
  maxStudents?: number;
  acceptsTrial?: boolean;
  publicSlug?: string | null;
}

export async function updateMyTeacherProfile(
  patch: TeacherProfilePatch,
): Promise<TeacherProfile> {
  const res = await fetch('/api/teacher-profile/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: patch }),
  });
  if (!res.ok) throw new Error(`updateMyTeacherProfile ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data ?? json);
  if (!n) throw new Error('updateMyTeacherProfile: malformed response');
  return n;
}
