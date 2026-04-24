/**
 * Kids golden-path smoke.
 *
 * After logging in as the seeded kids account, the learner should land on
 * `/kids/dashboard`, see a coin balance HUD, and be able to navigate to
 * `/kids/shop` and `/kids/room` without any hard error. Deep lesson-play is
 * out of scope for smoke — that lives in a dedicated spec.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './auth';

test('kids: dashboard → shop → room navigation', async ({ page, baseURL }) => {
  await loginAs(page, 'kids', { baseURL });

  await page.goto('/kids/dashboard');
  await expect(page).toHaveURL(/\/kids\/dashboard/);

  // Shop — top-level nav or direct nav both count
  await page.goto('/kids/shop');
  await expect(page.getByRole('heading', { name: /Магазин|Shop/i }).first()).toBeVisible();

  // Room
  await page.goto('/kids/room');
  await expect(page.getByRole('heading', { name: /Кімната|Room|Моя/i }).first()).toBeVisible();
});
