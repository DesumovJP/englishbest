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

let _cache: ServerRoom[] | null = null;
let _inflight: Promise<ServerRoom[]> | null = null;

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

export async function fetchRooms(): Promise<ServerRoom[]> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;

  _inflight = fetch('/api/rooms', { cache: 'no-store' })
    .then(async (res) => {
      if (!res.ok) throw new Error(`fetchRooms failed (${res.status})`);
      const json: { data?: RoomDto[] } = await res.json();
      const rooms = (json.data ?? [])
        .map(normalize)
        .filter((x): x is ServerRoom => x !== null)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      _cache = rooms;
      return rooms;
    })
    .finally(() => {
      _inflight = null;
    });

  return _inflight;
}

export function resetRoomsCache(): void {
  _cache = null;
  _inflight = null;
}
