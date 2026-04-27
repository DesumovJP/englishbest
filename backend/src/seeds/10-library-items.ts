/**
 * Seed: library items — DEPRECATED.
 *
 * Originally seeded 14 promotional book/video/game cards (Caterpillar,
 * Oxford Reading Tree, Peppa Pig, etc.) into `course` records. None of
 * them had real backing content — every card opened a "Доступ — в розробці"
 * (access in development) dead-end. The slugs are now in
 * `LEGACY_COURSE_SLUGS` and `11-real-lessons` deletes them on every boot
 * so the kids' school catalog only shows real, completable courses.
 *
 * Kept as a no-op so the orchestrator still imports cleanly. When real
 * library content is curated (PDFs, working video URLs, etc.) it should
 * be added through the admin panel — not seeded here.
 */
export async function up(_strapi: any): Promise<void> {
  // intentionally empty
}
