/**
 * One-shot CLI wrapper around the mock importer.
 *
 * Usage (local/dev — needs backend env vars):
 *   npm run import-mocks --workspace=backend
 *
 * On Railway production use the `IMPORT_MOCKS_ON_BOOT=1` env var instead;
 * `src/index.ts` will call `runImport(strapi)` from the bootstrap hook.
 *
 * The actual import logic lives in `src/lib/mock-importer.ts` so it can be
 * loaded from both the compiled Strapi runtime and this tsx script.
 */
import { compileStrapi, createStrapi } from '@strapi/strapi';
import { runImport } from '../src/lib/mock-importer';

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  try {
    await runImport(app);
  } catch (err) {
    app.log.error('[import] failed');
    app.log.error(err as any);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
}

main();
