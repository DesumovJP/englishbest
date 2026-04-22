/**
 * Seed: Kids-Zone shop catalog.
 *
 * Source of truth kept in-sync with `frontend/lib/shop-catalog.ts`. Items are
 * canonical product data (not demo fixtures), so this seed always runs and is
 * idempotent by `slug` — adding a new item to the list and redeploying
 * appends it; existing items are left untouched (no destructive sync yet).
 *
 * Media uploads (imageIdle/Hover/Active) stay empty here; the admin uploads
 * via Strapi UI. FE falls back to `emoji` until real art is attached.
 */
const SHOP_ITEM_UID = 'api::shop-item.shop-item';

type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
type Category = 'furniture' | 'decor' | 'outfit' | 'special';
type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

type ShopItemSeed = {
  slug: string;
  nameEn: string;
  nameUa: string;
  phonetic: string;
  emoji: string;
  category: Category;
  rarity: Rarity;
  price: number;
  levelRequired: Level;
  isNew?: boolean;
  slotOffset?: { top: string; left: string };
};

const SHOP_ITEMS: ShopItemSeed[] = [
  { slug: 'sofa',       nameEn: 'Sofa',           nameUa: 'Диван',            phonetic: '/ˈsoʊfə/',             emoji: '🛋️', category: 'furniture', rarity: 'common',    price: 80,  levelRequired: 'A1' },
  { slug: 'wardrobe',   nameEn: 'Wardrobe',       nameUa: 'Шафа',             phonetic: '/ˈwɔːrdrōb/',          emoji: '🪞',  category: 'furniture', rarity: 'uncommon',  price: 120, levelRequired: 'A2', isNew: true },
  { slug: 'bookshelf',  nameEn: 'Bookshelf',      nameUa: 'Книжкова полиця',  phonetic: '/ˈbʊkʃɛlf/',           emoji: '📚', category: 'furniture', rarity: 'common',    price: 60,  levelRequired: 'A1' },
  { slug: 'armchair',   nameEn: 'Armchair',       nameUa: 'Крісло',           phonetic: '/ˈɑːrmtʃɛr/',          emoji: '🪑', category: 'furniture', rarity: 'common',    price: 90,  levelRequired: 'A1' },
  { slug: 'desk',       nameEn: 'Desk',           nameUa: 'Письмовий стіл',   phonetic: '/dɛsk/',               emoji: '🖥️', category: 'furniture', rarity: 'common',    price: 110, levelRequired: 'A1' },
  { slug: 'lamp',       nameEn: 'Floor Lamp',     nameUa: 'Торшер',           phonetic: '/flɔːr læmp/',         emoji: '🪔', category: 'furniture', rarity: 'common',    price: 45,  levelRequired: 'A1' },
  { slug: 'globe',      nameEn: 'Globe',          nameUa: 'Глобус',           phonetic: '/ɡloʊb/',              emoji: '🌍', category: 'decor',     rarity: 'common',    price: 40,  levelRequired: 'A1' },
  { slug: 'aquarium',   nameEn: 'Aquarium',       nameUa: 'Акваріум',         phonetic: '/əˈkwɛriəm/',          emoji: '🐠', category: 'decor',     rarity: 'uncommon',  price: 150, levelRequired: 'A2', isNew: true },
  { slug: 'rainbow',    nameEn: 'Rainbow Poster', nameUa: 'Постер-веселка',   phonetic: '/ˈreɪnboʊ ˈpoʊstər/',  emoji: '🌈', category: 'decor',     rarity: 'common',    price: 30,  levelRequired: 'A1' },
  { slug: 'clock',      nameEn: 'Clock',          nameUa: 'Годинник',         phonetic: '/klɒk/',               emoji: '⏰', category: 'decor',     rarity: 'common',    price: 50,  levelRequired: 'A1' },
  { slug: 'plant',      nameEn: 'Plant',          nameUa: 'Рослина',          phonetic: '/plænt/',              emoji: '🪴', category: 'decor',     rarity: 'common',    price: 35,  levelRequired: 'A1' },
  { slug: 'hat',        nameEn: 'Top Hat',        nameUa: 'Циліндр',          phonetic: '/tɒp hæt/',            emoji: '🎩', category: 'outfit',    rarity: 'common',    price: 70,  levelRequired: 'A1', slotOffset: { top: '-14%', left: '50%' } },
  { slug: 'scarf',      nameEn: 'Scarf',          nameUa: 'Шарф',             phonetic: '/skɑːrf/',             emoji: '🧣', category: 'outfit',    rarity: 'common',    price: 45,  levelRequired: 'A1', slotOffset: { top: '56%',  left: '50%' } },
  { slug: 'glasses',    nameEn: 'Sunglasses',     nameUa: 'Окуляри',          phonetic: '/ˈsʌnɡlæsɪz/',         emoji: '🕶️', category: 'outfit',    rarity: 'uncommon',  price: 55,  levelRequired: 'A2', isNew: true, slotOffset: { top: '26%', left: '50%' } },
  { slug: 'crown',      nameEn: 'Crown',          nameUa: 'Корона',           phonetic: '/kraʊn/',              emoji: '👑', category: 'outfit',    rarity: 'rare',      price: 200, levelRequired: 'B1', slotOffset: { top: '-14%', left: '50%' } },
  { slug: 'backpack',   nameEn: 'Backpack',       nameUa: 'Рюкзак',           phonetic: '/ˈbækpæk/',            emoji: '🎒', category: 'outfit',    rarity: 'common',    price: 65,  levelRequired: 'A1', slotOffset: { top: '38%',  left: '105%' } },
  { slug: 'trophy',     nameEn: 'Trophy',         nameUa: 'Кубок',            phonetic: '/ˈtroʊfi/',            emoji: '🏆', category: 'special',   rarity: 'rare',      price: 300, levelRequired: 'A2', slotOffset: { top: '38%',  left: '-10%' } },
  { slug: 'rocket',     nameEn: 'Rocket',         nameUa: 'Ракета',           phonetic: '/ˈrɒkɪt/',             emoji: '🚀', category: 'special',   rarity: 'rare',      price: 250, levelRequired: 'B1', slotOffset: { top: '10%',  left: '-10%' } },
  { slug: 'unicorn',    nameEn: 'Unicorn',        nameUa: 'Єдиноріг',         phonetic: '/ˈjuːnɪkɔːrn/',        emoji: '🦄', category: 'special',   rarity: 'legendary', price: 500, levelRequired: 'B2' },
  { slug: 'dragon-egg', nameEn: 'Dragon Egg',     nameUa: 'Яйце дракона',     phonetic: '/ˈdræɡən ɛɡ/',         emoji: '🥚', category: 'special',   rarity: 'rare',      price: 400, levelRequired: 'B1' },
];

export async function up(strapi: any) {
  let created = 0;
  let skipped = 0;

  for (const item of SHOP_ITEMS) {
    const existing = await strapi.documents(SHOP_ITEM_UID).findMany({
      filters: { slug: item.slug },
      limit: 1,
    });
    if (existing?.[0]) {
      skipped += 1;
      continue;
    }

    await strapi.documents(SHOP_ITEM_UID).create({
      data: {
        slug: item.slug,
        nameEn: item.nameEn,
        nameUa: item.nameUa,
        phonetic: item.phonetic,
        emoji: item.emoji,
        category: item.category,
        rarity: item.rarity,
        price: item.price,
        levelRequired: item.levelRequired,
        isNew: item.isNew ?? false,
        slotOffset: item.slotOffset ?? null,
        publishedAt: new Date().toISOString(),
      },
      status: 'published',
    });
    created += 1;
  }

  strapi.log.info(`[seed] shop-items: created=${created}, skipped=${skipped}, total=${SHOP_ITEMS.length}`);
}
