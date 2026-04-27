/**
 * 12-point grade — Ukrainian academic scoring scale.
 *
 * Internal scoring (BE) is 0..100; the kid / parent / teacher UI displays
 * the 12-point label everywhere. One source of truth lives here so the
 * conversion is identical across every surface (homework detail, parent
 * dashboard, motivation panel, mini-task result, attendance recap, etc.).
 *
 * Mapping is a piece-wise approximation of the standard MOH scale —
 * 1–3 початковий, 4–6 середній, 7–9 достатній, 10–12 високий. We bias
 * thresholds slightly so kids don't fall to the bottom band on a 60 %
 * homework: 60 % is mid-середній (4-5), not "1".
 */

export type GradeBand = 'low' | 'mid' | 'good' | 'high';

export interface GradeView {
  /** 1..12 integer point. */
  points: number;
  /** Educational band — drives the visual color tone. */
  band: GradeBand;
  /** "8/12" — pre-formatted for display. */
  label: string;
}

export function pointsForScore(score: number | null | undefined): number {
  if (score === null || score === undefined || !Number.isFinite(score)) return 0;
  const s = Math.max(0, Math.min(100, score));
  if (s >= 99) return 12;
  if (s >= 95) return 11;
  if (s >= 90) return 10;
  if (s >= 84) return 9;
  if (s >= 78) return 8;
  if (s >= 72) return 7;
  if (s >= 66) return 6;
  if (s >= 58) return 5;
  if (s >= 50) return 4;
  if (s >= 40) return 3;
  if (s >= 25) return 2;
  if (s > 0)   return 1;
  return 0;
}

export function bandForPoints(points: number): GradeBand {
  if (points >= 10) return 'high';
  if (points >= 7)  return 'good';
  if (points >= 4)  return 'mid';
  return 'low';
}

export function gradeView(score: number | null | undefined): GradeView {
  const points = pointsForScore(score);
  const band = bandForPoints(points);
  return {
    points,
    band,
    label: `${points}/12`,
  };
}

/** Star bucket (1..5) — kept for delicate kids surfaces that already use
 *  ⭐ visuals. Maps points 1–12 → stars 1–5. */
export function starsForPoints(points: number): number {
  if (points >= 11) return 5;
  if (points >= 9)  return 4;
  if (points >= 7)  return 3;
  if (points >= 4)  return 2;
  return 1;
}
