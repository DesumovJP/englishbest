/**
 * Seed: Kids-Zone character catalog.
 *
 * Characters are the companion avatars kids can unlock and swap between.
 * Each character has a set of emotion images the FE swaps based on mood
 * (idle / happy / celebrate / sleepy / angry / sad / thinking / surprised).
 *
 * The `emotions` field is a JSON map of emotion → image path. The starter
 * bundle references PNGs shipped in `frontend/public/characters/<slug>/`
 * so the FE keeps serving them statically from Vercel — no media upload
 * is required.
 *
 * Idempotent by slug: adding a character and redeploying appends it;
 * existing rows are left untouched.
 */
const CHARACTER_UID = 'api::character.character';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

type CharacterSeed = {
  slug: string;
  nameEn: string;
  nameUa: string;
  description: string;
  rarity: Rarity;
  priceCoins: number;
  fallbackEmotion: string;
  emotions: Record<string, string>;
  orderIndex: number;
};

const CHARACTERS: CharacterSeed[] = [
  {
    slug: 'fox',
    nameEn: 'Fox',
    nameUa: 'Лисеня',
    description: 'Допитливий рудий лисенок. Завжди готовий вчитися!',
    rarity: 'common',
    priceCoins: 0,
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
    orderIndex: 0,
  },
  {
    slug: 'raccoon',
    nameEn: 'Raccoon',
    nameUa: 'Єнотик',
    description: 'Хитрий єнотик із гострим розумом. Розблокуй і грай!',
    rarity: 'rare',
    priceCoins: 500,
    fallbackEmotion: 'idle',
    emotions: {
      idle:      '/characters/raccoon/idle.png',
      happy:     '/characters/raccoon/hi.png',
      celebrate: '/characters/raccoon/hi.png',
      sleepy:    '/characters/raccoon/so.png',
      angry:     '/characters/raccoon/angry.png',
      sad:       '/characters/raccoon/cry.png',
      thinking:  '/characters/raccoon/thinking.png',
      surprised: '/characters/raccoon/idle.png',
    },
    orderIndex: 1,
  },
];

export async function up(strapi: any) {
  let created = 0;
  let skipped = 0;

  for (const c of CHARACTERS) {
    const existing = await strapi.documents(CHARACTER_UID).findMany({
      filters: { slug: c.slug },
      limit: 1,
    });
    if (existing?.[0]) {
      skipped += 1;
      continue;
    }

    await strapi.documents(CHARACTER_UID).create({
      data: {
        slug: c.slug,
        nameEn: c.nameEn,
        nameUa: c.nameUa,
        description: c.description,
        rarity: c.rarity,
        priceCoins: c.priceCoins,
        fallbackEmotion: c.fallbackEmotion,
        emotions: c.emotions,
        orderIndex: c.orderIndex,
      },
    });
    created += 1;
  }

  strapi.log.info(`[seed] characters: created=${created}, skipped=${skipped}, total=${CHARACTERS.length}`);
}
