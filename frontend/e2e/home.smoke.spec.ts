/**
 * Public marketing smoke — verifies that the unauth `/home` route renders
 * hero copy and the CTA that routes into the login flow. This is the
 * cheapest early-warning test: if it fails, the dev server is broken before
 * any auth-gated spec has a chance to run.
 */
import { test, expect } from '@playwright/test';

test('home page renders brand + primary CTA', async ({ page }) => {
  await page.goto('/home');
  await expect(page).toHaveTitle(/EnglishBest/i);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Спробувати|Увійти|Почати/i }).first()).toBeVisible();
});
