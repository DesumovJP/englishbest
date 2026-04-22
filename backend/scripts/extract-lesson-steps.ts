/**
 * Extracts rich block-based lesson step data from `frontend/mocks/lessons/*.ts`
 * into a single JSON file `frontend/mocks/lesson-steps.json` that the
 * `import-mocks` script can read at deploy-time.
 *
 * Run once after editing any of the TS mocks:
 *   npm run extract-lesson-steps --workspace=backend
 *
 * The emitted JSON is committed to the repo. Railway bootstrap only needs the
 * JSON — it never loads the TS files.
 */
import { writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const MOCKS_DIR = join(__dirname, '..', '..', 'frontend', 'mocks', 'lessons');
const OUT_FILE = join(__dirname, '..', '..', 'frontend', 'mocks', 'lesson-steps.json');

async function main() {
  const files = readdirSync(MOCKS_DIR).filter(
    (f) => f.endsWith('.ts') && f !== 'types.ts',
  );
  const out: unknown[] = [];
  for (const f of files) {
    const mod = await import(join(MOCKS_DIR, f));
    const lesson = mod.default;
    if (!lesson || !lesson.slug) {
      console.warn(`[extract] ${f}: no default export or missing slug — skipped`);
      continue;
    }
    out.push({
      slug: lesson.slug,
      courseSlug: lesson.courseSlug,
      title: lesson.title,
      xp: lesson.xp ?? 10,
      steps: lesson.steps ?? [],
    });
    console.log(`[extract] ${f} → ${lesson.slug} (${lesson.steps?.length ?? 0} steps)`);
  }
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(`[extract] wrote ${out.length} lessons → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
