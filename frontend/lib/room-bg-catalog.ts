/**
 * FE-side mirror of the BE room-background catalog
 * (`backend/src/lib/room-backgrounds.ts`).
 *
 * Slugs + prices MUST stay in sync with the server — server owns
 * validation + debit; this file just adds the visual CSS each slug
 * renders to. Keep the array in the same order so default (index 0)
 * matches the server's `DEFAULT_ROOM_BACKGROUND_SLUG`.
 */

export interface RoomBgCatalogEntry {
  slug: string;
  nameEn: string;
  nameUa: string;
  price: number;
  /** CSS `background` value — gradient string or `url(...) ... / cover`. */
  bgValue: string;
}

export const ROOM_BG_CATALOG: ReadonlyArray<RoomBgCatalogEntry> = [
  { slug: 'bg_default', nameEn: 'Forest Default', nameUa: 'Ліс (стандарт)',  price: 0,   bgValue: "url('/kids-dashboard-bg.jpg') center bottom / cover" },
  { slug: 'bg_sunset',  nameEn: 'Sunset Sky',     nameUa: 'Захід сонця',     price: 120, bgValue: 'linear-gradient(160deg, #FF6B35 0%, #F7C59F 35%, #FFBE76 65%, #FF6B6B 100%)' },
  { slug: 'bg_ocean',   nameEn: 'Deep Ocean',     nameUa: 'Глибокий океан',  price: 140, bgValue: 'linear-gradient(180deg, #0A2342 0%, #126872 40%, #1B998B 75%, #2EC4B6 100%)' },
  { slug: 'bg_space',   nameEn: 'Space Night',    nameUa: 'Космічна ніч',    price: 200, bgValue: 'linear-gradient(160deg, #0D0D2B 0%, #1A1A4E 30%, #2D1B69 60%, #11002F 100%)' },
  { slug: 'bg_candy',   nameEn: 'Candy Land',     nameUa: 'Країна цукерок',  price: 150, bgValue: 'linear-gradient(135deg, #FF9FF3 0%, #FFEAA7 25%, #74B9FF 50%, #A29BFE 75%, #FD79A8 100%)' },
  { slug: 'bg_forest',  nameEn: 'Magic Forest',   nameUa: 'Чарівний ліс',    price: 180, bgValue: 'linear-gradient(160deg, #0A3D0A 0%, #1B5E20 30%, #2E7D32 55%, #4CAF50 80%, #A5D6A7 100%)' },
  { slug: 'bg_arctic',  nameEn: 'Arctic Snow',    nameUa: 'Арктика',         price: 130, bgValue: 'linear-gradient(180deg, #B3E5FC 0%, #E1F5FE 40%, #F8FBFF 70%, #FFFFFF 100%)' },
  { slug: 'bg_volcano', nameEn: 'Volcano',        nameUa: 'Вулкан',          price: 220, bgValue: 'linear-gradient(180deg, #1A0000 0%, #4A0000 25%, #8B1A00 55%, #D32F2F 80%, #FF6B35 100%)' },
  { slug: 'bg_rainbow', nameEn: 'Rainbow Dream',  nameUa: 'Веселковий сон',  price: 300, bgValue: 'linear-gradient(135deg, #FF0080 0%, #FF8C00 16%, #FFD700 33%, #00CC44 50%, #0088FF 66%, #8800FF 83%, #FF0080 100%)' },
];

export const DEFAULT_ROOM_BG_SLUG = ROOM_BG_CATALOG[0]?.slug ?? 'bg_default';

const BY_SLUG = new Map(ROOM_BG_CATALOG.map((bg) => [bg.slug, bg]));

export function findRoomBg(slug: string | null | undefined): RoomBgCatalogEntry | null {
  if (!slug) return null;
  return BY_SLUG.get(slug) ?? null;
}

/** Resolve slug → CSS string. Falls back to default when slug is unknown. */
export function bgCssForSlug(slug: string | null | undefined): string {
  return (findRoomBg(slug) ?? ROOM_BG_CATALOG[0])?.bgValue
    ?? "url('/kids-dashboard-bg.jpg') center bottom / cover";
}
