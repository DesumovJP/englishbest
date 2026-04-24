/* ── Character system ──────────────────────────────────────────────
   All characters share the same emotion set.
   Each emotion maps to a PNG in public/characters/{id}/{file}.png
   Outfit overlays will be added as a second layer later.
─────────────────────────────────────────────────────────────────── */

export type CharacterEmotion =
  | 'idle'        // default/curious
  | 'happy'       // positive reaction
  | 'celebrate'   // lesson complete, achievement
  | 'sleepy'      // long idle, reminder
  | 'angry'       // error streak
  | 'sad'         // streak lost, fail
  | 'thinking'    // during exercise
  | 'surprised';  // new content, bonus

export type CharacterRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CharacterDef {
  id: string;
  nameUa: string;
  nameEn: string;
  rarity: CharacterRarity;
  description: string;
  /** Which emotion to use when the requested one has no image */
  fallbackEmotion: CharacterEmotion;
  /** emotion → path relative to /public (starts with /) */
  emotions: Partial<Record<CharacterEmotion, string>>;
}

/**
 * Runtime overrides for characters fetched from the server. When set,
 * `getCharacterImage` consults these first. This lets admins add new
 * characters in Strapi with emotion-map pointing at uploaded PNGs and
 * have them render in the FE without a redeploy.
 *
 * Populated by `lib/character-catalog.ts::fetchCharacters()` on mount.
 */
const SERVER_OVERRIDES: Record<string, CharacterDef> = {};

export function registerServerCharacter(def: CharacterDef): void {
  SERVER_OVERRIDES[def.id] = def;
}

export function getRegisteredCharacter(id: string): CharacterDef | undefined {
  return SERVER_OVERRIDES[id] ?? CHARACTERS[id];
}

export const CHARACTERS: Record<string, CharacterDef> = {
  fox: {
    id: 'fox',
    nameUa: 'Лисеня',
    nameEn: 'Fox',
    rarity: 'common',
    description: 'Допитливий рудий лисенок. Завжди готовий вчитися!',
    fallbackEmotion: 'idle',
    emotions: {
      idle:      '/characters/fox/idle.png',
      happy:     '/characters/fox/hi.png',
      celebrate: '/characters/fox/hi.png',
      sleepy:    '/characters/fox/so.png',
      angry:     '/characters/fox/angry.png',
      sad:       '/characters/fox/cry.png',
      thinking:  '/characters/fox/thinking.png',
      surprised: '/characters/fox/surprised.png',
    },
  },
  raccoon: {
    id: 'raccoon',
    nameUa: 'Єнотик',
    nameEn: 'Raccoon',
    rarity: 'rare',
    description: 'Хитрий єнотик із гострим розумом. Розблокуй і грай!',
    fallbackEmotion: 'idle',
    emotions: {
      idle:      '/characters/raccoon/idle.png',
      happy:     '/characters/raccoon/hi.png',
      celebrate: '/characters/raccoon/hi.png',
      sleepy:    '/characters/raccoon/so.png',
      angry:     '/characters/raccoon/angry.png',
      sad:       '/characters/raccoon/cry.png',
      thinking:  '/characters/raccoon/thinking.png',
      surprised: '/characters/raccoon/idle.png', // no wow image yet
    },
  },
};

/** Normalize legacy / unknown character ids → a known character. */
export function resolveCharacterId(characterId?: string): string {
  if (!characterId) return 'fox';
  if (SERVER_OVERRIDES[characterId] || CHARACTERS[characterId]) return characterId;
  // legacy values like "fox_default" or custom ids without image sets
  if (characterId.startsWith('raccoon')) return 'raccoon';
  return 'fox';
}

/** Returns the image path for a given character + emotion.
 *  Consults server-registered characters first, then static catalog.
 *  Falls back to the character's fallbackEmotion, then to fox/idle. */
export function getCharacterImage(
  characterId: string,
  emotion: CharacterEmotion = 'idle',
): string {
  const resolved = resolveCharacterId(characterId);
  const char = SERVER_OVERRIDES[resolved] ?? CHARACTERS[resolved];
  return (
    char.emotions[emotion] ??
    char.emotions[char.fallbackEmotion] ??
    '/characters/fox/idle.png'
  );
}

export const CHARACTER_LIST = Object.values(CHARACTERS);
