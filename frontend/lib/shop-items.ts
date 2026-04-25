/**
 * shop-items.ts — client-side loader for the server-managed shop catalog.
 *
 * Items live in Strapi (content-type `api::shop-item.shop-item`) and are
 * seeded on every boot from backend/src/seeds/05-shop-items.ts. The FE
 * fetches them via the `/api/shop-items` proxy (public, no auth needed).
 *
 * Side-effect: on successful fetch, each item is registered into
 * `lib/shop-catalog.ts` so dashboard/LessonCharacter lookups by slug keep
 * working for admin-added items without a redeploy.
 */
import type { Level } from '@/lib/types';
import { createCachedFetcher } from './data-cache';
import {
  registerServerShopItem,
  type CatalogShopItem,
  type ShopItemCategory,
} from './shop-catalog';

export type ShopItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface ServerShopItem {
  slug: string;
  nameEn: string;
  nameUa: string;
  phonetic: string;
  emoji: string;
  category: ShopItemCategory;
  rarity: ShopItemRarity;
  price: number;
  levelRequired: Level;
  isNew: boolean;
  slotOffset: { top: string; left: string } | null;
  imageIdle: string | null;
  imageHover: string | null;
  imageActive: string | null;
}

type MediaDto = { url?: string | null } | null | undefined;

type ShopItemDto = {
  slug?: string | null;
  nameEn?: string | null;
  nameUa?: string | null;
  phonetic?: string | null;
  emoji?: string | null;
  category?: string | null;
  rarity?: string | null;
  price?: number | null;
  levelRequired?: string | null;
  isNew?: boolean | null;
  slotOffset?: { top?: string; left?: string } | null;
  imageIdle?: MediaDto;
  imageHover?: MediaDto;
  imageActive?: MediaDto;
};

const CATEGORIES = new Set<ShopItemCategory>(['furniture', 'decor', 'outfit', 'special']);
const RARITIES = new Set<ShopItemRarity>(['common', 'uncommon', 'rare', 'legendary']);
const LEVELS = new Set<Level>(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

function pickCategory(v: string | null | undefined): ShopItemCategory {
  return v && CATEGORIES.has(v as ShopItemCategory) ? (v as ShopItemCategory) : 'decor';
}

function pickRarity(v: string | null | undefined): ShopItemRarity {
  return v && RARITIES.has(v as ShopItemRarity) ? (v as ShopItemRarity) : 'common';
}

function pickLevel(v: string | null | undefined): Level {
  return v && LEVELS.has(v as Level) ? (v as Level) : 'A1';
}

function mediaUrl(m: MediaDto): string | null {
  if (!m || typeof m !== 'object') return null;
  return typeof m.url === 'string' && m.url.length > 0 ? m.url : null;
}

function pickSlotOffset(raw: ShopItemDto['slotOffset']): { top: string; left: string } | null {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.top !== 'string' || typeof raw.left !== 'string') return null;
  return { top: raw.top, left: raw.left };
}

function normalize(d: ShopItemDto): ServerShopItem | null {
  if (!d?.slug || !d.nameEn) return null;
  return {
    slug: d.slug,
    nameEn: d.nameEn,
    nameUa: d.nameUa ?? d.nameEn,
    phonetic: d.phonetic ?? '',
    emoji: d.emoji ?? '✨',
    category: pickCategory(d.category),
    rarity: pickRarity(d.rarity),
    price: typeof d.price === 'number' ? d.price : 0,
    levelRequired: pickLevel(d.levelRequired),
    isNew: Boolean(d.isNew),
    slotOffset: pickSlotOffset(d.slotOffset),
    imageIdle: mediaUrl(d.imageIdle),
    imageHover: mediaUrl(d.imageHover),
    imageActive: mediaUrl(d.imageActive),
  };
}

function toCatalogShape(s: ServerShopItem): CatalogShopItem {
  return {
    id: s.slug,
    emoji: s.emoji,
    nameEn: s.nameEn,
    phonetic: s.phonetic,
    nameUa: s.nameUa,
    price: s.price,
    category: s.category,
    levelRequired: s.levelRequired,
    isNew: s.isNew,
    imageIdle: s.imageIdle,
    imageHover: s.imageHover,
    imageActive: s.imageActive,
  };
}

const cache = createCachedFetcher<ServerShopItem[]>({
  key: 'shop-items',
  ttlMs: 5 * 60 * 1000,
  fetch: async () => {
    const res = await fetch('/api/shop-items', { cache: 'no-store' });
    if (!res.ok) throw new Error(`fetchShopItems failed (${res.status})`);
    const json: { data?: ShopItemDto[] } = await res.json();
    return (json.data ?? [])
      .map(normalize)
      .filter((x): x is ServerShopItem => x !== null)
      .sort((a, b) => a.price - b.price);
  },
  onFresh: (items) => {
    for (const it of items) {
      registerServerShopItem(toCatalogShape(it), it.slotOffset);
    }
  },
});

export const fetchShopItems = cache.get;
export const peekShopItems = cache.peek;
export const resetShopItemsCache = cache.reset;
