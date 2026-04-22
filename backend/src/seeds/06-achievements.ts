/**
 * Seed: achievements catalog.
 *
 * Base set the backend-side lifecycle (Phase E2) will evaluate. Idempotent
 * by `slug`; always runs. `criteria` is a loose JSON contract interpreted in
 * the user-progress lifecycle — no Strapi validation, so schema changes here
 * must be matched in the evaluator.
 */
const ACHIEVEMENT_UID = 'api::achievement.achievement';

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';
type Category = 'streak' | 'lessons' | 'coins' | 'social' | 'kids' | 'mastery' | 'special';

type AchievementSeed = {
  slug: string;
  title: string;
  description: string;
  category: Category;
  tier: Tier;
  coinReward: number;
  xpReward: number;
  criteria: Record<string, unknown>;
  hidden?: boolean;
};

const ACHIEVEMENTS: AchievementSeed[] = [
  {
    slug: 'first-lesson',
    title: 'Перший урок',
    description: 'Заверши свій перший урок на платформі.',
    category: 'lessons',
    tier: 'bronze',
    coinReward: 20,
    xpReward: 50,
    criteria: { type: 'lessons-completed', count: 1 },
  },
  {
    slug: 'five-lessons',
    title: 'П\'ять уроків',
    description: 'Заверши 5 уроків.',
    category: 'lessons',
    tier: 'silver',
    coinReward: 50,
    xpReward: 100,
    criteria: { type: 'lessons-completed', count: 5 },
  },
  {
    slug: 'twenty-lessons',
    title: 'Двадцятка',
    description: 'Заверши 20 уроків — серйозний темп.',
    category: 'lessons',
    tier: 'gold',
    coinReward: 150,
    xpReward: 400,
    criteria: { type: 'lessons-completed', count: 20 },
  },
  {
    slug: 'streak-3-days',
    title: '3 дні поспіль',
    description: 'Заходь у застосунок 3 дні підряд.',
    category: 'streak',
    tier: 'bronze',
    coinReward: 30,
    xpReward: 50,
    criteria: { type: 'streak-days', count: 3 },
  },
  {
    slug: 'streak-7-days',
    title: 'Тижневий стрік',
    description: 'Заходь 7 днів підряд.',
    category: 'streak',
    tier: 'silver',
    coinReward: 100,
    xpReward: 150,
    criteria: { type: 'streak-days', count: 7 },
  },
  {
    slug: 'streak-30-days',
    title: 'Місяць непохитності',
    description: 'Заходь 30 днів підряд.',
    category: 'streak',
    tier: 'gold',
    coinReward: 500,
    xpReward: 1000,
    criteria: { type: 'streak-days', count: 30 },
  },
  {
    slug: 'coins-100',
    title: 'Сотня монет',
    description: 'Набери 100 монет.',
    category: 'coins',
    tier: 'bronze',
    coinReward: 10,
    xpReward: 20,
    criteria: { type: 'coins-earned', count: 100 },
  },
  {
    slug: 'coins-1000',
    title: 'Тисячник',
    description: 'Набери 1000 монет.',
    category: 'coins',
    tier: 'gold',
    coinReward: 200,
    xpReward: 400,
    criteria: { type: 'coins-earned', count: 1000 },
  },
  {
    slug: 'level-up-a2',
    title: 'Рівень A2',
    description: 'Доріс до рівня A2.',
    category: 'mastery',
    tier: 'silver',
    coinReward: 100,
    xpReward: 200,
    criteria: { type: 'level-reached', level: 'A2' },
  },
  {
    slug: 'level-up-b1',
    title: 'Рівень B1',
    description: 'Доріс до рівня B1.',
    category: 'mastery',
    tier: 'gold',
    coinReward: 250,
    xpReward: 500,
    criteria: { type: 'level-reached', level: 'B1' },
  },
  {
    slug: 'first-purchase',
    title: 'Перша покупка',
    description: 'Купи свій перший предмет у магазині.',
    category: 'special',
    tier: 'bronze',
    coinReward: 20,
    xpReward: 30,
    criteria: { type: 'shop-purchases', count: 1 },
  },
  {
    slug: 'room-decorator',
    title: 'Декоратор',
    description: 'Розмісти 10 предметів у своїй кімнаті.',
    category: 'kids',
    tier: 'silver',
    coinReward: 75,
    xpReward: 100,
    criteria: { type: 'items-placed', count: 10 },
  },
];

export async function up(strapi: any) {
  let created = 0;
  let skipped = 0;

  for (const a of ACHIEVEMENTS) {
    const existing = await strapi.documents(ACHIEVEMENT_UID).findMany({
      filters: { slug: a.slug },
      limit: 1,
    });
    if (existing?.[0]) {
      skipped += 1;
      continue;
    }

    await strapi.documents(ACHIEVEMENT_UID).create({
      data: {
        slug: a.slug,
        title: a.title,
        description: a.description,
        category: a.category,
        tier: a.tier,
        coinReward: a.coinReward,
        xpReward: a.xpReward,
        criteria: a.criteria,
        hidden: a.hidden ?? false,
        publishedAt: new Date().toISOString(),
      },
      status: 'published',
    });
    created += 1;
  }

  strapi.log.info(`[seed] achievements: created=${created}, skipped=${skipped}, total=${ACHIEVEMENTS.length}`);
}
