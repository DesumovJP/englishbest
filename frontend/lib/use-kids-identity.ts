/**
 * Kids-identity derivation hook.
 *
 * Single client-side seam between the real session (`useSession()`) and the
 * Kids Zone UI's need for a display name + CEFR learning level. The session
 * exposes `profile.kidsProfile` as an untyped record (the Strapi component
 * has no TS counterpart yet), so this hook is the one place that narrows it
 * and applies conservative fallbacks.
 *
 * Phase B/E will replace this with a typed `kidsProfile` + user-inventory
 * derivation. Until then:
 *   - `name` ← `firstName ?? displayName ?? 'друже'`
 *   - `level` ← `kidsProfile.currentLevel ?? 'A1'`
 *
 * The fallbacks are intentionally permissive so anon/preview renders still
 * make sense; gated content simply shows at A1 until a real profile loads.
 */
'use client';

import { useSession } from '@/lib/session-context';
import type { Level } from '@/lib/types';

export type KidsIdentity = {
  name: string;
  level: Level;
};

export function useKidsIdentity(): KidsIdentity {
  const { session } = useSession();
  const profile = session?.profile;
  const name = profile?.firstName ?? profile?.displayName ?? 'друже';
  const kidsProfile = profile?.kidsProfile as
    | { currentLevel?: Level }
    | null
    | undefined;
  const level = kidsProfile?.currentLevel ?? 'A1';
  return { name, level };
}
