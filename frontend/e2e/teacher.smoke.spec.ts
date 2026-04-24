/**
 * Teacher golden-path smoke.
 *
 * Logs in as the seeded teacher account and walks the core dashboards:
 *   /dashboard/teacher     — landing KPIs
 *   /dashboard/homework    — homework review list
 *   /dashboard/students    — roster
 *
 * Each page should render its shell without an unhandled error. Empty-state
 * copy is acceptable — we only assert the page mounted.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './auth';

test('teacher: dashboard, homework, students all load', async ({ page, baseURL }) => {
  await loginAs(page, 'teacher', { baseURL });

  await page.goto('/dashboard/teacher');
  await expect(page).toHaveURL(/\/dashboard\/teacher/);

  await page.goto('/dashboard/homework');
  await expect(page.getByRole('heading', { name: /Домашн|Homework/i }).first()).toBeVisible();

  await page.goto('/dashboard/students');
  await expect(page.getByRole('heading', { name: /Учні|Students|Мої/i }).first()).toBeVisible();
});
