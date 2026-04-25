'use client';
import Image from 'next/image';
import { useMemo } from 'react';
import {
  getCharacterImage,
  getRegisteredCharacter,
  type CharacterEmotion,
} from '@/lib/characters';

/* ── Outfit slot (future) ─────────────────────────────────────────
   Each piece is a PNG with transparent background layered on top.
   Positions are % of the character container size.
─────────────────────────────────────────────────────────────────── */
export interface CharacterOutfit {
  hat?:     string;
  glasses?: string;
  scarf?:   string;
}

const OUTFIT_STYLE: Record<keyof CharacterOutfit, React.CSSProperties> = {
  hat:     { position: 'absolute', top: '-8%',  left: '50%', transform: 'translateX(-50%)', width: '55%', height: 'auto' },
  glasses: { position: 'absolute', top: '28%',  left: '50%', transform: 'translateX(-50%)', width: '65%', height: 'auto' },
  scarf:   { position: 'absolute', top: '60%',  left: '50%', transform: 'translateX(-50%)', width: '70%', height: 'auto' },
};

export interface CharacterAvatarProps {
  characterId: string;
  emotion?: CharacterEmotion;
  size?: number;
  animate?: boolean;
  outfit?: CharacterOutfit;
  className?: string;
  priority?: boolean;
}

/**
 * Stack-render all emotion variants and swap via opacity instead of
 * remounting the <Image>. This eliminates the flicker that used to happen
 * on emotion change (old code did `key={src}` which forced a remount; the
 * browser then re-decoded even cached PNGs and the speech bubble appeared
 * before the new sprite). All sprites are mounted once with `loading="eager"`,
 * so the first emotion swap has no network/decode lag.
 */
export default function CharacterAvatar({
  characterId = 'fox',
  emotion = 'idle',
  size = 160,
  animate = true,
  outfit,
  className = '',
  priority = false,
}: CharacterAvatarProps) {
  // Build the unique sprite list once per character. Multiple emotions can
  // map to the same file (e.g. happy/celebrate share hi.png) — we dedupe on
  // src so the DOM stays minimal.
  const sprites = useMemo(() => {
    const def = getRegisteredCharacter(characterId);
    const map = new Map<string, CharacterEmotion[]>();
    if (def) {
      for (const key of Object.keys(def.emotions) as CharacterEmotion[]) {
        const url = def.emotions[key];
        if (!url) continue;
        const existing = map.get(url);
        if (existing) existing.push(key);
        else map.set(url, [key]);
      }
    }
    if (map.size === 0) {
      // Defensive fallback — fetchCharacters() may not have run yet.
      const fallback = getCharacterImage(characterId, 'idle');
      map.set(fallback, ['idle']);
    }
    return Array.from(map, ([src, emotions]) => ({ src, emotions }));
  }, [characterId]);

  const activeSrc = getCharacterImage(characterId, emotion);

  return (
    <div
      className={`relative flex-shrink-0 ${animate ? 'tk-animate-float' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {sprites.map(({ src, emotions }) => {
        const isActive = src === activeSrc;
        return (
          <Image
            key={src}
            src={src}
            alt={isActive ? `${characterId} ${emotion}` : ''}
            aria-hidden={!isActive}
            fill
            className="object-contain select-none pointer-events-none transition-opacity duration-150 ease-out"
            style={{ opacity: isActive ? 1 : 0 }}
            draggable={false}
            priority={isActive && priority}
            // Non-active sprites still load eagerly so a later emotion swap
            // is instant. They share the same DOM position as the active one,
            // but explicit `loading=eager` skips the IntersectionObserver wait.
            loading={isActive ? undefined : 'eager'}
            sizes={`${size}px`}
            data-emotions={emotions.join(',')}
          />
        );
      })}

      {outfit && (Object.keys(outfit) as (keyof CharacterOutfit)[]).map(slot => {
        const url = outfit[slot];
        if (!url) return null;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slot}
            src={url}
            alt={slot}
            draggable={false}
            style={OUTFIT_STYLE[slot]}
          />
        );
      })}
    </div>
  );
}
