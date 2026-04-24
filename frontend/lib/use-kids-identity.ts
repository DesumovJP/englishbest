/**
 * Kids-identity derivation hook.
 *
 * Single client-side seam between the real session (`useSession()`) and the
 * Kids Zone UI's need for a display name + CEFR learning level.
 *
 * Level source-of-truth is `user-profile.level` (written by the onboarding
 * placement quiz via PATCH `/api/user-profile/me`). The `kidsProfile` record
 * carries gamification state only.
 *
 *   - `name`  ← `firstName ?? displayName ?? 'друже'`
 *   - `level` ← `profile.level ?? 'A1'`
 *
 * Fallback to A1 keeps anon/preview renders sensible; the moment a placement
 * completes, the session refresh updates the level everywhere.
 */
'use client';

import { useSession } from '@/lib/session-context';
import type { Level } from '@/lib/types';

export type KidsIdentity = {
  name: string;
  level: Level;
};

const LEVELS: readonly Level[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function asLevel(v: unknown): Level | null {
  return typeof v === 'string' && (LEVELS as readonly string[]).includes(v)
    ? (v as Level)
    : null;
}

export function useKidsIdentity(): KidsIdentity {
  const { session } = useSession();
  const profile = session?.profile as
    | { firstName?: string; displayName?: string; level?: string }
    | undefined;
  const name = profile?.firstName ?? profile?.displayName ?? 'друже';
  const level = asLevel(profile?.level) ?? 'A1';
  return { name, level };
}
