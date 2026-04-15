'use client';
/**
 * CharacterDisplay — thin wrapper kept for backwards compatibility.
 * New code should use <CharacterAvatar> directly.
 *
 * Maps the old CompanionMood → CharacterEmotion and renders
 * CharacterAvatar with the real PNG assets.
 */
import CharacterAvatar from '@/components/kids/CharacterAvatar';
import type { CharacterEmotion } from '@/lib/characters';

type LegacyMood =
  | 'idle' | 'happy' | 'sad' | 'celebrate'
  | 'excited' | 'sleepy' | 'surprised' | 'love' | 'angry' | 'cool';

type LegacyAnimal = 'fox' | 'raccoon' | 'owl' | 'bear' | string;

const MOOD_MAP: Record<LegacyMood, CharacterEmotion> = {
  idle:      'idle',
  happy:     'happy',
  sad:       'sad',
  celebrate: 'celebrate',
  excited:   'happy',
  sleepy:    'sleepy',
  surprised: 'surprised',
  love:      'happy',
  angry:     'angry',
  cool:      'idle',
};

interface CharacterDisplayProps {
  characterId?: string;
  animalFallback?: LegacyAnimal;
  mood?: LegacyMood;
  outfit?: { hat?: string; glasses?: string; scarf?: string; bag?: string };
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function CharacterDisplay({
  characterId,
  animalFallback = 'fox',
  mood = 'idle',
  outfit,
  size = 120,
  className = '',
  animate = true,
}: CharacterDisplayProps) {
  // Resolve character: prefer explicit characterId, fall back to animalFallback
  const resolvedId = characterId && characterId !== 'fox_default' ? characterId : animalFallback;
  const emotion: CharacterEmotion = MOOD_MAP[mood] ?? 'idle';

  return (
    <CharacterAvatar
      characterId={resolvedId}
      emotion={emotion}
      size={size}
      animate={animate}
      className={className}
      outfit={outfit ? { hat: outfit.hat, glasses: outfit.glasses, scarf: outfit.scarf } : undefined}
    />
  );
}
