/**
 * rooms.ts — client-side loader for the server-managed Room catalog.
 *
 * Rooms live in Strapi (content-type `api::room.room`) and are seeded on
 * every boot from backend/src/seeds/09-rooms.ts. The FE fetches them via
 * the `/api/rooms` proxy (public, no auth needed).
 *
 * Shape matches the Strapi schema; callers should treat `background` as an
 * opaque CSS shorthand (url('...') or linear-gradient(...)).
 */

export interface ServerRoom {
  slug: string;
  nameEn: string;
  nameUa: string;
  coinsRequired: number;
  background: string;
  iconEmoji: string;
  orderIndex: number;
}

type RoomDto = {
  slug?: string | null;
  nameEn?: string | null;
  nameUa?: string | null;
  coinsRequired?: number | null;
  background?: string | null;
  iconEmoji?: string | null;
  orderIndex?: number | null;
};

import { createCachedFetcher } from './data-cache';

function normalize(r: RoomDto): ServerRoom | null {
  if (!r?.slug || !r.nameEn) return null;
  return {
    slug: r.slug,
    nameEn: r.nameEn,
    nameUa: r.nameUa ?? r.nameEn,
    coinsRequired: typeof r.coinsRequired === 'number' ? r.coinsRequired : 0,
    background: r.background ?? 'linear-gradient(160deg, #f7971e 0%, #ffd200 100%)',
    iconEmoji: r.iconEmoji ?? '🏠',
    orderIndex: typeof r.orderIndex === 'number' ? r.orderIndex : 0,
  };
}

const cache = createCachedFetcher<ServerRoom[]>({
  key: 'rooms',
  // Catalog data — admin-edited rarely. 5 min stale window keeps long
  // sessions reasonably fresh without per-navigation refetch.
  ttlMs: 5 * 60 * 1000,
  fetch: async () => {
    const res = await fetch('/api/rooms', { cache: 'no-store' });
    if (!res.ok) throw new Error(`fetchRooms failed (${res.status})`);
    const json: { data?: RoomDto[] } = await res.json();
    return (json.data ?? [])
      .map(normalize)
      .filter((x): x is ServerRoom => x !== null)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

export const fetchRooms = cache.get;
export const peekRooms = cache.peek;
export const resetRoomsCache = cache.reset;
