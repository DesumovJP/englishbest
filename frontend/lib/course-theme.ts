/**
 * Per-course visual identity — single source of truth for accent + gradient.
 *
 * Resolution order (most-specific wins):
 *   1. Course's admin-set fields (`accentColor`, `gradientFrom/To`,
 *      `coverImageUrl`) — set in Strapi admin per course.
 *   2. Static slug-keyed defaults below — for the v2 catalog so things
 *      look intentional out of the box.
 *   3. Generic green fallback — for any unknown slug.
 *
 * The same theme is used by:
 *   - the kids "Уроки" hero card
 *   - the kids course-detail hero
 *   - the course switcher pill (active state)
 *   - lesson tile cards (subtle accent on the current lesson)
 *
 * To re-skin a course in production, an admin sets `accentColor`,
 * `gradientFrom`, `gradientTo` (and optionally `coverImage`) in the
 * Strapi admin panel — no code change required.
 */
import type { Course } from './types';

export interface CourseTheme {
  /** Solid accent — used for borders, active states, secondary chips. */
  accent: string;
  /** Slightly darker shade — for shadow/press states. */
  accentDark: string;
  /** Hero background gradient. */
  gradient: string;
  /** Soft tint for "level-up" / category badges. */
  surfaceTint: string;
  /** Optional cover image URL — supersedes the gradient when set. */
  coverImageUrl?: string;
}

interface SlugDefault {
  accent: string;
  accentDark: string;
  from: string;
  to: string;
  tint: string;
}

const SLUG_DEFAULTS: Record<string, SlugDefault> = {
  'a-foundation':    { accent: '#16a34a', accentDark: '#15803d', from: '#22c55e', to: '#15803d', tint: '#dcfce7' },
  'a-my-world':      { accent: '#3b82f6', accentDark: '#1e40af', from: '#60a5fa', to: '#1e40af', tint: '#dbeafe' },
  'a-people-places': { accent: '#f97316', accentDark: '#c2410c', from: '#fb923c', to: '#c2410c', tint: '#ffedd5' },
  'b-stories':       { accent: '#a855f7', accentDark: '#7e22ce', from: '#c084fc', to: '#6b21a8', tint: '#f3e8ff' },
  'b-ideas':         { accent: '#06b6d4', accentDark: '#0891b2', from: '#22d3ee', to: '#0e7490', tint: '#cffafe' },
  'b-real-world':    { accent: '#f43f5e', accentDark: '#be123c', from: '#fb7185', to: '#be123c', tint: '#ffe4e6' },
};

const FALLBACK: SlugDefault = SLUG_DEFAULTS['a-foundation'];

function defaultsFor(slug: string | null | undefined): SlugDefault {
  if (!slug) return FALLBACK;
  return SLUG_DEFAULTS[slug] ?? FALLBACK;
}

/**
 * Resolve a CourseTheme from a Course record. Admin-set fields override
 * the slug defaults; pass null to get the fallback theme.
 */
export function themeForCourse(course: Course | null | undefined): CourseTheme {
  const slug = course?.slug ?? null;
  const d = defaultsFor(slug);
  const accent = course?.accentColor ?? d.accent;
  const accentDark = course?.accentColor ? darken(course.accentColor) : d.accentDark;
  const from = course?.gradientFrom ?? d.from;
  const to = course?.gradientTo ?? d.to;
  return {
    accent,
    accentDark,
    gradient: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    surfaceTint: d.tint,
    coverImageUrl: course?.coverImageUrl,
  };
}

/** Light shade-shift for a hex color. Crude but sufficient for press states. */
function darken(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 32);
  const g = Math.max(0, ((n >> 8) & 0xff) - 32);
  const b = Math.max(0, (n & 0xff) - 32);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
