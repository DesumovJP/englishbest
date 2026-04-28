/**
 * User-profile /me loader + self-update mutator.
 *
 * Hits `/api/user-profile/me` which backend scopes to the caller's own
 * user-profile. Write allow-list mirrors the BE controller's `buildPatch`.
 */

export type UserRole = 'kids' | 'adult' | 'teacher' | 'parent' | 'admin';
export type Locale = 'uk' | 'en' | 'ru';

export interface UserProfile {
  documentId: string;
  role: UserRole;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  locale: Locale;
  timezone: string;
  marketingOptIn: boolean;
  email: string | null;
  avatarUrl: string | null;
  organization: { name: string; slug: string } | null;
}

function nullableStr(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function pickLocale(v: unknown): Locale {
  return v === 'uk' || v === 'en' || v === 'ru' ? v : 'uk';
}

function normalize(raw: any): UserProfile | null {
  if (!raw?.documentId || typeof raw.role !== 'string') return null;
  const role = (['kids', 'adult', 'teacher', 'parent', 'admin'].includes(raw.role)
    ? raw.role
    : 'kids') as UserRole;

  const avatarUrl = typeof raw.avatar?.url === 'string' ? raw.avatar.url : null;
  const org = raw.organization && typeof raw.organization === 'object'
    ? {
        name: typeof raw.organization.name === 'string' ? raw.organization.name : '',
        slug: typeof raw.organization.slug === 'string' ? raw.organization.slug : '',
      }
    : null;

  return {
    documentId: String(raw.documentId),
    role,
    firstName: typeof raw.firstName === 'string' ? raw.firstName : '',
    lastName: nullableStr(raw.lastName),
    displayName: nullableStr(raw.displayName),
    phone: nullableStr(raw.phone),
    dateOfBirth: nullableStr(raw.dateOfBirth),
    locale: pickLocale(raw.locale),
    timezone: typeof raw.timezone === 'string' && raw.timezone.length > 0 ? raw.timezone : 'Europe/Kyiv',
    marketingOptIn: Boolean(raw.marketingOptIn),
    email: nullableStr(raw.user?.email),
    avatarUrl,
    organization: org,
  };
}

export async function fetchMyProfile(): Promise<UserProfile | null> {
  const res = await fetch('/api/user-profile/me', { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchMyProfile ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return normalize(json?.data ?? json);
}

export interface UserProfilePatch {
  firstName?: string;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  locale?: Locale;
  timezone?: string;
  marketingOptIn?: boolean;
  /** Avatar media id (number) — pass `null` to detach. */
  avatar?: number | null;
}

export async function updateMyProfile(patch: UserProfilePatch): Promise<UserProfile> {
  const res = await fetch('/api/user-profile/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: patch }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const message =
      (errBody && typeof errBody === 'object' && 'error' in errBody
        ? (errBody as { error?: { message?: string } }).error?.message
        : undefined) ?? `updateMyProfile ${res.status}`;
    throw new Error(message);
  }
  const json = await res.json().catch(() => ({}));
  const n = normalize(json?.data ?? json);
  if (!n) throw new Error('updateMyProfile: malformed response');
  return n;
}
