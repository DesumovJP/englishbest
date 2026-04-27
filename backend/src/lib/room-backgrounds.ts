/**
 * Server-trusted room-background catalog.
 *
 * Source of truth for slugs + prices. Visual values (gradients / image
 * URLs) live in the FE shop catalog because they're pure rendering — the
 * server doesn't care how a "Volcano" background looks, only that the
 * slug exists and what it costs.
 *
 * Add new backgrounds HERE and in the FE catalog at
 * `frontend/app/(kids)/kids/shop/page.tsx → BACKGROUNDS`. Slugs MUST
 * match across the two files.
 */

export interface RoomBackground {
  slug: string;
  price: number;
}

export const ROOM_BACKGROUND_CATALOG: ReadonlyArray<RoomBackground> = [
  { slug: 'bg_default', price: 0 },
  { slug: 'bg_sunset',  price: 120 },
  { slug: 'bg_ocean',   price: 140 },
  { slug: 'bg_space',   price: 200 },
  { slug: 'bg_candy',   price: 150 },
  { slug: 'bg_forest',  price: 180 },
  { slug: 'bg_arctic',  price: 130 },
  { slug: 'bg_volcano', price: 220 },
  { slug: 'bg_rainbow', price: 300 },
];

const BY_SLUG: ReadonlyMap<string, RoomBackground> = new Map(
  ROOM_BACKGROUND_CATALOG.map((bg) => [bg.slug, bg]),
);

export function findRoomBackground(slug: string): RoomBackground | null {
  return BY_SLUG.get(slug) ?? null;
}
