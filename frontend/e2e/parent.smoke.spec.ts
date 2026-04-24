/**
 * Parent golden-path smoke — dashboard overview must render.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './auth';

test('parent: dashboard overview loads', async ({ page, baseURL }) => {
  await loginAs(page, 'parent', { baseURL });
  await page.goto('/dashboard/parent');
  await expect(page).toHaveURL(/\/dashboard\/parent/);
  await expect(page.getByRole('heading').first()).toBeVisible();
});
