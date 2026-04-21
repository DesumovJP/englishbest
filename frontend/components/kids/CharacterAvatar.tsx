'use client';
import Image from 'next/image';
import { getCharacterImage, type CharacterEmotion } from '@/lib/characters';

/* ── Outfit slot (future) ─────────────────────────────────────────
   Each piece is a PNG with transparent background layered on top.
   Positions are % of the character container size.
─────────────────────────────────────────────────────────────────── */
export interface CharacterOutfit {
  hat?:     string; // image URL
  glasses?: string;
  scarf?:   string;
}

const OUTFIT_STYLE: Record<keyof CharacterOutfit, React.CSSProperties> = {
  hat:     { position: 'absolute', top: '-8%',  left: '50%', transform: 'translateX(-50%)', width: '55%', height: 'auto' },
  glasses: { position: 'absolute', top: '28%',  left: '50%', transform: 'translateX(-50%)', width: '65%', height: 'auto' },
  scarf:   { position: 'absolute', top: '60%',  left: '50%', transform: 'translateX(-50%)', width: '70%', height: 'auto' },
};

/* ── Props ────────────────────────────────────────────────────────── */
export interface CharacterAvatarProps {
  characterId: string;
  emotion?: CharacterEmotion;
  size?: number;
  animate?: boolean;
  outfit?: CharacterOutfit;
  className?: string;
  priority?: boolean;
}

/* ── Component ────────────────────────────────────────────────────── */
export default function CharacterAvatar({
  characterId = 'fox',
  emotion = 'idle',
  size = 160,
  animate = true,
  outfit,
  className = '',
  priority = false,
}: CharacterAvatarProps) {
  const src = getCharacterImage(characterId, emotion);

  return (
    <div
      className={`relative flex-shrink-0 ${animate ? 'tk-animate-float' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Character image — key={src} forces remount on emotion change */}
      <Image
        key={src}
        src={src}
        alt={`${characterId} ${emotion}`}
        fill
        className="object-contain select-none pointer-events-none"
        draggable={false}
        priority={priority}
        sizes={`${size}px`}
      />

      {/* Outfit overlays — rendered on top, future use */}
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
