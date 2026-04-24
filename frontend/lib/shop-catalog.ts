/**
 * shop-catalog.ts
 * In-memory shop-item registry, used for slug → (emoji, slotOffset, name)
 * lookups by the dashboard's placed-items layer and LessonCharacter's
 * equipped-overlay. Populated from:
 *   - a small set of canonical seed-matching rows below (for first paint /
 *     unauth'd FE builds where the catalog hasn't been fetched yet), and
 *   - `registerServerShopItem()` calls emitted by `lib/shop-items.ts` once
 *     the server catalog has been fetched (overrides seed rows by slug).
 *
 * Keep this file side-effect-free otherwise — the registry is the
 * authoritative lookup for all consumers.
 */

import type { Level } from "@/lib/types";

export type ShopItemCategory = "furniture" | "decor" | "outfit" | "special";

export interface CatalogShopItem {
  id: string;
  emoji: string;
  nameEn: string;
  phonetic: string;
  nameUa: string;
  price: number;
  category: ShopItemCategory;
  levelRequired: Level;
  isNew?: boolean;
  /** Optional CDN URLs — when present, consumers should prefer images over emoji. */
  imageIdle?: string | null;
  imageHover?: string | null;
  imageActive?: string | null;
}

const SEED_ITEMS: CatalogShopItem[] = [
  { id: "sofa",       emoji: "🛋️", nameEn: "Sofa",           phonetic: "/ˈsoʊfə/",            nameUa: "Диван",           price: 80,  category: "furniture", levelRequired: "A1" },
  { id: "wardrobe",   emoji: "🪞",  nameEn: "Wardrobe",       phonetic: "/ˈwɔːrdrōb/",         nameUa: "Шафа",            price: 120, category: "furniture", levelRequired: "A2", isNew: true },
  { id: "bookshelf",  emoji: "📚", nameEn: "Bookshelf",       phonetic: "/ˈbʊkʃɛlf/",          nameUa: "Книжкова полиця", price: 60,  category: "furniture", levelRequired: "A1" },
  { id: "armchair",   emoji: "🪑", nameEn: "Armchair",        phonetic: "/ˈɑːrmtʃɛr/",         nameUa: "Крісло",          price: 90,  category: "furniture", levelRequired: "A1" },
  { id: "desk",       emoji: "🖥️", nameEn: "Desk",            phonetic: "/dɛsk/",              nameUa: "Письмовий стіл",  price: 110, category: "furniture", levelRequired: "A1" },
  { id: "lamp",       emoji: "🪔", nameEn: "Floor Lamp",      phonetic: "/flɔːr læmp/",        nameUa: "Торшер",          price: 45,  category: "furniture", levelRequired: "A1" },
  { id: "globe",      emoji: "🌍", nameEn: "Globe",           phonetic: "/ɡloʊb/",             nameUa: "Глобус",          price: 40,  category: "decor",     levelRequired: "A1" },
  { id: "aquarium",   emoji: "🐠", nameEn: "Aquarium",        phonetic: "/əˈkwɛriəm/",         nameUa: "Акваріум",        price: 150, category: "decor",     levelRequired: "A2", isNew: true },
  { id: "rainbow",    emoji: "🌈", nameEn: "Rainbow Poster",  phonetic: "/ˈreɪnboʊ ˈpoʊstər/", nameUa: "Постер-веселка",  price: 30,  category: "decor",     levelRequired: "A1" },
  { id: "clock",      emoji: "⏰", nameEn: "Clock",           phonetic: "/klɒk/",              nameUa: "Годинник",        price: 50,  category: "decor",     levelRequired: "A1" },
  { id: "plant",      emoji: "🪴", nameEn: "Plant",           phonetic: "/plænt/",             nameUa: "Рослина",         price: 35,  category: "decor",     levelRequired: "A1" },
  { id: "hat",        emoji: "🎩", nameEn: "Top Hat",         phonetic: "/tɒp hæt/",           nameUa: "Циліндр",         price: 70,  category: "outfit",    levelRequired: "A1" },
  { id: "scarf",      emoji: "🧣", nameEn: "Scarf",           phonetic: "/skɑːrf/",            nameUa: "Шарф",            price: 45,  category: "outfit",    levelRequired: "A1" },
  { id: "glasses",    emoji: "🕶️", nameEn: "Sunglasses",      phonetic: "/ˈsʌnɡlæsɪz/",       nameUa: "Окуляри",         price: 55,  category: "outfit",    levelRequired: "A2", isNew: true },
  { id: "crown",      emoji: "👑", nameEn: "Crown",           phonetic: "/kraʊn/",             nameUa: "Корона",          price: 200, category: "outfit",    levelRequired: "B1" },
  { id: "backpack",   emoji: "🎒", nameEn: "Backpack",        phonetic: "/ˈbækpæk/",          nameUa: "Рюкзак",          price: 65,  category: "outfit",    levelRequired: "A1" },
  { id: "trophy",     emoji: "🏆", nameEn: "Trophy",          phonetic: "/ˈtroʊfi/",           nameUa: "Кубок",           price: 300, category: "special",   levelRequired: "A2" },
  { id: "rocket",     emoji: "🚀", nameEn: "Rocket",          phonetic: "/ˈrɒkɪt/",            nameUa: "Ракета",          price: 250, category: "special",   levelRequired: "B1" },
  { id: "unicorn",    emoji: "🦄", nameEn: "Unicorn",         phonetic: "/ˈjuːnɪkɔːrn/",       nameUa: "Єдиноріг",        price: 500, category: "special",   levelRequired: "B2" },
  { id: "dragon-egg", emoji: "🥚", nameEn: "Dragon Egg",      phonetic: "/ˈdræɡən ɛɡ/",        nameUa: "Яйце дракона",    price: 400, category: "special",   levelRequired: "B1" },
];

const SEED_SLOTS: Record<string, { top: string; left: string }> = {
  hat:      { top: "-14%", left: "50%" },
  crown:    { top: "-14%", left: "50%" },
  glasses:  { top: "26%",  left: "50%" },
  scarf:    { top: "56%",  left: "50%" },
  backpack: { top: "38%",  left: "105%" },
  trophy:   { top: "38%",  left: "-10%" },
  rocket:   { top: "10%",  left: "-10%" },
};

export const SHOP_ITEMS_BY_ID: Record<string, CatalogShopItem> = Object.fromEntries(
  SEED_ITEMS.map((i) => [i.id, i]),
);

/** Relative offsets (to character center) for rendering equipped outfit items. */
export const SLOT_OFFSET: Record<string, { top: string; left: string }> = { ...SEED_SLOTS };

/** Legacy list export — consumers should prefer the server catalog hook. */
export const SHOP_ITEMS: CatalogShopItem[] = SEED_ITEMS;

/**
 * Register a server-sourced item into the in-memory registry. Called by
 * `lib/shop-items.ts` after the `/api/shop-items` fetch resolves. Replaces
 * any existing seed row with the same slug.
 */
export function registerServerShopItem(
  item: CatalogShopItem,
  slotOffset: { top: string; left: string } | null,
): void {
  SHOP_ITEMS_BY_ID[item.id] = item;
  if (slotOffset) {
    SLOT_OFFSET[item.id] = slotOffset;
  }
}
