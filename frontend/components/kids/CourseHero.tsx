/**
 * CourseHero — full-width gradient hero used on /kids/school (Уроки tab)
 * and /kids/library/[slug] (course detail).
 *
 * Visual identity comes from `themeForCourse(course)` — admin-editable in
 * Strapi. If the course has a `coverImage`, it covers the gradient at
 * 50% opacity for an extra-rich feel; otherwise the gradient stands
 * alone with a subtle dot-pattern overlay.
 *
 * Composes children below the title block, so the caller decides whether
 * to render a "Continue" button, progress ring, or reward chips.
 */
'use client';
import type { CSSProperties, ReactNode } from 'react';
import type { CourseTheme } from '@/lib/course-theme';

interface CourseHeroProps {
  theme: CourseTheme;
  /** Tiny pre-title pill, e.g. "УРОК 6 · 8" or "A1 · ДІТИ". */
  eyebrow?: string;
  /** Big focal emoji shown above the title (lesson-type icon or course icon). */
  focalEmoji?: string;
  title: string;
  subtitle?: string;
  /** Slot below the title — reward chips, progress ring, etc. */
  children?: ReactNode;
  /** Optional FOX character corner stamp (uses /characters/fox/hi.png). */
  showFox?: boolean;
  className?: string;
}

const DOT_PATTERN_BG =
  'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)';

export function CourseHero({
  theme,
  eyebrow,
  focalEmoji,
  title,
  subtitle,
  children,
  showFox = true,
  className = '',
}: CourseHeroProps) {
  const bg: CSSProperties = theme.coverImageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%), url(${theme.coverImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: theme.gradient };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl text-white shadow-card-md ${className}`.trim()}
      style={bg}
    >
      {/* Subtle dot pattern adds texture without competing with content. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{ backgroundImage: DOT_PATTERN_BG, backgroundSize: '16px 16px' }}
      />

      {showFox && (
        <img
          src="/characters/fox/hi.png"
          alt=""
          aria-hidden
          width={96}
          height={96}
          className="absolute -bottom-2 -right-2 sm:bottom-2 sm:right-2 w-20 h-20 sm:w-24 sm:h-24 object-contain pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
        />
      )}

      <div className="relative px-6 py-7 sm:px-8 sm:py-8 flex flex-col gap-3 min-h-[260px]">
        {eyebrow && (
          <span className="self-start inline-block rounded-full px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/25 font-black text-[10.5px] tracking-[0.12em] uppercase">
            {eyebrow}
          </span>
        )}

        {focalEmoji && (
          <div
            aria-hidden
            className="self-start w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-[32px] leading-none mt-1"
          >
            {focalEmoji}
          </div>
        )}

        <h1 className="font-black tracking-tight text-[26px] sm:text-[30px] leading-[1.1] mt-1 max-w-[80%]">
          {title}
        </h1>

        {subtitle && (
          <p className="font-medium text-[14px] sm:text-[15px] text-white/85 leading-snug max-w-[80%]">
            {subtitle}
          </p>
        )}

        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}
