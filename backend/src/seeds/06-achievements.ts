/**
 * Seed: achievements catalog.
 *
 * Each entry maps to a `criteria` interpreted by `lib/rewards.ts`'s
 * `evaluateAchievements`. Eight criterion types are supported there; any
 * entry whose `type` isn't in that set is silently inert (still seeded for
 * forward-compat).
 *
 * Idempotent by `slug`. Adding a new entry seeds it; renaming or removing
 * an entry leaves the existing record published — clean it up manually if
 * needed.
 *
 * The reward sizes here ride on top of the matrix in `lib/rewards.ts`. They
 * are intentionally MILESTONE-shaped (rare, larger jumps) — small actions
 * already pay out via the matrix.
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
  // ─── Lessons (existing) ─────────────────────────────────────────────
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
    title: 'П’ять уроків',
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

  // ─── Streak (existing) ──────────────────────────────────────────────
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

  // ─── Coins (existing) ───────────────────────────────────────────────
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

  // ─── Homework quality (new) ────────────────────────────────────────
  {
    slug: 'first-homework-good',
    title: 'Старт з відмінним',
    description: 'Здай перше домашнє завдання на 80 % і вище.',
    category: 'mastery',
    tier: 'bronze',
    coinReward: 25,
    xpReward: 50,
    criteria: { type: 'homeworks-graded-good', count: 1 },
  },
  {
    slug: 'homework-streak-5',
    title: '5 відмінних домашок',
    description: 'Отримай 80 %+ за 5 ДЗ.',
    category: 'mastery',
    tier: 'silver',
    coinReward: 80,
    xpReward: 200,
    criteria: { type: 'homeworks-graded-good', count: 5 },
  },
  {
    slug: 'homework-streak-20',
    title: 'Майстер ДЗ',
    description: 'Отримай 80 %+ за 20 ДЗ — постійний рівень.',
    category: 'mastery',
    tier: 'gold',
    coinReward: 300,
    xpReward: 700,
    criteria: { type: 'homeworks-graded-good', count: 20 },
  },

  // ─── Mini-tasks (new) ──────────────────────────────────────────────
  {
    slug: 'first-mini-task',
    title: 'Розминка',
    description: 'Виконай перше міні-завдання.',
    category: 'lessons',
    tier: 'bronze',
    coinReward: 10,
    xpReward: 20,
    criteria: { type: 'mini-tasks-completed', count: 1 },
  },
  {
    slug: 'mini-task-master-10',
    title: '10 міні-перемог',
    description: 'Виконай 10 міні-завдань.',
    category: 'lessons',
    tier: 'silver',
    coinReward: 60,
    xpReward: 120,
    criteria: { type: 'mini-tasks-completed', count: 10 },
  },
  {
    slug: 'mini-task-perfect-5',
    title: 'Чисті 100',
    description: 'Виконай 5 міні-завдань на 100 %.',
    category: 'mastery',
    tier: 'silver',
    coinReward: 100,
    xpReward: 200,
    criteria: { type: 'mini-tasks-perfect', count: 5 },
  },

  // ─── Attendance (new) ──────────────────────────────────────────────
  {
    slug: 'perfect-week-attendance',
    title: 'Ідеальний тиждень',
    description: 'Усі заняття на тижні — присутність без запізнень.',
    category: 'special',
    tier: 'gold',
    coinReward: 150,
    xpReward: 300,
    criteria: { type: 'perfect-week-attendance' },
  },

  // ─── XP levels (new — semantic switch from CEFR) ───────────────────
  // The previous `level-up-a2` / `level-up-b1` slugs used CEFR labels and
  // were never wired. Replaced by XP-level milestones (matrix driven).
  // Old slugs left orphaned in DB if previously seeded; safe to delete.
  {
    slug: 'level-5',
    title: 'Рівень 5',
    description: 'Набери XP до 5-го рівня.',
    category: 'mastery',
    tier: 'silver',
    coinReward: 100,
    xpReward: 0,
    criteria: { type: 'level-reached', count: 5 },
  },
  {
    slug: 'level-10',
    title: 'Рівень 10',
    description: 'Набери XP до 10-го рівня.',
    category: 'mastery',
    tier: 'gold',
    coinReward: 250,
    xpReward: 0,
    criteria: { type: 'level-reached', count: 10 },
  },
  {
    slug: 'level-20',
    title: 'Рівень 20',
    description: 'Доріс до 20-го рівня — це вже серйозно.',
    category: 'mastery',
    tier: 'platinum',
    coinReward: 750,
    xpReward: 0,
    criteria: { type: 'level-reached', count: 20 },
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
