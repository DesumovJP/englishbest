/**
 * Playwright config — e2e smoke coverage for K5–K8 golden paths.
 *
 * Scope (per Phase J0–J2):
 *   - kids:    lesson → shop → room round-trip
 *   - teacher: homework review happy path
 *   - parent:  children overview
 *   - admin:   analytics loads
 *
 * Runs against a locally served dev/build. `webServer` below spins up
 * `next dev` on port 3000; the backend must already be reachable at
 * `NEXT_PUBLIC_API_URL` (defaults to http://localhost:1337 in .env.local).
 *
 * Auth helper: `e2e/auth.ts` logs seeded users via the real `/api/auth/login`
 * route so the cookie-based session is set before page.goto().
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PW_PORT ?? 3000);
const BASE_URL = process.env.PW_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
    locale: 'uk-UA',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.PW_EXTERNAL_SERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
        env: { NODE_ENV: 'development' },
      },
});
