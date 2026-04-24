/**
 * Auth helpers for Playwright specs.
 *
 * All seeded demo credentials share `Demo2026!` as the password. The helper
 * goes through the real `/api/auth/login` Next route handler so the browser
 * ends up with the same httpOnly cookies a regular login produces.
 *
 * Seeded accounts (run backend with `SEED_DEMO_ACCOUNTS=1 npm run develop`
 * on first boot): see `backend/src/seeds/04-demo-accounts.ts`.
 */
import type { Page, APIRequestContext } from '@playwright/test';

export const DEMO_PASSWORD = 'Demo2026!';

export const DEMO_USERS = {
  kids:    'demo-kids@englishbest.app',
  adult:   'demo-adult@englishbest.app',
  teacher: 'demo-teacher@englishbest.app',
  parent:  'demo-parent@englishbest.app',
} as const;

export type DemoRole = keyof typeof DEMO_USERS;

export async function loginAs(
  page: Page,
  role: DemoRole,
  { baseURL }: { baseURL?: string } = {},
) {
  const base = baseURL ?? (page.context() as unknown as { _options?: { baseURL?: string } })._options?.baseURL ?? '';
  const res = await page.request.post(`${base}/api/auth/login`, {
    data: { identifier: DEMO_USERS[role], password: DEMO_PASSWORD },
  });
  if (!res.ok()) {
    const body = await res.text().catch(() => '');
    throw new Error(`loginAs(${role}) failed: HTTP ${res.status()} — ${body.slice(0, 160)}`);
  }
}

export async function isBackendReachable(request: APIRequestContext, baseURL: string): Promise<boolean> {
  try {
    const res = await request.get(`${baseURL}/api/auth/me`, { failOnStatusCode: false });
    return res.status() < 500;
  } catch {
    return false;
  }
}
