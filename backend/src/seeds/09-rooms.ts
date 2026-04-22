/**
 * Seed: Kids-Zone room catalog.
 *
 * Rooms are the backdrop/scene a kid inhabits with their character. The
 * starter room (slug=bedroom) has coinsRequired=0 and is always unlocked
 * for every new inventory — enforced in the user-inventory controller,
 * not here.
 *
 * The `background` field is a raw CSS background shorthand — either a
 * `url('...')` or a `linear-gradient(...)`. The FE pipes it straight into
 * style.background so both variants work uniformly.
 *
 * Idempotent by slug.
 */
const ROOM_UID = 'api::room.room';

type RoomSeed = {
  slug: string;
  nameEn: string;
  nameUa: string;
  coinsRequired: number;
  background: string;
  iconEmoji: string;
  orderIndex: number;
};

const ROOMS: RoomSeed[] = [
  {
    slug: 'bedroom',
    nameEn: 'Bedroom',
    nameUa: 'Спальня',
    coinsRequired: 0,
    background: "url('/kids-room-bg.webp') center center / cover",
    iconEmoji: '🛏️',
    orderIndex: 0,
  },
  {
    slug: 'garden',
    nameEn: 'Garden',
    nameUa: 'Садок',
    coinsRequired: 300,
    background: 'linear-gradient(160deg, #a8e063 0%, #56ab2f 100%)',
    iconEmoji: '🌿',
    orderIndex: 1,
  },
  {
    slug: 'castle',
    nameEn: 'Castle',
    nameUa: 'Замок',
    coinsRequired: 800,
    background: 'linear-gradient(160deg, #8e9eab 0%, #536976 100%)',
    iconEmoji: '🏰',
    orderIndex: 2,
  },
  {
    slug: 'space',
    nameEn: 'Space',
    nameUa: 'Космос',
    coinsRequired: 1500,
    background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    iconEmoji: '🚀',
    orderIndex: 3,
  },
  {
    slug: 'underwater',
    nameEn: 'Underwater',
    nameUa: 'Підводний світ',
    coinsRequired: 3000,
    background: 'linear-gradient(160deg, #005c97 0%, #363795 100%)',
    iconEmoji: '🐠',
    orderIndex: 4,
  },
];

export async function up(strapi: any) {
  let created = 0;
  let skipped = 0;

  for (const r of ROOMS) {
    const existing = await strapi.documents(ROOM_UID).findMany({
      filters: { slug: r.slug },
      limit: 1,
    });
    if (existing?.[0]) {
      skipped += 1;
      continue;
    }

    await strapi.documents(ROOM_UID).create({
      data: {
        slug: r.slug,
        nameEn: r.nameEn,
        nameUa: r.nameUa,
        coinsRequired: r.coinsRequired,
        background: r.background,
        iconEmoji: r.iconEmoji,
        orderIndex: r.orderIndex,
      },
    });
    created += 1;
  }

  strapi.log.info(`[seed] rooms: created=${created}, skipped=${skipped}, total=${ROOMS.length}`);
}
