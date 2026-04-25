/**
 * character-catalog.ts — client-side loader for the server-managed
 * Character catalog.
 *
 * Characters live in Strapi (content-type `api::character.character`) and
 * are seeded on every boot from backend/src/seeds/08-characters.ts. The FE
 * fetches them via the `/api/characters` proxy (public, no auth needed).
 *
 * Side-effect: on successful fetch, each character's emotion map is
 * registered into `lib/characters.ts` so `CharacterAvatar` can render
 * admin-added characters without a redeploy.
 */
import {
  CharacterEmotion,
  CharacterRarity,
  registerServerCharacter,
} from './characters';
import { createCachedFetcher } from './data-cache';

export interface ServerCharacter {
  slug: string;
  nameEn: string;
  nameUa: string;
  description: string;
  rarity: CharacterRarity;
  priceCoins: number;
  fallbackEmotion: CharacterEmotion;
  emotions: Partial<Record<CharacterEmotion, string>>;
  orderIndex: number;
}

type CharacterDto = {
  slug?: string | null;
  nameEn?: string | null;
  nameUa?: string | null;
  description?: string | null;
  rarity?: string | null;
  priceCoins?: number | null;
  fallbackEmotion?: string | null;
  emotions?: Record<string, unknown> | null;
  orderIndex?: number | null;
};

const RARITIES = new Set<CharacterRarity>(['common', 'rare', 'epic', 'legendary']);
const EMOTIONS = new Set<CharacterEmotion>([
  'idle', 'happy', 'celebrate', 'sleepy', 'angry', 'sad', 'thinking', 'surprised',
]);

function pickRarity(v: string | null | undefined): CharacterRarity {
  if (v && RARITIES.has(v as CharacterRarity)) return v as CharacterRarity;
  return 'common';
}

function pickEmotion(v: string | null | undefined): CharacterEmotion {
  if (v && EMOTIONS.has(v as CharacterEmotion)) return v as CharacterEmotion;
  return 'idle';
}

function pickEmotionMap(raw: Record<string, unknown> | null | undefined): Partial<Record<CharacterEmotion, string>> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Partial<Record<CharacterEmotion, string>> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (EMOTIONS.has(k as CharacterEmotion) && typeof v === 'string' && v.length > 0) {
      out[k as CharacterEmotion] = v;
    }
  }
  return out;
}

function normalize(c: CharacterDto): ServerCharacter | null {
  if (!c?.slug || !c.nameEn) return null;
  return {
    slug: c.slug,
    nameEn: c.nameEn,
    nameUa: c.nameUa ?? c.nameEn,
    description: c.description ?? '',
    rarity: pickRarity(c.rarity),
    priceCoins: typeof c.priceCoins === 'number' ? c.priceCoins : 0,
    fallbackEmotion: pickEmotion(c.fallbackEmotion),
    emotions: pickEmotionMap(c.emotions ?? null),
    orderIndex: typeof c.orderIndex === 'number' ? c.orderIndex : 0,
  };
}

const cache = createCachedFetcher<ServerCharacter[]>({
  key: 'characters',
  ttlMs: 5 * 60 * 1000,
  fetch: async () => {
    const res = await fetch('/api/characters', { cache: 'no-store' });
    if (!res.ok) throw new Error(`fetchCharacters failed (${res.status})`);
    const json: { data?: CharacterDto[] } = await res.json();
    return (json.data ?? [])
      .map(normalize)
      .filter((x): x is ServerCharacter => x !== null)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },
  onFresh: (chars) => {
    for (const c of chars) {
      registerServerCharacter({
        id: c.slug,
        nameEn: c.nameEn,
        nameUa: c.nameUa,
        rarity: c.rarity,
        description: c.description,
        fallbackEmotion: c.fallbackEmotion,
        emotions: c.emotions,
      });
    }
  },
});

export const fetchCharacters = cache.get;
export const peekCharacters = cache.peek;
export const resetCharacterCatalogCache = cache.reset;
