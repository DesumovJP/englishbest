'use client';

/**
 * Reusable cover thumbnail for material cards (course / lesson / vocab).
 *
 * Behaviour:
 *   - When `url` resolves to a non-null absolute URL → renders the image with
 *     `object-cover`, `loading="lazy"`, alt = title-or-fallback.
 *   - Otherwise → renders a colored placeholder with either the supplied
 *     emoji (vocab/course) or the first letter (lesson).
 *
 * The component absolutizes via `lib/normalize.mediaUrl` so callers may pass
 * raw URLs straight from API responses (DO Spaces returns absolute, local
 * disk returns `/uploads/...`).
 */
import { mediaUrl } from '@/lib/normalize';

type Aspect = 'video' | 'square' | 'portrait';
type ThumbSize = 'sm' | 'md' | 'lg';

interface CoverThumbnailProps {
  url?: string | null;
  emoji?: string | null;
  /** First-letter fallback when emoji isn't supplied (e.g. lessons). */
  letter?: string | null;
  alt?: string;
  aspect?: Aspect;
  size?: ThumbSize;
  className?: string;
}

const ASPECT_CLS: Record<Aspect, string> = {
  video:    'aspect-video',
  square:   'aspect-square',
  portrait: 'aspect-[3/4]',
};

const SIZE_CLS: Record<ThumbSize, string> = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
};

const FALLBACK_FONT: Record<ThumbSize, string> = {
  sm: 'text-[20px]',
  md: 'text-[28px]',
  lg: 'text-[36px]',
};

export function CoverThumbnail({
  url,
  emoji,
  letter,
  alt = '',
  aspect = 'video',
  size = 'md',
  className,
}: CoverThumbnailProps) {
  const resolved = mediaUrl(url ?? undefined);

  return (
    <div
      className={`${ASPECT_CLS[aspect]} ${SIZE_CLS[size]} relative overflow-hidden bg-surface-muted flex items-center justify-center ${
        className ?? ''
      }`}
    >
      {resolved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : emoji ? (
        <span aria-hidden className={`${FALLBACK_FONT[size]} leading-none`}>
          {emoji}
        </span>
      ) : letter ? (
        <span
          aria-hidden
          className={`${FALLBACK_FONT[size]} font-black uppercase text-ink-muted`}
        >
          {letter}
        </span>
      ) : (
        <svg
          aria-hidden
          className="w-1/3 h-1/3 text-ink-faint"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )}
    </div>
  );
}

interface AvatarThumbnailProps {
  url?: string | null;
  emoji?: string | null;
  letter?: string | null;
  alt?: string;
  /** pixel size of the square thumbnail (default 40). */
  size?: number;
  className?: string;
}

/**
 * Compact square thumbnail variant — used in list rows where each item
 * carries an emoji icon today (course list, vocab card top-left).
 */
export function AvatarThumbnail({
  url,
  emoji,
  letter,
  alt = '',
  size = 40,
  className,
}: AvatarThumbnailProps) {
  const resolved = mediaUrl(url ?? undefined);
  const px = `${size}px`;
  return (
    <div
      style={{ width: px, height: px }}
      className={`rounded-lg overflow-hidden bg-surface-muted flex-shrink-0 flex items-center justify-center ${
        className ?? ''
      }`}
    >
      {resolved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : emoji ? (
        <span aria-hidden className="text-[20px] leading-none">{emoji}</span>
      ) : letter ? (
        <span
          aria-hidden
          className="text-[14px] font-black uppercase text-ink-muted"
        >
          {letter}
        </span>
      ) : null}
    </div>
  );
}
