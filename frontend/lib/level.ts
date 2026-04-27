/**
 * Level computation mirror of `backend/src/lib/rewards.ts:computeLevel`.
 *
 * Quadratic curve so early levels arrive fast and high levels feel earned:
 *   level n requires 100·n² cumulative XP.
 *   level 1 → 100, level 2 → 400, level 3 → 900, level 5 → 2500,
 *   level 10 → 10 000, level 20 → 40 000.
 *
 * Keep this in sync with the BE — they MUST agree, or the kid sees a
 * different level than the server records and level-up animations
 * mis-fire.
 */

export interface LevelInfo {
  level: number;
  /** XP earned within the current level. Always [0..nextThreshold). */
  currentInLevel: number;
  /** Total XP needed to traverse the current level (next - prev threshold). */
  nextThreshold: number;
  /** 0..1 fill ratio, useful for progress bars. */
  progress: number;
}

export function levelFromXp(xp: number): LevelInfo {
  const safe = Math.max(0, xp);
  const level = Math.floor(Math.sqrt(safe / 100));
  const prev = 100 * level * level;
  const next = 100 * (level + 1) * (level + 1);
  const span = Math.max(1, next - prev);
  const currentInLevel = safe - prev;
  return {
    level,
    currentInLevel,
    nextThreshold: span,
    progress: Math.max(0, Math.min(1, currentInLevel / span)),
  };
}
